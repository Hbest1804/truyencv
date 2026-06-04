# 📚 TruyenCV — Nền Tảng Đọc Truyện Online

<div align="center">

![TruyenCV Banner](https://img.shields.io/badge/TruyenCV-Đọc%20Truyện%20Online-6c63ff?style=for-the-badge&logo=bookstack&logoColor=white)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**TruyenCV** là một nền tảng đọc truyện chữ trực tuyến với giao diện hiện đại, hỗ trợ xác thực người dùng, tìm kiếm & khám phá truyện, đọc truyện theo chương, và tích hợp AI (Gemini).

[🚀 Demo](#) · [📋 Báo lỗi](https://github.com/Hbest1804/truyencv/issues) · [💡 Đề xuất tính năng](https://github.com/Hbest1804/truyencv/issues)

</div>

---

## 📑 Mục Lục

- [✨ Tính Năng](#-tính-năng)
- [🏗️ Kiến Trúc Hệ Thống](#️-kiến-trúc-hệ-thống)
- [🛠️ Công Nghệ Sử Dụng](#️-công-nghệ-sử-dụng)
- [📁 Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [⚙️ Cài Đặt & Khởi Chạy](#️-cài-đặt--khởi-chạy)
- [🔑 Biến Môi Trường](#-biến-môi-trường)
- [📡 API Endpoints](#-api-endpoints)
- [🤝 Đóng Góp](#-đóng-góp)

---

## ✨ Tính Năng

| Tính năng | Mô tả |
|-----------|-------|
| 🏠 **Trang Chủ** | Hiển thị truyện nổi bật, đọc gần đây, và bảng xếp hạng |
| 🔍 **Khám Phá** | Tìm kiếm và lọc truyện theo thể loại, trạng thái |
| 📖 **Chi Tiết Truyện** | Xem thông tin đầy đủ, danh sách chương, bình luận |
| 📜 **Đọc Truyện** | Giao diện đọc tối ưu, hỗ trợ điều hướng chương |
| 🔐 **Xác Thực** | Đăng ký / Đăng nhập với JWT + Supabase Auth |
| 🤖 **AI Integration** | Tích hợp Gemini AI API |
| 📱 **Responsive** | Tương thích đầy đủ trên desktop & mobile |
| 🎨 **Dark Mode UI** | Giao diện tối hiện đại với animation mượt mà |

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│   React 19 + TypeScript + Vite + TailwindCSS v4         │
│                                                         │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────────┐ │
│  │ HomePage │  │DiscoverPage │  │DetailPage/ReaderPage│ │
│  └──────────┘  └─────────────┘  └────────────────────┘ │
│                  AuthContext (JWT)                       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────────────────┐
│                      BACKEND                            │
│            Node.js + Express.js (ESM)                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ authRoutes  │  │ healthRoutes │  │  middlewares   │  │
│  │ /register   │  │ /health      │  │  errorHandler  │  │
│  │ /login      │  └──────────────┘  │  CORS          │  │
│  │ /logout     │                    └───────────────┘  │
│  │ /refresh    │                                        │
│  └──────┬──────┘                                        │
└─────────┼───────────────────────────────────────────────┘
          │ Supabase JS SDK
┌─────────▼───────────────────────────────────────────────┐
│                     SUPABASE                            │
│          PostgreSQL Database + Auth + Storage           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 19.x | UI Framework |
| TypeScript | 5.8 | Type-safe JavaScript |
| Vite | 6.x | Build tool & Dev server |
| TailwindCSS | 4.x | Utility-first CSS |
| Motion (Framer) | 12.x | Animation library |
| Lucide React | Latest | Icon library |
| @google/genai | 2.x | Gemini AI SDK |

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Node.js | Latest LTS | Runtime |
| Express.js | 4.x | Web framework |
| @supabase/supabase-js | 2.x | Database & Auth client |
| Axios | 1.x | HTTP client |
| dotenv | 16.x | Environment variables |
| cors | 2.x | CORS middleware |
| nodemon | 3.x | Dev auto-reload |

---

## 📁 Cấu Trúc Dự Án

```
truyencv/
├── 📂 frontend/                    # React + TypeScript SPA
│   ├── 📂 src/
│   │   ├── 📂 components/          # UI components tái sử dụng
│   │   │   ├── 📂 auth/            # AuthModal, LoginForm, RegisterForm
│   │   │   └── 📂 ui/              # BookCard, ChapterList, ...
│   │   ├── 📂 contexts/
│   │   │   └── AuthContext.tsx     # Global auth state (JWT)
│   │   ├── 📂 constants/
│   │   │   └── mockData.ts         # Dữ liệu mẫu (dev)
│   │   ├── 📂 hooks/               # Custom React hooks
│   │   ├── 📂 layouts/
│   │   │   ├── Header.tsx          # Thanh điều hướng chính
│   │   │   └── Footer.tsx          # Footer
│   │   ├── 📂 pages/
│   │   │   ├── HomePage.tsx        # Trang chủ
│   │   │   ├── DiscoverPage.tsx    # Khám phá truyện
│   │   │   ├── DetailPage.tsx      # Chi tiết truyện
│   │   │   └── ReaderPage.tsx      # Giao diện đọc
│   │   ├── 📂 services/            # API service calls
│   │   ├── 📂 types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx                 # Root component + routing
│   │   └── main.tsx                # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── .env.example
│
├── 📂 backend/                     # Node.js + Express API
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── axios.js            # Axios instance config
│   │   ├── 📂 controllers/
│   │   │   ├── authController.js   # Xử lý đăng ký/đăng nhập
│   │   │   └── healthController.js # Health check
│   │   ├── 📂 middlewares/
│   │   │   └── errorMiddleware.js  # Error handling tập trung
│   │   ├── 📂 routes/
│   │   │   ├── index.js            # Route aggregator
│   │   │   ├── authRoutes.js       # /api/auth/*
│   │   │   └── healthRoutes.js     # /api/health
│   │   ├── 📂 services/
│   │   │   └── authService.js      # Business logic xác thực
│   │   ├── 📂 utils/               # Utility functions
│   │   └── app.js                  # Express app setup
│   ├── server.js                   # Entry point
│   ├── supabase_schema.sql         # Database schema
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Cài Đặt & Khởi Chạy

### Yêu cầu
- **Node.js** >= 18.x
- **npm** >= 9.x
- Tài khoản **Supabase** (miễn phí)

### 1. Clone dự án

```bash
git clone https://github.com/Hbest1804/truyencv.git
cd truyencv
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin của bạn (xem phần [Biến Môi Trường](#-biến-môi-trường)).

Khởi chạy backend (dev mode):

```bash
npm run dev
```

> Backend sẽ chạy tại: `http://localhost:5000`

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Khởi chạy frontend (dev mode):

```bash
npm run dev
```

> Frontend sẽ chạy tại: `http://localhost:3000`

### 4. Thiết lập Database (Supabase)

1. Truy cập [supabase.com](https://supabase.com) và tạo project mới
2. Vào **SQL Editor** trong Supabase dashboard
3. Copy nội dung file `backend/supabase_schema.sql` và chạy
4. Lấy **Project URL** và **Anon Key** từ **Settings → API**
5. Điền vào file `.env` của backend

---

## 🔑 Biến Môi Trường

### Backend (`backend/.env`)

```env
# Cổng server (mặc định: 5000)
PORT=5000

# Supabase configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT secret key (dùng để ký token)
JWT_SECRET=your-super-secret-jwt-key

# CORS - URL của frontend
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
# URL của backend API
VITE_API_URL=http://localhost:5000/api

# Gemini AI API Key (từ Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key

# URL của ứng dụng (khi deploy)
APP_URL=http://localhost:3000
```

> ⚠️ **Lưu ý bảo mật:** Không commit file `.env` lên git. Các file này đã được thêm vào `.gitignore`.

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Mô tả | Access |
|--------|----------|-------|--------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | Public |
| `POST` | `/api/auth/login` | Đăng nhập, nhận access token | Public |
| `POST` | `/api/auth/logout` | Đăng xuất, hủy token | Private |
| `POST` | `/api/auth/refresh-token` | Làm mới access token | Public |

### Health (`/api/health`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/health` | Kiểm tra trạng thái server |

### Request/Response Examples

**POST `/api/auth/register`**
```json
// Request body
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "myusername"
}

// Response
{
  "success": true,
  "message": "Đăng ký thành công! Vui lòng xác nhận email.",
  "needsEmailConfirmation": true
}
```

**POST `/api/auth/login`**
```json
// Request body
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// Response
{
  "success": true,
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "myusername"
  }
}
```

---

## 🌿 Nhánh Git

| Nhánh | Mô tả |
|-------|-------|
| `main` | Nhánh production, code ổn định |
| `dev` | Nhánh phát triển chính, tổng hợp features |
| `feature/*` | Nhánh tính năng mới (tách từ `dev`) |
| `fix/*` | Nhánh sửa lỗi |

**Quy trình làm việc:**
```
feature/ten-tinh-nang  →  dev  →  main
```

---

## 🤝 Đóng Góp

1. **Fork** repository này
2. Tạo nhánh tính năng từ `dev`:
   ```bash
   git checkout dev
   git checkout -b feature/ten-tinh-nang
   ```
3. Commit thay đổi:
   ```bash
   git commit -m "feat: thêm tính năng X"
   ```
4. Push lên GitHub:
   ```bash
   git push origin feature/ten-tinh-nang
   ```
5. Tạo **Pull Request** vào nhánh `dev`

### Commit Message Convention
```
feat:     Tính năng mới
fix:      Sửa lỗi
docs:     Cập nhật tài liệu
style:    Format code (không thay đổi logic)
refactor: Tái cấu trúc code
chore:    Cập nhật dependencies, config
```

---

## 📄 License

Dự án này được phân phối dưới giấy phép **ISC**.

---

<div align="center">

Made with ❤️ by **Hbest1804**

⭐ Nếu dự án hữu ích, hãy cho một star nhé!

</div>
