import app from './src/app.js';
import dotenv from 'dotenv';
import { seedAdminAccount } from './src/utils/seedAdmin.js';

// Load biến môi trường từ file .env
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(` Server backend is running on port: ${PORT}`);

  // Tự động tạo tài khoản Admin nếu chưa tồn tại
  await seedAdminAccount();
});

// Xử lý lỗi Unhandled Rejections & Uncaught Exceptions
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message);
  process.exit(1);
});
