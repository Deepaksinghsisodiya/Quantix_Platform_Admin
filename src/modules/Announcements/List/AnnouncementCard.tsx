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
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
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
      return {
        badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        dot: 'bg-orange-500',
        label: 'Promotional Offer',
      };
    case 'news':
      return {
        badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500',
        label: 'Product News',
      };
    case 'notice':
      return {
        badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        dot: 'bg-indigo-500',
        label: 'Official Notice',
      };
    case 'alert':
      return {
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500',
        label: 'Urgent Alert',
      };
    case 'event':
      return {
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        label: 'Upcoming Event',
      };
    default:
      return {
        badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        dot: 'bg-slate-500',
        label: kind || 'General',
      };
  }
};

export const AnnouncementCardSkeleton: React.FC = () => {
  return <ATMSkeleton variant="announcement-card" />;
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
        'group relative rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-xs',
        isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-md'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* LEFT SECTION: Badges, Titles, and Content Details */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          {/* Header row: Kind, Badge, Pinned pill, Status pill */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border',
                theme.badgeBg
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />
              {announcement?.kind || 'Notice'}
            </span>

            {badge ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Tag className="h-3 w-3 text-slate-400" />
                {badge}
              </span>
            ) : null}

            {isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Pin className="h-2.5 w-2.5 fill-amber-500" />
                PINNED
              </span>
            )}

            <span
              className={cn(
                'text-[11px] font-medium px-2 py-0.5 rounded-full',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              )}
            >
              {isActive ? 'Active on Web' : 'Draft / Hidden'}
            </span>
          </div>

          {/* Title & Body */}
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug break-words">
              {title}
            </h3>
            {body ? (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed break-words">
                {body}
              </p>
            ) : null}
          </div>

          {/* Live Top Banner Strip Preview Pill */}
          <div className="pt-0.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0">Navbar Preview:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-950 text-slate-200 border border-orange-500/20 text-[11px] sm:text-xs max-w-full overflow-hidden">
              <span className="truncate max-w-[180px] sm:max-w-xs">{body || title}</span>
              <span className="text-slate-600 shrink-0">|</span>
              <span className="text-[#FF7332] font-bold inline-flex items-center gap-0.5 shrink-0">
                <span>{ctaLabel}</span>
                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </span>
            </div>
            {linkUrl ? (
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono truncate max-w-[140px] sm:max-w-xs">
                ({linkUrl})
              </span>
            ) : null}
          </div>
        </div>

        {/* RIGHT SECTION: Action Controls (Optimized for Mobile & Desktop) */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between sm:justify-end">
          {/* Order Reorder Buttons */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-0.5">
            <button
              type="button"
              disabled={index === 0 || isReordering}
              onClick={() => onMove(index, 'up')}
              title="Move Up"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalCount - 1 || isReordering}
              onClick={() => onMove(index, 'down')}
              title="Move Down"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Pinned */}
            <button
              type="button"
              onClick={() => onTogglePinned(announcement)}
              title={isPinned ? 'Unpin Announcement' : 'Pin to top of banner rotation'}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                isPinned
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Pin className={cn('h-4 w-4', isPinned && 'fill-amber-500')} />
            </button>

            {/* Toggle Published / Active */}
            <button
              type="button"
              onClick={() => onToggleActive(announcement)}
              title={isActive ? 'Hide from website' : 'Publish to website'}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            {/* Edit */}
            <ATMButton
              variant="outline"
              size="sm"
              onClick={() => onEdit(announcement)}
              className="flex items-center gap-1.5 h-8 px-2.5 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit</span>
            </ATMButton>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(announcement)}
              title="Delete Announcement"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
