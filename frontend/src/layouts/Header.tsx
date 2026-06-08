import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Settings, Menu, X, Home, Compass, Bookmark, MessageSquare, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { ViewState } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState, storyId?: string) => void;
}

type AuthModalTab = 'login' | 'register';

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuthModal = (tab: AuthModalTab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
  };

  const getDisplayName = () => {
    return user?.username || user?.email?.split('@')[0] || 'Thành viên';
  };

  const getAvatarLetter = () => {
    return (user?.username || user?.email || 'U')[0].toUpperCase();
  };

  if (currentView === 'reader') return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
            ? 'py-3 bg-background/40 backdrop-blur-xl border-b border-white/5'
            : 'py-5 bg-transparent'
          }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all duration-300">
              <span className="font-display font-extrabold text-white text-lg">A</span>
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white font-display group-hover:text-gradient-primary transition-all duration-300">
              Truyện HT
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container/40 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {[
              { id: 'home', label: 'Trang chủ', view: 'home' as ViewState },
              { id: 'discover', label: 'Khám phá', view: 'discover' as ViewState },
              { id: 'library', label: 'Tủ sách', view: null },
              { id: 'community', label: 'Cộng đồng', view: null },
            ].map((tab) => {
              const isActive = currentView === tab.view;
              return (
                <button
                  key={tab.id}
                  onClick={() => tab.view && onNavigate(tab.view)}
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive
                      ? 'text-white'
                      : 'text-on-surface-variant hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Expandable Search */}
            <div className="relative flex items-center">
              <motion.div
                animate={{ width: searchFocused ? 240 : 160 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="hidden sm:flex items-center relative"
              >
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full bg-surface-container-high/60 border rounded-full py-1.5 px-4 pl-10 text-white text-sm outline-none transition-all ${searchFocused
                      ? 'border-secondary/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-surface-container-highest'
                      : 'border-white/5 hover:border-white/10'
                    }`}
                />
                <Search className={`absolute left-3.5 w-4 h-4 transition-colors ${searchFocused ? 'text-secondary' : 'text-outline'}`} />
              </motion.div>
              <button className="sm:hidden text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-1">
                  <button className="text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  </button>
                </div>

                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    id="user-avatar-btn"
                    onClick={() => setUserDropdownOpen(prev => !prev)}
                    className="flex items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full border border-primary/40 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 hover:border-primary transition-colors">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">{getAvatarLetter()}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-[60]"
                        style={{
                          background: 'rgba(14, 19, 34, 0.97)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(24px)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                        }}
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-white font-semibold text-sm truncate">{getDisplayName()}</p>
                          <p className="text-on-surface-variant text-xs truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-left">
                            <UserCircle className="w-4 h-4" /> Hồ sơ của tôi
                          </button>
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-left">
                            <Settings className="w-4 h-4" /> Thiết lập
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            id="logout-btn"
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all text-left disabled:opacity-50"
                          >
                            <LogOut className="w-4 h-4" /> Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  id="header-login-btn"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant hover:text-white border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
                >
                  Đăng nhập
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                    boxShadow: '0 0 14px rgba(168,85,247,0.3)',
                  }}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-surface-container-low border-l border-white/5 z-50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="font-display font-bold text-white text-lg">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-on-surface-variant hover:text-white p-2 rounded-full hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-container-high/40 rounded-xl mb-6">
                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
                    {isAuthenticated && user?.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : isAuthenticated && user ? (
                      <span className="text-white font-bold">{getAvatarLetter()}</span>
                    ) : (
                      <UserCircle className="w-6 h-6 text-on-surface-variant" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{isAuthenticated && user ? getDisplayName() : 'Khách'}</h4>
                    <p className="text-xs text-on-surface-variant">{isAuthenticated && user ? user.email : 'Chưa đăng nhập'}</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  {[
                    { id: 'home', label: 'Trang chủ', view: 'home' as ViewState, icon: Home },
                    { id: 'discover', label: 'Khám phá', view: 'discover' as ViewState, icon: Compass },
                    { id: 'library', label: 'Tủ sách', view: null, icon: Bookmark },
                    { id: 'community', label: 'Cộng đồng', view: null, icon: MessageSquare },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.view;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.view) {
                            onNavigate(item.view);
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all ${isActive
                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/5 text-white'
                            : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : ''}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex-1 py-2 px-3 rounded-lg border border-white/10 text-on-surface-variant hover:text-white text-xs font-semibold transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="flex-1 py-2 px-3 rounded-lg text-white text-xs font-semibold transition-colors"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
