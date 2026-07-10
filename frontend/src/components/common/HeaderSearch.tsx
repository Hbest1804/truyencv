import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { searchService, SearchResult } from '@/services/search.service';

export function HeaderSearch({ searchFocused, setSearchFocused }: { searchFocused: boolean; setSearchFocused: (val: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchFocused]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchService.getSuggestions(query);
        if (res.success) {
          setSuggestions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchFocused(false);
    }
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <motion.form
        onSubmit={handleSearch}
        animate={{ width: searchFocused ? 260 : 160 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="hidden sm:flex items-center relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm..."
          onFocus={() => setSearchFocused(true)}
          className={`w-full bg-surface-container-high/60 border rounded-full py-1.5 px-4 pl-10 text-white text-sm outline-none transition-all ${searchFocused
            ? 'border-secondary/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-surface-container-highest'
            : 'border-white/5 hover:border-white/10'
            }`}
        />
        <Search className={`absolute left-3.5 w-4 h-4 transition-colors ${searchFocused ? 'text-secondary' : 'text-outline'}`} />
        
        {loading && searchFocused && (
           <Loader2 className="absolute right-3.5 w-4 h-4 text-on-surface-variant animate-spin" />
        )}
      </motion.form>

      {/* Mobile search button */}
      <button 
        onClick={() => {
          if (!searchFocused) {
            setSearchFocused(true);
            setTimeout(() => document.getElementById('mobile-search-input')?.focus(), 100);
          } else {
             handleSearch();
          }
        }} 
        className="sm:hidden text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Dropdown Suggestions */}
      <AnimatePresence>
        {searchFocused && (query.trim().length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-3 right-0 sm:left-0 w-[300px] sm:w-[360px] bg-surface-container-highest border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
          >
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {!loading && suggestions?.stories?.length === 0 && suggestions?.authors?.length === 0 && (
                <div className="p-4 text-center text-on-surface-variant text-sm">
                  Không tìm thấy kết quả nào cho "{query}"
                </div>
              )}

              {suggestions?.stories && suggestions.stories.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-2 py-1 mb-1">Truyện</h4>
                  {suggestions.stories.map(story => (
                    <div 
                      key={`story-${story.id}`}
                      onClick={() => {
                        navigate(`/stories/${story.id}`);
                        setSearchFocused(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      {story.cover_url ? (
                         <img src={story.cover_url} alt={story.title} className="w-10 h-14 object-cover rounded" />
                      ) : (
                         <div className="w-10 h-14 bg-surface-container flex items-center justify-center rounded">
                           <span className="text-xs text-on-surface-variant">No img</span>
                         </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{story.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {suggestions?.authors && suggestions.authors.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-2 py-1 mb-1">Tác giả</h4>
                  {suggestions.authors.map(author => (
                    <div 
                      key={`author-${author.id}`}
                      onClick={() => {
                         navigate(`/search?q=${encodeURIComponent(author.username)}&type=author`);
                         setSearchFocused(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                       {author.avatar_url ? (
                         <img src={author.avatar_url} alt={author.display_name} className="w-8 h-8 rounded-full object-cover" />
                       ) : (
                         <div className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center">
                           <span className="text-white text-xs">{author.username[0].toUpperCase()}</span>
                         </div>
                       )}
                       <div className="flex-1 min-w-0">
                         <p className="text-white text-sm font-semibold truncate">{author.display_name || author.username}</p>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-white/5 bg-surface-container-high/50">
              <button 
                onClick={() => handleSearch()}
                className="w-full text-center text-sm text-secondary hover:text-white transition-colors py-1.5"
              >
                Xem tất cả kết quả
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile full-screen search overlay */}
      <AnimatePresence>
        {searchFocused && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="sm:hidden fixed inset-0 bg-background/95 backdrop-blur z-[100] flex flex-col"
          >
             <div className="flex items-center gap-2 p-4 border-b border-white/5">
                <Search className="w-5 h-5 text-on-surface-variant" />
                <form onSubmit={handleSearch} className="flex-1">
                  <input
                    id="mobile-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm truyện, tác giả..."
                    className="w-full bg-transparent border-none text-white outline-none"
                  />
                </form>
                <button onClick={() => setSearchFocused(false)} className="text-on-surface-variant p-2">Đóng</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4">
                {loading && <div className="text-center py-4 text-on-surface-variant"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}
                
                {!loading && suggestions?.stories?.length === 0 && suggestions?.authors?.length === 0 && (
                  <div className="p-4 text-center text-on-surface-variant text-sm">
                    Không tìm thấy kết quả nào cho "{query}"
                  </div>
                )}

                {suggestions?.stories && suggestions.stories.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Truyện</h4>
                    {suggestions.stories.map(story => (
                      <div 
                        key={`m-story-${story.id}`}
                        onClick={() => {
                          navigate(`/stories/${story.id}`);
                          setSearchFocused(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors mb-2"
                      >
                        {story.cover_url ? (
                           <img src={story.cover_url} alt={story.title} className="w-12 h-16 object-cover rounded" />
                        ) : (
                           <div className="w-12 h-16 bg-surface-container flex items-center justify-center rounded">
                             <span className="text-xs text-on-surface-variant">No img</span>
                           </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{story.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions?.authors && suggestions.authors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Tác giả</h4>
                    {suggestions.authors.map(author => (
                      <div 
                        key={`m-author-${author.id}`}
                        onClick={() => {
                           navigate(`/search?q=${encodeURIComponent(author.username)}&type=author`);
                           setSearchFocused(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors mb-2"
                      >
                         {author.avatar_url ? (
                           <img src={author.avatar_url} alt={author.display_name} className="w-10 h-10 rounded-full object-cover" />
                         ) : (
                           <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
                             <span className="text-white text-xs">{author.username[0].toUpperCase()}</span>
                           </div>
                         )}
                         <div className="flex-1 min-w-0">
                           <p className="text-white text-sm font-semibold truncate">{author.display_name || author.username}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
