import { supabase } from '../config/database.js';

/**
 * Đăng ký tài khoản mới bằng Supabase Auth
 * @param {string} email
 * @param {string} password
 * @param {string} [username]
 */
export const registerUser = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
        display_name: username || email.split('@')[0],
      }
    }
  });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  return data;
};

/**
 * Đăng nhập bằng email và password
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 401;
    throw err;
  }

  return data;
};

/**
 * Đăng xuất - hủy session của user
 * Lưu ý: Supabase signOut() dùng session của supabase client instance.
 * Với custom token, ta validate trước rồi gọi signOut.
 * @param {string} accessToken
 */
export const logoutUser = async (accessToken) => {
  // Set session cho supabase client với token của user
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: '', // refresh_token không bắt buộc khi logout
  });

  if (sessionError) {
    // Bỏ qua lỗi invalid session vì mục tiêu là logout
    console.warn('Set session warning during logout:', sessionError.message);
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  return true;
};

/**
 * Làm mới access token từ refresh token
 * @param {string} refreshToken
 */
export const refreshUserToken = async (refreshToken) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    const err = new Error(error?.message || 'Could not refresh token');
    err.statusCode = 401;
    throw err;
  }

  return data;
};
