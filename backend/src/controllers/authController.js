import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
} from '../services/authService.js';
import { supabase } from '../config/database.js';

/**
 * POST /api/auth/register
 * Body: { email, password, username? }
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    const data = await registerUser(email, password, username);

    // Supabase có thể yêu cầu email confirmation
    const needsEmailConfirmation = !data.session;

    return res.status(201).json({
      success: true,
      message: needsEmailConfirmation
        ? 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.'
        : 'Đăng ký thành công!',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: data.user?.user_metadata?.username,
          created_at: data.user?.created_at,
        },
        ...(data.session && {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          token_type: data.session.token_type,
        }),
        needs_email_confirmation: needsEmailConfirmation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc',
      });
    }

    const data = await loginUser(email, password);

    if (!data?.user) {
      const err = new Error('Đăng nhập thất bại: Không tìm thấy thông tin người dùng');
      err.statusCode = 401;
      throw err;
    }

    // Lấy thông tin profile thực tế từ DB để trả về đầy đủ cho client
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, bio, role')
      .eq('id', data.user.id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: profile?.username || data.user?.user_metadata?.username,
          display_name: profile?.display_name || data.user?.user_metadata?.display_name,
          avatar_url: profile?.avatar_url,
          bio: profile?.bio,
          role: profile?.role,
          created_at: data.user?.created_at,
        },
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        token_type: data.session?.token_type || 'Bearer',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <access_token>
 */
export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token là bắt buộc để đăng xuất',
      });
    }

    const accessToken = authHeader.split(' ')[1];

    await logoutUser(accessToken);

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 * Body: { refresh_token }
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'refresh_token là bắt buộc',
      });
    }

    const data = await refreshUserToken(refresh_token);

    if (!data?.user) {
      const err = new Error('Làm mới token thất bại: Không tìm thấy thông tin người dùng');
      err.statusCode = 401;
      throw err;
    }

    // Lấy thông tin profile thực tế từ DB để trả về đầy đủ cho client khi refresh token
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, bio, role')
      .eq('id', data.user.id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      message: 'Làm mới token thành công!',
      data: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        token_type: data.session?.token_type || 'Bearer',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: profile?.username || data.user?.user_metadata?.username,
          display_name: profile?.display_name || data.user?.user_metadata?.display_name,
          avatar_url: profile?.avatar_url,
          bio: profile?.bio,
          role: profile?.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
