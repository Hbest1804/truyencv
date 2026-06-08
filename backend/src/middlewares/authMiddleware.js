import { supabase } from '../config/database.js';

// Middleware xác thực JWT token từ Supabase Auth
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];

    // Xác thực token bằng Supabase Auth client
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error?.message
      });
    }

    // Đính kèm thông tin user vào request object để các controller phía sau sử dụng
    req.user = data.user;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware xác thực JWT token tùy chọn (không chặn request nếu thiếu/sai token)
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // Xác thực token bằng Supabase Auth client
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data?.user) {
        req.user = data.user;
      }
    }
    next();
  } catch (error) {
    // Với optional auth, lỗi xác thực token không nên chặn request
    next();
  }
};

