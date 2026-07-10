import express from 'express';
import { 
  getGenres, 
  getStoriesByGenre, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  searchGlobal, 
  searchSuggestions 
} from '../controllers/utilityController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==========================================
// THỂ LOẠI (GENRES)
// ==========================================
router.get('/genres', getGenres);
router.get('/genres/:genreId/stories', getStoriesByGenre);

// ==========================================
// THÔNG BÁO (NOTIFICATIONS)
// ==========================================
router.get('/notifications', authMiddleware, getUserNotifications);
router.patch('/notifications/read-all', authMiddleware, markAllNotificationsAsRead);
router.patch('/notifications/:id/read', authMiddleware, markNotificationAsRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);

// ==========================================
// TÌM KIẾM TOÀN CỤC (GLOBAL SEARCH)
// ==========================================
router.get('/search', searchGlobal);
router.get('/search/suggestions', searchSuggestions);

export default router;
