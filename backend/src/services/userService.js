import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../config/database.js';

/**
 * Lấy thông tin cá nhân hiện tại
 * @param {string} userId
 * @param {string} userEmail
 */
export const getUserProfile = async (userId, userEmail) => {
  const { data, error } = await supabase
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
  if (username) {
    // Kiểm tra trùng username
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (existingUser) {
      const err = new Error('Tên người dùng đã được sử dụng');
      err.statusCode = 400;
      throw err;
    }
  }

  const { data, error } = await supabase
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

  const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  let mimeType = 'image/jpeg';
  let extension = 'jpg';
  let buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    extension = mimeType.split('/')[1] || 'jpg';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // Dự phòng khi chỉ gửi chuỗi base64 thô
    buffer = Buffer.from(base64Data, 'base64');
  }

  if (!supabaseAdmin) {
    const err = new Error('Supabase admin client chưa được cấu hình');
    err.statusCode = 500;
    throw err;
  }

  // Khởi tạo bucket 'avatars' nếu chưa tồn tại
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
  if (bucketsError) {
    throw bucketsError;
  }

  const bucketExists = buckets?.some((b) => b.name === 'avatars');
  if (!bucketExists) {
    const { error: createBucketError } = await supabaseAdmin.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    });
    if (createBucketError) throw createBucketError;
  }

  // Đường dẫn lưu file
  const filename = `${userId}/avatar_${Date.now()}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('avatars')
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
    .from('avatars')
    .getPublicUrl(filename);

  const avatarUrl = publicUrlData.publicUrl;

  // Cập nhật lại cột avatar_url trong bảng profiles
  const { data, error: updateError } = await supabase
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
export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  if (!supabaseAdmin) {
    const err = new Error('Supabase admin client chưa được cấu hình');
    err.statusCode = 500;
    throw err;
  }

  // Lấy email của người dùng từ Supabase Auth
  const { data: userDetails, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (getUserError || !userDetails?.user) {
    const err = new Error('Không tìm thấy thông tin người dùng trong hệ thống xác thực');
    err.statusCode = 404;
    throw err;
  }

  const email = userDetails.user.email;

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
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
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
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
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
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
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
  const { data, error } = await supabase
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
