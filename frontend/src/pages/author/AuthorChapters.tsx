import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authorApi } from '@/services/authorApi';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthorChapters() {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      navigate('/');
      return;
    }
    fetchData();
  }, [storyId, isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [storyRes, chaptersRes] = await Promise.all([
        authorApi.getStoryDetail(storyId as string),
        authorApi.getAuthorChapters(storyId as string)
      ]);
      setStoryTitle(storyRes.data.data.title);
      setChapters(chaptersRes.data.data);
    } catch (err) {
      alert('Không thể tải dữ liệu chương');
      navigate('/author/stories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      try {
        await authorApi.deleteChapter(storyId as string, chapterId);
        setChapters(chapters.filter(c => c.id !== chapterId));
      } catch (err) {
        alert('Xóa chương thất bại');
      }
    }
  };

  const handlePublish = async (chapterId: string) => {
    if (window.confirm('Xuất bản chương này ngay lập tức?')) {
      try {
        await authorApi.publishChapter(storyId as string, chapterId);
        fetchData();
      } catch (err) {
        alert('Xuất bản thất bại');
      }
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/author/stories" className="p-2 bg-surface hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Quản lý Chương</h1>
          <p className="text-white/50 text-sm">Truyện: {storyTitle}</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Danh sách chương ({chapters.length})
          </h2>
          <Link 
            to={`/author/stories/${storyId}/chapters/new`}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg transition-all text-sm font-medium"
          >
            <Plus size={18} />
            Thêm chương mới
          </Link>
        </div>

        {chapters.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            Chưa có chương nào. Hãy bắt đầu viết chương đầu tiên!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {chapters.map((chapter) => (
              <motion.div 
                key={chapter.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white/50 font-mono text-sm w-12 shrink-0">
                      Chương {chapter.chapter_number}
                    </span>
                    <h3 className="font-medium text-white truncate max-w-[400px]">
                      {chapter.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs mt-2 pl-[3.75rem]">
                    {chapter.is_published ? (
                      <span className="text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-0.5 rounded">
                        <CheckCircle size={12} /> Đã xuất bản
                      </span>
                    ) : chapter.scheduled_at ? (
                      <span className="text-blue-400 flex items-center gap-1 bg-blue-400/10 px-2 py-0.5 rounded">
                        <Clock size={12} /> Đã lên lịch: {new Date(chapter.scheduled_at).toLocaleString('vi-VN')}
                      </span>
                    ) : (
                      <span className="text-yellow-400 flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded">
                        Bản nháp
                      </span>
                    )}
                    <span className="text-white/40">
                      Cập nhật: {new Date(chapter.updated_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {!chapter.is_published && (
                    <button 
                      onClick={() => handlePublish(chapter.id)}
                      className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Xuất bản
                    </button>
                  )}
                  <Link 
                    to={`/author/stories/${storyId}/chapters/${chapter.id}/edit`}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(chapter.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
