import { createClient } from '@supabase/supabase-js';
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
  // Tạo client tạm thời, KHÔNG dùng global singleton để tránh session leak
  // giữa các request đồng thời trong môi trường multi-user server
  const tempClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  await tempClient.auth.setSession({
    access_token: accessToken,
    refresh_token: '',
  });

  const { error } = await tempClient.auth.signOut();

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
