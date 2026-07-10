import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Users, BookOpen, Layers, Flag } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStatsOverview()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Đang tải...</div>;

  const statCards = [
    { title: 'Người dùng', value: stats?.users?.total || 0, icon: <Users size={24} className="text-blue-400" />, bg: 'bg-blue-500/10' },
    { title: 'Truyện', value: stats?.stories?.total || 0, icon: <BookOpen size={24} className="text-purple-400" />, bg: 'bg-purple-500/10' },
    { title: 'Chương', value: stats?.chapters?.total || 0, icon: <Layers size={24} className="text-green-400" />, bg: 'bg-green-500/10' },
    { title: 'Báo cáo', value: stats?.reports?.pending || 0, icon: <Flag size={24} className="text-red-400" />, bg: 'bg-red-500/10' },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Tổng quan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border border-white/5 bg-surface-container-low flex items-center justify-between`}
          >
            <div>
              <p className="text-sm text-on-surface-variant font-medium mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-white">{card.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${card.bg}`}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
