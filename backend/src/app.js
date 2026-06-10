import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

// Cấu hình CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Cấu hình parsing body dạng JSON và URL-encoded
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: true }));

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
