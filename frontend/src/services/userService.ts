const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function apiFetchPrivate<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.message || 'Đã xảy ra lỗi');
    (error as Error & { statusCode: number }).statusCode = response.status;
    throw error;
  }

  return json;
}

async function apiFetchPublic<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.message || 'Đã xảy ra lỗi');
    (error as Error & { statusCode: number }).statusCode = response.status;
    throw error;
  }

  return json;
}

export const userService = {
  // Lấy thông tin cá nhân hiện tại
  async getCurrentUser(token: string) {
    return apiFetchPrivate<any>('/users/me', token);
  },

  // Cập nhật thông tin cá nhân
  async updateProfile(token: string, data: { username?: string; display_name?: string; bio?: string }) {
    return apiFetchPrivate<any>('/users/me', token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Upload ảnh đại diện dạng base64
  async uploadAvatar(token: string, base64Image: string) {
    return apiFetchPrivate<any>('/users/me/avatar', token, {
      method: 'POST',
      body: JSON.stringify({ avatar: base64Image }),
    });
  },

  // Đổi mật khẩu
  async changePassword(token: string, data: { oldPassword: string; newPassword: string }) {
    return apiFetchPrivate<any>('/users/me/password', token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Lịch sử đọc truyện
  async getReadingHistory(token: string, page = 1, limit = 20) {
    return apiFetchPrivate<any[]>(`/users/me/reading-history?page=${page}&limit=${limit}`, token);
  },

  // Thư viện truyện đã lưu
  async getLibrary(token: string, page = 1, limit = 20) {
    return apiFetchPrivate<any[]>(`/users/me/library?page=${page}&limit=${limit}`, token);
  },

  // Danh sách truyện yêu thích
  async getFavorites(token: string, page = 1, limit = 20) {
    return apiFetchPrivate<any[]>(`/users/me/favorites?page=${page}&limit=${limit}`, token);
  },

  // Danh sách truyện đang theo dõi
  async getFollowing(token: string, page = 1, limit = 20) {
    return apiFetchPrivate<any[]>(`/users/me/following?page=${page}&limit=${limit}`, token);
  },

  // Xem hồ sơ công khai người dùng
  async getPublicProfile(userId: string) {
    return apiFetchPublic<any>(`/users/${userId}`);
  },
};
