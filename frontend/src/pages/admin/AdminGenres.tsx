import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

export default function AdminGenres() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', slug: '', description: '' });

  const fetchGenres = () => {
    setLoading(true);
    adminService.getGenres()
      .then(res => setGenres(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await adminService.updateGenre(formData.id, {
          name: formData.name, slug: formData.slug, description: formData.description
        });
      } else {
        await adminService.createGenre({
          name: formData.name, slug: formData.slug, description: formData.description
        });
      }
      setIsEditing(false);
      setFormData({ id: '', name: '', slug: '', description: '' });
      fetchGenres();
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu thể loại');
    }
  };

  const handleEdit = (genre: any) => {
    setFormData(genre);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa thể loại này?')) return;
    try {
      await adminService.deleteGenre(id);
      fetchGenres();
    } catch (err) {
      console.error(err);
      alert('Lỗi xóa thể loại');
    }
  };

  return (
    <div className="p-8 flex gap-8">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-6">Quản lý Thể loại</h2>
        
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-white/5 text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-medium">Tên</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {genres.map(genre => (
                  <tr key={genre.id} className="hover:bg-white/5 transition-colors text-white">
                    <td className="px-4 py-3 font-semibold">{genre.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{genre.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(genre)}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-surface hover:bg-surface-container-high transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(genre.id)}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-error/20 hover:bg-error/30 text-error transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="w-80">
        <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 sticky top-8">
          <h3 className="text-lg font-bold text-white mb-4">
            {isEditing ? 'Sửa thể loại' : 'Thêm thể loại mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Tên</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1">Mô tả</label>
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-primary min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded transition-colors"
              >
                Lưu
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ id: '', name: '', slug: '', description: '' });
                  }}
                  className="flex-1 bg-surface hover:bg-surface-container-high text-white font-medium py-2 rounded transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
