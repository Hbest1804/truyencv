import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Users, BookOpen, Layers, Flag, ArrowUpRight, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStatsOverview(),
      adminService.getUserGrowth()
    ]).then(([statsRes, growthRes]) => {
      setStats(statsRes.data);
      setChartData(growthRes.data || []);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Tổng người dùng', 
      value: stats?.users?.total || 0, 
      trend: '+12%',
      icon: <Users size={24} className="text-blue-400" />, 
      color: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/20'
    },
    { 
      title: 'Truyện đã đăng', 
      value: stats?.stories?.total || 0, 
      trend: '+5%',
      icon: <BookOpen size={24} className="text-purple-400" />, 
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/20'
    },
    { 
      title: 'Tổng số chương', 
      value: stats?.chapters?.total || 0, 
      trend: '+8%',
      icon: <Layers size={24} className="text-green-400" />, 
      color: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-500/20'
    },
    { 
      title: 'Báo cáo chờ duyệt', 
      value: stats?.reports?.pending || 0, 
      trend: '-2%',
      icon: <Flag size={24} className="text-red-400" />, 
      color: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-500/20'
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className={`relative p-6 rounded-3xl border bg-gradient-to-br ${card.color} ${card.borderColor} overflow-hidden group`}
          >
            {/* Background Glow Effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60 font-medium mb-2">{card.title}</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-display font-bold text-white tracking-tight">{card.value}</h3>
                  <span className={`text-xs font-medium flex items-center ${card.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    <ArrowUpRight size={14} className={card.trend.startsWith('-') ? 'rotate-90' : ''} />
                    {card.trend}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 shadow-inner">
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 p-6 rounded-3xl bg-surface-container-low border border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Tăng trưởng hệ thống
              </h3>
              <p className="text-sm text-white/50 mt-1">Lượt truy cập & Đăng ký mới trong tuần qua</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="stories" name="Truyện mới" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="users" name="Người dùng mới" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* System Health / Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="p-6 rounded-3xl bg-surface-container-low border border-white/5 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-6">Trạng thái hệ thống</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Tài nguyên CPU</span>
                  <span className="text-green-400 font-medium">12%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[12%] rounded-full shadow-[0_0_10px_#22c55e]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Bộ nhớ (RAM)</span>
                  <span className="text-yellow-400 font-medium">68%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[68%] rounded-full shadow-[0_0_10px_#eab308]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Lưu trữ (Storage)</span>
                  <span className="text-primary font-medium">45%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%] rounded-full shadow-[0_0_10px_#a855f7]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-white">Hệ thống ổn định</p>
              <p className="text-xs text-white/50 mt-1">Tất cả các dịch vụ đang hoạt động bình thường.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
