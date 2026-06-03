import { useState, useEffect } from 'react';
import { Bell, Search, Settings, Menu, X, Home, Compass, Bookmark, MessageSquare } from 'lucide-react';
import { ViewState } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (currentView === 'reader') return null;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
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
              Quiet Architect
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
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="hidden sm:flex items-center relative"
              >
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full bg-surface-container-high/60 border rounded-full py-1.5 px-4 pl-10 text-white text-sm outline-none transition-all ${
                    searchFocused 
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

            {/* Notification & Settings */}
            <div className="hidden sm:flex items-center gap-1">
              <button className="text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
              </button>
              <button className="text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="relative group hidden sm:block">
              <div className="w-8 h-8 rounded-full border border-white/15 overflow-hidden cursor-pointer hover:border-primary transition-colors">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-rReDPldkvp0oS0VmXNCUL_RGiQCmBku2PeHBYklJ7ZUolKCa_D4zKsz-F_oc3Q6QzPdoJ0Hmq_jUFlmsjSRjN4FQVyFbX91pZc0K8LvOhn-TOJaJ7AcB3Sbv2YgB4gs6fnI4Fn9J_wQQsz0QiaLY3Vx0moZUCR4TT24t-c3ZmLUpQ0U0F0IxSbxV7kym2NUwqrEwgG5aH39jhJMtr_w1OC3pEWrg0TXNg2ZRYt436nyGGpKFD_mzL48PYJW71QrDmoDV40jGol0Y" 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
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
                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-rReDPldkvp0oS0VmXNCUL_RGiQCmBku2PeHBYklJ7ZUolKCa_D4zKsz-F_oc3Q6QzPdoJ0Hmq_jUFlmsjSRjN4FQVyFbX91pZc0K8LvOhn-TOJaJ7AcB3Sbv2YgB4gs6fnI4Fn9J_wQQsz0QiaLY3Vx0moZUCR4TT24t-c3ZmLUpQ0U0F0IxSbxV7kym2NUwqrEwgG5aH39jhJMtr_w1OC3pEWrg0TXNg2ZRYt436nyGGpKFD_mzL48PYJW71QrDmoDV40jGol0Y" 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Architect Guest</h4>
                    <p className="text-xs text-on-surface-variant">Thành viên</p>
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
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          isActive 
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

              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 rounded-lg border border-white/5 text-on-surface-variant hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" /> Thiết lập
                </button>
                <button className="flex-1 py-2 px-3 rounded-lg border border-white/5 text-on-surface-variant hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Thông báo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
