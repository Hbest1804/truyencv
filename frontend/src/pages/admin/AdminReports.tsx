import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Loader2, Search, Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = () => {
    setLoading(true);
    adminService.getReports({ status: statusFilter })
      .then(res => setReports(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (reportId: string, status: string) => {
    try {
      await adminService.resolveReport(reportId, status, 'Xử lý bởi admin');
      fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xử lý báo cáo');
    }
  };

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    return (r.reporter?.username?.toLowerCase() || '').includes(term) || 
           (r.story?.title?.toLowerCase() || '').includes(term) ||
           (r.reason?.toLowerCase() || '').includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Quản lý Báo cáo</h2>
          <p className="text-white/50 text-sm mt-1">Xử lý các vi phạm và khiếu nại từ người dùng</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm báo cáo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          
          <div className="flex bg-surface-container-low rounded-xl p-1 border border-white/10 shrink-0">
            {[
              { id: 'pending', label: 'Chờ xử lý' },
              { id: 'resolved', label: 'Đã giải quyết' },
              { id: 'dismissed', label: 'Bỏ qua' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === tab.id 
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="bg-surface-container-low/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Người báo cáo</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Truyện bị báo cáo</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Lý do</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((report, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={report.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                          {(report.reporter?.username || 'U').charAt(0)}
                        </div>
                        <span className="font-semibold text-white group-hover:text-primary transition-colors">
                          {report.reporter?.username || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white/80 line-clamp-1 max-w-[200px]">
                        {report.story?.title || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-secondary">{report.reason}</span>
                          <p className="text-xs text-white/50 mt-1 line-clamp-2 max-w-[250px]">{report.detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        report.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        'bg-white/5 text-white/50 border-white/10'
                      }`}>
                        {report.status === 'pending' ? 'Chờ xử lý' : report.status === 'resolved' ? 'Đã giải quyết' : 'Bỏ qua'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResolve(report.id, 'resolved')}
                            className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-white/70 hover:text-green-400 transition-all border border-transparent hover:border-green-500/30"
                            title="Đã giải quyết"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'dismissed')}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-transparent hover:border-white/20"
                            title="Bỏ qua"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/30 italic">Đã xử lý</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-white/30">
                        <Flag size={48} className="mb-4 opacity-20" />
                        <p>Không tìm thấy báo cáo nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
