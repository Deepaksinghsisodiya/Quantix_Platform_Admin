import React from 'react';
import {
  Store,
  TrendingUp,
  ShieldCheck,
  Globe2,
  UtensilsCrossed,
  ShoppingBag,
  Zap,
  Users,
  Award,
  Sparkles,
  Hash,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { SocialProofMetric } from '../Model/SocialProofTypes';

export const ICON_MAP: Record<string, React.ElementType> = {
  Store,
  TrendingUp,
  ShieldCheck,
  Globe2,
  UtensilsCrossed,
  ShoppingBag,
  Zap,
  Users,
  Award,
  Sparkles,
};

export interface ColorTheme {
  bg: string;
  text: string;
  border: string;
  gradient: string;
  accentBar: string;
}

export const DEFAULT_COLOR_THEME: ColorTheme = {
  bg: 'bg-orange-500/10 dark:bg-orange-500/20',
  text: 'text-[#FF4F00]',
  border: 'border-orange-500/30',
  gradient: 'from-orange-500 to-amber-500',
  accentBar: 'from-[#FF4F00] via-orange-500 to-amber-500',
};

export const COLOR_MAP: Record<string, ColorTheme> = {
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-[#FF4F00]',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500 to-amber-500',
    accentBar: 'from-[#FF4F00] via-orange-500 to-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-500',
    accentBar: 'from-emerald-400 via-teal-500 to-cyan-500',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500 to-cyan-500',
    accentBar: 'from-blue-400 via-cyan-500 to-sky-400',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500 to-indigo-500',
    accentBar: 'from-purple-400 via-indigo-500 to-violet-500',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    gradient: 'from-rose-500 to-pink-500',
    accentBar: 'from-rose-400 via-pink-500 to-rose-400',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-yellow-500',
    accentBar: 'from-amber-400 via-yellow-500 to-amber-400',
  },
};

export function getColorTheme(color?: string): ColorTheme {
  if (!color) return DEFAULT_COLOR_THEME;
  return COLOR_MAP[color.toLowerCase()] || DEFAULT_COLOR_THEME;
}

interface SocialProofCardProps {
  metric: SocialProofMetric;
  index: number;
  totalMetrics: number;
  viewMode?: 'grid' | 'list';
  isReordering?: boolean;
  isToggling?: boolean;
  onMoveMetric: (index: number, direction: 'up' | 'down') => void;
  onTogglePublished: (metric: SocialProofMetric) => void;
  onOpenEdit: (metric: SocialProofMetric) => void;
  onOpenDelete: (metric: SocialProofMetric) => void;
}

export const SocialProofCard: React.FC<SocialProofCardProps> = ({
  metric,
  index,
  totalMetrics,
  viewMode = 'grid',
  isReordering = false,
  isToggling = false,
  onMoveMetric,
  onTogglePublished,
  onOpenEdit,
  onOpenDelete,
}) => {
  const IconComponent = ICON_MAP[metric.iconKey] || Sparkles;
  const colorTheme = getColorTheme(metric.accentColor);

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-200 bg-white dark:bg-[#12151c]',
          metric.isActive
            ? 'border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-orange-500/30'
            : 'border-dashed border-slate-300 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/30'
        )}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500 shrink-0">
            #{index + 1}
          </div>

          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs',
              colorTheme.bg,
              colorTheme.border
            )}
          >
            <IconComponent className={cn('h-5 w-5', colorTheme.text)} />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-base sm:text-lg font-syne font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent',
                  colorTheme.gradient
                )}
              >
                {metric.value}
              </span>
              <span className="text-xs font-syne font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {metric.label}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {metric.siteVariant}
              </span>
            </div>
            {metric.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {metric.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors',
              metric.isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                metric.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {metric.isActive ? 'Live' : 'Hidden'}
          </span>

          <ATMContentActionButtons
            isActive={metric.isActive}
            onToggleActive={() => onTogglePublished(metric)}
            toggleDisabled={isToggling}
            onEdit={() => onOpenEdit(metric)}
            onDelete={() => onOpenDelete(metric)}
            onMoveUp={() => onMoveMetric(index, 'up')}
            onMoveDown={() => onMoveMetric(index, 'down')}
            canMoveUp={index > 0 && !isReordering}
            canMoveDown={index < totalMetrics - 1 && !isReordering}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden bg-white dark:bg-[#12151c]',
        metric.isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-[#FF4F00]/40 shadow-xs hover:shadow-lg'
          : 'border-dashed border-slate-300 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/30'
      )}
    >
      <div
        className={cn(
          'h-1.5 w-full transition-all duration-300',
          metric.isActive ? `bg-gradient-to-r ${colorTheme.accentBar}` : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Hash size={11} />#{index + 1} {metric.siteVariant ? `• ${metric.siteVariant}` : ''}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors',
              metric.isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                metric.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {metric.isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-xs transition-transform group-hover:scale-105',
              colorTheme.bg,
              colorTheme.border
            )}
          >
            <IconComponent className={cn('h-7 w-7', colorTheme.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'text-3xl font-syne font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent leading-none',
                colorTheme.gradient
              )}
            >
              {metric.value}
            </div>
            <div className="mt-1 text-xs font-syne font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
              {metric.label}
            </div>
          </div>
        </div>

        {metric.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {metric.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              Numeric
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-white">
              {metric.numericValue ?? '—'}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              Decimals
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-white">
              {metric.decimals ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400">
          Order: #{metric.sortOrder}
        </span>

        <ATMContentActionButtons
          isActive={metric.isActive}
          onToggleActive={() => onTogglePublished(metric)}
          toggleDisabled={isToggling}
          onEdit={() => onOpenEdit(metric)}
          onDelete={() => onOpenDelete(metric)}
          onMoveUp={() => onMoveMetric(index, 'up')}
          onMoveDown={() => onMoveMetric(index, 'down')}
          canMoveUp={index > 0 && !isReordering}
          canMoveDown={index < totalMetrics - 1 && !isReordering}
        />
      </div>
    </div>
  );
};
