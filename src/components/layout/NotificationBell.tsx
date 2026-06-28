import React, { useState } from 'react';
import { Bell, Inbox } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { useNotificationStore } from '../../store/notification.store';
import { notificationService } from '../../services/notification.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useSignalR } from '../../hooks/useSignalR';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchAll, addNotification } = useNotificationStore();
  const { accessToken } = useAuthStore();

  // Khởi tạo SignalR để lắng nghe thông báo realtime
  useSignalR({
    accessToken: accessToken,
    onNewNotification: (notification) => {
      addNotification(notification);
    }
  });

  // Gọi API lấy danh sách ban đầu
  useEffect(() => {
    if (accessToken) {
      fetchAll();
    }
  }, [accessToken, fetchAll]);

  const handleNotificationClick = async (id: number, isRead: boolean) => {
    if (!isRead) {
      try {
        await notificationService.markAsRead(id);
        markAsRead(id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      try {
        await notificationService.markAllAsRead();
        markAllAsRead();
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  };

  const displayNotifications = notifications.slice(0, 10);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold text-slate-900">Thông báo</h4>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#15718E] hover:text-[#105d76] hover:underline font-medium transition-colors cursor-pointer"
            >
              Đánh dấu tất cả đã đọc ({unreadCount})
            </button>
          )}
        </div>
        
        <ScrollArea className="h-[350px]">
          {displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
              <Inbox className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Bạn không có thông báo nào</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                  className={`flex flex-col gap-1 cursor-pointer p-4 transition-colors hover:bg-slate-50 border-b last:border-0 ${
                    !notification.isRead ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notification.title}
                    </h5>
                    {!notification.isRead && (
                      <span className="h-2 w-2 mt-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm line-clamp-2 ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
