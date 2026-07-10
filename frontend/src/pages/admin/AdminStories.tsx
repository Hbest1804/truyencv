import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

export default function AdminStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = () => {
    setLoading(true);
    adminService.getPendingStories()
      .then(res => setStories(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleApprove = async (storyId: string) => {
    try {
      await adminService.approveStory(storyId);
      fetchStories();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi duyệt truyện');
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa truyện này?')) return;
    try {
      await adminService.deleteStory(storyId);
      fetchStories();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa truyện');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Duyệt Truyện</h2>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-white/5 text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">Tên truyện</th>
                <th className="px-4 py-3 font-medium">Tác giả</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stories.map(story => (
                <tr key={story.id} className="hover:bg-white/5 transition-colors text-white">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{story.title}</div>
                    <div className="text-xs text-on-surface-variant truncate w-48">{story.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {story.author?.display_name || story.author?.username || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {story.created_at ? new Date(story.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(story.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium bg-error/20 hover:bg-error/30 text-error transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">
                    Không có truyện chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
