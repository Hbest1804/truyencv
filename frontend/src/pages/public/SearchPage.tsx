import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchService, SearchResult } from '@/services/search.service';
import { Loader2, Search, Book, Users } from 'lucide-react';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = (searchParams.get('type') as 'all' | 'story' | 'author') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [results, setResults] = useState<SearchResult>({ stories: [], authors: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchService.searchGlobal({ q, type, page, limit: 20 });
        if (res.success) {
          setResults(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, type, page]);

  const handleTypeChange = (newType: string) => {
    setSearchParams(prev => {
      prev.set('type', newType);
      prev.set('page', '1');
      return prev;
    });
  };

  if (!q || q.length < 2) {
    return (
      <div className="pt-24 max-w-[1280px] mx-auto px-4 md:px-6 min-h-[60vh] flex flex-col items-center justify-center">
        <Search className="w-16 h-16 text-on-surface-variant/30 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Tìm kiếm toàn cục</h2>
        <p className="text-on-surface-variant">Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 max-w-[1280px] mx-auto px-4 md:px-6 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-display mb-2">
          Kết quả tìm kiếm cho "{q}"
        </h1>
        <p className="text-on-surface-variant">
          Hiển thị kết quả tìm kiếm truyện và tác giả khớp với từ khóa của bạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-8">
        <button
          onClick={() => handleTypeChange('all')}
          className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${type === 'all' ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-white'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => handleTypeChange('story')}
          className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${type === 'story' ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-white'}`}
        >
          <Book className="w-4 h-4" /> Truyện
        </button>
        <button
          onClick={() => handleTypeChange('author')}
          className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${type === 'author' ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Tác giả
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
          <p className="text-on-surface-variant">Đang tìm kiếm...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Authors Section */}
          {(type === 'all' || type === 'author') && (
            <div>
              {type === 'all' && <h3 className="text-xl font-bold text-white mb-4">Tác giả ({results.authors.length})</h3>}
              {results.authors.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.authors.map(author => (
                    <div key={author.id} className="bg-surface-container border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center hover:bg-surface-container-high transition-colors">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 mb-3 overflow-hidden flex items-center justify-center border border-white/10">
                        {author.avatar_url ? (
                          <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xl font-bold">{author.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{author.display_name || author.username}</h4>
                      <p className="text-xs text-on-surface-variant">@{(author.username).substring(0, 15)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant italic">Không tìm thấy tác giả nào.</p>
              )}
            </div>
          )}

          {/* Stories Section */}
          {(type === 'all' || type === 'story') && (
            <div>
              {type === 'all' && <h3 className="text-xl font-bold text-white mb-4">Truyện ({results.stories.length})</h3>}
              {results.stories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {results.stories.map((story: any) => (
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
                <p className="text-on-surface-variant italic">Không tìm thấy truyện nào.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
