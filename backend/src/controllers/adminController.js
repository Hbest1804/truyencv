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
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
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
      // Tìm theo username hoặc display_name
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
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
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, count, error } = await supabase
      .from('stories')
      .select('*, author:profiles!author_id(username, display_name)', { count: 'exact' })
      .eq('is_published', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / parseInt(limit))
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
      .update({ is_published: false, updated_at: new Date().toISOString() })
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
    // Tạm thời query đơn giản
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', false);
    const { count: bannedUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true);

    const { count: totalStories } = await supabase.from('stories').select('*', { count: 'exact', head: true });
    const { count: publishedStories } = await supabase.from('stories').select('*', { count: 'exact', head: true }).eq('is_published', true);
    
    const { count: totalChapters } = await supabase.from('chapters').select('*', { count: 'exact', head: true });
    
    const { count: pendingReports } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');

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
    // Placeholder cho user growth, trong thực tế sẽ group by month/day
    res.status(200).json({ success: true, data: [] });
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
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('reports')
      .select('*, story:stories(title), reporter:profiles!reported_by(username)', { count: 'exact' });
      
    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / parseInt(limit))
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

    const { data, error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data, message: 'Report resolved' });
  } catch (error) {
    next(error);
  }
};
