import express from 'express';
import multer from 'multer';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import * as authorController from '../controllers/authorController.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB to prevent OOM/DoS
});

// All routes require authentication and 'author' or 'admin' role
router.use(authMiddleware, requireRole(['author', 'admin']));

// ─── TÁC GIẢ - QUẢN LÝ TRUYỆN ───────────────────────────────────────
router.get('/stories', authorController.getAuthorStories);
router.post('/stories', authorController.createStory);
router.get('/stories/:storyId', authorController.getStoryDetail);
router.put('/stories/:storyId', authorController.updateStory);
router.delete('/stories/:storyId', authorController.deleteStory);
router.patch('/stories/:storyId/status', authorController.changeStoryStatus);
router.post('/stories/:storyId/cover', upload.single('cover'), authorController.uploadStoryCover);

// ─── TÁC GIẢ - QUẢN LÝ CHƯƠNG ───────────────────────────────────────
router.get('/stories/:storyId/chapters', authorController.getAuthorChapters);
router.post('/stories/:storyId/chapters', authorController.createChapter);
router.get('/stories/:storyId/chapters/:chapterId', authorController.getChapterDetail);
router.put('/stories/:storyId/chapters/:chapterId', authorController.updateChapter);
router.delete('/stories/:storyId/chapters/:chapterId', authorController.deleteChapter);
router.patch('/stories/:storyId/chapters/:chapterId/publish', authorController.publishChapter);
router.patch('/stories/:storyId/chapters/:chapterId/schedule', authorController.scheduleChapter);

export default router;
