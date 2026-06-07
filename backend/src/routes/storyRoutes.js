import express from 'express';
import {
  listStories,
  listTrendingStories,
  searchStoriesHandler,
  getStoryDetail,
  followStoryHandler,
  unfollowStoryHandler,
  favoriteStoryHandler,
  unfavoriteStoryHandler,
  rateStoryHandler,
  reportStoryHandler,
  shareStoryHandler,
} from '../controllers/storyController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ──────────────────────────────────────────────
// PUBLIC ROUTES (không cần đăng nhập)
// ──────────────────────────────────────────────

/**
 * @route   GET /api/stories
 * @desc    Lấy danh sách truyện (phân trang)
 * @query   page, limit, genre (slug), status, sort
 * @access  Public
 */
router.get('/', listStories);

/**
 * @route   GET /api/stories/trending
 * @desc    Truyện xu hướng / xem nhiều nhất
 * @query   period (week|month|all), limit
 * @access  Public
 */
router.get('/trending', listTrendingStories);

/**
 * @route   GET /api/stories/search
 * @desc    Tìm kiếm truyện nâng cao
 * @query   q, genre, status, minRating, sort, page, limit
 * @access  Public
 */
router.get('/search', searchStoriesHandler);

/**
 * @route   GET /api/stories/:storyId
 * @desc    Chi tiết một truyện (kèm trạng thái follow/favorite nếu đã đăng nhập)
 * @access  Public (optional auth)
 */
router.get('/:storyId', getStoryDetail);

/**
 * @route   POST /api/stories/:storyId/share
 * @desc    Tạo link chia sẻ (không cần đăng nhập)
 * @body    { platform? }
 * @access  Public (optional auth)
 */
router.post('/:storyId/share', shareStoryHandler);

// ──────────────────────────────────────────────
// PRIVATE ROUTES (yêu cầu Bearer token)
// ──────────────────────────────────────────────

/**
 * @route   POST /api/stories/:storyId/follow
 * @desc    Theo dõi truyện
 * @access  Private
 */
router.post('/:storyId/follow', authMiddleware, followStoryHandler);

/**
 * @route   DELETE /api/stories/:storyId/follow
 * @desc    Hủy theo dõi truyện
 * @access  Private
 */
router.delete('/:storyId/follow', authMiddleware, unfollowStoryHandler);

/**
 * @route   POST /api/stories/:storyId/favorite
 * @desc    Thêm vào yêu thích
 * @access  Private
 */
router.post('/:storyId/favorite', authMiddleware, favoriteStoryHandler);

/**
 * @route   DELETE /api/stories/:storyId/favorite
 * @desc    Xóa khỏi yêu thích
 * @access  Private
 */
router.delete('/:storyId/favorite', authMiddleware, unfavoriteStoryHandler);

/**
 * @route   POST /api/stories/:storyId/rate
 * @desc    Đánh giá truyện (1–5 sao)
 * @body    { score: 1-5, review?: string }
 * @access  Private
 */
router.post('/:storyId/rate', authMiddleware, rateStoryHandler);

/**
 * @route   POST /api/stories/:storyId/report
 * @desc    Báo cáo vi phạm
 * @body    { reason: 'spam'|'copyright'|'inappropriate'|'wrong_category'|'other', detail?: string }
 * @access  Private
 */
router.post('/:storyId/report', authMiddleware, reportStoryHandler);

export default router;
