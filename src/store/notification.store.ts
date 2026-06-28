import { create } from 'zustand';
import type { NotificationDto } from '../models/api.model';
import { notificationService } from '../services/notification.service';

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  fetchAll: () => Promise<void>;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addNotification: (notification: NotificationDto) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchAll: async () => {
    try {
      const data = await notificationService.getNotifications();
      // Sắp xếp giảm dần theo id hoặc ngày tạo
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const unreadCount = sorted.filter(n => !n.isRead).length;
      set({ notifications: sorted, unreadCount });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  },
  markAsRead: (id: number) => {
    set((state) => {
      const notifications = state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    });
  },
  markAllAsRead: () => {
    set((state) => {
      const notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return { notifications, unreadCount: 0 };
    });
  },
  addNotification: (notification: NotificationDto) => {
    set((state) => {
      if (state.notifications.some(n => n.id === notification.id)) {
        return state;
      }
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    });
  }
}));
