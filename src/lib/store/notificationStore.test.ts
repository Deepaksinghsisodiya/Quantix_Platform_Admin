import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from './notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  it('starts with empty notifications', () => {
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('starts with zero unread count', () => {
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  describe('addNotification', () => {
    it('adds a notification and increments unread count', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: 'Hello',
      });

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.unreadCount).toBe(1);
      expect(state.notifications[0]!.read).toBe(false);
      expect(state.notifications[0]!.title).toBe('Test');
      expect(state.notifications[0]!.type).toBe('info');
    });

    it('assigns an id and createdAt', () => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Done',
        message: 'Task complete',
      });

      const notification = useNotificationStore.getState().notifications[0];
      expect(notification!.id).toBeDefined();
      expect(notification!.createdAt).toBeDefined();
    });

    it('prepends new notifications (newest first)', () => {
      const store = useNotificationStore.getState();
      store.addNotification({ type: 'info', title: 'First', message: '' });
      useNotificationStore.getState().addNotification({ type: 'info', title: 'Second', message: '' });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications[0]!.title).toBe('Second');
      expect(notifications[1]!.title).toBe('First');
    });
  });

  describe('markAsRead', () => {
    it('marks a specific notification as read', () => {
      useNotificationStore.getState().addNotification({
        type: 'warning',
        title: 'Alert',
        message: 'Attention',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().markAsRead(id);

      const state = useNotificationStore.getState();
      expect(state.notifications[0]!.read).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('does not affect other notifications', () => {
      const store = useNotificationStore.getState();
      store.addNotification({ type: 'info', title: 'A', message: '' });
      useNotificationStore.getState().addNotification({ type: 'info', title: 'B', message: '' });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().markAsRead(id);

      const state = useNotificationStore.getState();
      expect(state.unreadCount).toBe(1);
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', () => {
      const store = useNotificationStore.getState();
      store.addNotification({ type: 'info', title: 'A', message: '' });
      useNotificationStore.getState().addNotification({ type: 'info', title: 'B', message: '' });
      useNotificationStore.getState().addNotification({ type: 'info', title: 'C', message: '' });

      useNotificationStore.getState().markAllRead();

      const state = useNotificationStore.getState();
      expect(state.unreadCount).toBe(0);
      state.notifications.forEach((n) => {
        expect(n.read).toBe(true);
      });
    });
  });

  describe('removeNotification', () => {
    it('removes a notification by id', () => {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Something failed',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().removeNotification(id);

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });

    it('decrements unread count when removing unread notification', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: '',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      expect(useNotificationStore.getState().unreadCount).toBe(1);

      useNotificationStore.getState().removeNotification(id);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('does not decrement unread count when removing read notification', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: '',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().markAsRead(id);
      expect(useNotificationStore.getState().unreadCount).toBe(0);

      useNotificationStore.getState().removeNotification(id);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });
});
