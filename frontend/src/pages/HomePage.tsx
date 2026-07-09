import { useState } from 'react';
import { FEATURED_BOOK } from '@/constants/mockData';
import { Story } from '@/types';
import { BookCard } from '@/components/ui/BookCard';
import { motion } from 'motion/react';
import { Sparkles, Flame, BookOpen, ChevronRight, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { useStories, useTrendingStories } from '@/hooks/useStory';
import { useNavigate } from 'react-router-dom';

type RankingTab = 'week' | 'month';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Chuyển Story từ API thành Book (cho BookCard)
function storyToBookCard(story: Story) {
  const statusMap: Record<string, 'Ongoing' | 'Completed'> = {
    ongoing: 'Ongoing',
    completed: 'Completed',
    hiatus: 'Ongoing',
    dropped: 'Completed',
  };
  return {
    id: story.id,
    title: story.title,
    author: story.author_display_name || story.author_username || 'Không rõ',
    coverUrl: story.cover_url || 'https://placehold.co/400x600/1a1a2e/c084fc?text=No+Cover',
    genres: story.genres?.map(g => g.name) || [],
    status: statusMap[story.status] || 'Ongoing',
    chapterCount: story.chapter_count,
    rating: story.rating_avg || undefined,
    views: story.view_count > 1000
      ? `${(story.view_count / 1000).toFixed(1)}k`
      : String(story.view_count),
    synopsis: story.synopsis || story.description || undefined,
  };
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Skeleton card cho loading state
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-surface-container-high/60 mb-3.5" />
      <div className="h-4 rounded-lg bg-surface-container-high/60 mb-2 w-3/4" />
      <div className="h-3 rounded-lg bg-surface-container-high/40 w-1/2" />
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [rankingTab, setRankingTab] = useState<RankingTab>('week');

  // API calls
  const { stories: recentStories, loading: recentLoading, error: recentError } = useStories({
    sort: 'updated_at',
    limit: 6,
  });

  const { stories: weeklyTrending, loading: weeklyLoading } = useTrendingStories('week', 3);
  const { stories: monthlyTrending, loading: monthlyLoading } = useTrendingStories('month', 3);

  const currentRankings = rankingTab === 'week' ? weeklyTrending : monthlyTrending;
  const rankingLoading = rankingTab === 'week' ? weeklyLoading : monthlyLoading;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 pt-28 pb-16 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full"
    >
      {/* Hero Section: Cinematic Featured Story */}
      <motion.section
        variants={itemVariants}
        className="mb-16 relative rounded-3xl overflow-hidden border border-white/5 bg-surface-container-low shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex flex-col md:flex-row min-h-[460px] md:h-[500px]"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />

        <div className="md:w-[55%] p-8 md:p-14 flex flex-col justify-center relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 backdrop-blur-md text-primary text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-6 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Bản tin đề cử
          </div>
          <h1 className="text-3xl md:text-5.5xl font-black text-white mb-4 leading-tight font-display tracking-tight">
            {FEATURED_BOOK.title}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mb-8 max-w-lg leading-relaxed font-ui">
            {FEATURED_BOOK.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/stories/' + FEATURED_BOOK.id)}
              className="bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] px-8 py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Đọc ngay
            </button>
            <button
              onClick={() => navigate('/stories/' + FEATURED_BOOK.id)}
              className="px-8 py-3.5 rounded-xl font-bold border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 transform active:scale-98 cursor-pointer"
            >
              Chi tiết truyện
            </button>
          </div>
        </div>
        <div className="md:w-[45%] relative h-64 md:h-full overflow-hidden">
          <img
            src={FEATURED_BOOK.coverUrl}
            alt="Featured Book Cover"
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-103"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/40 to-transparent md:block hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent md:hidden block"></div>
        </div>
      </motion.section>

      {/* Grid Layout for Recent and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

        {/* Recent Updates */}
        <motion.section variants={itemVariants} className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-secondary rounded-full" />
              <h2 className="text-2xl font-bold text-white font-display">Mới Cập Nhật</h2>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="text-secondary hover:text-secondary-fixed transition-colors text-sm font-semibold flex items-center gap-1 group cursor-pointer"
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Error state */}
          {recentError && (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{recentError} — Đang hiển thị dữ liệu mẫu.</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {recentLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : recentStories.length > 0
                ? recentStories.map(story => (
                  <div key={story.id}>
                    <BookCard
                      book={storyToBookCard(story)}
                      onClick={() => navigate('/stories/' + story.id)}
                    />
                  </div>
                ))
                : (
                  // Fallback to mock data if no API data
                  <div className="col-span-3 text-center py-12 text-on-surface-variant">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có truyện nào được xuất bản</p>
                  </div>
                )
            }
          </div>
        </motion.section>

        {/* Rankings Sidebar */}
        <motion.aside variants={itemVariants} className="lg:col-span-4 max-lg:mt-6">
          <div className="bg-surface-container-low/60 border border-white/5 p-6 rounded-2xl h-full backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white font-display">
                Bảng Xếp Hạng
              </h2>
            </div>

            <div className="flex bg-surface-container/60 p-1 rounded-xl mb-6 border border-white/5">
              <button
                onClick={() => setRankingTab('week')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${rankingTab === 'week'
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
                  }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setRankingTab('month')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${rankingTab === 'month'
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
                  }`}
              >
                Tháng này
              </button>
            </div>

            {rankingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-secondary animate-spin" />
              </div>
            ) : currentRankings.length > 0 ? (
              <ul className="space-y-3.5">
                {currentRankings.map((story, index) => (
                  <li
                    key={story.id}
                    className="flex items-center gap-4 group cursor-pointer p-2.5 rounded-xl hover:bg-surface-container-high/40 border border-transparent hover:border-white/5 transition-all duration-300"
                    onClick={() => navigate('/stories/' + story.id)}
                  >
                    <div className={`text-xl font-extrabold w-8 h-8 rounded-lg flex items-center justify-center font-display transition-all duration-300 ${index === 0 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]' :
                      index === 1 ? 'bg-slate-300/10 border border-slate-300/20 text-slate-300' :
                        'bg-amber-700/10 border border-amber-700/20 text-amber-600'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-semibold text-white group-hover:text-secondary transition-colors duration-250 truncate">
                        {story.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {story.views_in_period
                          ? `${formatViews(story.views_in_period as number)} lượt đọc tuần này`
                          : `${formatViews(story.view_count)} tổng lượt đọc`
                        }
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Chưa có dữ liệu xếp hạng</p>
              </div>
            )}
          </div>
        </motion.aside>

      </div>

      {/* Categories */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
          <div className="w-2.5 h-6 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold text-white font-display">
            Thể Loại Phổ Biến
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {['Tiên Hiệp', 'Kiếm Hiệp', 'Huyền Huyễn', 'Ngôn Tình', 'Đô Thị', 'Võng Du'].map((genre, i) => (
            <button
              key={genre}
              onClick={() => navigate('/discover')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 border cursor-pointer hover:shadow-md transform active:scale-98 ${i % 2 === 0
                ? 'bg-secondary/5 border-secondary/15 hover:border-secondary/35 text-secondary hover:bg-secondary/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-primary/5 border-primary/15 hover:border-primary/35 text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
