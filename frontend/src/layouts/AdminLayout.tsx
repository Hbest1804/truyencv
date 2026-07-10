import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Tags, Flag, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin or not logged in
    if (user === null) {
      navigate('/login');
    } else if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { name: 'Tổng quan', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Truyện', path: '/admin/stories', icon: <BookOpen size={20} /> },
    { name: 'Thể loại', path: '/admin/genres', icon: <Tags size={20} /> },
    { name: 'Báo cáo', path: '/admin/reports', icon: <Flag size={20} /> },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('/admin/dashboard')) return 'Tổng quan';
    if (currentPath.includes('/admin/users')) return 'Quản lý người dùng';
    if (currentPath.includes('/admin/stories')) return 'Quản lý truyện';
    if (currentPath.includes('/admin/genres')) return 'Quản lý thể loại';
    if (currentPath.includes('/admin/reports')) return 'Kiểm duyệt báo cáo';
    return 'Admin Panel';
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden selection:bg-primary/30 font-sans relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-[280px] z-10 flex flex-col backdrop-blur-2xl bg-white/[0.02] border-r border-white/5 relative">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-xl text-white">T</span>
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white tracking-wide">TRUYENCV</h1>
            <p className="text-xs text-primary font-medium tracking-wider uppercase">Workspace</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                      isActive 
                        ? 'text-white' 
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary"></div>
                    )}
                    
                    {/* Hover Background */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                    )}

                    <div className={`relative z-10 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                      {item.icon}
                    </div>
                    <span className="relative z-10 font-medium">{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Profile Area */}
        <div className="p-4 m-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden ring-2 ring-primary/20">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                  {user.display_name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium text-error bg-error/10 hover:bg-error/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex justify-between items-center px-8 border-b border-white/5 backdrop-blur-md bg-background/50">
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            {getPageTitle()}
          </h2>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all group"
          >
            <Home size={18} className="text-white/50 group-hover:text-primary transition-colors" />
            <span className="text-white/80 group-hover:text-white transition-colors">Về trang chủ</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
