import { useState, useEffect, useCallback, useRef } from 'react';
import { Story, StoriesListResult, ReportReason } from '@/types';
import { storyService } from '@/services/storyService';

// ─── useStories ───────────────────────────────────────────────────────────────
/** Hook lấy danh sách truyện có phân trang */
export function useStories(params: {
  page?: number;
  limit?: number;
  genre?: string;
  status?: string;
  sort?: string;
} = {}) {
  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<Omit<StoriesListResult, 'stories'>>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    storyService.getStories(paramsRef.current).then(res => {
      if (!cancelled) {
        setStories(res.stories);
        setPagination({
          total: res.pagination.total,
          page: res.pagination.page,
          limit: res.pagination.limit,
          totalPages: res.pagination.totalPages,
        });
        setLoading(false);
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err.message || 'Lỗi khi tải danh sách truyện');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [params.page, params.limit, params.genre, params.status, params.sort]);

  return { stories, pagination, loading, error };
}

// ─── useTrendingStories ───────────────────────────────────────────────────────
/** Hook lấy truyện xu hướng */
export function useTrendingStories(period: 'week' | 'month' | 'all' = 'week', limit = 10) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    storyService.getTrending({ period, limit }).then(data => {
      if (!cancelled) {
        setStories(data);
        setLoading(false);
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err.message || 'Lỗi khi tải truyện xu hướng');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [period, limit]);

  return { stories, loading, error };
}

// ─── useSearchStories ─────────────────────────────────────────────────────────
/** Hook tìm kiếm truyện nâng cao */
export function useSearchStories(params: {
  q?: string;
  genre?: string;
  status?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) {
  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    // Không search nếu không có query và filter
    if (!params.q && !params.genre && !params.status && !params.minRating) {
      setStories([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);

    storyService.search(params).then(res => {
      if (!cancelled) {
        setStories(res.stories);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setLoading(false);
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err.message || 'Lỗi khi tìm kiếm truyện');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { stories, total, totalPages, loading, error };
}

// ─── useStory ─────────────────────────────────────────────────────────────────
/** Hook lấy chi tiết 1 truyện + các actions */
export function useStory(storyId: string | null) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    storyService.getById(storyId).then(data => {
      if (!cancelled) {
        setStory(data);
        setLoading(false);
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err.message || 'Lỗi khi tải chi tiết truyện');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [storyId]);

  // Follow / Unfollow
  const toggleFollow = useCallback(async () => {
    if (!story) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (story.is_following) {
        await storyService.unfollow(story.id);
        setStory(prev => prev ? { ...prev, is_following: false, bookmark_count: prev.bookmark_count - 1 } : prev);
      } else {
        await storyService.follow(story.id);
        setStory(prev => prev ? { ...prev, is_following: true, bookmark_count: prev.bookmark_count + 1 } : prev);
      }
    } catch (err: unknown) {
      setActionError((err as Error).message || 'Lỗi khi cập nhật theo dõi');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [story]);

  // Favorite / Unfavorite
  const toggleFavorite = useCallback(async () => {
    if (!story) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (story.is_favorited) {
        await storyService.unfavorite(story.id);
        setStory(prev => prev ? { ...prev, is_favorited: false } : prev);
      } else {
        await storyService.favorite(story.id);
        setStory(prev => prev ? { ...prev, is_favorited: true } : prev);
      }
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Lỗi khi cập nhật yêu thích';
      setActionError(errMsg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [story]);

  // Rate
  const rate = useCallback(async (score: number, review?: string) => {
    if (!story) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const rating = await storyService.rate(story.id, score, review);
      setStory(prev => prev
        ? { ...prev, user_rating: { score: rating.score, review: rating.review } }
        : prev
      );
      return rating;
    } catch (err: unknown) {
      setActionError((err as Error).message || 'Lỗi khi đánh giá');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [story]);

  // Report
  const report = useCallback(async (reason: ReportReason, detail?: string) => {
    if (!story) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await storyService.report(story.id, reason, detail);
    } catch (err: unknown) {
      setActionError((err as Error).message || 'Lỗi khi báo cáo');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [story]);

  // Share
  const share = useCallback(async (platform: 'general' | 'facebook' | 'twitter' | 'telegram' = 'general') => {
    if (!story) return null;
    try {
      return await storyService.share(story.id, platform);
    } catch (err: unknown) {
      setActionError((err as Error).message || 'Lỗi khi tạo link chia sẻ');
      return null;
    }
  }, [story]);

  return {
    story,
    loading,
    error,
    actionLoading,
    actionError,
    toggleFollow,
    toggleFavorite,
    rate,
    report,
    share,
  };
}
