import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Loader2, Search, Shield, UserX, UserCheck, Mail, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi đổi quyền');
    }
  };

  const handleBanToggle = async (userId: string, is_banned: boolean) => {
    try {
      await adminService.toggleBanUser(userId, is_banned);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi khóa/mở tài khoản');
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (u.username?.toLowerCase() || '').includes(term) || 
           (u.display_name?.toLowerCase() || '').includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Người Dùng</h2>
          <p className="text-white/50 text-sm mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm người dùng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-low border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
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
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Người dùng</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Vai trò (Role)</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-4 font-medium text-white/70 whitespace-nowrap text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="font-bold text-primary">{user.display_name?.charAt(0) || user.username?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-primary transition-colors">{user.display_name || user.username}</div>
                          <div className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                            <Mail size={10} />
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`appearance-none bg-surface-container-high border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium outline-none transition-all cursor-pointer hover:border-primary/50 focus:border-primary ${
                            user.role === 'admin' ? 'text-purple-400' :
                            user.role === 'author' ? 'text-blue-400' :
                            user.role === 'moderator' ? 'text-orange-400' :
                            'text-white/70'
                          }`}
                        >
                          <option value="reader">Reader</option>
                          <option value="author">Author</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Shield size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          {!user.is_banned && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${user.is_banned ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </span>
                        <span className={`text-xs font-medium ${user.is_banned ? 'text-red-400' : 'text-green-400'}`}>
                          {user.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleBanToggle(user.id, !user.is_banned)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          user.is_banned 
                            ? 'bg-white/5 hover:bg-white/10 text-white hover:text-green-400' 
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        }`}
                      >
                        {user.is_banned ? <UserCheck size={14} /> : <UserX size={14} />}
                        {user.is_banned ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-white/30">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p>Không tìm thấy người dùng nào.</p>
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
