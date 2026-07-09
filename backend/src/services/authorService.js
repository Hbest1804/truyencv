import { supabase } from '../config/database.js';
import { generateSlug } from '../utils/slugify.js';

// ─── TÁC GIẢ - QUẢN LÝ TRUYỆN ───────────────────────────────────────

export const getAuthorStories = async (authorId) => {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id, title, slug, cover_url, status, is_published, chapter_count, view_count, rating_avg, created_at, updated_at
    `)
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
  return data;
};

export const createStory = async (authorId, { title, description, genreIds, status = 'draft' }) => {
  if (!title || !description || !genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
    const err = new Error('Thiếu thông tin bắt buộc (title, description, genreIds)');
    err.statusCode = 400;
    throw err;
  }

  let slug = generateSlug(title);
  // check duplicate slug
  const { data: existSlug } = await supabase.from('stories').select('id').eq('slug', slug).maybeSingle();
  if (existSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const { data: story, error } = await supabase
    .from('stories')
    .insert({
      author_id: authorId,
      title,
      slug,
      description,
      status,
      is_published: status === 'ongoing' || status === 'completed',
    })
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  const uniqueGenreIds = [...new Set(genreIds)];
  const storyGenres = uniqueGenreIds.map((gId) => ({ story_id: story.id, genre_id: gId }));
  const { error: sgError } = await supabase.from('story_genres').insert(storyGenres);

  if (sgError) {
    // Rollback story creation to maintain database consistency
    await supabase.from('stories').delete().eq('id', story.id);
    const err = new Error(`Failed to associate genres: ${sgError.message}`);
    err.statusCode = 500;
    throw err;
  }

  return story;
};

export const getStoryDetail = async (authorId, storyId) => {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      story_genres (
        genres (
          id, name
        )
      )
    `)
    .eq('id', storyId)
    .eq('author_id', authorId)
    .single();

  if (error || !data) {
    const err = new Error('Truyện không tồn tại hoặc bạn không có quyền truy cập');
    err.statusCode = 404;
    throw err;
  }

  return {
    ...data,
    genres: (data.story_genres || []).map((sg) => sg.genres).filter(Boolean),
  };
};

