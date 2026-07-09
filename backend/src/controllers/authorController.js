import * as authorService from '../services/authorService.js';

// ─── TÁC GIẢ - QUẢN LÝ TRUYỆN ───────────────────────────────────────

export const getAuthorStories = async (req, res, next) => {
  try {
    const stories = await authorService.getAuthorStories(req.user.id);
    res.json({ success: true, data: stories });
  } catch (error) {
    next(error);
  }
};

export const createStory = async (req, res, next) => {
  try {
    const story = await authorService.createStory(req.user.id, req.body);
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

export const getStoryDetail = async (req, res, next) => {
  try {
    const story = await authorService.getStoryDetail(req.user.id, req.params.storyId);
    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

export const updateStory = async (req, res, next) => {
  try {
    const story = await authorService.updateStory(req.user.id, req.params.storyId, req.body);
    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    await authorService.deleteStory(req.user.id, req.params.storyId);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const changeStoryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }
    const story = await authorService.changeStoryStatus(req.user.id, req.params.storyId, status);
    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

export const uploadStoryCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const story = await authorService.uploadStoryCover(
      req.user.id,
      req.params.storyId,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

// ─── TÁC GIẢ - QUẢN LÝ CHƯƠNG ───────────────────────────────────────

export const getAuthorChapters = async (req, res, next) => {
  try {
    const chapters = await authorService.getAuthorChapters(req.user.id, req.params.storyId);
    res.json({ success: true, data: chapters });
  } catch (error) {
    next(error);
  }
};

export const createChapter = async (req, res, next) => {
  try {
    const chapter = await authorService.createChapter(req.user.id, req.params.storyId, req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const getChapterDetail = async (req, res, next) => {
  try {
    const chapter = await authorService.getChapterDetail(req.user.id, req.params.storyId, req.params.chapterId);
    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const chapter = await authorService.updateChapter(req.user.id, req.params.storyId, req.params.chapterId, req.body);
    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const deleteChapter = async (req, res, next) => {
  try {
    await authorService.deleteChapter(req.user.id, req.params.storyId, req.params.chapterId);
    res.json({ success: true, message: 'Chapter deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const publishChapter = async (req, res, next) => {
  try {
    const chapter = await authorService.publishChapter(req.user.id, req.params.storyId, req.params.chapterId);
    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const scheduleChapter = async (req, res, next) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: 'Missing scheduledAt' });
    }
    const chapter = await authorService.scheduleChapter(req.user.id, req.params.storyId, req.params.chapterId, scheduledAt);
    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};
