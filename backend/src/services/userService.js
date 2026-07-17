import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../config/database.js';

const checkAdminClient = () => {
  if (!supabaseAdmin) {
    const err = new Error('Supabase admin client chưa được cấu hình. Vui lòng thiết lập SUPABASE_SERVICE_ROLE_KEY.');
    err.statusCode = 500;
    throw err;
  }
};


/**
 * Lấy thông tin cá nhân hiện tại
 * @param {string} userId
 * @param {string} userEmail
 */
export const getUserProfile = async (userId, userEmail) => {
  checkAdminClient();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, role, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    const err = new Error('Không tìm thấy thông tin hồ sơ người dùng');
    err.statusCode = 404;
    throw err;
  }

  return {
    ...data,
    email: userEmail,
  };
};

/**
 * Cập nhật thông tin cá nhân
 * @param {string} userId
 * @param {object} updateData
 */
export const updateUserProfile = async (userId, { username, display_name, bio }) => {
  checkAdminClient();
  if (username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      const err = new Error('Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và từ 3 đến 30 ký tự');
      err.statusCode = 400;
      throw err;
    }

    // Kiểm tra trùng username
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (checkError) {
      const err = new Error(checkError.message);
      err.statusCode = 500;
      throw err;
    }

    if (existingUser) {
      const err = new Error('Tên người dùng đã được sử dụng');
      err.statusCode = 400;
      throw err;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      ...(username && { username }),
      ...(display_name !== undefined && { display_name }),
      ...(bio !== undefined && { bio }),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

/**
 * Upload ảnh đại diện bằng cách giải mã base64 và đẩy lên Supabase Storage
 * @param {string} userId
 * @param {string} base64Data
 */
export const uploadUserAvatar = async (userId, base64Data) => {
  if (!base64Data) {
    const err = new Error('Dữ liệu hình ảnh là bắt buộc');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra sơ bộ độ dài chuỗi base64 trước khi chuyển sang Buffer để tránh DoS/OOM (2MB binary = ~2.7MB base64)
  if (base64Data.length > 3 * 1024 * 1024) {
    const err = new Error('Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB');
    err.statusCode = 400;
    throw err;
  }

  const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    const err = new Error('Định dạng ảnh không hợp lệ. Vui lòng sử dụng định dạng Data URL (data:image/...;base64,...)');
    err.statusCode = 400;
    throw err;
  }

  const mimeType = matches[1];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedMimeTypes.includes(mimeType)) {
    const err = new Error('Chỉ chấp nhận các định dạng ảnh: jpeg, png, gif, webp');
    err.statusCode = 400;
    throw err;
  }

  let extension = mimeType.split('/')[1] || 'jpg';
  if (extension === 'jpeg') extension = 'jpg';
  const buffer = Buffer.from(matches[2], 'base64');

  // Kiểm tra kích thước file (giới hạn 2MB)
  if (buffer.length > 2 * 1024 * 1024) {
    const err = new Error('Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB');
    err.statusCode = 400;
    throw err;
  }

  checkAdminClient();

  // Xóa ảnh đại diện cũ (nếu có) để tránh tích lũy file rác trong Storage
  try {
    const { data: existingFiles } = await supabaseAdmin.storage.from('user imagin').list(userId);
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`);
      await supabaseAdmin.storage.from('user imagin').remove(filesToDelete);
    }
  } catch (storageErr) {
    console.warn('[Storage Cleanup Warning] Không thể dọn dẹp avatar cũ:', storageErr.message);
  }

  // Đường dẫn lưu file
  const filename = `${userId}/avatar_${Date.now()}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('user imagin')
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    const err = new Error(uploadError.message);
    err.statusCode = 500;
    throw err;
  }

  // Lấy URL công khai của file vừa upload
  const { data: publicUrlData } = supabaseAdmin.storage
    .from('user imagin')
    .getPublicUrl(filename);

  const avatarUrl = publicUrlData.publicUrl;

  // Cập nhật lại cột avatar_url trong bảng profiles
  const { data, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    const err = new Error(updateError.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
};

/**
 * Thay đổi mật khẩu người dùng
 * @param {string} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changeUserPassword = async (userId, email, oldPassword, newPassword) => {
  checkAdminClient();

  // Xác thực mật khẩu cũ bằng cách thử Đăng nhập với client tạm thời để tránh rò rỉ session trên shared client
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
  const { error: signInError } = await tempClient.auth.signInWithPassword({
    email,
    password: oldPassword,
  });

  if (signInError) {
    const err = new Error('Mật khẩu cũ không chính xác');
    err.statusCode = 401;
    throw err;
  }

  // Cập nhật mật khẩu mới bằng admin client
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    const err = new Error(updateError.message);
    err.statusCode = 400;
    throw err;
  }

  return true;
};

/**
 * Lấy lịch sử đọc truyện của người dùng
 * @param {string} userId
 * @param {number} page
 * @param {number} limit
 */
export const getReadingHistory = async (userId, page = 1, limit = 20) => {
  checkAdminClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('reading_history')
    .select(`
      id,
      progress,
      read_at,
      story:stories (
        id,
        title,
        slug,
        cover_url,
        status,
        chapter_count,
        rating_avg,
        bookmark_count,
        author:profiles!author_id (
          username,
          display_name,
          avatar_url
        )
      ),
      chapter:chapters (
        id,
        chapter_number,
        title
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    history: data || [],
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Lấy thư viện truyện đã lưu / theo dõi (bookmarks)
 * @param {string} userId
 * @param {number} page
 * @param {number} limit
 */
export const getLibrary = async (userId, page = 1, limit = 20) => {
  checkAdminClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('bookmarks')
    .select(`
      id,
      created_at,
      updated_at,
      last_chapter_id,
      story:stories (
        id,
        title,
        slug,
        cover_url,
        status,
        chapter_count,
        view_count,
        bookmark_count,
        rating_avg,
        rating_count,
        author:profiles!author_id (
          username,
          display_name,
          avatar_url
        )
      ),
      last_chapter:chapters!last_chapter_id (
        id,
        chapter_number,
        title
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    library: data || [],
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Lấy danh sách truyện yêu thích
 * @param {string} userId
 * @param {number} page
 * @param {number} limit
 */
export const getFavorites = async (userId, page = 1, limit = 20) => {
  checkAdminClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('favorites')
    .select(`
      id,
      created_at,
      story:stories (
        id,
        title,
        slug,
        cover_url,
        status,
        chapter_count,
        view_count,
        bookmark_count,
        rating_avg,
        rating_count,
        author:profiles!author_id (
          username,
          display_name,
          avatar_url
        )
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return {
    favorites: data || [],
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Lấy hồ sơ công khai người dùng
 * @param {string} userId
 */
export const getPublicProfile = async (userId) => {
  checkAdminClient();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    const err = new Error('Người dùng không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  return data;
};
