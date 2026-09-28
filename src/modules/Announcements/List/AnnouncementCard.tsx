import React from 'react';
import {
  Pin,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  BellRing,
  Tag,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Announcement } from '../Model/AnnouncementTypes';

interface AnnouncementCardProps {
  announcement: Announcement;
  index: number;
  totalCount: number;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onToggleActive: (announcement: Announcement) => void;
  onTogglePinned: (announcement: Announcement) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

export const getKindTheme = (kind?: string | null) => {
  switch (kind?.toLowerCase()) {
    case 'promo':
      return { badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', dot: 'bg-orange-500', label: 'Promo', accentBar: 'from-primary via-orange-500 to-amber-500' };
    case 'news':
      return { badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500', label: 'News', accentBar: 'from-blue-400 via-cyan-500 to-sky-400' };
    case 'notice':
      return { badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-500', label: 'Notice', accentBar: 'from-indigo-400 via-violet-500 to-purple-500' };
    case 'alert':
      return { badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500', label: 'Alert', accentBar: 'from-rose-400 via-pink-500 to-rose-400' };
    case 'event':
      return { badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', label: 'Event', accentBar: 'from-emerald-400 via-teal-500 to-cyan-500' };
    default:
      return { badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500', label: kind || 'General', accentBar: 'from-slate-400 via-slate-500 to-slate-400' };
  }
};

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  index,
  totalCount,
  onEdit,
  onDelete,
  onToggleActive,
  onTogglePinned,
  onMove,
  isReordering = false,
}) => {
  const theme = getKindTheme(announcement?.kind);
  const title = announcement?.title || 'Untitled Announcement';
  const body = announcement?.body || '';
  const badge = announcement?.badge || '';
  const ctaLabel = announcement?.ctaLabel || 'Claim Offer';
  const linkUrl = announcement?.linkUrl || '';
  const isPinned = !!announcement?.isPinned;
  const isActive = announcement?.isActive ?? true;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden',
        isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
      )}
    >
      {/* Top Accent Bar */}
      <div className={cn('h-1.5 w-full transition-all duration-300', isActive ? `bg-gradient-to-r ${theme.accentBar}` : 'bg-slate-300 dark:bg-slate-700')} />

      <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
        {/* Header row: kind badge + pinned + status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs', theme.badgeBg)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
              {theme.label}
            </span>
            {badge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Tag className="h-3 w-3 text-slate-400" />{badge}
              </span>
            )}
            {isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Pin className="h-2.5 w-2.5 fill-amber-500" />PINNED
              </span>
            )}
          </div>
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors', isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
            {isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        {/* Icon + Title */}
        <div className="flex items-start gap-3.5">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs', isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400')}>
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
              {title}
            </h3>
            {body && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed break-words">
                {body}
              </p>
            )}
          </div>
        </div>

        {/* Live Banner Preview strip */}
        <div className="rounded-xl bg-slate-950 border border-orange-500/20 px-3 py-2.5 flex items-center gap-2 overflow-hidden">
          <BellRing className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <span className="text-xs text-slate-300 truncate flex-1">{body || title}</span>
          <span className="text-slate-600 shrink-0">|</span>
          <span className="text-[11px] font-bold text-[#FF7332] shrink-0 inline-flex items-center gap-0.5">
            {ctaLabel}<ExternalLink className="h-2.5 w-2.5 ml-0.5" />
          </span>
        </div>

        {/* Link URL if any */}
        {linkUrl && (
          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
            ↗ {linkUrl}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        {/* Reorder */}
        <div className="flex items-center gap-1">
          <button type="button" disabled={index === 0 || isReordering} onClick={() => onMove(index, 'up')} title="Move Up"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <ArrowUp className="h-3.5 w-3.5" /></button>
          <button type="button" disabled={index === totalCount - 1 || isReordering} onClick={() => onMove(index, 'down')} title="Move Down"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <ArrowDown className="h-3.5 w-3.5" /></button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Pin toggle */}
          <button type="button" onClick={() => onTogglePinned(announcement)} title={isPinned ? 'Unpin' : 'Pin to top'}
            className={cn('p-1.5 rounded-lg border transition-colors shadow-2xs cursor-pointer', isPinned ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-300')}>
            <Pin className={cn('h-3.5 w-3.5', isPinned && 'fill-amber-500')} /></button>

          {/* Toggle active */}
          <button type="button" onClick={() => onToggleActive(announcement)}
            className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs cursor-pointer', isActive ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100')}
            title={isActive ? 'Hide from website' : 'Publish to website'}>
            <span className={cn('h-2 w-2 rounded-full shrink-0', isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
            <span>{isActive ? 'Live' : 'Draft'}</span>
          </button>

          {/* Edit */}
          <button type="button" onClick={() => onEdit(announcement)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-orange-50 hover:text-[#FF4F00] hover:border-orange-300 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 transition-all shadow-2xs cursor-pointer">
            <Edit2 size={13} className="text-[#FF4F00]" /><span>Edit</span></button>

          {/* Delete */}
          <button type="button" onClick={() => onDelete(announcement)} title="Delete"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-2xs cursor-pointer">
            <Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
};
