import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import storyRoutes from './storyRoutes.js';

const router = express.Router();

// Tích hợp các sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/stories', storyRoutes);

export default router;
