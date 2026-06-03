import axios from 'axios';

// Khởi tạo một Axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  timeout: 10000, // 10s timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Bạn có thể thêm request/response interceptors ở đây nếu cần thiết
axiosInstance.interceptors.request.use(
  (config) => {
    // Ví dụ: tự động gắn token từ session hay biến môi trường nếu gọi ngoài
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Trả thẳng dữ liệu payload về
  },
  (error) => {
    // Xử lý lỗi chung khi gọi API ngoài
    const message = error.response?.data?.message || error.message || 'Axios request error';
    console.error('Axios Error:', message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
