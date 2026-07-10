// Middleware xử lý lỗi tập trung cho toàn ứng dụng Express
export const errorMiddleware = (err, req, res, next) => {
  if (err.statusCode !== 404) {
    console.error('Error stack:', err.stack || err);
  }

  const statusCode = Number(err.statusCode) || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Chỉ hiển thị stack trace khi ở môi trường development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
