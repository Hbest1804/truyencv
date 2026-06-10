import express from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  uploadAvatar,
  changePassword,
  getReadingHistory,
  getLibrary,
  getFavorites,
  getFollowing,
  getPublicProfile,
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Lấy thông tin cá nhân hiện tại
 * @access  Private
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route   PUT /api/users/me
 * @desc    Cập nhật thông tin cá nhân
 * @access  Private
 */
router.put('/me', authMiddleware, updateCurrentUser);

/**
 * @route   POST /api/users/me/avatar
 * @desc    Upload ảnh đại diện dạng base64
 * @access  Private
 */
router.post('/me/avatar', authMiddleware, uploadAvatar);

/**
 * @route   PUT /api/users/me/password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
router.put('/me/password', authMiddleware, changePassword);

/**
 * @route   GET /api/users/me/reading-history
 * @desc    Lấy lịch sử đọc truyện
 * @access  Private
 */
router.get('/me/reading-history', authMiddleware, getReadingHistory);

/**
 * @route   GET /api/users/me/library
 * @desc    Lấy thư viện truyện đã lưu
 * @access  Private
 */
router.get('/me/library', authMiddleware, getLibrary);

/**
 * @route   GET /api/users/me/favorites
 * @desc    Lấy danh sách truyện yêu thích
 * @access  Private
 */
router.get('/me/favorites', authMiddleware, getFavorites);

/**
 * @route   GET /api/users/me/following
 * @desc    Lấy danh sách truyện đang theo dõi
 * @access  Private
 */
router.get('/me/following', authMiddleware, getFollowing);

/**
 * @route   GET /api/users/:userId
 * @desc    Xem hồ sơ công khai người dùng
 * @access  Public
 */
router.get('/:userId', getPublicProfile);

export default router;
