import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, List, Settings as SettingsIcon, ChevronLeft, ChevronRight, X, Minus, Plus, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReader } from '@/hooks/useReader';
import { useStory } from '@/hooks/useStory';

type ReaderTheme = 'sepia' | 'warm' | 'white' | 'light' | 'rose' | 'lavender' | 'mint' | 'dark' | 'nordic' | 'forest' | 'ocean';
type ReaderFont = 'serif' | 'sans' | 'mono';
type ReaderSpacing = 'tight' | 'normal' | 'relaxed';

export function ReaderPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const navigate = useNavigate();
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState<ReaderTheme>('sepia');
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

  // Ref cờ hiệu: tránh saveProgress ghi đè khi đang restore scroll
  const isRestoringScroll = useRef(true);

  // 1. Restore scroll progress when activeChapter is loaded
  useEffect(() => {
    if (activeChapter) {
      isRestoringScroll.current = true;
      const savedProgress = activeChapter.reading_progress || 0;
      if (savedProgress > 0 && savedProgress < 99) {
        const timer = setTimeout(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (scrollHeight > 0) {
            const targetY = (savedProgress / 100) * scrollHeight;
            // Dùng auto thay vì smooth — tránh trigger nhiều scroll events không cần thiết
            window.scrollTo({ top: targetY, behavior: 'auto' });
            setTimeout(() => { isRestoringScroll.current = false; }, 150);
          } else {
            isRestoringScroll.current = false;
          }
        }, 600);
        return () => clearTimeout(timer);
      } else {
        window.scrollTo(0, 0);
        setReadingProgress(0);
        isRestoringScroll.current = false;
      }
    }
  }, [activeChapter?.id]);

  // 2. Handle scroll: track progress only (bars are always visible)
  useEffect(() => {
    const handleScroll = () => {
      // Bỏ qua nếu đang restore vị trí cuộn — tránh ghi đè progress chương mới
      if (isRestoringScroll.current) return;

      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = (currentScrollY / scrollHeight) * 100;
        const boundedScrolled = Math.max(0, Math.min(scrolled, 100));
        setReadingProgress(boundedScrolled);
        saveProgress(boundedScrolled);
        if (boundedScrolled >= 95) markAsRead();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [saveProgress, markAsRead]);

  const themeClasses: Record<ReaderTheme, string> = {
    // ── Sáng ──
    sepia:    'bg-[#fdf6e3] text-[#4a3728]',
    warm:     'bg-[#f5f0e8] text-[#2c2017]',
    white:    'bg-[#ffffff] text-[#111111]',
    light:    'bg-[#f9f9f9] text-[#18181b]',
    // ── Pastel ──
    rose:     'bg-[#fff0f3] text-[#5c1a2e]',
    lavender: 'bg-[#f3f0ff] text-[#3b2f6e]',
    mint:     'bg-[#edfaf4] text-[#1a4a35]',
    // ── Tối ──
    dark:     'bg-[#12141a] text-[#e8eaf0]',
    nordic:   'bg-[#1e2536] text-[#dde3f0]',
    forest:   'bg-[#142920] text-[#cce8d8]',
    ocean:    'bg-[#0b1e2d] text-[#c8e0f0]',
  };

  // Header/footer dùng glass-panel tối giống Home page — không phụ thuộc vào theme đọc
  const barBg = 'bg-[#0b0f19]/80 backdrop-blur-2xl border-white/5';
  const barText = 'text-white';
  const barMuted = 'text-white/50';
  const isDarkTheme = true; // bars luôn tối — dùng cho logic nội bộ drawer

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
      <div className="min-h-screen bg-[#fdf6e3] text-[#4a3728] flex flex-col items-center justify-center font-ui">
        <Loader2 className="w-10 h-10 text-amber-700 animate-spin mb-4" />
        <p className="text-[#4a3728]/60 text-sm font-semibold">Đang tải nội dung chương...</p>
      </div>
    );
  }

  // Error state
  if (error || !activeChapter) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] text-[#4a3728] flex flex-col items-center justify-center p-6 text-center font-ui">
        <AlertCircle className="w-12 h-12 text-amber-700 mb-4 opacity-70" />
        <h2 className="text-xl font-bold text-[#2c2017] mb-2">Lỗi tải chương</h2>
        <p className="text-[#4a3728]/60 text-sm mb-6 max-w-sm">{error || 'Không tìm thấy nội dung chương'}</p>
        <button
          onClick={() => navigate(`/stories/${storyId}`)}
          className="px-6 py-2.5 bg-amber-800/10 border border-amber-800/30 text-amber-800 rounded-xl text-sm font-bold hover:bg-amber-800/20 transition-all cursor-pointer"
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
        if (settingsOpen) setSettingsOpen(false);
        else if (chaptersDrawerOpen) setChaptersDrawerOpen(false);
      }}
    >
      {/* Top Reader Control Bar — always visible, dark glass like Home */}
      <header
        className="fixed top-0 w-full z-50 bg-[#0b0f19]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center h-14 px-4 md:px-8 max-w-[1280px] mx-auto font-ui">
          <button
            onClick={() => navigate(`/stories/${storyId}`)}
            className={`flex items-center gap-2 transition-colors cursor-pointer group ${barText} hover:text-secondary`}
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline font-bold text-sm">Trở lại</span>
          </button>
          
          <div className="flex flex-col items-center text-center max-w-[200px] md:max-w-md">
            <h1 className={`font-bold truncate text-xs md:text-sm font-display ${barText}`}>
              Chương {activeChapter.chapter_number}: {activeChapter.title}
            </h1>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${barMuted}`}>
              {story?.title || 'Đang tải truyện...'}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setChaptersDrawerOpen(!chaptersDrawerOpen)}
              className={`transition-colors p-2 rounded-full cursor-pointer ${chaptersDrawerOpen ? 'text-secondary' : `${barText} hover:text-secondary`}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`transition-colors p-2 rounded-full cursor-pointer ${settingsOpen ? 'text-secondary' : `${barText} hover:text-secondary`}`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reading Progress Bar — dưới header */}
        <div className="w-full h-[3px] bg-white/8">
          <div
            className="h-full bg-secondary transition-all duration-150 ease-out shadow-[0_0_6px_rgba(6,182,212,0.6)]"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="w-full max-w-[700px] mx-auto px-6 md:px-4 pt-28 pb-52 relative z-10 select-text">
        <article
          className="max-w-none text-current"
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeights[spacing] }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 font-display text-current opacity-90 border-b border-current/10 pb-5">
            {activeChapter.title}
          </h2>
          
          <div className="font-medium">
            {(activeChapter.content || '')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/\\n/g, '\n')
              .replace(/\r/g, '\n')
              .split('\n')
              .map((para, idx) => {
                const cleanPara = para.trim();
                if (!cleanPara) return null;
                return (
                  <p
                    key={idx}
                    className="mb-[1.6em] indent-[2em] text-justify"
                  >
                    {cleanPara}
                  </p>
                );
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
            className="fixed bottom-0 left-0 w-full z-[80] bg-[#0b0f19]/95 backdrop-blur-2xl border-t border-white/5 p-6 md:p-8 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] font-ui"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-[640px] mx-auto space-y-6">
              <div className={`flex justify-between items-center border-b pb-4 ${isDarkTheme ? 'border-white/10' : 'border-black/10'}`}>
                <span className={`font-display font-extrabold text-base flex items-center gap-2 ${barText}`}>
                  <SettingsIcon className="w-5 h-5 text-secondary" /> Thiết lập trình đọc
                </span>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className={`p-1.5 rounded-full cursor-pointer transition-colors ${barMuted} hover:${barText}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Picker */}
              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${barMuted}`}>Màu nền trang</h4>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    // Sáng
                    { id: 'sepia',    label: 'Cổ điển',    bg: '#fdf6e3', border: '#c8b87a' },
                    { id: 'warm',     label: 'Kem',         bg: '#f5f0e8', border: '#c4b8a8' },
                    { id: 'white',    label: 'Trắng',       bg: '#ffffff', border: '#cccccc' },
                    { id: 'light',    label: 'Xám nhạt',    bg: '#f9f9f9', border: '#d4d4d4' },
                    // Pastel
                    { id: 'rose',     label: 'Hồng',        bg: '#fff0f3', border: '#f4a0b5' },
                    { id: 'lavender', label: 'Oải hương',   bg: '#f3f0ff', border: '#bbaef5' },
                    { id: 'mint',     label: 'Bạc hà',      bg: '#edfaf4', border: '#7ed3a8' },
                    // Tối
                    { id: 'dark',     label: 'Đêm',         bg: '#12141a', border: '#3a3f52' },
                    { id: 'nordic',   label: 'Bắc Âu',      bg: '#1e2536', border: '#4a5580' },
                    { id: 'forest',   label: 'Rừng',        bg: '#142920', border: '#2a5a3a' },
                    { id: 'ocean',    label: 'Đại dương',   bg: '#0b1e2d', border: '#1a4a6e' },
                  ] as { id: ReaderTheme; label: string; bg: string; border: string }[]).map(t => {
                    const active = theme === t.id;
                    const isLight = ['sepia','warm','white','light','rose','lavender','mint'].includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        title={t.label}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? 'border-secondary shadow-[0_0_0_2px_rgba(6,182,212,0.35)] scale-105'
                            : isDarkTheme ? 'border-white/10 hover:border-white/30 hover:scale-105' : 'border-black/10 hover:border-black/25 hover:scale-105'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full mb-1.5 shadow-sm"
                          style={{ background: t.bg, border: `2px solid ${t.border}` }}
                        />
                        <span className={`text-[9px] font-bold leading-tight text-center ${isLight ? 'text-black/60' : 'text-white/70'} ${active ? '!text-secondary' : ''}`}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family Picker */}
              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${barMuted}`}>Phông chữ</h4>
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
                        font === f.id
                          ? 'border-secondary text-secondary'
                          : `${isDarkTheme ? 'border-white/10' : 'border-black/10'} ${barMuted} hover:${barText}`
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
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${barMuted}`}>Cỡ chữ ({fontSize}px)</h4>
                  <div className={`flex items-center gap-3 p-1.5 rounded-xl border ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/8 hover:bg-black/15 text-black'}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className={`flex-grow text-center text-sm font-bold ${barText}`}>{fontSize}px</div>
                    <button
                      onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/8 hover:bg-black/15 text-black'}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${barMuted}`}>Giãn dòng</h4>
                  <div className={`flex p-1.5 rounded-xl border ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    {(['tight', 'normal', 'relaxed'] as ReaderSpacing[]).map(s => {
                      const active = spacing === s;
                      const spacingLabels = { tight: 'Hẹp', normal: 'Vừa', relaxed: 'Rộng' };
                      return (
                        <button
                          key={s}
                          onClick={() => setSpacing(s)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            active ? 'bg-secondary/20 text-secondary border border-secondary/30' : `${barMuted} hover:${barText}`
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

      {/* Bottom Navigation & Controls — always visible, dark glass like Home */}
      <footer
        className="fixed bottom-0 w-full z-50 bg-[#0b0f19]/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] font-ui"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-[720px] mx-auto px-4 md:px-0 py-3">
          <div className={`flex justify-between items-center mb-2 text-xs ${barMuted}`}>
            <div>
              Tiến độ: <span className={`font-bold ${barText}`}>{Math.round(readingProgress)}%</span>
            </div>
            <div className={`font-bold uppercase text-[10px] tracking-wider ${barText}`}>
              Chương {currentChapterNumber} / {totalChapters}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              disabled={!hasPrev}
              onClick={goToPrevChapter}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all group text-sm font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${barText} ${isDarkTheme ? 'hover:bg-white/8' : 'hover:bg-black/6'}`}
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              Chương trước
            </button>
            
            <button
              disabled={!hasNext}
              onClick={goToNextChapter}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white shadow-[0_4px_15px_rgba(6,182,212,0.3)] transition-all group text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Chương tiếp
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

