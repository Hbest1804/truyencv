import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Tự động tạo tài khoản Admin khi backend khởi động.
 * Sử dụng Supabase Service Role Key để bypass RLS và tạo user qua Admin API.
 */
export const seedAdminAccount = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminUsername = process.env.ADMIN_USERNAME || 'Admin';

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      '⚠️  [SeedAdmin] Bỏ qua: Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env'
    );
    return;
  }

  // Dùng service_role client để có quyền tạo/quản lý user qua Admin API
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [SeedAdmin] Không thể lấy danh sách users:', listError.message);
      return;
    }

    const adminAlreadyExists = existingUsers?.users?.some(
      (user) => user.email === adminEmail
    );

    if (adminAlreadyExists) {
      console.log(`✅ [SeedAdmin] Tài khoản Admin (${adminEmail}) đã tồn tại — bỏ qua.`);
      return;
    }

    // Tạo tài khoản admin mới
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Bỏ qua bước xác nhận email
      user_metadata: {
        username: adminUsername,
        display_name: adminUsername,
        role: 'admin',
      },
    });

    if (error) {
      console.error('❌ [SeedAdmin] Tạo tài khoản Admin thất bại:', error.message);
      return;
    }

    console.log('==========================================');
    console.log('🎉 [SeedAdmin] Tài khoản Admin đã được tạo!');
    console.log(`   Email   : ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   User ID : ${data.user?.id}`);
    console.log('==========================================');
  } catch (err) {
    console.error('❌ [SeedAdmin] Lỗi không mong đợi:', err.message);
  }
};
