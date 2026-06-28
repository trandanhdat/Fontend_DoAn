import { axiosInstance } from "../utils/axios.config";

import type { NotificationDto } from '../models/api.model';

export const notificationService = {
  getNotifications: async (): Promise<NotificationDto[]> => {
    const response = await axiosInstance.get<NotificationDto[]>('/notification');
    return response.data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/notification/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch(`/notification/read-all`);
  }
};
