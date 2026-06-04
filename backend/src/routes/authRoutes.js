import express from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập, lấy access token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất, hủy token
 * @access  Private (cần Bearer token)
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Làm mới access token
 * @access  Public (cần refresh_token trong body)
 */
router.post('/refresh-token', refreshToken);

export default router;
