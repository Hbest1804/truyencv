import {
  getStories,
  getTrendingStories,
  searchStories,
  getStoryById,
  followStory,
  unfollowStory,
  favoriteStory,
  unfavoriteStory,
  rateStory,
  reportStory,
  shareStory,
  getChaptersOfStory,
  getChapterContent,
  saveReadingProgress,
  markChapterRead,
} from '../services/storyService.js';

/**
 * GET /api/stories
 * Query: page, limit, genre (slug), status, sort
 */
export const listStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genre, status, sort } = req.query;

    // Giới hạn limit tối đa 100
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    const safePage = Math.max(Number(page) || 1, 1);

    const result = await getStories({ page: safePage, limit: safeLimit, genre, status, sort });

    return res.status(200).json({
      success: true,
      data: result.stories,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stories/trending
 * Query: period (week | month | all), limit
 */
export const listTrendingStories = async (req, res, next) => {
  try {
    const { period = 'week', limit = 10 } = req.query;
    const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50));

    const stories = await getTrendingStories({ period, limit: safeLimit });

    return res.status(200).json({
      success: true,
      period,
      data: stories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stories/search
 * Query: q, genre, status, minRating, sort, page, limit
 */
export const searchStoriesHandler = async (req, res, next) => {
  try {
    const { q, genre, status, minRating, sort, page = 1, limit = 20 } = req.query;

    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    const safePage = Math.max(Number(page) || 1, 1);

    const result = await searchStories({
      q,
      genre,
      status,
      minRating,
      sort,
      page: safePage,
      limit: safeLimit,
    });

    return res.status(200).json({
      success: true,
      query: q || '',
      data: result.stories,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stories/:storyId
 */
export const getStoryDetail = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    // req.user có thể null nếu không đăng nhập
    const userId = req.user?.id || null;

    const story = await getStoryById(storyId, userId);

    return res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/follow
 * Yêu cầu: Bearer token
 */
export const followStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const bookmark = await followStory(storyId, userId);

    return res.status(201).json({
      success: true,
      message: 'Theo dõi truyện thành công!',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/stories/:storyId/follow
 * Yêu cầu: Bearer token
 */
export const unfollowStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    await unfollowStory(storyId, userId);

    return res.status(200).json({
      success: true,
      message: 'Hủy theo dõi truyện thành công!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/favorite
 * Yêu cầu: Bearer token
 */
export const favoriteStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const result = await favoriteStory(storyId, userId);

    return res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/stories/:storyId/favorite
 * Yêu cầu: Bearer token
 */
export const unfavoriteStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    await unfavoriteStory(storyId, userId);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/rate
 * Body: { score (1-5), review? }
 * Yêu cầu: Bearer token
 */
export const rateStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;
    const { score, review } = req.body;

    if (!score) {
      return res.status(400).json({
        success: false,
        message: 'score là bắt buộc (số nguyên từ 1 đến 5)',
      });
    }

    const rating = await rateStory(storyId, userId, score, review);

    return res.status(200).json({
      success: true,
      message: 'Đánh giá truyện thành công!',
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/report
 * Body: { reason, detail? }
 * reason: 'spam' | 'copyright' | 'inappropriate' | 'wrong_category' | 'other'
 * Yêu cầu: Bearer token
 */
export const reportStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;
    const { reason, detail } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'reason là bắt buộc. Chọn một trong: spam, copyright, inappropriate, wrong_category, other',
      });
    }

    const report = await reportStory(storyId, userId, reason, detail);

    return res.status(201).json({
      success: true,
      message: 'Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét sớm!',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/share
 * Body: { platform? } - 'general' | 'facebook' | 'twitter' | 'telegram'
 * Access: Public (không cần đăng nhập)
 */
export const shareStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user?.id || null;
    const { platform = 'general' } = req.body;

    const shareData = await shareStory(storyId, userId, platform);

    return res.status(200).json({
      success: true,
      message: 'Tạo link chia sẻ thành công!',
      data: shareData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stories/:storyId/chapters
 * Query: page, limit
 */
export const listChaptersOfStoryHandler = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 200));
    const safePage = Math.max(Number(page) || 1, 1);

    const result = await getChaptersOfStory(storyId, { page: safePage, limit: safeLimit });

    return res.status(200).json({
      success: true,
      data: result.chapters,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stories/:storyId/chapters/:chapterId
 */
export const getChapterContentHandler = async (req, res, next) => {
  try {
    const { storyId, chapterId } = req.params;
    const userId = req.user?.id || null;

    const chapter = await getChapterContent(storyId, chapterId, userId);

    return res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/chapters/:chapterId/progress
 * Body: { progress }
 */
export const saveReadingProgressHandler = async (req, res, next) => {
  try {
    const { storyId, chapterId } = req.params;
    const userId = req.user.id;
    const { progress } = req.body;

    if (progress === undefined || progress === null) {
      return res.status(400).json({
        success: false,
        message: 'progress là bắt buộc (số nguyên từ 0 đến 100)',
      });
    }

    const safeProgress = Math.max(0, Math.min(Number(progress) || 0, 100));

    const history = await saveReadingProgress(storyId, chapterId, userId, safeProgress);

    return res.status(200).json({
      success: true,
      message: 'Lưu vị trí đọc thành công!',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/stories/:storyId/chapters/:chapterId/mark-read
 */
export const markChapterReadHandler = async (req, res, next) => {
  try {
    const { storyId, chapterId } = req.params;
    const userId = req.user.id;

    const history = await markChapterRead(storyId, chapterId, userId);

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc chương truyện!',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
