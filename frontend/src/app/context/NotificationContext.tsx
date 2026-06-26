import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { realtimeService, Notification } from '../services/realtime/realtimeService';
import { eventBus } from '../services/realtime/eventBus';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!session) return;
    const all = await realtimeService.getNotifications(session.userId);
    setNotifications(all);
    setUnreadCount(all.filter((n) => !n.read).length);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!session) return;

    const unsub = eventBus.on<{ notification: Notification }>('notification_added', ({ notification }) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);

      // Show toast for new notifications
      const toastFn = notification.type === 'error' ? toast.error
        : notification.type === 'warning' ? toast.warning
        : notification.type === 'success' ? toast.success
        : toast.info;
      toastFn(notification.title, { description: notification.message });
    });

    return unsub;
  }, [session]);

  const markRead = useCallback(async (id: string) => {
    await realtimeService.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!session) return;
    await realtimeService.markAllRead(session.userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [session]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
