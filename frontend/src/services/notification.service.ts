import api from './api';

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_chapter' | 'comment_reply' | 'new_follower' | 'story_completed' | 'system';
  title: string;
  body: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getNotifications: async () => {
    return api.get('/notifications');
  },

  markAsRead: async (id: string) => {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return api.patch('/notifications/read-all');
  },

  deleteNotification: async (id: string) => {
    return api.delete(`/notifications/${id}`);
  }
};
