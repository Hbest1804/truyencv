import express from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();
import multer from 'multer';
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Tất cả các route trong file này đều yêu cầu đăng nhập và có role 'admin'
router.use(authMiddleware, requireRole(['admin']));

// ==========================================
// 8.1 Quản lý Người dùng
// ==========================================
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetail);
router.patch('/users/:userId/role', adminController.changeUserRole);
router.patch('/users/:userId/ban', adminController.toggleBanUser);
router.get('/users/:userId/activity', adminController.getUserActivity);

// ==========================================
// 8.2 Kiểm duyệt Truyện
// ==========================================
router.get('/stories', adminController.getPendingStories);
router.patch('/stories/:storyId/approve', adminController.approveStory);
router.patch('/stories/:storyId/hide', adminController.hideStory);
router.delete('/stories/:storyId', adminController.deleteStory);
router.get('/stories/:storyId', adminController.getStoryDetail);
router.put('/stories/:storyId', adminController.updateStory);
router.post('/stories/:storyId/cover', upload.single('cover'), adminController.uploadStoryCover);

// Quản lý thể loại
router.get('/genres', adminController.getGenres);
router.post('/genres', adminController.createGenre);
router.put('/genres/:genreId', adminController.updateGenre);
router.delete('/genres/:genreId', adminController.deleteGenre);

// ==========================================
// 8.3 Thống kê & Báo cáo
// ==========================================
router.get('/stats/overview', adminController.getStatsOverview);
router.get('/stats/stories/top-views', adminController.getTopViewedStories);
router.get('/stats/stories/top-favorites', adminController.getTopFavoriteStories);
router.get('/stats/users/growth', adminController.getUserGrowth);
router.get('/stats/chapters/activity', adminController.getChapterActivity);

router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId/resolve', adminController.resolveReport);

export default router;
