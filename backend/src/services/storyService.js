import { supabase } from '../config/database.js';

// ─── Supabase select string để lấy story kèm author và genres ─────────────────
// Dùng Supabase relational query thay vì v_story_detail view
const STORY_SELECT = `
  id,
  author_id,
  title,
  slug,
  cover_url,
  description,
  synopsis,
  status,
  is_published,
  chapter_count,
  view_count,
  bookmark_count,
  rating_avg,
  rating_count,
  word_count,
  featured,
  created_at,
  updated_at,
  published_at,
  author:profiles!author_id (
    username,
    display_name,
    avatar_url
  ),
  story_genres (
    genres (
      id,
      name,
      slug
    )
  )
`.trim();

/**
 * Chuẩn hóa data từ Supabase relational query về format giống v_story_detail
 * để frontend không cần thay đổi
 */
function normalizeStory(raw) {
  if (!raw) return null;
  const { author, story_genres, ...rest } = raw;
  return {
    ...rest,
    author_username: author?.username || null,
    author_display_name: author?.display_name || null,
    author_avatar_url: author?.avatar_url || null,
    genres: (story_genres || []).map((sg) => sg.genres).filter(Boolean),
  };
}

// ============================================================
// GET /stories - Lấy danh sách truyện (phân trang)
// ============================================================
export const getStories = async ({ page = 1, limit = 20, genre, status, sort = 'updated_at' }) => {
  const offset = (page - 1) * limit;

  // Lọc theo genre nếu có — cần lấy story_ids trước
  let genreStoryIds = null;
  if (genre) {
    const { data: genreData, error: genreError } = await supabase
      .from('genres')
      .select('id')
      .eq('slug', genre)
      .single();

    if (genreError || !genreData) {
      const err = new Error('Thể loại không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const { data: storyGenres, error: sgError } = await supabase
      .from('story_genres')
      .select('story_id')
      .eq('genre_id', genreData.id);

    if (sgError) throw sgError;

    genreStoryIds = (storyGenres || []).map((sg) => sg.story_id);
    if (genreStoryIds.length === 0) {
      return { stories: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 };
    }
  }

  const validSorts = ['updated_at', 'created_at', 'view_count', 'rating_avg', 'bookmark_count'];
  const sortField = validSorts.includes(sort) ? sort : 'updated_at';

  let query = supabase
    .from('stories')
    .select(STORY_SELECT, { count: 'exact' })
    .eq('is_published', true)
    .order(sortField, { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (genreStoryIds) {
    query = query.in('id', genreStoryIds);
  }

  const { data, error, count } = await query;

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    stories: (data || []).map(normalizeStory),
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

// ============================================================
// GET /stories/trending - Truyện xu hướng / xem nhiều nhất
// ============================================================
export const getTrendingStories = async ({ period = 'week', limit = 10 }) => {
  // Fallback trực tiếp: lấy theo view_count tổng từ bảng stories
  // (story_views có thể chưa có RLS phù hợp hoặc chưa có data)
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return (data || []).map(normalizeStory);
};

// ============================================================
// GET /stories/search - Tìm kiếm truyện nâng cao
// ============================================================
export const searchStories = async ({ q, genre, status, minRating, sort = 'updated_at', page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  // Lọc theo genre nếu có
  let genreStoryIds = null;
  if (genre) {
    const { data: genreData } = await supabase
      .from('genres')
      .select('id')
      .eq('slug', genre)
      .single();

    if (genreData) {
      const { data: storyGenres } = await supabase
        .from('story_genres')
        .select('story_id')
        .eq('genre_id', genreData.id);

      genreStoryIds = (storyGenres || []).map((sg) => sg.story_id);
      if (genreStoryIds.length === 0) {
        return { stories: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 };
      }
    }
  }

  const validSorts = ['updated_at', 'created_at', 'view_count', 'rating_avg', 'bookmark_count'];
  const sortField = validSorts.includes(sort) ? sort : 'updated_at';

  let query = supabase
    .from('stories')
    .select(STORY_SELECT, { count: 'exact' })
    .eq('is_published', true)
    .order(sortField, { ascending: false })
    .range(offset, offset + limit - 1);

  // Tìm kiếm theo title (ilike) — không join author tại đây vì phức tạp hơn
  if (q && q.trim()) {
    query = query.ilike('title', `%${q.trim()}%`);
  }

  if (status) {
    const validStatuses = ['ongoing', 'completed', 'hiatus', 'dropped'];
    if (validStatuses.includes(status)) {
      query = query.eq('status', status);
    }
  }

  if (minRating) {
    const rating = parseFloat(minRating);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      query = query.gte('rating_avg', rating);
    }
  }

  if (genreStoryIds) {
    query = query.in('id', genreStoryIds);
  }

  const { data, error, count } = await query;

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    stories: (data || []).map(normalizeStory),
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

// ============================================================
// GET /stories/:storyId - Chi tiết một truyện
// ============================================================
export const getStoryById = async (storyId, userId = null) => {
  const { data: raw, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .eq('id', storyId)
    .single();

  if (error || !raw) {
    const err = new Error('Truyện không tồn tại hoặc chưa được xuất bản');
    err.statusCode = 404;
    throw err;
  }

  const story = normalizeStory(raw);

  // Kiểm tra truyện đã xuất bản (hoặc user là tác giả)
  if (!story.is_published && story.author_id !== userId) {
    const err = new Error('Truyện không tồn tại hoặc chưa được xuất bản');
    err.statusCode = 404;
    throw err;
  }

  // Nếu user đăng nhập, kiểm tra trạng thái follow & favorite
  let isFollowing = false;
  let isFavorited = false;
  let userRating = null;

  if (userId) {
    const [bookmarkRes, ratingRes] = await Promise.all([
      supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .maybeSingle(),
      supabase
        .from('ratings')
        .select('score, review')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .maybeSingle(),
    ]);

    isFollowing = !!bookmarkRes.data;
    isFavorited = !!bookmarkRes.data;
    userRating = ratingRes.data;
  }

  return {
    ...story,
    is_following: isFollowing,
    is_favorited: isFavorited,
    user_rating: userRating,
  };
};

// ============================================================
// POST /stories/:storyId/follow - Theo dõi truyện
// ============================================================
export const followStory = async (storyId, userId) => {
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('is_published', true)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle();

  if (existing) {
    const err = new Error('Bạn đã theo dõi truyện này rồi');
    err.statusCode = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, story_id: storyId })
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

// ============================================================
// DELETE /stories/:storyId/follow - Hủy theo dõi truyện
// ============================================================
export const unfollowStory = async (storyId, userId) => {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle();

  if (!existing) {
    const err = new Error('Bạn chưa theo dõi truyện này');
    err.statusCode = 404;
    throw err;
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('story_id', storyId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return true;
};

// ============================================================
// POST /stories/:storyId/favorite - Thêm vào yêu thích
// ============================================================
export const favoriteStory = async (storyId, userId) => {
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('is_published', true)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle();

  if (existing) {
    const err = new Error('Truyện đã có trong danh sách yêu thích');
    err.statusCode = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, story_id: storyId })
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

// ============================================================
// DELETE /stories/:storyId/favorite - Xóa khỏi yêu thích
// ============================================================
export const unfavoriteStory = async (storyId, userId) => {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle();

  if (!existing) {
    const err = new Error('Truyện không có trong danh sách yêu thích');
    err.statusCode = 404;
    throw err;
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('story_id', storyId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return true;
};

// ============================================================
// POST /stories/:storyId/rate - Đánh giá truyện (1–5 sao)
// ============================================================
export const rateStory = async (storyId, userId, score, review = null) => {
  if (!score || score < 1 || score > 5 || !Number.isInteger(Number(score))) {
    const err = new Error('Điểm đánh giá phải là số nguyên từ 1 đến 5');
    err.statusCode = 400;
    throw err;
  }

  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .eq('is_published', true)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      {
        user_id: userId,
        story_id: storyId,
        score: Number(score),
        review: review || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,story_id' }
    )
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

// ============================================================
// POST /stories/:storyId/report - Báo cáo vi phạm
// ============================================================
export const reportStory = async (storyId, userId, reason, detail = '') => {
  const validReasons = ['spam', 'copyright', 'inappropriate', 'wrong_category', 'other'];

  if (!reason || !validReasons.includes(reason)) {
    const err = new Error(`Lý do báo cáo không hợp lệ. Chọn một trong: ${validReasons.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, title')
    .eq('id', storyId)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  // Gửi notification đến admin (nếu có)
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin');

  if (admins && admins.length > 0) {
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: 'system',
      title: `Báo cáo vi phạm: ${story.title}`,
      body: `Lý do: ${reason}. Chi tiết: ${detail || 'Không có'}. Story ID: ${storyId}. Báo cáo bởi: ${userId}`,
      link_url: `/admin/reports/${storyId}`,
    }));

    await supabase.from('notifications').insert(notifications);
  }

  console.log(`[REPORT] Story: ${storyId} | User: ${userId} | Reason: ${reason} | Detail: ${detail}`);

  return {
    story_id: storyId,
    reported_by: userId,
    reason,
    detail,
    status: 'pending',
  };
};

// ============================================================
// POST /stories/:storyId/share - Tạo link chia sẻ
// ============================================================
export const shareStory = async (storyId, userId = null, platform = 'general') => {
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, title, slug, cover_url, description')
    .eq('id', storyId)
    .eq('is_published', true)
    .single();

  if (storyError || !story) {
    const err = new Error('Truyện không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const shareUrl = `${baseUrl}/stories/${story.slug}`;

  const shareLinks = {
    general: shareUrl,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(story.title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(story.title)}`,
  };

  return {
    story_id: storyId,
    story_title: story.title,
    story_slug: story.slug,
    share_url: shareUrl,
    share_links: shareLinks,
    og_data: {
      title: story.title,
      description: story.description,
      image: story.cover_url,
      url: shareUrl,
    },
  };
};
