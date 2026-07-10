import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Story } from '@/types';
import { userService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  BookOpen,
  Heart,
  History,
  Lock,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Flame,
  Bookmark
} from 'lucide-react';

type TabType = 'profile' | 'library' | 'favorites' | 'history' | 'password';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tab Data States
  const [libraryStories, setLibraryStories] = useState<any[]>([]);
  const [favoriteStories, setFavoriteStories] = useState<any[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  
  // Pagination
  const [libPage, setLibPage] = useState(1);
  const [libTotalPages, setLibTotalPages] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const [favTotalPages, setFavTotalPages] = useState(1);
  const [histPage, setHistPage] = useState(1);
  const [histTotalPages, setHistTotalPages] = useState(1);

  // Form States
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Sync user data to local forms when user state changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Fetch Library
  useEffect(() => {
    if (!accessToken || activeTab !== 'library') return;

    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getLibrary(accessToken, libPage, 10);
        setLibraryStories(res.data || []);
        setLibTotalPages(res.pagination?.totalPages || 1);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [accessToken, activeTab, libPage]);

  // Fetch Favorites
  useEffect(() => {
    if (!accessToken || activeTab !== 'favorites') return;

    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getFavorites(accessToken, favPage, 10);
        setFavoriteStories(res.data || []);
        setFavTotalPages(res.pagination?.totalPages || 1);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [accessToken, activeTab, favPage]);

  // Fetch History
  useEffect(() => {
    if (!accessToken || activeTab !== 'history') return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getReadingHistory(accessToken, histPage, 10);
        setReadingHistory(res.data || []);
        setHistTotalPages(res.pagination?.totalPages || 1);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken, activeTab, histPage]);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Profile Edit Submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await userService.updateProfile(accessToken, {
        username,
        display_name: displayName,
        bio,
      });

      updateUser(res.data);
      showToast('success', 'Cập nhật hồ sơ cá nhân thành công!');
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Avatar Image Selection & Base64 Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    // Validate type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Chỉ chấp nhận file hình ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB');
      return;
    }

    setAvatarLoading(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await userService.uploadAvatar(accessToken, base64String);
        updateUser({ avatar_url: res.data.avatar_url });
        showToast('success', 'Cập nhật ảnh đại diện thành công!');
      } catch (err: any) {
        showToast('error', err.message || 'Upload ảnh đại diện thất bại');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Password Change Submission
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (newPassword !== confirmPassword) {
      showToast('error', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.changePassword(accessToken, {
        oldPassword,
        newPassword,
      });

      showToast('success', 'Thay đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('error', err.message || 'Thay đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    return user?.display_name || user?.username || user?.email?.split('@')[0] || 'Thành viên';
  };

  const getAvatarLetter = () => {
    return (user?.username || user?.email || 'U')[0].toUpperCase();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getRoleText = (role?: string) => {
    const roles: Record<string, string> = {
      reader: 'Độc giả',
      author: 'Tác giả',
      moderator: 'Kiểm duyệt viên',
      admin: 'Quản trị viên',
    };
    return roles[role || 'reader'] || 'Độc giả';
  };

  const getRoleBadgeColor = (role?: string) => {
    const colors: Record<string, string> = {
      reader: 'bg-white/5 border-white/10 text-on-surface-variant',
      author: 'bg-primary/10 border-primary/25 text-primary',
      moderator: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
      admin: 'bg-red-500/10 border-red-500/25 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
    };
    return colors[role || 'reader'] || colors.reader;
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex-1 pt-28 pb-16 px-4 md:px-6 max-w-[1280px] mx-auto w-full flex flex-col lg:flex-row gap-8 relative">
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[80px] pointer-events-none" />

      {/* Sidebar - Profile Card & Tab Navigation */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 relative z-10">
        {/* User Card */}
        <div className="bg-surface-container-low/60 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-primary/40 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 relative">
              {avatarLoading ? (
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              ) : user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-3xl">{getAvatarLetter()}</span>
              )}
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 p-2 bg-secondary text-on-secondary rounded-full shadow-lg border border-white/10 hover:bg-secondary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">{getDisplayName()}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">@{user.username || 'user'}</p>
          
          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
            {getRoleText(user.role)}
          </div>

          {user.bio && (
            <p className="text-sm text-on-surface-variant mt-4 leading-relaxed font-ui italic px-4 border-t border-white/5 pt-3 w-full">
              "{user.bio}"
            </p>
          )}

          <p className="text-xxs text-on-surface-variant/75 mt-4">
            Tham gia ngày: {formatDate(user.created_at)}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface-container-low/40 border border-white/5 p-2 rounded-2xl backdrop-blur-md flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar">
          {[
            { id: 'profile', label: 'Thông tin cá nhân', icon: UserIcon },
            { id: 'library', label: 'Tủ sách đã lưu', icon: Bookmark },
            { id: 'favorites', label: 'Truyện yêu thích', icon: Heart },
            { id: 'history', label: 'Lịch sử đọc', icon: History },
            { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-left whitespace-nowrap cursor-pointer flex-shrink-0 lg:flex-shrink-grow ${isActive
                    ? 'bg-gradient-to-r from-primary/15 to-secondary/15 border border-white/10 text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow w-full lg:w-2/3 relative z-10 min-h-[500px]">
        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-surface-container-low/60 border border-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-md min-h-full">
          {/* TAB 1: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/5 pb-3">
                Cập nhật thông tin cá nhân
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                      Địa chỉ Email (Không thể đổi)
                    </label>
                    <input
                      type="text"
                      value={user.email}
                      disabled
                      className="w-full bg-surface-container/30 border border-white/5 rounded-xl py-3 px-4 text-on-surface-variant text-sm cursor-not-allowed outline-none opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                      Tên đăng nhập (Username)
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username..."
                      required
                      className="w-full bg-surface-container/50 border border-white/5 hover:border-white/10 focus:border-secondary/50 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Tên hiển thị (Display Name)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tên hiển thị..."
                    required
                    className="w-full bg-surface-container/50 border border-white/5 hover:border-white/10 focus:border-secondary/50 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Tiểu sử ngắn (Bio)
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu bản thân..."
                    rows={4}
                    className="w-full bg-surface-container/50 border border-white/5 hover:border-white/10 focus:border-secondary/50 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)] px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: LIBRARY / BOOKMARKS */}
          {activeTab === 'library' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/5 pb-3">
                Tủ sách đã lưu
              </h2>
              {loading && libraryStories.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
              ) : libraryStories.length > 0 ? (
                <div className="space-y-4">
                  {libraryStories.map((item) => {
                    const story = item.story;
                    const lastChapter = item.last_chapter;
                    if (!story) return null;
                    return (
                      <div
                        key={item.id}
                        className="bg-surface-container/30 border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-white/10 transition-all group"
                      >
                        <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                          <img
                            src={story.cover_url || 'https://placehold.co/400x600/1a1a2e/c084fc?text=No+Cover'}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            <h4
                              onClick={() => navigate('/stories/' + story.id)}
                              className="text-base font-bold text-white hover:text-secondary cursor-pointer transition-colors truncate"
                            >
                              {story.title}
                            </h4>
                            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
                              <span>Tác giả: {story.original_author || story.author?.display_name || story.author?.username || 'Không rõ'}</span>
                              <span>•</span>
                              <span className="capitalize">{story.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}</span>
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5 pt-2.5 mt-2">
                            <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
                              {lastChapter ? (
                                <>
                                  <span>Đọc dở: </span>
                                  <span className="font-semibold text-white">Chương {lastChapter.chapter_number}: {lastChapter.title}</span>
                                </>
                              ) : (
                                <span>Chưa đọc chương nào</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate('/stories/' + story.id)}
                                className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                Chi tiết <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {libTotalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      <button
                        onClick={() => setLibPage(p => Math.max(1, p - 1))}
                        disabled={libPage === 1}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Trước
                      </button>
                      <span className="text-xs text-on-surface-variant flex items-center px-2">
                        Trang {libPage} / {libTotalPages}
                      </span>
                      <button
                        onClick={() => setLibPage(p => Math.min(libTotalPages, p + 1))}
                        disabled={libPage === libTotalPages}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-on-surface-variant">
                  <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="text-sm">Chưa có truyện nào trong tủ sách của bạn</p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="mt-4 text-xs font-bold text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    Khám phá truyện ngay <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAVORITES */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/5 pb-3">
                Truyện yêu thích
              </h2>
              {loading && favoriteStories.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
              ) : favoriteStories.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {favoriteStories.map((item) => {
                      const story = item.story;
                      if (!story) return null;
                      return (
                        <div
                          key={item.id}
                          className="bg-surface-container/20 border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-all flex flex-col group cursor-pointer"
                          onClick={() => navigate('/stories/' + story.id)}
                        >
                          <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-surface-container relative">
                            <img
                              src={story.cover_url || 'https://placehold.co/400x600/1a1a2e/c084fc?text=No+Cover'}
                              alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center border border-red-500/35">
                              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">
                            {story.title}
                          </h4>
                          <p className="text-xxs text-on-surface-variant mt-1">
                            {story.author?.display_name || story.author?.username || 'Tác giả'}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {favTotalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-6">
                      <button
                        onClick={() => setFavPage(p => Math.max(1, p - 1))}
                        disabled={favPage === 1}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Trước
                      </button>
                      <span className="text-xs text-on-surface-variant flex items-center px-2">
                        Trang {favPage} / {favTotalPages}
                      </span>
                      <button
                        onClick={() => setFavPage(p => Math.min(favTotalPages, p + 1))}
                        disabled={favPage === favTotalPages}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-on-surface-variant">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="text-sm">Chưa có truyện nào trong danh sách yêu thích</p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="mt-4 text-xs font-bold text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    Khám phá truyện ngay <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: READING HISTORY */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/5 pb-3">
                Lịch sử đọc truyện
              </h2>
              {loading && readingHistory.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
              ) : readingHistory.length > 0 ? (
                <div className="space-y-4">
                  {readingHistory.map((item) => {
                    const story = item.story;
                    const chapter = item.chapter;
                    if (!story) return null;
                    return (
                      <div
                        key={item.id}
                        className="bg-surface-container/30 border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-white/10 transition-all group"
                      >
                        <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                          <img
                            src={story.cover_url || 'https://placehold.co/400x600/1a1a2e/c084fc?text=No+Cover'}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4
                                onClick={() => navigate('/stories/' + story.id)}
                                className="text-sm md:text-base font-bold text-white hover:text-secondary cursor-pointer transition-colors truncate"
                              >
                                {story.title}
                              </h4>
                              <span className="text-xxs text-on-surface-variant flex-shrink-0">
                                {formatRelativeTime(item.read_at)}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              Đã đọc: {chapter ? `Chương ${chapter.chapter_number}: ${chapter.title}` : 'Chưa rõ chương'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-2 mt-2">
                            {/* Progress bar */}
                            <div className="flex-grow max-w-xs flex items-center gap-2">
                              <div className="flex-grow h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-secondary"
                                  style={{ width: `${item.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xxs font-bold text-on-surface-variant">{item.progress || 0}%</span>
                            </div>
                            
                            <button
                              onClick={() => navigate('/stories/' + story.id)} // In full app, direct to Reader page for that chapter
                              className="px-3.5 py-1 bg-secondary text-on-secondary shadow-sm hover:bg-secondary/90 text-xxs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Đọc tiếp <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {histTotalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      <button
                        onClick={() => setHistPage(p => Math.max(1, p - 1))}
                        disabled={histPage === 1}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Trước
                      </button>
                      <span className="text-xs text-on-surface-variant flex items-center px-2">
                        Trang {histPage} / {histTotalPages}
                      </span>
                      <button
                        onClick={() => setHistPage(p => Math.min(histTotalPages, p + 1))}
                        disabled={histPage === histTotalPages}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-on-surface-variant">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="text-sm">Chưa có lịch sử đọc truyện</p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="mt-4 text-xs font-bold text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    Khám phá truyện ngay <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PASSWORD UPDATE */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/5 pb-3">
                Thay đổi mật khẩu tài khoản
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    required
                    className="w-full bg-surface-container/50 border border-white/5 hover:border-white/10 focus:border-secondary/50 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Mật khẩu mới (Tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    required
                    className="w-full bg-surface-container/50 border border-white/5 hover:border-white/10 focus:border-secondary/50 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    required
                    className="w-full bg-surface-container/50 border border-white/5 hover:border-white/10 focus:border-secondary/50 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)] px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Cập nhật mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
