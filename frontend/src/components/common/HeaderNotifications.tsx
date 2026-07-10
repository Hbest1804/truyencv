import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService, Notification } from '@/services/notification.service';
import { Link } from 'react-router-dom';

export function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && notifications.length === 0) fetchNotifications();
        }}
        className="text-on-surface-variant hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.6)] border-2 border-background"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-3 w-[320px] sm:w-[380px] bg-surface-container-highest border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl flex flex-col max-h-[480px]"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface-container-high/50">
              <h3 className="font-bold text-white">Thông báo</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-secondary hover:text-white transition-colors"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {loading && notifications.length === 0 ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-secondary" /></div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-sm">
                  Bạn không có thông báo nào.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => {
                         if (!notification.is_read) handleMarkAsRead(notification.id);
                         setIsOpen(false);
                      }}
                      className={`relative p-3 rounded-xl transition-all flex gap-3 group ${notification.is_read ? 'hover:bg-white/5 opacity-70' : 'bg-primary/5 hover:bg-primary/10 border border-primary/20'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-semibold truncate pr-4 ${notification.is_read ? 'text-white' : 'text-primary-light'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                          {notification.body}
                        </p>
                        {notification.link_url && (
                          <Link 
                            to={notification.link_url} 
                            className="text-xs text-secondary hover:underline inline-block"
                            onClick={(e) => {
                               if (!notification.is_read) handleMarkAsRead(notification.id);
                               setIsOpen(false);
                            }}
                          >
                            Xem chi tiết
                          </Link>
                        )}
                      </div>
                      
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-surface-container-highest p-1 rounded-lg border border-white/10 shadow-lg">
                        {!notification.is_read && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1.5 text-secondary hover:bg-secondary/20 rounded-md transition-colors"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
