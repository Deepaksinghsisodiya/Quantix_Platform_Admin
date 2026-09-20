import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, CheckCheck, AlertTriangle, Info, CircleCheck, XCircle,
  CreditCard, Coins, ShieldCheck, Ticket, Server, ChevronRight,
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import type { Notification, NotificationType } from '@/lib/types/notification';
import { cn } from '@/lib/utils/cn';

type FilterKey = 'all' | 'unread' | NotificationType;

const TYPE_META: Record<NotificationType, { label: string; icon: React.ComponentType<any>; accent: string; badge: string }> = {
  Info:       { label: 'Info',       icon: Info,          accent: 'text-sky-600 dark:text-sky-400',          badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
  Warning:    { label: 'Warning',    icon: AlertTriangle, accent: 'text-amber-600 dark:text-amber-400',      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  Error:      { label: 'Error',      icon: XCircle,       accent: 'text-rose-600 dark:text-rose-400',        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  Success:    { label: 'Success',    icon: CircleCheck,   accent: 'text-emerald-600 dark:text-emerald-400',  badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  System:     { label: 'System',     icon: Server,        accent: 'text-slate-600 dark:text-slate-300',      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300' },
  Ticket:     { label: 'Ticket',     icon: Ticket,        accent: 'text-violet-600 dark:text-violet-400',    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  Billing:    { label: 'Billing',    icon: CreditCard,    accent: 'text-indigo-600 dark:text-indigo-400',    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  Token:      { label: 'Token',      icon: Coins,         accent: 'text-emerald-600 dark:text-emerald-400',  badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  Compliance: { label: 'Compliance', icon: ShieldCheck,   accent: 'text-fuchsia-600 dark:text-fuchsia-400',  badge: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300' },
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
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

  const openNotification = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  const activeFilterButton = (key: FilterKey, label: string, count: number) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={cn(
        'px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all',
        filter === key
          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-zinc-950 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
      )}
    >
      {label}
      {count > 0 && (
        <span className={cn(
          'ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black',
          filter === key
            ? 'bg-white/20'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        )}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Platform alerts, ticket routing, billing events, and system messages.
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border',
            unreadCount === 0
              ? 'text-slate-400 border-slate-200 cursor-not-allowed dark:text-slate-600 dark:border-slate-800'
              : 'text-white bg-primary-600 hover:bg-primary-700 border-primary-600 shadow-sm',
          )}
        >
          <CheckCheck size={14} />
          Mark all as read
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-black">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {activeFilterButton('all', 'All', counts.all ?? 0)}
        {activeFilterButton('unread', 'Unread', counts.unread ?? 0)}
        <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1 self-stretch" />
        {(Object.keys(TYPE_META) as NotificationType[]).map((t) =>
          counts[t] ? activeFilterButton(t, TYPE_META[t].label, counts[t]) : null,
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-semibold text-slate-400">Loading notifications…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/20">
          <BellOff size={40} className="text-slate-300 dark:text-slate-700" />
          <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">You're all caught up.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Nothing matches this filter.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.Info;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                onClick={() => openNotification(n)}
                className={cn(
                  'flex items-start gap-4 px-5 py-4 cursor-pointer transition-all',
                  n.read
                    ? 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                    : 'bg-primary-50/40 hover:bg-primary-50/70 dark:bg-primary-950/10 dark:hover:bg-primary-950/20',
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border',
                  meta.badge,
                  'border-transparent',
                )}>
                  <Icon size={16} className={meta.accent} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                    )}
                    <p className={cn(
                      'text-sm truncate',
                      n.read ? 'font-semibold text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white',
                    )}>
                      {n.title}
                    </p>
                    <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider', meta.badge)}>
                      {meta.label}
                    </span>
                    {n.merchantType && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {n.merchantType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {n.link && (
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-2">
        <Bell size={10} className="inline -mt-0.5 mr-1" />
        Notifications refresh every minute automatically.
      </p>
    </div>
  );
};

export default NotificationsPage;
