import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

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
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xử lý báo cáo');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Báo cáo</h2>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface border border-white/10 rounded px-3 py-1.5 outline-none text-sm text-white"
        >
          <option value="pending">Chờ xử lý</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="dismissed">Bỏ qua</option>
        </select>
      </div>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-white/5 text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">Người báo cáo</th>
                <th className="px-4 py-3 font-medium">Truyện bị báo cáo</th>
                <th className="px-4 py-3 font-medium">Lý do</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-white/5 transition-colors text-white">
                  <td className="px-4 py-3 font-medium">
                    {report.reporter?.username || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    {report.story?.title || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-secondary">{report.reason}</span>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{report.detail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      report.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 
                      report.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-surface text-on-surface'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {report.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleResolve(report.id, 'resolved')}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                        >
                          Xử lý
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, 'dismissed')}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-surface hover:bg-surface-container-high transition-colors"
                        >
                          Bỏ qua
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                    Không có báo cáo nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
