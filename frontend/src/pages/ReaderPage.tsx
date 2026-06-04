import { useState, useEffect } from 'react';
import { ArrowLeft, List, Settings as SettingsIcon, ChevronLeft, ChevronRight, X, Minus, Plus } from 'lucide-react';
import { ViewState } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

interface ReaderPageProps {
  onNavigate: (view: ViewState) => void;
}

type ReaderTheme = 'dark' | 'light' | 'sepia' | 'nordic' | 'forest';
type ReaderFont = 'serif' | 'sans' | 'mono';
type ReaderSpacing = 'tight' | 'normal' | 'relaxed';

export function ReaderPage({ onNavigate }: ReaderPageProps) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [readingProgress, setReadingProgress] = useState(35);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [font, setFont] = useState<ReaderFont>('serif');
  const [fontSize, setFontSize] = useState(19);
  const [spacing, setSpacing] = useState<ReaderSpacing>('normal');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50 && currentScrollY > lastScrollY && controlsVisible && !settingsOpen) {
        setControlsVisible(false);
      } else if (currentScrollY < lastScrollY && !controlsVisible) {
        setControlsVisible(true);
      }
      lastScrollY = currentScrollY;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = (currentScrollY / scrollHeight) * 100;
        setReadingProgress(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controlsVisible, settingsOpen]);

  const themeClasses: Record<ReaderTheme, string> = {
    dark: 'bg-[#030712] text-[#f8fafc]',
    light: 'bg-[#f8fafc] text-[#0f172a]',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    nordic: 'bg-[#0f172a] text-[#e2e8f0]',
    forest: 'bg-[#0d2219] text-[#e1ece8]'
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses[theme]} ${fontClasses[font]}`}
      onClick={() => {
        if (settingsOpen) {
          setSettingsOpen(false);
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
                onClick={() => onNavigate('detail')}
                className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 text-white" />
                <span className="hidden sm:inline text-white font-bold text-sm">Trở lại</span>
              </button>
              
              <div className="flex flex-col items-center text-center max-w-[200px] md:max-w-md">
                <h1 className="font-bold text-white truncate text-sm md:text-base font-display">
                  Chương 4: Tiếng vọng từ hư vô
                </h1>
                <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase mt-0.5">
                  Đại Đạo Tranh Phong
                </span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button className="text-on-surface-variant hover:text-secondary transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer">
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
          <h2 className="text-3xl md:text-4.5xl font-black mb-10 font-display text-white border-b border-white/5 pb-6">
            4. Tiếng vọng từ hư vô
          </h2>
          
          <div className="space-y-8 font-medium">
            <p>
              Thư viện rộng lớn vô cùng, một kỳ quan kiến trúc làm bằng gỗ gụ thẫm màu và hắc thạch bóng loáng. Những hạt bụi nhảy múa lười biếng trong các luồng ánh sáng nhạt nhòa lọt qua những ô cửa sổ cao hình vòm. Nói nơi đây yên tĩnh thì quả là chưa đủ; sự im lặng ở đây có một sức nặng vật chất, đè nén lên màng nhĩ như độ sâu của đại dương mênh mông.
            </p>
            <p>
              Elias lướt nhẹ một ngón tay dọc theo gáy của một cuốn sách bọc da cổ kính, cảm nhận những chữ dập nổi đã bị bào mòn mịn màng qua hàng thế kỷ tôn kính. Đây không phải là nơi để duyệt qua một cách tình cờ. Mỗi tập sách được lưu giữ ở đây không chỉ chứa đựng các bản vẽ thiết kế cho các tòa nhà, mà còn cho cả chính thực tại.
            </p>
            <p>
              Anh dừng lại, bàn tay lơ lửng trên một cuốn sách đặc biệt không có gì nổi bật được bọc trong vải bạt màu xám phiến thạch. Tựa đề, được đóng dấu nhạt bằng bạc, ghi: <em className="text-secondary font-bold">Tính Toàn Vẹn Cấu Trúc Của Hư Vô</em>.
            </p>
            
            <blockquote className="border-l-4 border-secondary/50 pl-6 my-10 italic opacity-85 p-5 rounded-r-2xl bg-black/20 font-ui text-base leading-relaxed">
              "Xây dựng trong hư không đòi hỏi nhiều hơn là vật chất thô sơ. Nó đòi hỏi một niềm tin tuyệt đối rằng sự trống rỗng thèm khát hình thể. Người ta phải lắng nghe khoảng không tiêu cực trước khi cố gắng lấp đầy nó."
            </blockquote>
            
            <p>
              Khi anh mở cuốn sách ra, những trang giấy không sột soạt; chúng như thể đang thở dài nhẹ nhõm. Các sơ đồ bên trong liên tục chuyển động, những điều không thể về mặt hình học xoắn vặn mắt và làm căng thẳng tâm trí người đọc.
            </p>
            <p>
              Đột nhiên, một tiếng chuông mềm mại vang vọng khắp các giá sách dài vô tận. Đó là âm thanh sắc bén, rõ ràng của thủy tinh bị rạn nứt dưới một áp lực khổng lồ.
            </p>
            
            <div className="flex justify-center my-14 opacity-40">
              <span className="w-2 h-2 rounded-full bg-current mx-2.5"></span>
              <span className="w-2 h-2 rounded-full bg-current mx-2.5"></span>
              <span className="w-2 h-2 rounded-full bg-current mx-2.5"></span>
            </div>
            
            <p>
              Anh cẩn thận đóng cuốn sách lại, đảm bảo chiếc khóa tinh xảo đã được bảo mật. Sự im lặng ùa trở lại, nhưng giờ đây nó đã thay đổi. Sức nặng của nó đã biến mất, được thay thế bằng một sự chờ đợi căng thẳng tột độ.
            </p>
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
                    const circleColors = { dark: 'bg-[#030712]', light: 'bg-[#f8fafc]', sepia: 'bg-[#f4ecd8]', nordic: 'bg-[#0f172a]', forest: 'bg-[#0d2219]' };
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
                  Chương 4 / 24
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/5 text-white transition-colors group text-sm font-semibold cursor-pointer">
                  <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                  Chương trước
                </button>
                
                <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary shadow-[0_4px_15px_rgba(6,182,212,0.25)] transition-all group text-sm font-bold cursor-pointer">
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
