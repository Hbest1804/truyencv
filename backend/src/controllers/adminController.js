import { supabase, supabaseAdmin } from '../config/database.js';

/**
 * Helper để kiểm tra Supabase Admin
 */
const requireSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase Service Role Key is not configured. Cannot perform this admin action.');
  }
  return supabaseAdmin;
};

// ==========================================
// 8.1 Quản lý Người dùng
// ==========================================

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search, from, to } = req.query;
    if (from && isNaN(Date.parse(from))) {
      return res.status(400).json({ success: false, message: 'Invalid "from" date format' });
    }
    if (to && isNaN(Date.parse(to))) {
      return res.status(400).json({ success: false, message: 'Invalid "to" date format' });
    }
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      if (status === 'banned') query = query.eq('is_banned', true);
      else if (status === 'active') query = query.eq('is_banned', false);
    }
    if (search) {
      // Loại bỏ các ký tự đặc biệt có thể làm hỏng cú pháp PostgREST
      const sanitizedSearch = search.replace(/[,()]/g, '');
      query = query.or(`username.ilike.%${sanitizedSearch}%,display_name.ilike.%${sanitizedSearch}%`);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parsedLimit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        totalPages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, reason } = req.body;
    
    if (req.user && userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }
    
    if (!['reader', 'author', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const adminClient = requireSupabaseAdmin();

    const { data, error } = await adminClient
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data, message: 'User role updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleBanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { is_banned, reason } = req.body;

    if (req.user && userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot ban or unban yourself' });
    }

    const adminClient = requireSupabaseAdmin();

    const { data, error } = await adminClient
      .from('profiles')
      .update({ is_banned, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ 
      success: true, 
      data, 
      message: `User account ${is_banned ? 'banned' : 'unbanned'} successfully` 
    });
  } catch (error) {
    next(error);
  }
};

