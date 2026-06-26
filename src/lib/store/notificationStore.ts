import { create } from 'zustand';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * FRS-SAP-1304: Notification categories for the notification center.
 * Includes V2 additions: TokenExpiry, CommissionSettlement.
 */
type NotificationCategory =
  | 'Ticket'
  | 'Invoice'
  | 'TokenExpiry'
  | 'TokenBalance'
  | 'SLABreach'
  | 'Compliance'
  | 'CommissionSettlement'
  | 'System'
  | 'General';

export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
  readonly read: boolean;
  readonly createdAt: string;
  readonly link?: string;
}

interface NotificationState {
  notifications: readonly Notification[];
  unreadCount: number;

  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt' | 'category'> & { category?: NotificationCategory }) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
}

let nextId = 1;

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const entry: Notification = {
      ...notification,
      category: notification.category ?? 'General',
      id: String(nextId++),
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...get().notifications];
    set({ notifications: updated, unreadCount: get().unreadCount + 1 });
  },

  markAsRead: (id: string) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  removeNotification: (id: string) => {
    const removed = get().notifications.find((n) => n.id === id);
    const updated = get().notifications.filter((n) => n.id !== id);
    const decrement = removed && !removed.read ? 1 : 0;
    set({
      notifications: updated,
      unreadCount: Math.max(0, get().unreadCount - decrement),
    });
  },
}));
