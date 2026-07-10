import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers()
      .then(res => setUsers(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminService.changeUserRole(userId, role);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đổi quyền');
    }
  };

  const handleBanToggle = async (userId: string, is_banned: boolean) => {
    try {
      await adminService.toggleBanUser(userId, is_banned);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi khóa/mở tài khoản');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Quản lý người dùng</h2>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-white/5 text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors text-white">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-xs text-on-surface-variant">{user.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-surface border border-white/10 rounded px-2 py-1 outline-none text-sm"
                    >
                      <option value="reader">Reader</option>
                      <option value="author">Author</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.is_banned ? 'bg-error/20 text-error' : 'bg-green-500/20 text-green-400'}`}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleBanToggle(user.id, !user.is_banned)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        user.is_banned 
                          ? 'bg-surface hover:bg-surface-container-high text-on-surface' 
                          : 'bg-error/20 hover:bg-error/30 text-error'
                      }`}
                    >
                      {user.is_banned ? 'Mở khóa' : 'Khóa'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">
                    Không có người dùng nào.
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
