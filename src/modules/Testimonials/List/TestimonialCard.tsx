import React, { useState } from 'react';
import {
  Star,
  Quote,
  TrendingUp,
  Building2,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const initials = getInitials(testimonial.personName);
  const rating = Math.max(1, Math.min(5, testimonial.rating || 5));
  const pageLabel = testimonial.pageSlug
    ? testimonial.pageSlug.charAt(0).toUpperCase() + testimonial.pageSlug.slice(1)
    : testimonial.merchantType || 'Enterprise';

  // â”€â”€â”€ LIST VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white dark:bg-slate-900/70 p-4 shadow-xs transition-all duration-200 hover:shadow-md',
          testimonial.isActive
            ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary/40'
            : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 opacity-80 dark:bg-slate-950/40'
        )}
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-400">
            #{index + 1}
          </span>

          {testimonial.avatarUrl ? (
            <div className="relative h-10 w-10 shrink-0">
              {!imgLoaded && <div className="absolute inset-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />}
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.personName}
                onLoad={() => setImgLoaded(true)}
                className={cn('h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700 transition-opacity duration-300', imgLoaded ? 'opacity-100' : 'opacity-0')}
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-amber-500 text-xs font-black text-white shadow-xs">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{testimonial.personName}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{[testimonial.personRole, testimonial.companyName].filter(Boolean).join(' \u2022 ')}</span>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{pageLabel}</span>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border', testimonial.isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', testimonial.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                {testimonial.isActive ? 'Live' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={cn('h-3 w-3', star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-300 text-slate-300 dark:fill-slate-700 dark:text-slate-700')} />
                ))}
              </div>
              {testimonial.title && <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{testimonial.title}</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">&ldquo;{testimonial.body}&rdquo;</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <ATMContentActionButtons
            isActive={testimonial.isActive}
            onToggleActive={() => onTogglePublished(testimonial)}
            onEdit={() => onOpenEdit(testimonial)}
            onDelete={() => onOpenDelete(testimonial)}
            onMoveUp={() => onMoveItem(index, 'up')}
            onMoveDown={() => onMoveItem(index, 'down')}
            canMoveUp={index > 0 && !isReordering}
            canMoveDown={index < totalItems - 1 && !isReordering}
            moveTooltip={{ up: 'Move Up', down: 'Move Down' }}
          />
        </div>
      </div>
    );
  }

  // â”€â”€â”€ GRID VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden',
        testimonial.isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
      )}
    >
      {/* Top Accent Bar */}
      <div className={cn('h-1.5 w-full transition-all duration-300', testimonial.isActive ? 'bg-gradient-to-r from-primary via-orange-500 to-amber-500' : 'bg-slate-300 dark:bg-slate-700')} />

      <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              #{index + 1}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary dark:text-orange-400 border border-primary/20 text-xs font-bold">
              <Building2 size={11} />{pageLabel}
            </span>
          </div>
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors', testimonial.isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', testimonial.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
            {testimonial.isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        {/* Stars + metric */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={cn('h-4 w-4 transition-colors', star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700')} />
            ))}
            <span className="ml-1.5 text-xs font-bold text-amber-500 dark:text-amber-400">{rating}.0</span>
          </div>
          {testimonial.metricText && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />{testimonial.metricText}
            </span>
          )}
        </div>

        {/* Quote body */}
        <div className="relative flex-1">
          <Quote className="absolute -top-1.5 -left-1 h-4 w-4 text-primary/20 rotate-180" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-4 italic line-clamp-4">
            &ldquo;{testimonial.body}&rdquo;
          </p>
          {testimonial.title && (
            <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{testimonial.title}</h4>
          )}
        </div>

        {/* Author block */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/70">
          {testimonial.avatarUrl ? (
            <div className="relative h-10 w-10 shrink-0">
              {!imgLoaded && <div className="absolute inset-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />}
              <img
                src={testimonial.avatarUrl} alt={testimonial.personName} onLoad={() => setImgLoaded(true)}
                className={cn('h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700 transition-opacity duration-300', imgLoaded ? 'opacity-100' : 'opacity-0')}
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-amber-500 text-xs font-black text-white shadow-xs">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{testimonial.personName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {[testimonial.personRole, testimonial.companyName].filter(Boolean).join(' \u2022 ') || 'Verified Client'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions â€” unified ATMContentActionButtons */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[10px] font-mono text-slate-400">#{index + 1} of {totalItems}</span>
        <ATMContentActionButtons
          isActive={testimonial.isActive}
          onToggleActive={() => onTogglePublished(testimonial)}
          onEdit={() => onOpenEdit(testimonial)}
          onDelete={() => onOpenDelete(testimonial)}
          onMoveUp={() => onMoveItem(index, 'up')}
          onMoveDown={() => onMoveItem(index, 'down')}
          canMoveUp={index > 0 && !isReordering}
          canMoveDown={index < totalItems - 1 && !isReordering}
          moveTooltip={{ up: 'Move Up', down: 'Move Down' }}
        />
      </div>
    </div>
  );
};
