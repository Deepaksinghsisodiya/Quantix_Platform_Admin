import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellRing, BellOff, CheckCheck, ChevronRight, Inbox, Clock3,
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import type { Notification, NotificationType } from '@/lib/types/notification';
import { cn } from '@/lib/utils/cn';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard, ATMSkeleton, ATMEmptyState, ATMBadge } from '@/shared/ui';
import { TYPE_META, FILTER_ICON, timeAgo } from '../components/notificationMeta';

type FilterKey = 'all' | 'unread' | NotificationType;

/** Local calendar-date key (YYYY-MM-DD) used to group notifications. */
function dayKey(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return local;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: notifications.length, unread: unreadCount };
    for (const n of notifications) c[n.type] = (c[n.type] ?? 0) + 1;
    return c;
  }, [notifications, unreadCount]);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const { todayKey, yesterdayKey } = useMemo(() => {
    const now = new Date();
    const today = dayKey(now.toISOString());
    const yesterday = dayKey(new Date(now.getTime() - 86_400_000).toISOString());
    return { todayKey: today, yesterdayKey: yesterday };
  }, []);

  const todayCount = useMemo(
    () => notifications.filter((n) => dayKey(n.createdAt) === todayKey).length,
    [notifications, todayKey],
  );

  const groups = useMemo(() => {
    const buckets: Record<'Today' | 'Yesterday' | 'Earlier', Notification[]> = {
      Today: [], Yesterday: [], Earlier: [],
    };
    for (const n of filtered) {
      const k = dayKey(n.createdAt);
      if (k === todayKey) buckets.Today.push(n);
      else if (k === yesterdayKey) buckets.Yesterday.push(n);
      else buckets.Earlier.push(n);
    }
    return (['Today', 'Yesterday', 'Earlier'] as const)
      .map((label) => ({ label, items: buckets[label] }))
      .filter((g) => g.items.length > 0);
  }, [filtered, todayKey, yesterdayKey]);

  const openNotification = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  const filterPill = (key: FilterKey, label: string, count: number, Icon: React.ComponentType<any> | undefined) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all',
        filter === key
          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white border-transparent shadow-sm shadow-primary-500/20'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-zinc-950 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
      )}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} className={filter === key ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />}
      {label}
      {count > 0 && (
        <span className={cn(
          'ml-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black',
          filter === key ? 'bg-white/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        )}>
          {count}
        </span>
      )}
    </button>
  );

  const renderRow = (n: Notification) => {
    const meta = TYPE_META[n.type] ?? TYPE_META.Info;
    const Icon = meta.icon;
    return (
      <div
        key={n.id}
        onClick={() => openNotification(n)}
        className={cn(
          'relative flex items-start gap-3.5 px-4 py-4 cursor-pointer transition-all group',
          n.read
            ? 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
            : 'bg-primary-50/40 hover:bg-primary-50/70 dark:bg-primary-950/10 dark:hover:bg-primary-950/20',
        )}
      >
        {!n.read && (
          <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-gradient-to-b from-primary-500 to-accent-500" />
        )}

        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm',
          meta.badge,
        )}>
          <Icon size={17} className={meta.accent} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={cn(
              'text-sm truncate',
              n.read ? 'font-semibold text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white',
            )} title={n.title}>
              {n.title}
            </p>
            <span
              className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold shrink-0 mt-0.5"
              title={new Date(n.createdAt).toLocaleString()}
            >
              {timeAgo(n.createdAt)}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {n.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <ATMBadge size="sm" className={cn('border', meta.badge)}>{meta.label}</ATMBadge>
            {n.merchantType && (
              <ATMBadge size="sm" color="muted">{n.merchantType}</ATMBadge>
            )}
          </div>
        </div>

        {n.link && (
          <ChevronRight
            size={16}
            className="text-slate-300 dark:text-slate-600 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </div>
    );
  };

  const emptyState =
    notifications.length === 0
      ? {
          icon: BellOff,
          title: 'You are all caught up',
          description: 'New platform alerts, ticket routing and billing events will appear here.',
        }
      : {
          icon: Inbox,
          title: 'Nothing matches this filter',
          description: 'Try a different category, or clear the filter to see every notification.',
        };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter">
      {/* Header */}
      <ATMPageHeader
        title="Notifications"
        subtitle="Platform alerts, ticket routing, billing events, and system messages."
        icon={BellRing}
        iconColor="theme"
        breadcrumbs={[{ label: 'Notifications' }]}
        action={
          unreadCount > 0
            ? { label: `Mark all as read (${unreadCount})`, onClick: markAllRead, icon: CheckCheck }
            : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ATMStatsCard
          label="Total"
          value={counts.all ?? 0}
          icon={BellRing}
          variant="accent"
          description="All notifications"
          onClick={() => setFilter('all')}
          className={cn(filter === 'all' && 'ring-2 ring-primary-500/30')}
        />
        <ATMStatsCard
          label="Unread"
          value={unreadCount}
          icon={Inbox}
          variant="rose"
          description="Waiting for your attention"
          onClick={() => setFilter('unread')}
          className={cn(filter === 'unread' && 'ring-2 ring-rose-500/30')}
        />
        <ATMStatsCard
          label="Today"
          value={todayCount}
          icon={Clock3}
          variant="indigo"
          description="Received in the last 24 hours"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterPill('all', 'All', counts.all ?? 0, FILTER_ICON.all)}
        {filterPill('unread', 'Unread', counts.unread ?? 0, FILTER_ICON.unread)}
        <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1 self-stretch" />
        {(Object.keys(TYPE_META) as NotificationType[]).map((t) =>
          counts[t] ? filterPill(t, TYPE_META[t].label, counts[t], TYPE_META[t].icon) : null,
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 p-5">
          <ATMSkeleton variant="card" count={4} className="h-20" />
        </div>
      ) : filtered.length === 0 ? (
        <ATMEmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={
            filter !== 'all' ? (
              <button
                onClick={() => setFilter('all')}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                Clear filter
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.label} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {g.label}
                </p>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {g.items.length}
                </span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 shadow-sm">
                {g.items.map(renderRow)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer hint */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-2">
        <BellRing size={10} className="inline -mt-0.5 mr-1" />
        Notifications refresh every minute automatically.
      </p>
    </div>
  );
};

export default NotificationsPage;