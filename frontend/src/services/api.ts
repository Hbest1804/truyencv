const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAccessToken(): string | null {
  return localStorage.getItem('auth_access_token');
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    json = { message: text || 'Đã xảy ra lỗi' };
  }

  if (!response.ok) {
    const error = new Error(json.message || 'Đã xảy ra lỗi');
    (error as Error & { statusCode: number }).statusCode = response.status;
    throw error;
  }

  return json;
}

function buildQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.set(key, String(val));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

const api = {
  get: (url: string, config?: { params?: Record<string, any> }) => {
    return fetchWithAuth(`${url}${buildQuery(config?.params)}`, { method: 'GET' });
  },
  post: (url: string, data?: any) => {
    return fetchWithAuth(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  },
  patch: (url: string, data?: any) => {
    return fetchWithAuth(url, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
  },
  delete: (url: string) => {
    return fetchWithAuth(url, { method: 'DELETE' });
  }
};

export default api;
