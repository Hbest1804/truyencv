const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAccessToken(): string | null {
  const token = localStorage.getItem('supabase_access_token');
  if (token) return token;
  const storageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
  const storageStr = storageKey ? localStorage.getItem(storageKey) : null;
  if (storageStr) {
    try {
      const storageObj = JSON.parse(storageStr);
      return storageObj?.access_token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

const getHeaders = () => {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { response: { data, status: res.status } };
  }
  return { data };
};

export const adminService = {
  // Users
  getUsers: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/users?${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  getUserDetail: (userId: string) =>
    fetch(`${API_BASE}/admin/users/${userId}`, { headers: getHeaders() }).then(handleResponse),
  changeUserRole: (userId: string, role: string, reason?: string) =>
    fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role, reason })
    }).then(handleResponse),
  toggleBanUser: (userId: string, is_banned: boolean, reason?: string) =>
    fetch(`${API_BASE}/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_banned, reason })
    }).then(handleResponse),
  getUserActivity: (userId: string) =>
    fetch(`${API_BASE}/admin/users/${userId}/activity`, { headers: getHeaders() }).then(handleResponse),

  // Stories
  getPendingStories: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/stories?${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  approveStory: (storyId: string) =>
    fetch(`${API_BASE}/admin/stories/${storyId}/approve`, {
      method: 'PATCH',
      headers: getHeaders()
    }).then(handleResponse),
  hideStory: (storyId: string, reason?: string) =>
    fetch(`${API_BASE}/admin/stories/${storyId}/hide`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    }).then(handleResponse),
  deleteStory: (storyId: string) =>
    fetch(`${API_BASE}/admin/stories/${storyId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Genres
  getGenres: () => fetch(`${API_BASE}/admin/genres`, { headers: getHeaders() }).then(handleResponse),
  createGenre: (data: any) =>
    fetch(`${API_BASE}/admin/genres`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateGenre: (genreId: string, data: any) =>
    fetch(`${API_BASE}/admin/genres/${genreId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),
  deleteGenre: (genreId: string) =>
    fetch(`${API_BASE}/admin/genres/${genreId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Stats
  getStatsOverview: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/stats/overview?${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  
  // Reports
  getReports: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/reports?${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  resolveReport: (reportId: string, status: string, resolution_note?: string) =>
    fetch(`${API_BASE}/admin/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, resolution_note })
    }).then(handleResponse),
};
