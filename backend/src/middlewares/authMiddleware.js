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

// Middleware phân quyền dựa trên role trong bảng profiles
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access token is missing or invalid'
        });
      }

      // Lấy thông tin profile từ database để kiểm tra role và trạng thái bị ban chính xác
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          success: false,
          message: 'User profile not found or access denied'
        });
      }

      if (profile.is_banned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: user account is banned'
        });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      // Đính kèm profile role vào user object
      req.user.role = profile.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};


