import { BellRing, Inbox, AlertTriangle, Info, CircleCheck, XCircle, CreditCard, Coins, ShieldCheck, Ticket, Server } from 'lucide-react';
import type { NotificationType } from '@/lib/types/notification';

/** Icon accent + badge chip styles per notification type (shared by the bell + page). */
export const TYPE_META: Record<NotificationType, { label: string; icon: React.ComponentType<any>; accent: string; badge: string }> = {
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

/** Categorical + unread filter chip icons for the notification page. */
export const FILTER_ICON: Record<'all' | 'unread', React.ComponentType<any>> = {
  all: BellRing,
  unread: Inbox,
};

export function timeAgo(iso: string): string {
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