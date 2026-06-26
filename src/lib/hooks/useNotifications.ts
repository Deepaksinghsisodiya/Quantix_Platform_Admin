import { useCallback, useMemo } from 'react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/modules/notifications/services/notificationsApi';
import type { Notification } from '@/lib/types';
import { useFilterStore } from '@/lib/store/filterStore';

export function useNotifications() {
  const { merchantTypeFilter } = useFilterStore();

  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60_000,
  });

  const [markReadTrigger] = useMarkNotificationReadMutation();
  const [markAllReadTrigger] = useMarkAllNotificationsReadMutation();

  /** FRS-SAP-1605: Filter notifications by global merchant type filter. */
  const notifications: readonly Notification[] = useMemo(() => {
    const all = data?.data ?? [];
    if (merchantTypeFilter === 'All') return all;
    return all.filter((n) => !n.merchantType || n.merchantType === merchantTypeFilter);
  }, [data, merchantTypeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    (id: string) => {
      void markReadTrigger(id);
    },
    [markReadTrigger],
  );

  const markAllRead = useCallback(
    () => {
      void markAllReadTrigger();
    },
    [markAllReadTrigger],
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    isLoading,
  } as const;
}

