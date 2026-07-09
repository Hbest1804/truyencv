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

const getHeaders = (isFormData = false) => {
  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { response: { data } };
  }
  return { data };
};

export const authorApi = {
  getAuthorStories: () => 
    fetch(`${API_BASE}/author/stories`, {
      headers: getHeaders()
    }).then(handleResponse),
  
  createStory: (data: { title: string; description: string; genreIds: number[]; status?: string }) => 
    fetch(`${API_BASE}/author/stories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),
    
  getStoryDetail: (storyId: number | string) => 
    fetch(`${API_BASE}/author/stories/${storyId}`, {
      headers: getHeaders()
    }).then(handleResponse),
    
  updateStory: (storyId: number | string, data: any) => 
    fetch(`${API_BASE}/author/stories/${storyId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),
    
  deleteStory: (storyId: number | string) => 
    fetch(`${API_BASE}/author/stories/${storyId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),
    
  changeStoryStatus: (storyId: number | string, status: string) => 
    fetch(`${API_BASE}/author/stories/${storyId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse),
    
  uploadStoryCover: (storyId: number | string, file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    return fetch(`${API_BASE}/author/stories/${storyId}/cover`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    }).then(handleResponse);
  },

  getAuthorChapters: (storyId: number | string) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters`, {
      headers: getHeaders()
    }).then(handleResponse),
    
  createChapter: (storyId: number | string, data: any) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),
    
  getChapterDetail: (storyId: number | string, chapterId: number | string) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters/${chapterId}`, {
      headers: getHeaders()
    }).then(handleResponse),
    
  updateChapter: (storyId: number | string, chapterId: number | string, data: any) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters/${chapterId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),
    
  deleteChapter: (storyId: number | string, chapterId: number | string) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),
    
  publishChapter: (storyId: number | string, chapterId: number | string) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters/${chapterId}/publish`, {
      method: 'PATCH',
      headers: getHeaders()
    }).then(handleResponse),
    
  scheduleChapter: (storyId: number | string, chapterId: number | string, scheduledAt: string) => 
    fetch(`${API_BASE}/author/stories/${storyId}/chapters/${chapterId}/schedule`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ scheduledAt })
    }).then(handleResponse),
};
