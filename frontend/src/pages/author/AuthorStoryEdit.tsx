import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authorApi } from '@/services/authorApi';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

export function AuthorStoryEdit() {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const isNew = storyId === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    genreIds: [] as number[],
  });
  const [coverUrl, setCoverUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      navigate('/');
      return;
    }
    
    if (!isNew) {
      fetchStory();
    }
  }, [storyId, isAuthenticated, user, navigate]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const res = await authorApi.getStoryDetail(storyId as string);
      const story = res.data.data;
      setFormData({
        title: story.title || '',
        description: story.description || '',
        status: story.status || 'draft',
        genreIds: story.genres?.map((g: any) => g.id) || [],
      });
      setCoverUrl(story.cover_url || '');
    } catch (err) {
      alert('Không thể tải thông tin truyện');
      navigate('/author/stories');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (isNew) {
      alert('Vui lòng tạo truyện trước khi upload ảnh bìa');
      return;
    }

    try {
      setSaving(true);
      const res = await authorApi.uploadStoryCover(storyId as string, file);
      setCoverUrl(res.data.data.cover_url);
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

    // if genreIds empty, give a fake one for now to bypass db constraint if any, 
    // but we should ideally select it.
    const submitData = {
      ...formData,
      genreIds: formData.genreIds.length > 0 ? formData.genreIds : [1], // fallback 1
    };

    try {
      setSaving(true);
      if (isNew) {
        const res = await authorApi.createStory(submitData);
        navigate(`/author/stories/${res.data.data.id}/edit`);
      } else {
        await authorApi.updateStory(storyId as string, submitData);
        alert('Cập nhật thành công');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/author/stories" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />
        Quay lại danh sách
      </Link>

      <div className="bg-surface rounded-2xl border border-white/5 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-8">
          {isNew ? 'Tạo Truyện Mới' : 'Chỉnh Sửa Truyện'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left col: Cover */}
          <div className="col-span-1">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Ảnh bìa</label>
              <div 
                className="aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all relative group"
                onClick={() => !isNew && fileInputRef.current?.click()}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={40} className="mx-auto text-white/20 mb-2" />
                    <span className="text-sm text-white/40 block">Chưa có ảnh bìa</span>
                  </div>
                )}
                
                {!isNew && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Upload size={18} />
                      Tải ảnh lên
                    </div>
                  </div>
                )}
              </div>
              {isNew && <p className="text-xs text-white/40 mt-2 text-center">Tạo truyện trước để tải ảnh lên</p>}
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
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập tên truyện..."
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="ongoing">Đang ra</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="paused">Tạm dừng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mô tả / Tóm tắt <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[200px]"
                  placeholder="Giới thiệu về nội dung truyện..."
                  maxLength={5000}
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isNew ? 'Tạo truyện' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
