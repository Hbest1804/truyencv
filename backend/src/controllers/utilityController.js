import { supabase } from '../config/database.js';

// ==========================================
// 1. THỂ LOẠI (GENRES)
// ==========================================

export const getGenres = async (req, res, next) => {
  try {
    // Lấy danh sách thể loại và tính số lượng truyện (nếu có thể join, hoặc count riêng)
    // Để tối ưu, ta có thể dùng view hoặc join. Ở đây dùng supabase rpc hoặc subquery nếu cần, 
    // tạm thời lấy tất cả genres và có thể đếm ở client hoặc bằng function.
    // Thực tế có thể có bảng story_genres, đếm số lượng sẽ tốn chi phí. 
    // Chúng ta tạm thời trả về genres đơn giản.
    const { data: genres, error } = await supabase
      .from('genres')
      .select('*')
      .order('name');
      
    if (error) throw error;

    // TODO: tính storyCount có thể cần custom view hoặc function. Tạm thời trả về count=0
    const genresWithCount = genres.map(g => ({ ...g, storyCount: 0 }));

    res.status(200).json({ success: true, data: genresWithCount });
  } catch (error) {
    next(error);
  }
};

export const getStoriesByGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    // JOIN qua bảng story_genres
    const { data, count, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles!author_id(username, display_name),
        story_genres!inner(genre_id)
      `, { count: 'exact' })
      .eq('story_genres.genre_id', genreId)
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .range(offset, offset + parsedLimit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data.map(d => {
        const { story_genres, ...rest } = d;
        return rest;
      }),
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

// ==========================================
// 2. THÔNG BÁO (NOTIFICATIONS)
// ==========================================

export const getUserNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50); // Giới hạn 50 thông báo gần nhất

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. TÌM KIẾM TOÀN CỤC (GLOBAL SEARCH)
// ==========================================

export const searchGlobal = async (req, res, next) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters long' });
    }
    if (typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be a string of at least 2 characters' });
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;
    const sanitizedSearch = q.replace(/[,()]/g, '');

    let stories = [];
    let authors = [];

    if (type === 'all' || type === 'story') {
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*, author:profiles!author_id(username, display_name)')
        .eq('is_published', true)
        .ilike('title', `%${sanitizedSearch}%`)
        .order('view_count', { ascending: false })
        .range(offset, offset + parsedLimit - 1);
      if (storyError) throw storyError;
      stories = storyData || [];
    }

    if (type === 'all' || type === 'author') {
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role')
        .in('role', ['author', 'admin'])
        .or(`username.ilike.%${sanitizedSearch}%,display_name.ilike.%${sanitizedSearch}%`)
        .limit(parsedLimit);
      if (authorError) throw authorError;
      authors = authorData || [];
    }

    res.status(200).json({
      success: true,
      data: {
        stories,
        authors
      },
      pagination: {
        page: parsedPage,
        limit: parsedLimit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: { stories: [], authors: [] } });
    }
    if (typeof q !== 'string' || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: { stories: [], authors: [] } });
    }

    const sanitizedSearch = q.replace(/[,()]/g, '');

    const [storiesResult, authorsResult] = await Promise.all([
      supabase
        .from('stories')
        .select('id, title, slug, cover_url')
        .eq('is_published', true)
        .ilike('title', `%${sanitizedSearch}%`)
        .order('view_count', { ascending: false })
        .limit(5),
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('role', ['author', 'admin'])
        .or(`username.ilike.%${sanitizedSearch}%,display_name.ilike.%${sanitizedSearch}%`)
        .limit(5)
    ]);

    if (storiesResult.error) throw storiesResult.error;
    if (authorsResult.error) throw authorsResult.error;

    res.status(200).json({
      success: true,
      data: {
        stories: storiesResult.data || [],
        authors: authorsResult.data || []
      }
    });
  } catch (error) {
    next(error);
  }
};
