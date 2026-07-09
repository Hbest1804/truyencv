import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authorApi } from '@/services/authorApi';
import { BookOpen, Edit, Trash2, Plus, AlertCircle, Eye, Settings, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthorDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      navigate('/');
      return;
    }
    fetchStories();
  }, [isAuthenticated, user, navigate]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await authorApi.getAuthorStories();
      setStories(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách truyện');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa truyện này? Tất cả chương sẽ bị xóa theo.')) {
      try {
        await authorApi.deleteStory(storyId);
        setStories(stories.filter(s => s.id !== storyId));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Xóa truyện thất bại');
      }
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Quản lý Truyện</h1>
          <p className="text-white/60">Quản lý các tác phẩm của bạn</p>
        </div>
        <Link 
          to="/author/stories/new" 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all font-medium"
        >
          <Plus size={20} />
          Tạo truyện mới
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {stories.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-white/5">
          <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Chưa có truyện nào</h3>
          <p className="text-white/50 mb-6">Bạn chưa tạo truyện nào. Hãy bắt đầu sáng tác ngay!</p>
          <Link to="/author/stories/new" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Plus size={20} /> Viết truyện mới
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-2xl overflow-hidden border border-white/5 group hover:border-primary/30 transition-all flex flex-col"
            >
              <div className="relative aspect-[16/9] bg-white/5">
                {story.cover_url ? (
                  <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <BookOpen size={40} />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                    story.status === 'published' || story.is_published ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    story.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {story.status === 'draft' ? 'Bản nháp' : story.status === 'ongoing' ? 'Đang ra' : story.status === 'completed' ? 'Hoàn thành' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{story.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-white/50 mb-4 mt-auto">
                  <div className="flex items-center gap-1"><BookOpen size={16} /> {story.chapter_count || 0} chương</div>
                  <div className="flex items-center gap-1"><Eye size={16} /> {story.view_count || 0} view</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-auto">
                  <Link 
                    to={`/author/stories/${story.id}/edit`}
                    className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                  >
                    <Settings size={18} />
                    <span className="text-xs">Sửa</span>
                  </Link>
                  <Link 
                    to={`/author/stories/${story.id}/chapters`}
                    className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  >
                    <Edit size={18} />
                    <span className="text-xs">Chương</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(story.id)}
                    className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                    <span className="text-xs">Xóa</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
