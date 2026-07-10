import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { genreService, Genre } from '@/services/genre.service';
import { Loader2, Book, Tag } from 'lucide-react';
import { Story } from '@/types';
import { Link } from 'react-router-dom';

export function GenresPage() {
  const { genreSlug } = useParams<{ genreSlug: string }>();
  const navigate = useNavigate();
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<Genre | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);

  // Fetch Genres
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const res = await genreService.getGenres();
        if (res.success && res.data) {
          setGenres(res.data);
          // If no genreSlug is provided but genres exist, maybe redirect to the first one?
          // Or just show a message to select a genre. Let's just show the message if no slug.
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  // Sync activeGenre based on URL slug
  useEffect(() => {
    if (genres.length > 0) {
      if (genreSlug) {
        const found = genres.find(g => g.slug === genreSlug);
        if (found) {
          setActiveGenre(found);
        } else {
           // Not found, redirect to first genre
           navigate(`/genres/${genres[0].slug}`, { replace: true });
        }
      } else {
        navigate(`/genres/${genres[0].slug}`, { replace: true });
      }
    }
  }, [genreSlug, genres, navigate]);

  // Fetch stories for active genre
  useEffect(() => {
    if (!activeGenre) return;

    const fetchStories = async () => {
      setLoadingStories(true);
      try {
        const res = await genreService.getStoriesByGenre(activeGenre.id, { page: 1, limit: 30 });
        if (res.success) {
          setStories(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchStories();
  }, [activeGenre]);

  return (
    <div className="pt-24 max-w-[1280px] mx-auto px-4 md:px-6 pb-20">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar - Genres List */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 bg-surface-container/50 border border-white/5 rounded-2xl p-4 backdrop-blur-xl">
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> 
              Thể Loại
            </h2>
            
            {loadingGenres ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-secondary" /></div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {genres.map(genre => (
                  <Link
                    key={genre.id}
                    to={`/genres/${genre.slug}`}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeGenre?.id === genre.id 
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]' 
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Stories Grid */}
        <div className="flex-1">
          {activeGenre && (
            <div className="mb-8 border-b border-white/10 pb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display mb-2">
                Truyện {activeGenre.name}
              </h1>
              {activeGenre.description && (
                <p className="text-on-surface-variant text-sm md:text-base">
                  {activeGenre.description}
                </p>
              )}
            </div>
          )}

          {loadingStories ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
              <p className="text-on-surface-variant">Đang tải danh sách truyện...</p>
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {stories.map((story: any) => (
                <Link key={story.id} to={`/stories/${story.id}`} className="group flex flex-col gap-3">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container border border-white/5 shadow-lg group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
                    {story.cover_url ? (
                      <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-surface-container-high to-surface-container">
                        <Book className="w-8 h-8 text-on-surface-variant/30 mb-2" />
                        <span className="text-xs font-semibold text-on-surface-variant line-clamp-3">{story.title}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md ${
                        story.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        story.status === 'ongoing' ? 'bg-secondary/20 text-secondary-light border border-secondary/30' :
                        'bg-surface-container-high/80 text-on-surface-variant border border-white/10'
                      }`}>
                        {story.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-secondary transition-colors" title={story.title}>
                      {story.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
                      <span>{story.author?.display_name || story.author?.username || 'Vô danh'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Book className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
              <p className="text-on-surface-variant text-lg">Chưa có truyện nào thuộc thể loại này.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
