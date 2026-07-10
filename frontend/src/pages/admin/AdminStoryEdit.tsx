import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

const GENRES = [
  { id: 1, label: 'Tiên Hiệp' },
  { id: 2, label: 'Kiếm Hiệp' },
  { id: 3, label: 'Huyền Huyễn' },
  { id: 4, label: 'Ngôn Tình' },
  { id: 5, label: 'Đô Thị' },
  { id: 6, label: 'Võng Du' },
  { id: 7, label: 'Fantasy' },
  { id: 8, label: 'Sci-Fi' },
  { id: 9, label: 'Mystery' },
];

export default function AdminStoryEdit() {
  const navigate = useNavigate();
  const { storyId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    genreIds: [] as number[],
    view_count: 0,
    original_author: '',
  });
  const [coverUrl, setCoverUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStoryDetail(storyId as string);
      const story = res.data;
      setFormData({
        title: story.title || '',
        description: story.description || '',
        status: story.status || 'draft',
        genreIds: story.genres?.map((g: any) => g.id) || [],
        view_count: story.view_count || 0,
        original_author: story.original_author || '',
      });
      setCoverUrl(story.cover_url || '');
    } catch (err) {
      alert('Không thể tải thông tin truyện');
      navigate('/admin/stories');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB.');
      return;
    }

    try {
      setSaving(true);
      const res = await adminService.uploadStoryCover(storyId as string, file);
      setCoverUrl(res.data.cover_url);
    } catch (err) {
      alert('Upload ảnh bìa thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.genreIds.length === 0) {
      alert('Vui lòng chọn ít nhất một thể loại');
      return;
    }

    const submitData = {
      ...formData,
      genreIds: formData.genreIds,
    };

    try {
      setSaving(true);
      await adminService.updateStory(storyId as string, submitData);
      alert('Cập nhật thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/stories" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 hover:border-white/10">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-display font-bold text-white">Chỉnh sửa Truyện</h1>
      </div>

      <div className="bg-surface-container-low/50 backdrop-blur-xl rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left col: Cover */}
          <div className="col-span-1">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Ảnh bìa</label>
              <div 
                className="aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={40} className="mx-auto text-white/20 mb-2" />
                    <span className="text-sm text-white/40 block">Chưa có ảnh bìa</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Upload size={18} /> Tải ảnh lên
                  </div>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Right col: Form */}
          <div className="col-span-1 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Tên truyện <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập tên truyện..."
                  maxLength={200}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Tên tác giả</label>
                <input
                  type="text"
                  value={formData.original_author}
                  onChange={e => setFormData({...formData, original_author: e.target.value})}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập tên tác giả..."
                  maxLength={255}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="ongoing">Đang ra</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="paused">Tạm dừng</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Lượt xem (Tuỳ chỉnh)</label>
                  <input
                    type="number"
                    value={formData.view_count}
                    onChange={e => setFormData({...formData, view_count: parseInt(e.target.value) || 0})}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Thể loại <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => {
                    const isSelected = formData.genreIds.includes(genre.id);
                    return (
                      <button
                        type="button"
                        key={genre.id}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            genreIds: isSelected 
                              ? prev.genreIds.filter(id => id !== genre.id)
                              : [...prev.genreIds, genre.id]
                          }));
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          isSelected 
                            ? 'bg-primary/20 border-primary text-primary' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {genre.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mô tả / Tóm tắt <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[200px]"
                  placeholder="Giới thiệu về nội dung truyện..."
                  maxLength={5000}
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
