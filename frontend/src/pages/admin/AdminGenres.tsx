import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Loader2, Plus, Edit3, Trash2, Tags, Save, X } from 'lucide-react';
import { motion } from 'motion/react';

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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi lưu thể loại');
    }
  };

  const handleEdit = (genre: any) => {
    setFormData(genre);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa thể loại này? Hành động này không thể hoàn tác!')) return;
    try {
      await adminService.deleteGenre(id);
      fetchGenres();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa thể loại');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-white">Quản lý Thể loại</h2>
        <p className="text-white/50 text-sm mt-1">Thêm, sửa, xóa các thể loại truyện trên hệ thống</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Col: Table */}
        <div className="flex-1">
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
                      <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Tên Thể Loại</th>
                      <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Slug</th>
                      <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {genres.map((genre, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={genre.id} 
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Tags size={14} />
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-primary transition-colors text-base">{genre.name}</div>
                              {genre.description && <div className="text-xs text-white/40 mt-0.5 line-clamp-1 max-w-[200px]">{genre.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/60">
                            {genre.slug}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(genre)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/70 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/30"
                              title="Sửa"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(genre.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    
                    {genres.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-white/30">
                            <Tags size={48} className="mb-4 opacity-20" />
                            <p>Chưa có thể loại nào.</p>
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

        {/* Right Col: Form */}
        <div className="w-full lg:w-[350px]">
          <div className="bg-surface-container-low/50 backdrop-blur-xl p-6 rounded-3xl border border-white/5 sticky top-8 shadow-2xl">
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              {isEditing ? <Edit3 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
              {isEditing ? 'Sửa thể loại' : 'Thêm thể loại mới'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Tên thể loại <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Tiên Hiệp"
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Slug <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="VD: tien-hiep"
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mô tả</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn..."
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[100px]"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                >
                  <Save size={18} />
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ id: '', name: '', slug: '', description: '' });
                    }}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 font-medium px-4 py-2.5 rounded-xl transition-all"
                  >
                    <X size={18} />
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
