import {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  changeUserPassword,
  getReadingHistory as getReadingHistoryService,
  getLibrary as getLibraryService,
  getFavorites as getFavoritesService,
  getPublicProfile as getPublicProfileService,
} from '../services/userService.js';

/**
 * GET /users/me
 * Lấy thông tin cá nhân hiện tại
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const profile = await getUserProfile(userId, userEmail);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /users/me
 * Cập nhật thông tin cá nhân
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, display_name, bio } = req.body;

    const updatedProfile = await updateUserProfile(userId, { username, display_name, bio });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /users/me/avatar
 * Upload ảnh đại diện
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body; // Chuỗi base64 của ảnh

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu ảnh đại diện (avatar) dạng base64 là bắt buộc trong body request',
      });
    }

    const updatedProfile = await uploadUserAvatar(userId, avatar);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công!',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /users/me/password
 * Đổi mật khẩu
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu cũ và mật khẩu mới là bắt buộc',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    await changeUserPassword(userId, req.user.email, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Thay đổi mật khẩu thành công!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/me/reading-history
 * Lịch sử đọc truyện
 */
export const getReadingHistory = async (req, res, next) => {
  try {
    let pageNum = parseInt(req.query.page, 10);
    let limitNum = parseInt(req.query.limit, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;

    const result = await getReadingHistoryService(userId, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      data: result.history,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/me/library
 * Thư viện truyện đã lưu
 */
export const getLibrary = async (req, res, next) => {
  try {
    let pageNum = parseInt(req.query.page, 10);
    let limitNum = parseInt(req.query.limit, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;

    const result = await getLibraryService(userId, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      data: result.library,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/me/favorites
 * Danh sách truyện yêu thích
 */
export const getFavorites = async (req, res, next) => {
  try {
    let pageNum = parseInt(req.query.page, 10);
    let limitNum = parseInt(req.query.limit, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;

    const result = await getFavoritesService(userId, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      data: result.favorites,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/me/following
 * Danh sách truyện đang theo dõi (sử dụng chung bảng bookmarks với library)
 */
export const getFollowing = async (req, res, next) => {
  try {
    let pageNum = parseInt(req.query.page, 10);
    let limitNum = parseInt(req.query.limit, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;

    // Sử dụng chung service với library (bookmarks)
    const result = await getLibraryService(userId, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      data: result.library, // sử dụng bookmarks
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/:userId
 * Xem hồ sơ công khai người dùng
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const profile = await getPublicProfileService(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
