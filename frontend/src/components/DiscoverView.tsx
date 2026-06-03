import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Check, ListFilter } from 'lucide-react';
import { DISCOVER_BOOKS } from '../data';
import { ViewState } from '../types';
import { BookCard } from './BookCard';
import { motion, AnimatePresence } from 'motion/react';

interface DiscoverViewProps {
  onNavigate: (view: ViewState) => void;
}

const GENRES = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Slice of Life'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DiscoverView({ onNavigate }: DiscoverViewProps) {
  const [selectedSort, setSelectedSort] = useState('latest');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Fantasy', 'Sci-Fi']);
  const [chapterRange, setChapterRange] = useState(250);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

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
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <SlidersHorizontal className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-bold text-white font-display">Bộ lọc tìm kiếm</h2>
            </div>

            {/* Mobile Search */}
            <div className="mb-6 lg:hidden">
              <div className="relative">
                <input 
                  type="text" 
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
                {[
                  { id: 'latest', label: 'Cập nhật mới nhất' },
                  { id: 'viewed', label: 'Xem nhiều nhất' },
                  { id: 'rated', label: 'Đánh giá cao nhất' },
                ].map(sort => {
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
                  { id: 'completed', label: 'Hoàn thành' }
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase font-display">Thể loại</h3>
                <button 
                  onClick={() => setSelectedGenres([])}
                  className="text-secondary hover:text-secondary-fixed transition-colors text-[10px] font-bold uppercase cursor-pointer"
                >
                  Xoá chọn
                </button>
              </div>
              <div className="max-h-[190px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
                {GENRES.map((genre) => {
                  const isChecked = selectedGenres.includes(genre);
                  return (
                    <button 
                      key={genre} 
                      onClick={() => toggleGenre(genre)}
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
                        {genre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapters Range */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase font-display">Số chương tối thiểu</h3>
                <span className="text-xs font-extrabold text-secondary font-display">{chapterRange} ch</span>
              </div>
              <div className="space-y-2">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50"
                  value={chapterRange}
                  onChange={(e) => setChapterRange(Number(e.target.value))}
                  className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary" 
                />
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant font-display">
                  <span>0 ch</span>
                  <span>1000+ ch</span>
                </div>
              </div>
            </div>

          </div>
        </motion.aside>

        {/* Results Grid */}
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-white/5 pb-3">
            <div>
              <h1 className="text-2xl md:text-3.5xl font-black text-white font-display mb-1.5">Khám phá tác phẩm</h1>
              <p className="text-xs md:text-sm text-on-surface-variant">Hiển thị 1-12 trong số 145 kết quả tìm được</p>
            </div>
            <div className="hidden lg:flex items-center relative w-64">
              <input 
                type="text" 
                placeholder="Tìm tên truyện, tác giả..." 
                className="w-full bg-surface-container-low/60 border border-white/5 hover:border-white/10 focus:border-secondary/40 rounded-xl py-2 px-4 pl-10 text-white text-sm outline-none transition-all"
              />
              <Search className="absolute left-3.5 text-outline w-4 h-4" />
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {DISCOVER_BOOKS.map(book => (
              <motion.div key={book.id} variants={itemVariants}>
                <BookCard 
                  book={book} 
                  onClick={() => onNavigate('detail')} 
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="mt-16 flex justify-center items-center gap-2">
             <button className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" disabled>
                <ChevronLeft className="w-5 h-5" />
             </button>
             <button className="w-10 h-10 rounded-xl border border-secondary bg-secondary/10 text-secondary font-bold flex items-center justify-center transition-all text-sm shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer">1</button>
             <button className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all text-sm cursor-pointer">2</button>
             <button className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all text-sm cursor-pointer">3</button>
             <span className="text-on-surface-variant px-1 font-bold">...</span>
             <button className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all text-sm cursor-pointer hidden sm:flex">12</button>
             <button className="w-10 h-10 rounded-xl border border-white/5 text-on-surface-variant hover:border-secondary/40 hover:text-secondary flex items-center justify-center transition-all cursor-pointer">
                <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

