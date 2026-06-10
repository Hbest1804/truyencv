import { useState, useEffect } from 'react';
import {
  BookOpen, Bookmark, Heart, User, Star, Eye, ArrowRight, Expand, Send,
  MessageSquare, ChevronDown, ListPlus, Share2, Flag, Loader2, Check,
  AlertCircle, Copy, Facebook, Twitter, X
} from 'lucide-react';
import { CHAPTERS, COMMENTS } from '@/constants/mockData';
import { ReportReason, DbChapter } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { useStory } from '@/hooks/useStory';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService } from '@/services/storyService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer disabled:cursor-default transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-white/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ shareData, onClose }: {
  shareData: { share_url: string; share_links: { facebook: string; twitter: string; telegram: string } } | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (shareData) {
      navigator.clipboard.writeText(shareData.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-surface-container border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Share2 className="w-5 h-5 text-secondary" /> Chia sẻ truyện
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {shareData ? (
          <>
            {/* Copy Link */}
            <div className="flex items-center gap-2 bg-surface-container-high/60 border border-white/5 rounded-xl p-3 mb-4">
              <p className="text-xs text-on-surface-variant truncate flex-1">{shareData.share_url}</p>
              <button
                onClick={copyLink}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  copied
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-surface-container-highest hover:bg-surface-container text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            {/* Platform Links */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={shareData.share_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1877f2]/10 border border-[#1877f2]/20 text-[#1877f2] hover:bg-[#1877f2]/20 transition-all"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-xs font-bold">Facebook</span>
              </a>
              <a
                href={shareData.share_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                <Twitter className="w-5 h-5" />
                <span className="text-xs font-bold">Twitter/X</span>
              </a>
              <a
                href={shareData.share_links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/20 transition-all"
              >
                <Send className="w-5 h-5" />
                <span className="text-xs font-bold">Telegram</span>
              </a>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-secondary animate-spin" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ onSubmit, onClose, loading }: {
  onSubmit: (reason: ReportReason, detail: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState<ReportReason>('inappropriate');
  const [detail, setDetail] = useState('');

  const REASONS: { id: ReportReason; label: string }[] = [
    { id: 'spam', label: 'Spam / Quảng cáo' },
    { id: 'copyright', label: 'Vi phạm bản quyền' },
    { id: 'inappropriate', label: 'Nội dung không phù hợp' },
    { id: 'wrong_category', label: 'Sai thể loại / thông tin' },
    { id: 'other', label: 'Lý do khác' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-surface-container border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" /> Báo cáo vi phạm
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {REASONS.map(r => (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                reason === r.id
                  ? 'bg-red-400/10 border-red-400/40 text-red-300'
                  : 'bg-surface-container-high/40 border-white/5 text-on-surface-variant hover:text-white hover:border-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                reason === r.id ? 'border-red-400' : 'border-outline-variant'
              }`}>
                {reason === r.id && <div className="w-2 h-2 rounded-full bg-red-400" />}
              </div>
              <span className="text-sm font-medium">{r.label}</span>
            </button>
          ))}
        </div>

        <textarea
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="Mô tả chi tiết vi phạm (tùy chọn)..."
          className="w-full bg-surface-container-high/40 border border-white/5 rounded-xl p-3 text-white text-sm outline-none focus:border-red-400/40 transition-all resize-none min-h-[80px] placeholder:text-outline mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/5 text-on-surface-variant hover:text-white hover:border-white/10 text-sm font-bold transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(reason, detail)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-sm font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Gửi báo cáo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main DetailPage ──────────────────────────────────────────────────────────
export function DetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Nếu không có storyId, dùng mock data
  const {
    story,
    loading: storyLoading,
    error: storyError,
    actionLoading,
    actionError,
    toggleFollow,
    toggleFavorite,
    rate,
    report,
    share,
  } = useStory(storyId || null);

  // Mock data fallback
  const [commentsList, setCommentsList] = useState(COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [chapterOrderAsc, setChapterOrderAsc] = useState(true);
  const [chapterPage, setChapterPage] = useState(1);

  // Real database chapters
  const [chapters, setChapters] = useState<DbChapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  useEffect(() => {
    if (storyId) {
      setChaptersLoading(true);
      storyService.getChapters(storyId, { limit: 10000 })
        .then(res => {
          setChapters(res.chapters);
          setChaptersLoading(false);
        })
        .catch(err => {
          console.error("Failed to load chapters:", err);
          setChaptersLoading(false);
        });
    }
  }, [storyId]);

  // Rating UI
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  // Share
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<Awaited<ReturnType<typeof share>> | null>(null);

  // Report
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync user rating từ API
  useEffect(() => {
    if (story?.user_rating?.score) {
      setRatingScore(story.user_rating.score);
    }
  }, [story]);

  // Sync action error to toast
  useEffect(() => {
    if (actionError) showToast(actionError, 'error');
  }, [actionError]);

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const cmt = {
      id: `cmt-${Date.now()}`,
      author: 'Bạn',
      avatarUrl: 'https://placehold.co/40x40/1a1a2e/c084fc?text=U',
      timeAgo: 'VỪA XONG',
      content: newComment.trim()
    };
    setCommentsList([cmt, ...commentsList]);
    setNewComment('');
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) { showToast('Vui lòng đăng nhập để theo dõi truyện', 'error'); return; }
    try {
      const wasFollowing = story?.is_following;
      await toggleFollow();
      showToast(wasFollowing ? 'Đã hủy theo dõi' : 'Đã theo dõi truyện!');
    } catch {
      // Lỗi đã được xử lý bởi useStory hook và hiện qua actionError toast
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { showToast('Vui lòng đăng nhập để thêm yêu thích', 'error'); return; }
    try {
      const wasFavorited = story?.is_favorited;
      await toggleFavorite();
      showToast(wasFavorited ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích!');
    } catch {
      // Lỗi đã được xử lý bởi useStory hook và hiện qua actionError toast
    }
  };

  const handleRate = async () => {
    if (!isAuthenticated) { showToast('Vui lòng đăng nhập để đánh giá', 'error'); return; }
    if (ratingScore === 0) { showToast('Vui lòng chọn số sao', 'error'); return; }
    try {
      await rate(ratingScore, ratingReview);
      setRatingSuccess(true);
      setShowRatingForm(false);
      showToast('Đánh giá của bạn đã được ghi nhận!');
    } catch {
      // error handled by actionError
    }
  };

  const handleShare = async () => {
    setShowShareModal(true);
    if (!shareData) {
      const data = await share('general');
      setShareData(data);
    }
  };

  const handleReport = async (reason: ReportReason, detail: string) => {
    if (!isAuthenticated) { showToast('Vui lòng đăng nhập để báo cáo', 'error'); return; }
    try {
      await report(reason, detail);
      setShowReportModal(false);
      setReportSuccess(true);
      showToast('Báo cáo đã được gửi. Cảm ơn bạn!');
    } catch {
      // handled
    }
  };

  const chaptersPerPage = 150;

  const rawChapters = storyId && chapters.length > 0
    ? chapters
    : CHAPTERS.map((ch, idx) => {
        const dateStr = new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString();
        return {
          id: ch.id,
          story_id: 'mock',
          chapter_number: idx + 1,
          title: ch.title,
          content: '',
          word_count: 0,
          view_count: 0,
          is_published: true,
          is_free: true,
          created_at: dateStr,
          updated_at: dateStr,
          published_at: null,
        } as DbChapter;
      });

  const displayedChapters = chapterOrderAsc ? rawChapters : [...rawChapters].reverse();

  // Reset page when sorting changes or chapters count changes
  useEffect(() => {
    setChapterPage(1);
  }, [chapterOrderAsc, chapters.length]);

  const totalChapterPages = Math.ceil(displayedChapters.length / chaptersPerPage);
  const paginatedChapters = displayedChapters.slice(
    (chapterPage - 1) * chaptersPerPage,
    chapterPage * chaptersPerPage
  );

  const halfLength = Math.ceil(paginatedChapters.length / 2);
  const leftChapters = paginatedChapters.slice(0, halfLength);
  const rightChapters = paginatedChapters.slice(halfLength);



  // ─── Loading State ────────────────────────────────────────────────────────
  if (storyLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-28 pb-24 min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-on-surface-variant text-sm">Đang tải thông tin truyện...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (storyError && storyId) {
    return (
      <div className="flex-1 flex items-center justify-center pt-28 pb-24 min-h-[60vh]">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-70" />
          <h2 className="text-xl font-bold text-white mb-2">Không thể tải truyện</h2>
          <p className="text-on-surface-variant text-sm mb-6">{storyError}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-all cursor-pointer"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // ─── Story data (API or fallback) ─────────────────────────────────────────
  const title = story?.title || 'Echoes of the Neon Citadel';
  const author = story?.author_display_name || story?.author_username || 'Aria Vance';
  const coverUrl = story?.cover_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkM2R6zheb9eqEGUi4jXGsEyeP_DXGBu7rBQyMICcr1EL9YJAWHC7lhMzuk3Ac4UT2XwW8yhHygjWbmW2wBDtsvLyYP9nAORQBsUaygZaLcAX-VPHDqegxkUv71glg2xlSG752Q0nk8wevi_uMJLqu2ecwc0anQcgP-Za9uAvHNy6nL2SCiGDxCQ3dS15Y1G3FToR8v8VSeXhAHRAtKQCXKMYYxAeEKBnbjxt5_dRDDDkHpE7VmhKkXkCZcmNMAdxp6TmpgtIc9Cor';
  const genres = story?.genres?.map(g => g.name) || ['SCI-FI', 'CYBERPUNK', 'MYSTERY'];
  const ratingAvg = story?.rating_avg ?? 4.8;
  const ratingCount = story?.rating_count ?? 1200;
  const viewCount = story?.view_count ?? 342000;
  const synopsis = story?.synopsis || story?.description || 'In the sprawling metropolis of Neo-Veridia, memory is a currency traded on the black market...';
  const chapterCount = story?.chapter_count ?? 24;
  const isFollowing = story?.is_following ?? false;
  const isFavorited = story?.is_favorited ?? false;
  const storyStatus = story?.status || 'ongoing';

  const viewStr = viewCount > 1000 ? `${(viewCount / 1000).toFixed(0)}k` : String(viewCount);

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-secondary/20 border-secondary/40 text-secondary'
                : 'bg-red-400/20 border-red-400/40 text-red-300'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            shareData={shareData}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            onSubmit={handleReport}
            onClose={() => setShowReportModal(false)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full"
      >
        {/* Bento Layout Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16">

          {/* Cover Art */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border border-white/5 bg-surface-container-low max-w-[320px] lg:max-w-full aspect-[2/3] w-full group hover:shadow-[0_20px_50px_rgba(168,85,247,0.25)] hover:border-primary/20">
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-secondary/20 flex items-center gap-1.5 shadow-md">
                <span className={`w-2 h-2 rounded-full animate-pulse ${storyStatus === 'ongoing' ? 'bg-secondary' : 'bg-amber-400'}`}></span>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-secondary">
                  {storyStatus === 'ongoing' ? 'Đang ra' : storyStatus === 'completed' ? 'Hoàn' : storyStatus === 'hiatus' ? 'Tạm ngưng' : 'Drop'}
                </span>
              </div>
              {/* Chapter Count badge */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-bold text-white">{chapterCount} ch</span>
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-black leading-tight text-white mb-5 font-display tracking-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-3 gap-x-5 mb-6 text-sm font-medium text-on-surface-variant">
              <span className="flex items-center gap-2 text-white/95">
                <User className="w-4 h-4 text-primary" />
                Tác giả: <span className="font-bold">{author}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10 hidden sm:inline"></span>

              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-white">{ratingAvg.toFixed(1)}</span>
                <span className="text-xs text-on-surface-variant">({ratingCount.toLocaleString()} đánh giá)</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10 hidden sm:inline"></span>

              <span className="flex items-center gap-2">
                <Eye className="w-4.5 h-4.5 text-secondary" />
                Lượt xem: <span className="font-bold text-white">{viewStr}</span>
              </span>
            </div>

            {/* Genres Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {genres.map((g, i) => (
                <span
                  key={g}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase border ${
                    i === 0 ? 'bg-secondary/5 border-secondary/15 text-secondary' :
                    i === 1 ? 'bg-primary/5 border-primary/15 text-primary' :
                    'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => navigate(`/stories/${story?.id || storyId}/reader`)}
                className="bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] font-bold py-3.5 px-8 rounded-xl hover:bg-secondary/90 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center gap-2.5"
              >
                <BookOpen className="w-5 h-5" />
                Đọc từ đầu
              </button>

              <button
                onClick={handleToggleFollow}
                disabled={actionLoading}
                className={`font-bold py-3.5 px-6 rounded-xl border transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center gap-2.5 disabled:opacity-60 ${
                  isFollowing
                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                    : 'bg-surface-container-high/40 border-white/5 hover:border-white/15 text-white hover:bg-surface-container-high/60'
                }`}
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className={`w-5 h-5 ${isFollowing ? 'fill-primary' : ''}`} />}
                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </button>

              <button
                onClick={handleToggleFavorite}
                disabled={actionLoading}
                className={`font-bold py-3.5 px-6 rounded-xl border transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center gap-2.5 disabled:opacity-60 ${
                  isFavorited
                    ? 'bg-red-500/10 border-red-500/40 text-red-400'
                    : 'bg-surface-container-high/40 border-white/5 hover:border-red-500/20 text-white hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-400' : ''}`} />
                {isFavorited ? 'Yêu thích' : 'Thêm yêu thích'}
              </button>

              <button
                onClick={handleShare}
                className="py-3.5 px-4 rounded-xl border border-white/5 hover:border-white/15 text-on-surface-variant hover:text-white transition-all cursor-pointer"
                title="Chia sẻ"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => !reportSuccess && setShowReportModal(true)}
                className={`py-3.5 px-4 rounded-xl border transition-all cursor-pointer ${
                  reportSuccess
                    ? 'border-secondary/20 text-secondary'
                    : 'border-white/5 hover:border-red-500/20 text-on-surface-variant hover:text-red-400'
                }`}
                title={reportSuccess ? 'Đã báo cáo' : 'Báo cáo vi phạm'}
              >
                {reportSuccess ? <Check className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
              </button>
            </div>

            {/* Rating Form */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  if (!isAuthenticated) { showToast('Vui lòng đăng nhập để đánh giá', 'error'); return; }
                  setShowRatingForm(!showRatingForm);
                }}
                className="text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4" />
                {ratingSuccess || story?.user_rating ? `Bạn đã đánh giá ${ratingScore} sao` : 'Đánh giá truyện này'}
              </button>
            </div>

            <AnimatePresence>
              {showRatingForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-surface-container-low/40 p-5 rounded-2xl border border-white/5 mb-6"
                >
                  <h3 className="text-sm font-bold text-white mb-3">Đánh giá của bạn</h3>
                  <StarRating value={ratingScore} onChange={setRatingScore} disabled={actionLoading} />
                  <textarea
                    value={ratingReview}
                    onChange={e => setRatingReview(e.target.value)}
                    placeholder="Nhận xét (tùy chọn)..."
                    className="w-full mt-3 bg-surface-container-high/40 border border-white/5 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400/40 transition-all resize-none min-h-[80px] placeholder:text-outline"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowRatingForm(false)}
                      className="px-4 py-2 rounded-xl border border-white/5 text-on-surface-variant text-xs font-bold hover:text-white transition-all cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleRate}
                      disabled={actionLoading || ratingScore === 0}
                      className="px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-400/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Gửi đánh giá
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Synopsis */}
            <div className="bg-surface-container-low/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-md">
              <h3 className="text-lg font-bold text-white mb-4 font-display flex items-center gap-2">
                <span className="w-2 h-4 bg-primary rounded-full" />
                Tóm tắt nội dung
              </h3>
              <p className="font-reading text-base md:text-lg leading-relaxed text-on-surface-variant opacity-95">
                {synopsis}
              </p>
            </div>
          </motion.div>
        </div>

        <hr className="border-white/5 my-12" />

        {/* Chapters & Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Chapters */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-bold text-white font-display">Danh sách chương</h2>
              </div>
              <button
                onClick={() => setChapterOrderAsc(!chapterOrderAsc)}
                className="px-3.5 py-1.5 rounded-lg border border-white/5 hover:border-white/10 text-on-surface-variant hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-surface-container/30"
              >
                Thứ tự: {chapterOrderAsc ? 'Cũ nhất' : 'Mới nhất'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${chapterOrderAsc ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {chaptersLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 bg-surface-container-low/20 border border-white/5 rounded-2xl">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                <p className="text-sm text-on-surface-variant font-medium">Đang tải danh sách chương...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {/* Cột trái */}
                  <div className="flex flex-col gap-3">
                    {leftChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => navigate(`/stories/${story?.id || storyId}/reader/${ch.id}`)}
                        className="group p-4 rounded-xl bg-surface-container-low/40 border border-white/5 hover:border-secondary/25 hover:bg-surface-container-high/40 transition-all duration-300 flex items-center justify-between cursor-pointer text-left"
                      >
                        <div className="flex flex-col">
                          <span className="text-white group-hover:text-secondary transition-colors duration-250 font-semibold font-display">
                            {ch.title}
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-1.5 tracking-wider">
                            Cập nhật {ch.updated_at ? new Date(ch.updated_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-surface-container/60 group-hover:bg-secondary/15 flex items-center justify-center transition-all">
                          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Cột phải */}
                  <div className="flex flex-col gap-3">
                    {rightChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => navigate(`/stories/${story?.id || storyId}/reader/${ch.id}`)}
                        className="group p-4 rounded-xl bg-surface-container-low/40 border border-white/5 hover:border-secondary/25 hover:bg-surface-container-high/40 transition-all duration-300 flex items-center justify-between cursor-pointer text-left"
                      >
                        <div className="flex flex-col">
                          <span className="text-white group-hover:text-secondary transition-colors duration-250 font-semibold font-display">
                            {ch.title}
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-1.5 tracking-wider">
                            Cập nhật {ch.updated_at ? new Date(ch.updated_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-surface-container/60 group-hover:bg-secondary/15 flex items-center justify-center transition-all">
                          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {totalChapterPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-4 bg-surface-container-low/25 border border-white/5 rounded-2xl">
                    <button
                      disabled={chapterPage === 1}
                      onClick={() => setChapterPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-2 rounded-xl bg-surface-container-high/40 border border-white/5 text-on-surface-variant hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-high/80 transition-all text-xs font-bold cursor-pointer active:scale-95"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalChapterPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      const isCurrent = pNum === chapterPage;
                      
                      const pageSlice = displayedChapters.slice(idx * chaptersPerPage, (idx + 1) * chaptersPerPage);
                      if (pageSlice.length === 0) return null;
                      const firstChapter = pageSlice[0];
                      const lastChapter = pageSlice[pageSlice.length - 1];
                      const minNum = Math.min(firstChapter.chapter_number, lastChapter.chapter_number);
                      const maxNum = Math.max(firstChapter.chapter_number, lastChapter.chapter_number);
                      const label = `${minNum} - ${maxNum}`;

                      return (
                        <button
                          key={pNum}
                          onClick={() => setChapterPage(pNum)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer hover:scale-[1.03] active:scale-97 ${
                            isCurrent
                              ? 'bg-secondary/15 border-secondary/35 text-secondary shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                              : 'bg-surface-container-low/40 border-white/5 text-on-surface-variant hover:text-white hover:bg-surface-container-high/60'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}

                    <button
                      disabled={chapterPage === totalChapterPages}
                      onClick={() => setChapterPage(prev => Math.min(totalChapterPages, prev + 1))}
                      className="px-3 py-2 rounded-xl bg-surface-container-high/40 border border-white/5 text-on-surface-variant hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-high/80 transition-all text-xs font-bold cursor-pointer active:scale-95"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Comments */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white font-display">
                Bình luận ({commentsList.length})
              </h2>
            </div>

            {/* Post Comment Input */}
            <div className="mb-8 bg-surface-container-low/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-surface-container-high/40 border border-white/5 rounded-xl p-4 text-white focus:border-primary/50 outline-none transition-all resize-none min-h-[100px] text-sm placeholder:text-outline"
                placeholder="Bạn nghĩ gì về truyện này? Viết bình luận của bạn..."
              ></textarea>
              <div className="flex justify-end mt-3">
                <button
                  onClick={handlePostComment}
                  className="bg-primary hover:bg-primary/95 text-white text-xs font-bold tracking-wider uppercase py-2.5 px-6 rounded-lg transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  Gửi bình luận <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence initial={false}>
                {commentsList.map(cmt => (
                  <motion.div
                    key={cmt.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-4 border-b border-white/5 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 rounded-xl border border-white/10 flex-shrink-0 overflow-hidden shadow-md">
                      <img src={cmt.avatarUrl} alt={cmt.author} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-baseline justify-between mb-1 gap-2">
                        <span className="font-bold text-white text-sm truncate">{cmt.author}</span>
                        <span className="text-[9px] font-bold text-on-surface-variant tracking-wider whitespace-nowrap">{cmt.timeAgo}</span>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed break-words">{cmt.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
