import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import type { NotificationDto } from '../models/api.model';

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7039/api";
const HUB_URL = `${API_URL.replace(/\/api$/, '')}/hubs/notifications`;

interface UseSignalROptions {
    accessToken: string | null;
    onNewNotification?: (notification: NotificationDto) => void;
}

/**
 * Hook kết nối SignalR NotificationHub.
 * Lắng nghe event "NewNotification", hiển thị toast và gọi callback.
 */
export function useSignalR({ accessToken, onNewNotification }: UseSignalROptions) {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => accessToken || '' })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connection.on('NewNotification', (notification: NotificationDto) => {
            toast(notification.title ?? 'Thông báo mới', { icon: '🔔', duration: 4000 });
            onNewNotification?.(notification);
        });

        let isMounted = true;

        connection.start().catch((err) => {
            if (isMounted && err.message !== 'The connection was stopped during negotiation.') {
                console.error('[SignalR] Kết nối thất bại:', err);
            }
        });

        connectionRef.current = connection;
        return () => {
            isMounted = false;
            // Nếu đang kết nối thì stop sẽ gây ra lỗi "stopped during negotiation"
            // Ta cứ kệ, đó là behaviour của React Strict Mode
            connection.stop().catch(() => {});
            connectionRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    return connectionRef;
}