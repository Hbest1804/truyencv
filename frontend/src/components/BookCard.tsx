import { BookOpen, Star } from 'lucide-react';
import { Book } from '../types';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  showDetails?: boolean;
}

export function BookCard({ book, onClick, showDetails = true }: BookCardProps) {
  // Determine gradient border / shadow based on index or title
  const isSpecial = book.rating && book.rating >= 4.8;
  
  return (
    <>
      <motion.button 
        onClick={onClick}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group text-left block w-full cursor-pointer focus:outline-none"
      >
        <div className="relative aspect-[2/3] mb-3.5 overflow-hidden rounded-2xl bg-surface-container border border-white/5 shadow-md transition-all duration-500 group-hover:border-secondary/40 group-hover:shadow-[0_12px_30px_rgba(6,182,212,0.2)]">
          
          {/* Cover Image */}
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            loading="lazy"
          />

          {/* Ambient Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />
          
          {/* Badges Overlay (Top Left) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {book.status === 'Ongoing' ? (
              <span className="bg-[#0e1b20]/80 border border-secondary/30 backdrop-blur-md text-secondary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Đang ra
              </span>
            ) : (
              <span className="bg-surface-container-highest/80 border border-white/10 backdrop-blur-md text-on-surface text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Hoàn thành
              </span>
            )}
          </div>

          {/* Rating Badge (Top Right) */}
          {book.rating && (
            <div className="absolute top-3 right-3 z-10 bg-black/60 border border-amber-500/20 backdrop-blur-md text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {book.rating}
            </div>
          )}
          
          {/* Chapters Count Overlay (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="bg-black/60 backdrop-blur-md text-on-surface text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-secondary" /> 
              {book.chapterCount} ch
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-1.5 px-1">
            <h3 className="font-bold text-base text-white group-hover:text-secondary transition-colors duration-300 line-clamp-1 font-display">
              {book.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-medium line-clamp-1">
                {book.author !== 'Unknown' ? `${book.author}` : `Cập nhật gần đây`}
              </p>
              {book.views && (
                <span className="text-[10px] text-outline font-semibold">
                  {book.views} lượt xem
                </span>
              )}
            </div>

            {book.genres && book.genres.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {book.genres.slice(0, 2).map((g, i) => (
                  <span 
                    key={i} 
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                      i % 2 === 0 
                        ? 'bg-secondary/5 border border-secondary/15 text-secondary' 
                        : 'bg-primary/5 border border-primary/15 text-primary'
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.button>
    </>
  );
}


