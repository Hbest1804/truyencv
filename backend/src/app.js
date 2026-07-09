import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: function (origin, callback) {
    // Chấp nhận mọi origin (domain) để không bị lỗi CORS khi deploy Vercel
    callback(null, true);
  },
  credentials: true
}));

// Cấu hình parsing body dạng JSON và URL-encoded
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: true }));

// Health check route cho Render (ngăn lỗi 404 khi vào đường dẫn gốc)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TruyenCV API is running' });
});

// Định tuyến API chính
app.use('/api', routes);

// Route mặc định cho các request không hợp lệ (404 Not Found)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Middleware xử lý lỗi tập trung
app.use(errorMiddleware);

export default app;
