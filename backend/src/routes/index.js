import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import storyRoutes from './storyRoutes.js';
import userRoutes from './userRoutes.js';
import authorRoutes from './authorRoutes.js';
import adminRoutes from './adminRoutes.js';
import utilityRoutes from './utilityRoutes.js';

const router = express.Router();

// Tích hợp các sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/stories', storyRoutes);
router.use('/users', userRoutes);
router.use('/author', authorRoutes);
router.use('/admin', adminRoutes);

// Tích hợp các route công cộng và tiện ích (Genres, Notifications, Search)
router.use('/', utilityRoutes);

export default router;
