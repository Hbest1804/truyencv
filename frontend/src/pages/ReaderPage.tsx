import { useState, useEffect } from 'react';
import { ArrowLeft, List, Settings as SettingsIcon, ChevronLeft, ChevronRight, X, Minus, Plus, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReader } from '@/hooks/useReader';
import { useStory } from '@/hooks/useStory';

type ReaderTheme = 'dark' | 'light' | 'sepia' | 'nordic' | 'forest';
type ReaderFont = 'serif' | 'sans' | 'mono';
type ReaderSpacing = 'tight' | 'normal' | 'relaxed';

export function ReaderPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const navigate = useNavigate();
  
  const [controlsVisible, setControlsVisible] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [font, setFont] = useState<ReaderFont>('serif');
  const [fontSize, setFontSize] = useState(19);
  const [spacing, setSpacing] = useState<ReaderSpacing>('normal');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersDrawerOpen, setChaptersDrawerOpen] = useState(false);

  // Hook to handle active chapter loading and state management
  const {
    chapters,
    activeChapter,
    loading,
    error,
    goToNextChapter,
    goToPrevChapter,
    saveProgress,
    markAsRead,
    hasNext,
    hasPrev,
    currentChapterNumber,
    totalChapters,
  } = useReader(storyId, chapterId);

  // Hook to get the story meta (e.g. title)
  const { story } = useStory(storyId || null);

  // 1. Restore scroll progress when activeChapter is loaded
  useEffect(() => {
    if (activeChapter) {
      const savedProgress = activeChapter.reading_progress || 0;
      if (savedProgress > 0 && savedProgress < 99) {
        const timer = setTimeout(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (scrollHeight > 0) {
            const targetY = (savedProgress / 100) * scrollHeight;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        }, 600); // Wait for content rendering/fonts to layout
        return () => clearTimeout(timer);
      } else {
        window.scrollTo(0, 0);
        setReadingProgress(0);
      }
    }
  }, [activeChapter?.id]);

  // 2. Handle scroll behaviors
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50 && currentScrollY > lastScrollY && controlsVisible && !settingsOpen && !chaptersDrawerOpen) {
        setControlsVisible(false);
      } else if (currentScrollY < lastScrollY && !controlsVisible) {
        setControlsVisible(true);
      }
      lastScrollY = currentScrollY;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = (currentScrollY / scrollHeight) * 100;
        const boundedScrolled = Math.max(0, Math.min(scrolled, 100));
        setReadingProgress(boundedScrolled);
        
        // Debounced save progress
        saveProgress(boundedScrolled);

        // Mark as read when close to bottom
        if (boundedScrolled >= 95) {
          markAsRead();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controlsVisible, settingsOpen, chaptersDrawerOpen, saveProgress, markAsRead]);

  const themeClasses: Record<ReaderTheme, string> = {
    dark: 'bg-[#0e1118] text-[#f1f5f9]',
    light: 'bg-[#ffffff] text-[#18181b]',
    sepia: 'bg-[#fdf6e3] text-[#5c4738]',
    nordic: 'bg-[#1e2536] text-[#e2e8f0]',
    forest: 'bg-[#142920] text-[#e1ece8]'
  };

  const fontClasses: Record<ReaderFont, string> = {
    serif: 'font-reading',
    sans: 'font-ui',
    mono: 'font-mono'
  };

  const lineHeights: Record<ReaderSpacing, number> = {
    tight: 1.6,
    normal: 1.9,
    relaxed: 2.2
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#f8fafc] flex flex-col items-center justify-center font-ui">
        <Loader2 className="w-10 h-10 text-secondary animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm font-semibold">Đang tải nội dung chương...</p>
      </div>
    );
  }

  // Error state
  if (error || !activeChapter) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#f8fafc] flex flex-col items-center justify-center p-6 text-center font-ui">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4 opacity-70" />
        <h2 className="text-xl font-bold text-white mb-2">Lỗi tải chương</h2>
        <p className="text-on-surface-variant text-sm mb-6 max-w-sm">{error || 'Không tìm thấy nội dung chương'}</p>
        <button
          onClick={() => navigate(`/stories/${storyId}`)}
          className="px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-all cursor-pointer"
        >
          Trở lại chi tiết truyện
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses[theme]} ${fontClasses[font]}`}
      onClick={() => {
        if (settingsOpen) {
          setSettingsOpen(false);
        } else if (chaptersDrawerOpen) {
          setChaptersDrawerOpen(false);
        } else {
          setControlsVisible(!controlsVisible);
        }
      }}
    >
      {/* Top Reader Control Bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.header
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 shadow-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-[1280px] mx-auto font-ui">
              <button
                onClick={() => navigate(`/stories/${storyId}`)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 text-white" />
                <span className="hidden sm:inline text-white font-bold text-sm">Trở lại</span>
              </button>
              
              <div className="flex flex-col items-center text-center max-w-[200px] md:max-w-md">
                <h1 className="font-bold text-white truncate text-xs md:text-base font-display">
                  Chương {activeChapter.chapter_number}: {activeChapter.title}
                </h1>
                <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase mt-0.5">
                  {story?.title || 'Đang tải truyện...'}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setChaptersDrawerOpen(!chaptersDrawerOpen)}
                  className={`text-on-surface-variant hover:text-secondary transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer ${chaptersDrawerOpen ? 'text-secondary bg-white/5' : ''}`}
                >
                  <List className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`text-on-surface-variant hover:text-secondary transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer ${settingsOpen ? 'text-secondary bg-white/5' : ''}`}
                >
                  <SettingsIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Reading Progress Indicator */}
      <div
        className={`fixed top-16 left-0 w-full h-[3px] z-50 bg-white/10 transition-all duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="h-full bg-secondary transition-all duration-150 ease-out shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Main Reading Canvas */}
      <main className="w-full max-w-[720px] mx-auto px-6 md:px-0 pt-32 pb-48 relative z-10 select-text">
        <article
          className="max-w-none text-current"
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeights[spacing] }}
        >
          <h2 className="text-3xl md:text-4.5xl font-black mb-10 font-display text-current opacity-95 border-b border-current/10 pb-6">
            Chương {activeChapter.chapter_number}: {activeChapter.title}
          </h2>
          
          <div className="space-y-8 font-medium">
            {(activeChapter.content || '')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/\\n/g, '\n')
              .replace(/\r/g, '\n')
              .split('\n')
              .map((para, idx) => {
                const cleanPara = para.trim();
                if (!cleanPara) return null;
                return <p key={idx}>{cleanPara}</p>;
              })}
          </div>
        </article>
      </main>

      {/* Preferences Drawer Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 w-full z-50 glass-panel border-t border-white/5 p-6 md:p-8 rounded-t-3xl shadow-2xl font-ui"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-[640px] mx-auto space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="font-display font-extrabold text-white text-base flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-secondary" /> Thiết lập trình đọc
                </span>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-on-surface-variant hover:text-white p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Picker */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Màu nền trang</h4>
                <div className="grid grid-cols-5 gap-3">
                  {(['dark', 'light', 'sepia', 'nordic', 'forest'] as ReaderTheme[]).map(t => {
                    const active = theme === t;
                    const labels = { dark: 'Obsidian', light: 'Giấy', sepia: 'Cổ điển', nordic: 'Bắc Âu', forest: 'Rừng thông' };
                    const circleColors = { dark: 'bg-[#0e1118]', light: 'bg-[#ffffff]', sepia: 'bg-[#fdf6e3]', nordic: 'bg-[#1e2536]', forest: 'bg-[#142920]' };
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                          active ? 'border-secondary bg-white/5' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full border border-white/10 mb-1 ${circleColors[t]}`} />
                        <span className="text-[10px] font-bold text-white mt-1">{labels[t]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family Picker */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Phông chữ</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'serif' as ReaderFont, label: 'Serif (Lora)', fontClass: 'font-serif' },
                    { id: 'sans' as ReaderFont, label: 'Sans (Jakarta)', fontClass: 'font-sans' },
                    { id: 'mono' as ReaderFont, label: 'Mono (Console)', fontClass: 'font-mono' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${f.fontClass} ${
                        font === f.id ? 'border-secondary bg-white/5 text-white' : 'border-white/5 text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & Spacing Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cỡ chữ ({fontSize}px)</h4>
                  <div className="flex items-center gap-3 bg-surface-container/60 p-1.5 rounded-xl border border-white/5">
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                      className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-white cursor-pointer active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-grow text-center text-xs font-bold text-white">Chữ</div>
                    <button
                      onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                      className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-white cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Giãn dòng</h4>
                  <div className="flex bg-surface-container/60 p-1.5 rounded-xl border border-white/5">
                    {(['tight', 'normal', 'relaxed'] as ReaderSpacing[]).map(s => {
                      const active = spacing === s;
                      const spacingLabels = { tight: 'Hẹp', normal: 'Vừa', relaxed: 'Rộng' };
                      return (
                        <button
                          key={s}
                          onClick={() => setSpacing(s)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            active ? 'bg-secondary/15 text-secondary border border-secondary/20 shadow-sm' : 'text-on-surface-variant hover:text-white'
                          }`}
                        >
                          {spacingLabels[s]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapters List Sidebar Drawer */}
      <AnimatePresence>
        {chaptersDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setChaptersDrawerOpen(false)}
              className="fixed inset-0 bg-black z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed left-0 top-0 bottom-0 w-[300px] bg-surface-container border-r border-white/10 z-[70] p-6 flex flex-col justify-between font-ui"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                  <span className="font-display font-extrabold text-white text-base">Mục lục chương</span>
                  <button
                    onClick={() => setChaptersDrawerOpen(false)}
                    className="text-on-surface-variant hover:text-white p-2 rounded-full hover:bg-white/5 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {chapters.map((ch) => {
                    const isActive = ch.id === activeChapter.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          navigate(`/stories/${storyId}/reader/${ch.id}`);
                          setChaptersDrawerOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-secondary/15 border-secondary/35 text-secondary shadow-sm'
                            : 'bg-surface-container-high/40 border-white/5 text-on-surface-variant hover:text-white hover:bg-surface-container-high/60'
                        }`}
                      >
                        Chương {ch.chapter_number}: {ch.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation & Controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.footer
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed bottom-0 w-full z-50 glass-panel border-t border-white/5 shadow-lg font-ui"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-[720px] mx-auto px-4 md:px-0 py-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3.5 text-xs text-on-surface-variant">
                <div>
                  Tiến độ: <span className="font-bold text-white">{Math.round(readingProgress)}%</span>
                </div>
                <div className="font-bold uppercase text-[10px] tracking-wider">
                  Chương {currentChapterNumber} / {totalChapters}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  disabled={!hasPrev}
                  onClick={goToPrevChapter}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/5 text-white transition-colors group text-sm font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                  Chương trước
                </button>
                
                <button
                  disabled={!hasNext}
                  onClick={goToNextChapter}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary shadow-[0_4px_15px_rgba(6,182,212,0.25)] transition-all group text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Chương tiếp
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}

