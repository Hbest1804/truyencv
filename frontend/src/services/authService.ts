const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginData {
  user: {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    created_at?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface RegisterData {
  user: {
    id: string;
    email: string;
    username?: string;
    created_at?: string;
  };
  access_token?: string;
  refresh_token?: string;
  needs_email_confirmation: boolean;
}

interface RefreshData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

async function apiFetch<T>(
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

export const authService = {
  async register(email: string, password: string, username?: string) {
    return apiFetch<RegisterData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  },

  async login(email: string, password: string) {
    return apiFetch<LoginData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(accessToken: string) {
    return apiFetch('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async refreshToken(refreshToken: string) {
    return apiFetch<RefreshData>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};
