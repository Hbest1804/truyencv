import { Story, StoriesListResult, ShareData, RatingData, ReportReason, DbChapter } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  period?: string;
  query?: string;
}

/** Lấy access token từ localStorage (để gửi kèm authenticated requests) */
function getAccessToken(): string | null {
  return localStorage.getItem('auth_access_token');
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    const err = new Error('Bạn cần đăng nhập để thực hiện thao tác này');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.message || 'Đã xảy ra lỗi');
    (error as Error & { statusCode: number }).statusCode = response.status;
    throw error;
  }

  return json;
}

// ─── Query Params Helper ──────────────────────────────────────────────────────
function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.set(key, String(val));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

// ─── Story Service ────────────────────────────────────────────────────────────
export const storyService = {
  /**
   * GET /api/stories
   * Lấy danh sách truyện có phân trang
   */
  async getStories(params: {
    page?: number;
    limit?: number;
    genre?: string;
    status?: string;
    sort?: string;
  } = {}): Promise<{ stories: Story[]; pagination: StoriesListResult }> {
    const qs = buildQuery(params);
    const res = await apiFetch<Story[]>(`/stories${qs}`);
    return {
      stories: res.data || [],
      pagination: {
        stories: res.data || [],
        total: res.pagination?.total || 0,
        page: res.pagination?.page || 1,
        limit: res.pagination?.limit || 20,
        totalPages: res.pagination?.totalPages || 0,
      },
    };
  },

  /**
   * GET /api/stories/trending
   * Truyện xu hướng / xem nhiều nhất
   */
  async getTrending(params: { period?: 'week' | 'month' | 'all'; limit?: number } = {}): Promise<Story[]> {
    const qs = buildQuery(params);
    const res = await apiFetch<Story[]>(`/stories/trending${qs}`);
    return res.data || [];
  },

  /**
   * GET /api/stories/search
   * Tìm kiếm truyện nâng cao
   */
  async search(params: {
    q?: string;
    genre?: string;
    status?: string;
    minRating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ stories: Story[]; total: number; totalPages: number; query: string }> {
    const qs = buildQuery(params);
    const res = await apiFetch<Story[]>(`/stories/search${qs}`);
    return {
      stories: res.data || [],
      total: res.pagination?.total || 0,
      totalPages: res.pagination?.totalPages || 0,
      query: res.query || '',
    };
  },

  /**
   * GET /api/stories/:storyId
   * Chi tiết một truyện
   */
  async getById(storyId: string): Promise<Story> {
    const res = await apiFetch<Story>(`/stories/${storyId}`);
    if (!res.data) throw new Error('Không tìm thấy truyện');
    return res.data;
  },

  /**
   * POST /api/stories/:storyId/follow
   * Theo dõi truyện (yêu cầu đăng nhập)
   */
  async follow(storyId: string): Promise<void> {
    await apiFetch(`/stories/${storyId}/follow`, { method: 'POST' }, true);
  },

  /**
   * DELETE /api/stories/:storyId/follow
   * Hủy theo dõi truyện (yêu cầu đăng nhập)
   */
  async unfollow(storyId: string): Promise<void> {
    await apiFetch(`/stories/${storyId}/follow`, { method: 'DELETE' }, true);
  },

  /**
   * POST /api/stories/:storyId/favorite
   * Thêm vào yêu thích (yêu cầu đăng nhập)
   */
  async favorite(storyId: string): Promise<void> {
    await apiFetch(`/stories/${storyId}/favorite`, { method: 'POST' }, true);
  },

  /**
   * DELETE /api/stories/:storyId/favorite
   * Xóa khỏi yêu thích (yêu cầu đăng nhập)
   */
  async unfavorite(storyId: string): Promise<void> {
    await apiFetch(`/stories/${storyId}/favorite`, { method: 'DELETE' }, true);
  },

  /**
   * POST /api/stories/:storyId/rate
   * Đánh giá truyện 1-5 sao (yêu cầu đăng nhập)
   */
  async rate(storyId: string, score: number, review?: string): Promise<RatingData> {
    const res = await apiFetch<RatingData>(
      `/stories/${storyId}/rate`,
      {
        method: 'POST',
        body: JSON.stringify({ score, review }),
      },
      true
    );
    return res.data!;
  },

  /**
   * POST /api/stories/:storyId/report
   * Báo cáo vi phạm (yêu cầu đăng nhập)
   */
  async report(storyId: string, reason: ReportReason, detail?: string): Promise<void> {
    await apiFetch(
      `/stories/${storyId}/report`,
      {
        method: 'POST',
        body: JSON.stringify({ reason, detail }),
      },
      true
    );
  },

  /**
   * POST /api/stories/:storyId/share
   * Tạo link chia sẻ (không cần đăng nhập)
   */
  async share(storyId: string, platform: 'general' | 'facebook' | 'twitter' | 'telegram' = 'general'): Promise<ShareData> {
    const res = await apiFetch<ShareData>(`/stories/${storyId}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
    return res.data!;
  },

  /**
   * GET /api/stories/:storyId/chapters
   * Danh sách chương của một truyện
   */
  async getChapters(
    storyId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ chapters: DbChapter[]; pagination: Omit<StoriesListResult, 'stories'> }> {
    const qs = buildQuery(params);
    const res = await apiFetch<DbChapter[]>(`/stories/${storyId}/chapters${qs}`);
    return {
      chapters: res.data || [],
      pagination: {
        total: res.pagination?.total || 0,
        page: res.pagination?.page || 1,
        limit: res.pagination?.limit || 50,
        totalPages: res.pagination?.totalPages || 0,
      },
    };
  },

  /**
   * GET /api/stories/:storyId/chapters/:chapterId
   * Nội dung một chương
   */
  async getChapter(storyId: string, chapterId: string): Promise<DbChapter> {
    const res = await apiFetch<DbChapter>(`/stories/${storyId}/chapters/${chapterId}`);
    if (!res.data) throw new Error('Không tìm thấy nội dung chương');
    return res.data;
  },

  /**
   * POST /api/stories/:storyId/chapters/:chapterId/progress
   * Lưu vị trí đọc
   */
  async saveProgress(storyId: string, chapterId: string, progress: number): Promise<void> {
    await apiFetch(
      `/stories/${storyId}/chapters/${chapterId}/progress`,
      {
        method: 'POST',
        body: JSON.stringify({ progress }),
      },
      true
    );
  },

  /**
   * POST /api/stories/:storyId/chapters/:chapterId/mark-read
   * Đánh dấu đã đọc
   */
  async markRead(storyId: string, chapterId: string): Promise<void> {
    await apiFetch(
      `/stories/${storyId}/chapters/${chapterId}/mark-read`,
      {
        method: 'POST',
      },
      true
    );
  },
};
