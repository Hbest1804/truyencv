import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { Story } from '@/types';
import { BookCard } from '@/components/ui/BookCard';
import { motion } from 'motion/react';
import { storyService } from '@/services/storyService';
import { useNavigate } from 'react-router-dom';

const GENRES = [
  { label: 'Tiên Hiệp', slug: 'tien-hiep' },
  { label: 'Kiếm Hiệp', slug: 'kiem-hiep' },
  { label: 'Huyền Huyễn', slug: 'huyen-huyen' },
  { label: 'Ngôn Tình', slug: 'ngon-tinh' },
  { label: 'Đô Thị', slug: 'do-thi' },
  { label: 'Võng Du', slug: 'vong-du' },
  { label: 'Fantasy', slug: 'fantasy' },
  { label: 'Sci-Fi', slug: 'sci-fi' },
  { label: 'Mystery', slug: 'mystery' },
];

const SORT_OPTIONS = [
  { id: 'updated_at', label: 'Cập nhật mới nhất' },
  { id: 'view_count', label: 'Xem nhiều nhất' },
  { id: 'rating_avg', label: 'Đánh giá cao nhất' },
  { id: 'bookmark_count', label: 'Theo dõi nhiều nhất' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function storyToBookCard(story: Story) {
  const statusMap: Record<string, 'Ongoing' | 'Completed'> = {
    ongoing: 'Ongoing', completed: 'Completed', hiatus: 'Ongoing', dropped: 'Completed',
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
  };
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-surface-container-high/60 mb-3.5" />
      <div className="h-4 rounded-lg bg-surface-container-high/60 mb-2 w-3/4" />
      <div className="h-3 rounded-lg bg-surface-container-high/40 w-1/2" />
    </div>
  );
}

export function DiscoverPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('updated_at');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 12;

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = {
        sort: selectedSort,
        page,
        limit: LIMIT,
      };
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const hasSearch = query.trim() || selectedGenres.length > 0 || selectedStatus !== 'all';

      if (hasSearch) {
        // Dùng search endpoint
        const res = await storyService.search({
          q: query.trim() || undefined,
          genre: selectedGenres[0] || undefined, // API hỗ trợ 1 genre tại 1 thời điểm
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          sort: selectedSort,
          page,
          limit: LIMIT,
        });
        setStories(res.stories);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } else {
        // Dùng list endpoint
        const res = await storyService.getStories({
          sort: selectedSort,
          page,
          limit: LIMIT,
        });
        setStories(res.stories);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Lỗi khi tải danh sách truyện');
    } finally {
      setLoading(false);
    }
  }, [query, selectedSort, selectedStatus, selectedGenres, page]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [query, selectedSort, selectedStatus, selectedGenres]);

  const toggleGenre = (slug: string) => {
    setSelectedGenres(prev =>
      prev.includes(slug) ? [] : [slug]
    );
  };

  const handleSearch = () => {
    setQuery(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setSearchInput('');
    setQuery('');
    setSelectedGenres([]);
    setSelectedStatus('all');
    setSelectedSort('updated_at');
    setPage(1);
  };

  const hasActiveFilters = query || selectedGenres.length > 0 || selectedStatus !== 'all' || selectedSort !== 'updated_at';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full"
    >
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <motion.aside variants={itemVariants} className="w-full lg:w-72 flex-shrink-0">
          <div className="glass-panel rounded-2xl p-6 sticky top-28 border border-white/5">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-secondary" />
                <h2 className="text-lg font-bold text-white font-display">Bộ lọc</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-secondary hover:text-secondary-fixed transition-colors font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Xóa lọc
                </button>
              )}
            </div>

            {/* Mobile Search */}
            <div className="mb-6 lg:hidden">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm tên truyện, tác giả..."
                  className="w-full bg-surface-container border border-white/5 focus:border-secondary/40 rounded-xl py-2.5 px-4 pl-10 text-white text-sm outline-none transition-all"
                />
                <Search className="absolute left-3.5 top-3 text-outline w-4 h-4" />
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h3 className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-3.5 font-display">Sắp xếp theo</h3>
              <div className="space-y-3">
                {SORT_OPTIONS.map(sort => {
                  const isChecked = selectedSort === sort.id;
                  return (
                    <button
                      key={sort.id}
                      onClick={() => setSelectedSort(sort.id)}
                      className="flex items-center gap-3 cursor-pointer group w-full text-left"
                    >
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'border-secondary bg-secondary/10'
                          : 'border-outline-variant bg-surface group-hover:border-secondary/50'
                      }`}>
                        {isChecked && <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isChecked ? 'text-white' : 'text-on-surface-variant group-hover:text-white'
                      }`}>
                        {sort.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <h3 className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-3.5 font-display">Trạng thái</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'ongoing', label: 'Đang ra' },
                  { id: 'completed', label: 'Hoàn thành' },
                  { id: 'hiatus', label: 'Tạm ngưng' },
                ].map(status => {
                  const isActive = selectedStatus === status.id;
                  return (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary/10 border-secondary text-secondary shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'bg-surface-container border-white/5 text-on-surface-variant hover:text-white hover:border-white/10'
                      }`}
                    >
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Genres */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase font-display">Thể loại</h3>
                {selectedGenres.length > 0 && (
                  <button
                    onClick={() => setSelectedGenres([])}
                    className="text-secondary hover:text-secondary-fixed transition-colors text-[10px] font-bold uppercase cursor-pointer"
                  >
                    Xoá chọn
                  </button>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
                {GENRES.map((genre) => {
                  const isChecked = selectedGenres.includes(genre.slug);
                  return (
                    <button
                      key={genre.slug}
                      onClick={() => toggleGenre(genre.slug)}
                      className="flex items-center gap-3 cursor-pointer group w-full text-left"
                    >
                      <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-secondary border-secondary shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                          : 'bg-surface border-outline-variant group-hover:border-secondary/40'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 text-on-secondary stroke-[3.5px]" />}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isChecked ? 'text-white' : 'text-on-surface-variant group-hover:text-white'
                      }`}>
                        {genre.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Results Grid */}
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-white/5 pb-3">
            <div>
              <h1 className="text-2xl md:text-3.5xl font-black text-white font-display mb-1.5">Khám phá tác phẩm</h1>
              <p className="text-xs md:text-sm text-on-surface-variant">
                {loading
                  ? 'Đang tải...'
                  : `Hiển thị ${stories.length} trong số ${total} kết quả`
                }
              </p>
            </div>
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center relative w-72">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm tên truyện, tác giả..."
                className="w-full bg-surface-container-low/60 border border-white/5 hover:border-white/10 focus:border-secondary/40 rounded-xl py-2 px-4 pl-10 pr-12 text-white text-sm outline-none transition-all"
              />
              <Search className="absolute left-3.5 text-outline w-4 h-4" />
              <button
                onClick={handleSearch}
                className="absolute right-2 bg-secondary/20 hover:bg-secondary/30 text-secondary p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {(query || selectedGenres.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {query && (
                <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                  "{query}"
                  <button onClick={() => { setQuery(''); setSearchInput(''); }} className="cursor-pointer hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedGenres.map(slug => {
                const genre = GENRES.find(g => g.slug === slug);
                return (
                  <span key={slug} className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold px-3 py-1.5 rounded-full">
                    {genre?.label || slug}
                    <button onClick={() => toggleGenre(slug)} className="cursor-pointer hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <button onClick={fetchStories} className="ml-auto text-xs font-bold text-red-400 hover:text-white transition-colors cursor-pointer">Thử lại</button>
            </div>
          )}

          <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <SkeletonCard />
                  </motion.div>
                ))
              : stories.map(story => (
                  <motion.div key={story.id} variants={itemVariants}>
                    <BookCard
                      book={storyToBookCard(story)}
                      onClick={() => navigate('/stories/' + story.id)}
                    />
                  </motion.div>
                ))
            }

            {!loading && stories.length === 0 && !error && (
              <div className="col-span-full text-center py-16">
                <Search className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-30" />
                <p className="text-on-surface-variant">Không tìm thấy truyện nào phù hợp</p>
                <button onClick={clearFilters} className="mt-3 text-secondary text-sm font-semibold hover:underline cursor-pointer">
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all text-sm cursor-pointer font-bold ${
                      page === pageNum
                        ? 'border-secondary bg-secondary/10 text-secondary shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <span className="text-on-surface-variant px-1 font-bold">...</span>
                  <button
                    onClick={() => setPage(totalPages)}
                    className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all text-sm cursor-pointer"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Loading indicator for pagination */}
          {loading && (
            <div className="flex justify-center mt-8">
              <Loader2 className="w-6 h-6 text-secondary animate-spin" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
