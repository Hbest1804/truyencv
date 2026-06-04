import { useState } from 'react';
import { BookOpen, Bookmark, User, Star, Eye, ArrowRight, Expand, Send, MessageSquare, ChevronDown, ListPlus } from 'lucide-react';
import { CURRENT_STORY_DETAIL, CHAPTERS, COMMENTS } from '@/constants/mockData';
import { ViewState } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

interface DetailPageProps {
  onNavigate: (view: ViewState) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

export function DetailPage({ onNavigate }: DetailPageProps) {
  const book = CURRENT_STORY_DETAIL;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentsList, setCommentsList] = useState(COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [chapterOrderAsc, setChapterOrderAsc] = useState(true);

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const cmt = {
      id: `cmt-${Date.now()}`,
      author: 'Architect Guest',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-rReDPldkvp0oS0VmXNCUL_RGiQCmBku2PeHBYklJ7ZUolKCa_D4zKsz-F_oc3Q6QzPdoJ0Hmq_jUFlmsjSRjN4FQVyFbX91pZc0K8LvOhn-TOJaJ7AcB3Sbv2YgB4gs6fnI4Fn9J_wQQsz0QiaLY3Vx0moZUCR4TT24t-c3ZmLUpQ0U0F0IxSbxV7kym2NUwqrEwgG5aH39jhJMtr_w1OC3pEWrg0TXNg2ZRYt436nyGGpKFD_mzL48PYJW71QrDmoDV40jGol0Y',
      timeAgo: 'VỪA XONG',
      content: newComment.trim()
    };
    setCommentsList([cmt, ...commentsList]);
    setNewComment('');
  };

  const displayedChapters = chapterOrderAsc ? CHAPTERS : [...CHAPTERS].reverse();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full"
    >
      {/* Bento Layout Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16">
        
        {/* Cover Art */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 flex justify-center lg:justify-start"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border border-white/5 bg-surface-container-low max-w-[320px] lg:max-w-full aspect-[2/3] w-full group hover:shadow-[0_20px_50px_rgba(168,85,247,0.25)] hover:border-primary/20">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-secondary/20 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-secondary">Đang ra</span>
            </div>
          </div>
        </motion.div>

        {/* Metadata */}
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-white mb-5 font-display tracking-tight">
            {book.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-y-3 gap-x-5 mb-6 text-sm font-medium text-on-surface-variant">
            <span className="flex items-center gap-2 text-white/95">
              <User className="w-4 h-4 text-primary" />
              Tác giả: <span className="font-bold">{book.author}</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10 hidden sm:inline"></span>
            
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-white">{book.rating}</span>
              <span className="text-xs text-on-surface-variant">(1.2k đánh giá)</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10 hidden sm:inline"></span>
            
            <span className="flex items-center gap-2">
              <Eye className="w-4.5 h-4.5 text-secondary" />
              Lượt xem: <span className="font-bold text-white">{book.views}</span>
            </span>
          </div>

          {/* Genres Badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {book.genres.map((g, i) => (
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
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => onNavigate('reader')}
              className="bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] font-bold py-3.5 px-8 rounded-xl hover:bg-secondary/90 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <BookOpen className="w-5 h-5" />
              Đọc từ đầu
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`font-bold py-3.5 px-8 rounded-xl border transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2.5 ${
                isBookmarked
                  ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-surface-container-high/40 border-white/5 hover:border-white/15 text-white hover:bg-surface-container-high/60'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-primary' : ''}`} />
              {isBookmarked ? 'Đang theo dõi' : 'Theo dõi truyện'}
            </button>
          </div>

          {/* Synopsis */}
          <div className="bg-surface-container-low/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-md">
            <h3 className="text-lg font-bold text-white mb-4 font-display flex items-center gap-2">
              <span className="w-2 h-4 bg-primary rounded-full" />
              Tóm tắt nội dung
            </h3>
            <p className="font-reading text-base md:text-lg leading-relaxed text-on-surface-variant opacity-95">
              {book.synopsis}
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
          
          <div className="flex flex-col gap-3">
            {displayedChapters.map(ch => (
              <button
                key={ch.id}
                onClick={() => onNavigate('reader')}
                className="group p-4 rounded-xl bg-surface-container-low/40 border border-white/5 hover:border-secondary/25 hover:bg-surface-container-high/40 transition-all duration-300 flex items-center justify-between cursor-pointer text-left"
              >
                <div className="flex flex-col">
                  <span className="text-white group-hover:text-secondary transition-colors duration-250 font-semibold font-display">
                    {ch.title}
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-1.5 tracking-wider">
                    Cập nhật {ch.updatedAt}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-surface-container/60 group-hover:bg-secondary/15 flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
            
            <button className="w-full py-4 mt-2 rounded-xl border border-white/5 hover:border-white/10 text-sm font-bold text-on-surface-variant hover:text-white hover:bg-surface-container-high/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
              Xem thêm chương
              <Expand className="w-4 h-4" />
            </button>
          </div>
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
              placeholder="Bạn nghĩ gì về chương này? Viết bình luận của bạn..."
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
  );
}
