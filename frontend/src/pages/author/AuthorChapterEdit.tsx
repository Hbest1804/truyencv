import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authorApi } from '@/services/authorApi';
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react';

export function AuthorChapterEdit() {
  const navigate = useNavigate();
  const { storyId, chapterId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const isNew = chapterId === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    number: '',
    scheduledAt: '',
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      navigate('/');
      return;
    }
    
    if (!isNew) {
      fetchChapter();
    }
  }, [storyId, chapterId, isAuthenticated, user, navigate]);

  const fetchChapter = async () => {
    try {
      setLoading(true);
      const res = await authorApi.getChapterDetail(storyId as string, chapterId as string);
      const chapter = res.data.data;
      setFormData({
        title: chapter.title || '',
        content: chapter.content || '',
        status: chapter.status || 'draft',
        number: chapter.chapter_number?.toString() || '',
        scheduledAt: chapter.scheduled_at ? (() => {
          const d = new Date(chapter.scheduled_at);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        })() : '',
      });
      if (chapter.scheduled_at) {
        setIsScheduling(true);
      }
    } catch (err) {
      alert('Không thể tải thông tin chương');
      navigate(`/author/stories/${storyId}/chapters`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    
    if (formData.content.length < 100) {
      alert('Nội dung chương phải dài ít nhất 100 ký tự');
      return;
    }

    const submitData: any = {
      title: formData.title,
      content: formData.content,
      status: formData.status,
    };

    if (formData.number) {
      submitData.number = parseInt(formData.number, 10);
    }

    if (isScheduling) {
      if (!formData.scheduledAt) {
        alert("Vui lòng chọn thời gian lên lịch đăng");
        return;
      }
      submitData.scheduledAt = new Date(formData.scheduledAt).toISOString();
      submitData.status = 'draft'; // Should be draft until scheduled time comes, or handle via cron.
    }

    try {
      setSaving(true);
      if (isNew) {
        await authorApi.createChapter(storyId as string, submitData);
        alert('Tạo chương thành công');
        navigate(`/author/stories/${storyId}/chapters`);
      } else {
        await authorApi.updateChapter(storyId as string, chapterId as string, submitData);
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link 
        to={`/author/stories/${storyId}/chapters`} 
        className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Quay lại danh sách chương
      </Link>

      <div className="bg-surface rounded-2xl border border-white/5 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-8">
          {isNew ? 'Thêm Chương Mới' : 'Chỉnh Sửa Chương'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-white/70 mb-2">Tiêu đề chương <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Nhập tiêu đề chương..."
                maxLength={200}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white/70 mb-2">Số chương</label>
              <input
                type="number"
                value={formData.number}
                onChange={e => setFormData({...formData, number: e.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Tự động"
                min={1}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-white/70 mb-2">Trạng thái xuất bản</label>
              <select
                value={formData.status}
                onChange={e => {
                  setFormData({...formData, status: e.target.value});
                  if (e.target.value === 'published') setIsScheduling(false);
                }}
                disabled={isScheduling}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản ngay</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isScheduling}
                  onChange={(e) => {
                    setIsScheduling(e.target.checked);
                    if (e.target.checked) setFormData({...formData, status: 'draft'});
                  }}
                  className="rounded border-white/20 bg-background text-primary focus:ring-primary"
                />
                Lên lịch đăng (tùy chọn)
              </label>
              <input
                type="datetime-local"
                disabled={!isScheduling}
                value={formData.scheduledAt}
                onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Nội dung chương (HTML) <span className="text-red-500">*</span>
              <span className="text-white/40 text-xs ml-2 font-normal">(Hỗ trợ thẻ HTML cơ bản hoặc dùng Markdown)</span>
            </label>
            <textarea
              required
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[500px]"
              placeholder="<p>Nhập nội dung chương truyện của bạn vào đây...</p>"
            />
            <div className="mt-2 flex justify-between text-xs text-white/40">
              <span>Tối thiểu 100 ký tự</span>
              <span>{formData.content.length} ký tự</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isNew ? 'Lưu chương' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