export const getUserActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // For simplicity, we just fetch recent reading history or comments
    const { data: comments, error: commentErr } = await supabase
      .from('comments')
      .select('id, content, created_at, story_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (commentErr) throw commentErr;

    res.status(200).json({
      success: true,
      data: {
        recent_comments: comments
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8.2 Kiểm duyệt Truyện
// ==========================================

export const getPendingStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    let query = supabase
      .from('stories')
      .select('*, author:profiles!author_id(username, display_name)', { count: 'exact' });

    if (status === 'pending') {
      query = query.eq('is_published', false);
    } else if (status === 'published') {
      query = query.eq('is_published', true);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parsedLimit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        totalPages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const approveStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { data, error } = await supabase
      .from('stories')
      .update({ is_published: true, published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data, message: 'Story approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const hideStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { reason } = req.body;
    const { data, error } = await supabase
      .from('stories')
      .update({ 
        is_published: false, 
        updated_at: new Date().toISOString() 
        // moderation_note: reason
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data, message: 'Story hidden successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getStoryDetail = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles!author_id(username, display_name),
        story_genres (
          genres (
            id, name
          )
        )
      `)
      .eq('id', storyId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Story not found' });

    res.status(200).json({
      success: true,
      data: {
        ...data,
        genres: (data.story_genres || []).map((sg) => sg.genres).filter(Boolean),
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { title, description, genreIds, status, author_id, view_count, original_author } = req.body;
    
    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      updates.status = status;
      updates.is_published = status === 'ongoing' || status === 'completed';
    }
    if (author_id !== undefined) updates.author_id = author_id;
    if (view_count !== undefined) updates.view_count = view_count;
    if (original_author !== undefined) updates.original_author = original_author;

    // We use supabaseAdmin here to bypass RLS in case it blocks original_author updates
    const adminClient = requireSupabaseAdmin();
    
    // Check if column exists by trying to update it. If it fails due to column missing, we ignore it.
    let updateRes = await adminClient.from('stories').update(updates).eq('id', storyId).select().maybeSingle();
    
    if (updateRes.error && updateRes.error.message.includes('original_author')) {
      delete updates.original_author;
      updateRes = await adminClient.from('stories').update(updates).eq('id', storyId).select().maybeSingle();
    }

    if (updateRes.error) throw updateRes.error;
    if (!updateRes.data) return res.status(404).json({ success: false, message: 'Story not found' });

    if (genreIds && Array.isArray(genreIds)) {
      const { error: deleteError } = await adminClient.from('story_genres').delete().eq('story_id', storyId);
      if (deleteError) throw deleteError;

      if (genreIds.length > 0) {
        const uniqueGenreIds = [...new Set(genreIds)];
        const storyGenres = uniqueGenreIds.map((gId) => ({ story_id: storyId, genre_id: gId }));
        const { error: insertError } = await adminClient.from('story_genres').insert(storyGenres);
        if (insertError) throw insertError;
      }
    }

    res.status(200).json({ success: true, data: updateRes.data, message: 'Story updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadStoryCover = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' });
    }

    const adminClient = requireSupabaseAdmin();
    const { data: story, error: checkError } = await adminClient.from('stories').select('id').eq('id', storyId).maybeSingle();
    if (checkError) throw checkError;
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    const fileExt = req.file.mimetype.split('/')[1] || 'jpg';
    const fileName = `${storyId}-${Date.now()}.${fileExt}`;
    const filePath = `${storyId}/${fileName}`;

    const { error: uploadError } = await adminClient.storage
      .from('covers')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(filePath);
    const coverUrl = publicUrlData.publicUrl;

    const { data: updatedStory, error: updateError } = await adminClient
      .from('stories')
      .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
      .eq('id', storyId)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;
    res.status(200).json({ success: true, data: updatedStory });
  } catch (error) {
    next(error);
  }
};

export const getGenres = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('genres').select('*').order('name');
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createGenre = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ success: false, message: 'Slug must only contain lowercase letters, numbers, and hyphens' });
    }
    const { data, error } = await supabase
      .from('genres')
      .insert({ name, slug, description })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data, message: 'Genre created' });
  } catch (error) {
    next(error);
  }
};

export const updateGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const { name, slug, description } = req.body;

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ success: false, message: 'Slug must only contain lowercase letters, numbers, and hyphens' });
    }
    const { data, error } = await supabase
      .from('genres')
      .update({ name, slug, description })
      .eq('id', genreId)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json({ success: true, data, message: 'Genre updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const { error } = await supabase.from('genres').delete().eq('id', genreId);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Genre deleted' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8.3 Thống kê & Báo cáo
// ==========================================

export const getStatsOverview = async (req, res, next) => {
  try {
    const results = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', false),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      supabase.from('stories').select('*', { count: 'exact', head: true }),
      supabase.from('stories').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('chapters').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const firstError = results.find(r => r.error)?.error;
    if (firstError) throw firstError;

    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: bannedUsers },
      { count: totalStories },
      { count: publishedStories },
      { count: totalChapters },
      { count: pendingReports }
    ] = results;

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers },
        stories: { total: totalStories, published: publishedStories },
        chapters: { total: totalChapters },
        reports: { pending: pendingReports }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTopViewedStories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, cover_url, view_count')
      .order('view_count', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopFavoriteStories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, cover_url, bookmark_count')
      .order('bookmark_count', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUserGrowth = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    const date7DaysAgo = new Date(today);
    date7DaysAgo.setUTCDate(date7DaysAgo.getUTCDate() - 6);
    date7DaysAgo.setUTCHours(0, 0, 0, 0);

    const { data: profiles, error: errProfiles } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', date7DaysAgo.toISOString())
      .lte('created_at', today.toISOString());
      
    if (errProfiles) throw errProfiles;

    const { data: stories, error: errStories } = await supabase
      .from('stories')
      .select('created_at')
      .gte('created_at', date7DaysAgo.toISOString())
      .lte('created_at', today.toISOString());

    if (errStories) throw errStories;

    // Group by day
    const growthData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date7DaysAgo);
      d.setUTCDate(d.getUTCDate() + i);
      const dateString = d.toISOString().split('T')[0];
      
      const dayUsers = (profiles || []).filter(p => p.created_at.startsWith(dateString)).length;
      const dayStories = (stories || []).filter(s => s.created_at.startsWith(dateString)).length;
      
      const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short', timeZone: 'UTC' }); // e.g., T2, T3
      
      growthData.push({
        name: dayName,
        users: dayUsers,
        stories: dayStories
      });
    }

    res.status(200).json({ success: true, data: growthData });
  } catch (error) {
    next(error);
  }
};

export const getChapterActivity = async (req, res, next) => {
  try {
    // Placeholder
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    let query = supabase
      .from('reports')
      .select('*, story:stories(title), reporter:profiles!reported_by(username)', { count: 'exact' });
      
    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parsedLimit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        totalPages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, resolution_note } = req.body;

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid report status' });
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ status, resolution_note, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data, message: 'Report resolved' });
  } catch (error) {
    next(error);
  }
};
