import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, BellOff, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { cn } from '@/lib/utils/cn';
import { TYPE_META, timeAgo } from '@/modules/notifications/components/notificationMeta';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const recent = notifications.slice(0, 5);

  const openItem = (id: string, link: string | null) => {
    markAsRead(id);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications, ${unreadCount} unread`}
        className={cn(
          'relative p-2 rounded-xl transition-all active:scale-95',
          'text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          'hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 dark:hover:border-slate-700',
        )}
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0d0f14]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white dark:bg-[#13151a] border border-[var(--zen-border)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="p-8 text-center">
                <BellOff size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Nothing new right now.</p>
              </div>
            ) : (
              recent.map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.Info;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => openItem(n.id, n.link)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 transition-colors',
                      n.read
                        ? 'hover:bg-slate-100 dark:hover:bg-white/[0.03]'
                        : 'bg-primary-50/50 hover:bg-primary-50 dark:bg-primary-950/10 dark:hover:bg-primary-950/20',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border', meta.badge)}>
                        <Icon size={14} className={meta.accent} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-[12px] truncate',
                          n.read ? 'font-semibold text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white',
                        )}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{timeAgo(n.createdAt)}</p>
                      </div>
                      {n.link && <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 mt-1 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={() => { setOpen(false); navigate('/notifications'); }}
            className="w-full py-2.5 text-[11px] font-black text-primary-600 dark:text-primary-400 hover:bg-slate-100 dark:hover:bg-white/[0.03] border-t border-slate-100 dark:border-slate-800/60 uppercase tracking-widest"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;