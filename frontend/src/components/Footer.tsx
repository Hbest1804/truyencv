import { ViewState } from '../types';
import { Github, Twitter, Globe, Send } from 'lucide-react';

export function Footer({ currentView }: { currentView: ViewState }) {
  if (currentView === 'reader') return null;

  return (
    <footer className="bg-surface-container-lowest/80 backdrop-blur-md w-full pt-16 pb-8 border-t border-white/5 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <span className="font-display font-extrabold text-white text-base">A</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Quiet Architect
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">
              Nền tảng đọc truyện trực tuyến cao cấp, mang lại trải nghiệm đọc đắm chìm và trực quan cho người yêu sách.
            </p>
            <div className="flex items-center gap-3.5 mt-2">
              {[
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' },
                { icon: Globe, href: '#' }
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={idx} 
                    href={social.href}
                    className="w-9 h-9 rounded-lg border border-white/5 hover:border-secondary/30 bg-surface-container-high/40 hover:bg-surface-container-highest text-on-surface-variant hover:text-secondary flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links Col 1 */}
          <div className="lg:col-span-2 flex flex-col gap-3.5 max-sm:mt-4">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-display mb-1.5">Giới thiệu</h4>
            {['Về chúng tôi', 'Điều khoản', 'Bảo mật', 'Liên hệ'].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-250 w-fit"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Quick Links Col 2 */}
          <div className="lg:col-span-2 flex flex-col gap-3.5">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-display mb-1.5">Tài nguyên</h4>
            {['Ứng dụng', 'API thư viện', 'Trợ giúp', 'Diễn đàn'].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-250 w-fit"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Newsletter Col */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-display mb-1.5 font-semibold">Đăng ký nhận tin</h4>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Nhận thông báo về các chương truyện mới nhất và sự kiện cộng đồng.
            </p>
            <div className="flex items-center gap-2 mt-1 relative">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="w-full bg-surface-container border border-white/5 hover:border-white/10 focus:border-secondary/40 rounded-lg py-2 px-4 pr-12 text-sm text-white outline-none transition-all"
              />
              <button className="absolute right-1 w-8 h-8 rounded-md bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary/90 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
          <span>© 2026 The Quiet Architect. Bảo lưu mọi quyền.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-secondary transition-colors">Chính sách Cookie</a>
            <a href="#" className="hover:text-secondary transition-colors">Sơ đồ trang</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

