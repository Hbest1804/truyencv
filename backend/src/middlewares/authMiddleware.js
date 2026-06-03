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
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error?.message
      });
    }

    // Đính kèm thông tin user vào request object để các controller phía sau sử dụng
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
