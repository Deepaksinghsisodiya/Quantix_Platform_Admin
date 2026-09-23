import React from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Star,
  Quote,
  TrendingUp,
} from 'lucide-react';

import { ATMBadge } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { TestimonialItem } from '../Model/TestimonialTypes';

interface TestimonialCardProps {
  testimonial: TestimonialItem;
  index: number;
  totalItems: number;
  viewMode: 'grid' | 'list';
  isReordering?: boolean;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onTogglePublished: (item: TestimonialItem) => void;
  onOpenEdit: (item: TestimonialItem) => void;
  onOpenDelete: (item: TestimonialItem) => void;
}

export function getInitials(name?: string): string {
  if (!name) return 'QX';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'QX';
  const first = parts[0] || '';
  if (parts.length === 1) return first.substring(0, 2).toUpperCase();
  const last = parts[parts.length - 1] || '';
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || 'QX';
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  index,
  totalItems,
  viewMode,
  isReordering = false,
  onMoveItem,
  onTogglePublished,
  onOpenEdit,
  onOpenDelete,
}) => {
  const initials = getInitials(testimonial.personName);
  const rating = Math.max(1, Math.min(5, testimonial.rating || 5));
  const pageLabel = testimonial.pageSlug
    ? testimonial.pageSlug.charAt(0).toUpperCase() + testimonial.pageSlug.slice(1)
    : testimonial.merchantType || 'Enterprise';

  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg dark:bg-[#12151c]',
          testimonial.isActive
            ? 'border-slate-200/90 dark:border-slate-800'
            : 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
        )}
      >
        {/* Card Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/90 backdrop-blur-md">
              #{index + 1} • {pageLabel}
            </span>
            <ATMBadge
              color={testimonial.isActive ? 'success' : 'default'}
              label={testimonial.isActive ? 'Live' : 'Hidden'}
              icon={testimonial.isActive ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            />
          </div>

          {/* Star Rating Display */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4 transition-colors',
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-700 text-slate-700'
                  )}
                />
              ))}
              <span className="ml-1.5 text-xs font-bold text-amber-300">
                {rating}.0
              </span>
            </div>

            {testimonial.metricText && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <TrendingUp className="h-3 w-3" />
                {testimonial.metricText}
              </span>
            )}
          </div>
        </div>

        {/* Card Body: Quote & Title */}
        <div className="flex-1 p-5 space-y-3.5">
          {testimonial.title && (
            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {testimonial.title}
            </h4>
          )}

          <div className="relative">
            <Quote className="absolute -top-1.5 -left-1 h-4 w-4 text-primary-500/20 dark:text-primary-400/20 rotate-180" />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-4 italic line-clamp-4">
              &ldquo;{testimonial.body}&rdquo;
            </p>
          </div>

          {/* Author Block */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/70">
            {testimonial.avatarUrl ? (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.personName}
                className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-amber-500 text-xs font-black text-white shadow-xs">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {testimonial.personName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {[testimonial.personRole, testimonial.companyName].filter(Boolean).join(' • ') || 'Verified Client'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/50 rounded-b-2xl">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={index === 0 || isReordering}
              onClick={() => onMoveItem(index, 'up')}
              title="Move Up"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <MoveUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalItems - 1 || isReordering}
              onClick={() => onMoveItem(index, 'down')}
              title="Move Down"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <MoveDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onTogglePublished(testimonial)}
              title={testimonial.isActive ? 'Hide from website' : 'Publish to website'}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {testimonial.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={() => onOpenEdit(testimonial)}
              title="Edit Testimonial"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary-950/60 dark:hover:text-primary-400 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenDelete(testimonial)}
              title="Delete Testimonial"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/60 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View Mode
  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-xs transition-all hover:shadow-md dark:bg-[#12151c]',
        testimonial.isActive
          ? 'border-slate-200/90 dark:border-slate-800'
          : 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          #{index + 1}
        </span>

        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.personName}
            className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-amber-500 text-xs font-black text-white shadow-xs">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {testimonial.personName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {[testimonial.personRole, testimonial.companyName].filter(Boolean).join(' • ')}
            </span>
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {pageLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-3 w-3',
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-300 text-slate-300 dark:fill-slate-700 dark:text-slate-700'
                  )}
                />
              ))}
            </div>
            {testimonial.title && (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {testimonial.title}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
            &ldquo;{testimonial.body}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <ATMBadge
          color={testimonial.isActive ? 'success' : 'default'}
          label={testimonial.isActive ? 'Live' : 'Hidden'}
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0 || isReordering}
            onClick={() => onMoveItem(index, 'up')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <MoveUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalItems - 1 || isReordering}
            onClick={() => onMoveItem(index, 'down')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <MoveDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onTogglePublished(testimonial)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {testimonial.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(testimonial)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenDelete(testimonial)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
