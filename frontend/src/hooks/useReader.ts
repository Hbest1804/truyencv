import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DbChapter } from '@/types';
import { storyService } from '@/services/storyService';
import { useAuth } from '@/hooks/useAuth';

export function useReader(storyId: string | undefined, chapterId: string | undefined) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [chapters, setChapters] = useState<DbChapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<DbChapter | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progressSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedRead = useRef<string | null>(null);

  // 1. Fetch chapters list
  useEffect(() => {
    if (!storyId) return;
    let active = true;
    setChaptersLoading(true);
    storyService.getChapters(storyId, { limit: 1000 })
      .then(res => {
        if (active) {
          setChapters(res.chapters);
          setChaptersLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          console.error('Failed to load chapters list:', err);
          setError(err.message || 'Lỗi khi tải danh sách chương');
          setChaptersLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [storyId]);

  // 2. Redirect to first chapter if no chapterId is specified
  useEffect(() => {
    if (!storyId || chapterId || chaptersLoading) return;
    if (chapters.length > 0) {
      navigate(`/stories/${storyId}/reader/${chapters[0].id}`, { replace: true });
    } else {
      setLoading(false);
    }
  }, [storyId, chapterId, chaptersLoading, chapters, navigate]);

  // 3. Load active chapter content
  useEffect(() => {
    if (!storyId || !chapterId) return;

    let active = true;
    setLoading(true);
    setError(null);

    storyService.getChapter(storyId, chapterId)
      .then(data => {
        if (active) {
          setActiveChapter(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          console.error('Failed to load chapter content:', err);
          setError(err.message || 'Lỗi khi tải nội dung chương');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [storyId, chapterId]);

  // Go to next chapter
  const goToNextChapter = useCallback(() => {
    if (!activeChapter || chapters.length === 0) return;
    const currentIndex = chapters.findIndex(ch => ch.id === activeChapter.id);
    if (currentIndex !== -1 && currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      navigate(`/stories/${storyId}/reader/${nextChapter.id}`);
    }
  }, [activeChapter, chapters, storyId, navigate]);

  // Go to previous chapter
  const goToPrevChapter = useCallback(() => {
    if (!activeChapter || chapters.length === 0) return;
    const currentIndex = chapters.findIndex(ch => ch.id === activeChapter.id);
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      navigate(`/stories/${storyId}/reader/${prevChapter.id}`);
    }
  }, [activeChapter, chapters, storyId, navigate]);

  // Save progress (debounced)
  const saveProgress = useCallback((progress: number) => {
    if (!isAuthenticated || !storyId || !activeChapter) return;

    // Debounce the API call
    if (progressSaveTimeout.current) {
      clearTimeout(progressSaveTimeout.current);
    }

    progressSaveTimeout.current = setTimeout(() => {
      storyService.saveProgress(storyId, activeChapter.id, Math.round(progress))
        .catch(err => console.warn('Failed to save progress:', err));
    }, 2000); // Save progress after 2 seconds of scroll inactivity
  }, [isAuthenticated, storyId, activeChapter]);

  // Mark as read
  const markAsRead = useCallback(() => {
    if (!isAuthenticated || !storyId || !activeChapter) return;
    if (hasMarkedRead.current === activeChapter.id) return;
    hasMarkedRead.current = activeChapter.id;
    storyService.markRead(storyId, activeChapter.id)
      .catch(err => {
        console.warn('Failed to mark chapter as read:', err);
        hasMarkedRead.current = null;
      });
  }, [isAuthenticated, storyId, activeChapter]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (progressSaveTimeout.current) {
        clearTimeout(progressSaveTimeout.current);
      }
    };
  }, []);

  const hasNext = activeChapter && chapters.length > 0
    ? chapters.findIndex(ch => ch.id === activeChapter.id) < chapters.length - 1
    : false;

  const hasPrev = activeChapter && chapters.length > 0
    ? chapters.findIndex(ch => ch.id === activeChapter.id) > 0
    : false;

  const currentChapterIndex = activeChapter && chapters.length > 0
    ? chapters.findIndex(ch => ch.id === activeChapter.id)
    : -1;

  return {
    chapters,
    activeChapter,
    loading: loading,
    error,
    goToNextChapter,
    goToPrevChapter,
    saveProgress,
    markAsRead,
    hasNext,
    hasPrev,
    currentChapterNumber: activeChapter ? activeChapter.chapter_number : 0,
    totalChapters: chapters.length,
    currentChapterIndex,
  };
}
