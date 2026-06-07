import { supabase } from '../config/database.js';

// ============================================================
// GET /stories - Lấy danh sách truyện (phân trang)
// ============================================================
export const getStories = async ({ page = 1, limit = 20, genre, status, sort = 'updated_at' }) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('v_story_detail')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (status) {
    query = query.eq('status', status);
  }

  if (genre) {
    // Lọc theo slug thể loại
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

    // Lấy story_ids thuộc thể loại này
    const { data: storyGenres, error: sgError } = await supabase
      .from('story_genres')
      .select('story_id')
      .eq('genre_id', genreData.id);

    if (sgError) throw sgError;

    const storyIds = storyGenres.map((sg) => sg.story_id);
    if (storyIds.length === 0) {
      return { stories: [], total: 0, page, limit, totalPages: 0 };
    }
    query = query.in('id', storyIds);
  }

  // Sắp xếp
  const validSorts = ['updated_at', 'created_at', 'view_count', 'rating_avg', 'bookmark_count'];
  const sortField = validSorts.includes(sort) ? sort : 'updated_at';
  query = query.order(sortField, { ascending: false });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    stories: data,
    total: count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(count / limit),
  };
};

// ============================================================
// GET /stories/trending - Truyện xu hướng / xem nhiều nhất
// ============================================================
export const getTrendingStories = async ({ period = 'week', limit = 10 }) => {
  const validPeriods = { week: 7, month: 30, all: null };
  const days = validPeriods[period] ?? 7;

  let viewQuery = supabase
    .from('story_views')
    .select('story_id, count:story_id.count()')
    .order('count', { ascending: false })
    .limit(limit);

  if (days) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    viewQuery = viewQuery.gte('viewed_at', since);
  }

  const { data: viewData, error: viewError } = await viewQuery;

  if (viewError) {
    // Fallback: lấy theo view_count tổng từ bảng stories
    const { data, error } = await supabase
      .from('v_story_detail')
      .select('*')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }
    return data;
  }

  if (!viewData || viewData.length === 0) {
    // Fallback khi chưa có view data
    const { data, error } = await supabase
      .from('v_story_detail')
      .select('*')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }
    return data;
  }

  const storyIds = viewData.map((v) => v.story_id);

  const { data: stories, error: storiesError } = await supabase
    .from('v_story_detail')
    .select('*')
    .in('id', storyIds)
    .eq('is_published', true);

  if (storiesError) {
    const err = new Error(storiesError.message);
    err.statusCode = 500;
    throw err;
  }

  // Gắn views_in_period và sort theo thứ tự view
  const viewMap = new Map(viewData.map((v) => [v.story_id, v.count]));
  return stories
    .map((s) => ({ ...s, views_in_period: viewMap.get(s.id) || 0 }))
    .sort((a, b) => b.views_in_period - a.views_in_period);
};

// ============================================================
// GET /stories/search - Tìm kiếm truyện nâng cao
// ============================================================
export const searchStories = async ({ q, genre, status, minRating, sort = 'updated_at', page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('v_story_detail')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (q && q.trim()) {
    // Tìm kiếm theo title hoặc author username
    query = query.or(`title.ilike.%${q.trim()}%,author_username.ilike.%${q.trim()}%`);
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

      const storyIds = (storyGenres || []).map((sg) => sg.story_id);
      if (storyIds.length === 0) {
        return { stories: [], total: 0, page, limit, totalPages: 0 };
      }
      query = query.in('id', storyIds);
    }
  }

  const validSorts = ['updated_at', 'created_at', 'view_count', 'rating_avg', 'bookmark_count'];
  const sortField = validSorts.includes(sort) ? sort : 'updated_at';
  query = query.order(sortField, { ascending: false });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    stories: data,
    total: count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(count / limit),
  };
};

// ============================================================
// GET /stories/:storyId - Chi tiết một truyện
// ============================================================
export const getStoryById = async (storyId, userId = null) => {
  const { data: story, error } = await supabase
    .from('v_story_detail')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error || !story) {
    const err = new Error('Truyện không tồn tại hoặc chưa được xuất bản');
    err.statusCode = 404;
    throw err;
  }

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
    isFavorited = !!bookmarkRes.data; // bookmarks = theo dõi / yêu thích trong schema này
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
  // Kiểm tra truyện tồn tại
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

  // Kiểm tra đã theo dõi chưa
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
// Ghi chú: Dùng chung bảng bookmarks (bookmark = follow + favorite)
// Tạo thêm bảng favorites riêng nếu muốn phân biệt
// ============================================================
export const favoriteStory = async (storyId, userId) => {
  // Kiểm tra truyện tồn tại
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

  // Dùng bookmarks như favorites (hoặc nếu schema có bảng riêng thì đổi ở đây)
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
  // Validate score
  if (!score || score < 1 || score > 5 || !Number.isInteger(Number(score))) {
    const err = new Error('Điểm đánh giá phải là số nguyên từ 1 đến 5');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra truyện tồn tại
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

  // Upsert rating (tạo mới hoặc cập nhật nếu đã đánh giá)
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
// Ghi chú: Schema hiện tại chưa có bảng reports.
// Ta tạm lưu vào notifications hoặc dùng Supabase realtime edge.
// Ở đây trả về response thành công và log để admin xử lý.
// ============================================================
export const reportStory = async (storyId, userId, reason, detail = '') => {
  const validReasons = ['spam', 'copyright', 'inappropriate', 'wrong_category', 'other'];

  if (!reason || !validReasons.includes(reason)) {
    const err = new Error(`Lý do báo cáo không hợp lệ. Chọn một trong: ${validReasons.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra truyện tồn tại
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

  // Lấy thông tin admin để gửi notification
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin');

  // Gửi notification đến tất cả admin
  if (admins && admins.length > 0) {
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: 'system',
      title: `Báo cáo vi phạm: ${story.title}`,
      body: `Lý do: ${reason}. Chi tiết: ${detail || 'Không có'}. Story ID: ${storyId}. Báo cáo bởi user: ${userId}`,
      link_url: `/admin/reports/${storyId}`,
    }));

    await supabase.from('notifications').insert(notifications);
  }

  // Log báo cáo (trong thực tế nên có bảng reports riêng)
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
  // Kiểm tra truyện tồn tại
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

  // Tạo link chia sẻ theo platform
  const shareLinks = {
    general: shareUrl,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(story.title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(story.title)}`,
  };

  // Tăng view_count (tính share như một lượt tương tác)
  // Không tăng view_count cho share, chỉ ghi nhận

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
