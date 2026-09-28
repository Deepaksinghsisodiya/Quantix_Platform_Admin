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
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { Announcement } from '../Model/AnnouncementTypes';

interface AnnouncementCardProps {
  announcement: Announcement;
  index: number;
  totalCount: number;
  viewMode?: 'grid' | 'list';
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
      return {
        badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        dot: 'bg-orange-500',
        label: 'Promo',
        accentBar: 'from-[#FF4F00] via-orange-500 to-amber-500',
        borderAccent: 'border-l-orange-500',
        iconBg: 'bg-orange-500/10 text-[#FF4F00] border-orange-500/20',
      };
    case 'news':
      return {
        badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500',
        label: 'News',
        accentBar: 'from-blue-500 via-cyan-500 to-sky-400',
        borderAccent: 'border-l-blue-500',
        iconBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      };
    case 'notice':
      return {
        badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        dot: 'bg-indigo-500',
        label: 'Notice',
        accentBar: 'from-indigo-500 via-violet-500 to-purple-500',
        borderAccent: 'border-l-indigo-500',
        iconBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      };
    case 'alert':
      return {
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500',
        label: 'Alert',
        accentBar: 'from-rose-500 via-pink-500 to-rose-400',
        borderAccent: 'border-l-rose-500',
        iconBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      };
    case 'event':
      return {
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        label: 'Event',
        accentBar: 'from-emerald-500 via-teal-500 to-cyan-500',
        borderAccent: 'border-l-emerald-500',
        iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      };
    default:
      return {
        badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        dot: 'bg-slate-500',
        label: kind || 'General',
        accentBar: 'from-slate-400 via-slate-500 to-slate-400',
        borderAccent: 'border-l-slate-400',
        iconBg: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
      };
  }
};

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  index,
  totalCount,
  viewMode = 'grid',
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

  // ─── LIST VIEW ──────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl border border-l-4 transition-all duration-200',
          isActive
            ? cn('bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs', theme.borderAccent)
            : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 border-l-slate-300 dark:border-l-slate-700 opacity-80'
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Kind-tinted Megaphone Icon */}
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform group-hover:scale-105', theme.iconBg)}>
            <Megaphone size={18} />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Kind Badge */}
              <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs', theme.badgeBg)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
                {theme.label}
              </span>

              {/* Custom Promo Badge */}
              {badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {badge}
                </span>
              )}

              {/* Pinned Indicator */}
              {isPinned && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Pin size={10} className="fill-amber-500" /> PINNED
                </span>
              )}

              {/* Title */}
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate font-syne group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
              </h4>
            </div>

            {/* Body */}
            {body && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {body}
              </p>
            )}
          </div>
        </div>

        {/* CTA preview chip (Desktop) */}
        {ctaLabel && (
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50/80 text-[#FF4F00] dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
              <Sparkles className="h-3 w-3" />
              {ctaLabel}
            </span>
            {linkUrl && (
              <span className="hidden xl:inline text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                ↗ {linkUrl}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onTogglePinned(announcement)}
            title={isPinned ? 'Unpin from top rotation' : 'Pin to top of rotation'}
            className={cn(
              'h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs',
              isPinned
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-300'
            )}
          >
            <Pin size={14} className={cn(isPinned && 'fill-amber-500')} />
          </button>

          <ATMContentActionButtons
            isActive={isActive}
            showLabels={true}
            activeLabel="Live"
            inactiveLabel="Hidden"
            onToggleActive={() => onToggleActive(announcement)}
            onEdit={() => onEdit(announcement)}
            onDelete={() => onDelete(announcement)}
            onMoveUp={() => onMove(index, 'up')}
            onMoveDown={() => onMove(index, 'down')}
            canMoveUp={index > 0 && !isReordering}
            canMoveDown={index < totalCount - 1 && !isReordering}
            moveTooltip={{ up: 'Move Announcement Up', down: 'Move Announcement Down' }}
          />
        </div>
      </div>
    );
  }

  // ─── GRID VIEW ──────────────────────────────────────────────
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden',
        isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80',
        isPinned && 'ring-1 ring-amber-400/40 shadow-xs'
      )}
    >
      {/* Top Accent Bar */}
      <div className={cn('h-1.5 w-full transition-all duration-300', isActive ? cn('bg-linear-to-r', theme.accentBar) : 'bg-slate-300 dark:bg-slate-700')} />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
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

          {/* Top-Right Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => onToggleActive(announcement)}
            title={isActive ? 'Status: Published Live (Click to hide from website)' : 'Status: Hidden Draft (Click to publish on website)'}
            className={cn(
              'h-7 rounded-lg border inline-flex items-center gap-2 px-2 transition-all duration-200 cursor-pointer select-none text-[11px] font-semibold shadow-2xs group/btn',
              isActive
                ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/90'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            )}
          >
            <span
              className={cn(
                'relative inline-flex h-3.5 w-6.5 p-0.5 items-center rounded-full transition-colors duration-200 ease-in-out shrink-0',
                isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-2.5 w-2.5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out',
                  isActive ? 'translate-x-3' : 'translate-x-0'
                )}
              />
            </span>
            <span className="leading-none">{isActive ? 'Live' : 'Hidden'}</span>
          </button>
        </div>

        {/* Title & Body */}
        <div className="space-y-2 flex-1">
          <h3 className="font-syne font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          {body && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {body}
            </p>
          )}
        </div>

        {/* CTA Preview */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-[#FF4F00]">
            <Sparkles className="h-3.5 w-3.5" />
            {ctaLabel}
          </span>
          {linkUrl && (
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
              ↗ {linkUrl}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400">
          #{index + 1} of {totalCount}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => onTogglePinned(announcement)}
            title={isPinned ? 'Unpin' : 'Pin to top'}
            className={cn(
              'h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs',
              isPinned
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-300'
            )}
          >
            <Pin size={14} className={cn(isPinned && 'fill-amber-500')} />
          </button>

          <ATMContentActionButtons
            isActive={isActive}
            onToggleActive={() => onToggleActive(announcement)}
            onEdit={() => onEdit(announcement)}
            onDelete={() => onDelete(announcement)}
            onMoveUp={() => onMove(index, 'up')}
            onMoveDown={() => onMove(index, 'down')}
            canMoveUp={index > 0 && !isReordering}
            canMoveDown={index < totalCount - 1 && !isReordering}
            moveTooltip={{ up: 'Move Announcement Up', down: 'Move Announcement Down' }}
          />
        </div>
      </div>
    </div>
  );
};
