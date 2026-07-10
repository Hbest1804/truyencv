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
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};