export const updateStory = async (authorId, storyId, { title, description, genreIds, status }) => {
  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (status) {
    updates.status = status;
    updates.is_published = status === 'ongoing' || status === 'completed';
  }
  updates.updated_at = new Date().toISOString();

  const { data: story, error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', storyId)
    .eq('author_id', authorId)
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  if (genreIds && Array.isArray(genreIds)) {
    const { error: delError } = await supabase.from('story_genres').delete().eq('story_id', storyId);
    if (delError) {
      const err = new Error(`Failed to clear old genres: ${delError.message}`);
      err.statusCode = 500;
      throw err;
    }
    const storyGenres = genreIds.map((gId) => ({ story_id: storyId, genre_id: gId }));
    const { error: insError } = await supabase.from('story_genres').insert(storyGenres);
    if (insError) {
      const err = new Error(`Failed to update genres: ${insError.message}`);
      err.statusCode = 500;
      throw err;
    }
  }

  return story;
};

export const deleteStory = async (authorId, storyId) => {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
    .eq('author_id', authorId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
  return true;
};

export const changeStoryStatus = async (authorId, storyId, status) => {
  return updateStory(authorId, storyId, { status });
};

export const uploadStoryCover = async (authorId, storyId, fileBuffer, mimeType, originalName) => {
  // Verify story ownership first to prevent unauthorized uploads
  const { data: storyCheck, error: checkError } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('author_id', authorId)
    .maybeSingle();

  if (checkError || !storyCheck) {
    const err = new Error('Truyện không tồn tại hoặc bạn không có quyền truy cập');
    err.statusCode = checkError ? 500 : 404;
    throw err;
  }

  // Map mimeType to extension to prevent path traversal via client-controlled originalName
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  const ext = mimeToExt[mimeType] || 'jpg';
  const filePath = `covers/${authorId}/${storyId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase
    .storage
    .from('covers') // Giả sử bucket tên là 'covers'
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(filePath);
  const coverUrl = publicUrlData.publicUrl;

  const { data: story, error: updateError } = await supabase
    .from('stories')
    .update({ cover_url: coverUrl })
    .eq('id', storyId)
    .eq('author_id', authorId)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return story;
};

// ─── TÁC GIẢ - QUẢN LÝ CHƯƠNG ───────────────────────────────────────

export const getAuthorChapters = async (authorId, storyId) => {
  // Check ownership
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('author_id', authorId)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại hoặc không có quyền');
    err.statusCode = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('chapters')
    .select('id, title, chapter_number, status, is_published, published_at, scheduled_at, created_at, updated_at')
    .eq('story_id', storyId)
    .order('chapter_number', { ascending: true });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

export const createChapter = async (authorId, storyId, { title, content, status = 'draft', scheduledAt, number }) => {
  if (!title || !content) {
    const err = new Error('Thiếu thông tin bắt buộc (title, content)');
    err.statusCode = 400;
    throw err;
  }

  // Check ownership
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('author_id', authorId)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại hoặc không có quyền');
    err.statusCode = 404;
    throw err;
  }

  // Calculate chapter_number if not provided
  let chapterNumber = number;
  if (chapterNumber === undefined || chapterNumber === null) {
    const { data: lastChapter } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    chapterNumber = lastChapter ? lastChapter.chapter_number + 1 : 1;
  }

  const plainText = content.replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const isPublished = status === 'published';
  const publishedAt = isPublished ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      story_id: storyId,
      title,
      content,
      chapter_number: chapterNumber,
      status,
      is_published: isPublished,
      scheduled_at: scheduledAt || null,
      published_at: publishedAt,
      word_count: wordCount,
    })
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

export const getChapterDetail = async (authorId, storyId, chapterId) => {
  // Verify story ownership implicitly via the join or direct query
  const { data: story } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('author_id', authorId)
    .single();
    
  if (!story) {
    const err = new Error('Truyện không tồn tại hoặc bạn không có quyền truy cập');
    err.statusCode = 403;
    throw err;
  }

  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('story_id', storyId)
    .single();

  if (error || !data) {
    const err = new Error('Chương không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

export const updateChapter = async (authorId, storyId, chapterId, { title, content, status, scheduledAt, number }) => {
  const { data: story } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('author_id', authorId)
    .single();
    
  if (!story) {
    const err = new Error('Truyện không tồn tại hoặc bạn không có quyền truy cập');
    err.statusCode = 403;
    throw err;
  }

  const updates = { updated_at: new Date().toISOString() };
  if (title) updates.title = title;
  if (content) {
    updates.content = content;
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    updates.word_count = plainText ? plainText.split(/\s+/).length : 0;
  }
  if (status) {
    updates.status = status;
    updates.is_published = status === 'published';
    updates.published_at = updates.is_published ? new Date().toISOString() : null;
  }
  if (scheduledAt !== undefined) updates.scheduled_at = scheduledAt;
  if (number !== undefined) updates.chapter_number = number;

  const { data, error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', chapterId)
    .eq('story_id', storyId)
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

export const deleteChapter = async (authorId, storyId, chapterId) => {
  const { data: story } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('author_id', authorId)
    .single();
    
  if (!story) {
    const err = new Error('Truyện không tồn tại hoặc bạn không có quyền truy cập');
    err.statusCode = 403;
    throw err;
  }

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId)
    .eq('story_id', storyId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
  return true;
};

export const publishChapter = async (authorId, storyId, chapterId) => {
  return updateChapter(authorId, storyId, chapterId, { status: 'published' });
};

export const scheduleChapter = async (authorId, storyId, chapterId, scheduledAt) => {
  return updateChapter(authorId, storyId, chapterId, { scheduledAt });
};
