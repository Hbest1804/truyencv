import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Link } from 'react-router-dom';
import { Loader2, Search, Edit3, CheckCircle, XCircle, Trash2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStories = () => {
    setLoading(true);
    adminService.getPendingStories({ status: statusFilter === 'all' ? '' : statusFilter })
      .then(res => setStories(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();
  }, [statusFilter]);

  const handleApprove = async (storyId: string) => {
    try {
      await adminService.approveStory(storyId);
      fetchStories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi duyệt truyện');
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn tác!')) return;
    try {
      await adminService.deleteStory(storyId);
      fetchStories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa truyện');
    }
  };

  const filteredStories = stories.filter(s => {
    const term = searchTerm.toLowerCase();
    return (s.title?.toLowerCase() || '').includes(term) || 
           (s.author?.display_name?.toLowerCase() || '').includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Quản lý Truyện</h2>
          <p className="text-white/50 text-sm mt-1">Duyệt, chỉnh sửa và xóa các tác phẩm trên hệ thống</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm truyện..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          
          <div className="flex bg-surface-container-low rounded-xl p-1 border border-white/10 shrink-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'published', label: 'Đã xuất bản' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === tab.id 
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="bg-surface-container-low/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Tên truyện</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Tác giả</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Ngày tạo</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStories.map((story, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={story.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-md bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {story.cover_url ? (
                            <img src={story.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="text-white/20" size={24} />
                          )}
                        </div>
                        <div>
                          <Link to={`/admin/stories/${story.id}/edit`} className="font-semibold text-white group-hover:text-primary transition-colors text-base line-clamp-1">
                            {story.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                              story.is_published 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                              {story.is_published ? 'Đã xuất bản' : 'Chờ duyệt'}
                            </span>
                            <span className="text-xs text-white/40 truncate w-32">{story.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                          {(story.original_author || story.author?.display_name || 'U').charAt(0)}
                        </div>
                        <span className="text-white/80 font-medium">
                          {story.original_author || story.author?.display_name || story.author?.username || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {story.created_at ? new Date(story.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/stories/${story.id}/edit`}
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/70 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/30"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={16} />
                        </Link>
                        {!story.is_published && (
                          <button
                            onClick={() => handleApprove(story.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-white/70 hover:text-green-400 transition-all border border-transparent hover:border-green-500/30"
                            title="Duyệt truyện"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                          title="Xóa truyện"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                
                {filteredStories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-white/30">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p>Không tìm thấy truyện nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
