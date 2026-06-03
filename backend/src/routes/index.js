import express from 'express';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

// Tích hợp các sub-routers
router.use('/health', healthRoutes);

// Bổ sung các routes khác tại đây trong tương lai, ví dụ:
// import authRoutes from './authRoutes.js';
// router.use('/auth', authRoutes);

export default router;
