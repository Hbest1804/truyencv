import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// Tích hợp các sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router;
