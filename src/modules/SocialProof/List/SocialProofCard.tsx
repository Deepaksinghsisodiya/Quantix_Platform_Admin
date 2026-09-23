import React from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  CheckCircle2,
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
} from 'lucide-react';

import { ATMBadge } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
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
}

export const DEFAULT_COLOR_THEME: ColorTheme = {
  bg: 'bg-orange-500/10 dark:bg-orange-500/20',
  text: 'text-orange-600 dark:text-orange-400',
  border: 'border-orange-500/30',
  gradient: 'from-orange-500 to-amber-500',
};

export const COLOR_MAP: Record<string, ColorTheme> = {
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500 to-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-500',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500 to-cyan-500',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500 to-indigo-500',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    gradient: 'from-rose-500 to-pink-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-yellow-500',
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
  viewMode: 'grid' | 'list';
  isReordering?: boolean;
  onMoveMetric: (index: number, direction: 'up' | 'down') => void;
  onTogglePublished: (metric: SocialProofMetric) => void;
  onOpenEdit: (metric: SocialProofMetric) => void;
  onOpenDelete: (metric: SocialProofMetric) => void;
}

export const SocialProofCard: React.FC<SocialProofCardProps> = ({
  metric,
  index,
  totalMetrics,
  viewMode,
  isReordering = false,
  onMoveMetric,
  onTogglePublished,
  onOpenEdit,
  onOpenDelete,
}) => {
  const IconComponent = ICON_MAP[metric.iconKey] || Sparkles;
  const colorTheme = getColorTheme(metric.accentColor);

  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg dark:bg-[#12151c]',
          metric.isActive
            ? 'border-slate-200/90 dark:border-slate-800'
            : 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
        )}
      >
        {/* Ribbon Mockup Preview Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/90 backdrop-blur-md">
              #{index + 1} • {metric.siteVariant}
            </span>
            <ATMBadge
              color={metric.isActive ? 'success' : 'default'}
              label={metric.isActive ? 'Live' : 'Hidden'}
              icon={metric.isActive ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            />
          </div>

          <div className="mt-4 flex items-center gap-3.5">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md shadow-xs', colorTheme.bg, colorTheme.border)}>
              <IconComponent className={cn('h-6 w-6', colorTheme.text)} />
            </div>
            <div>
              <div className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent', colorTheme.gradient)}>
                {metric.value}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {metric.label}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-4 space-y-3">
          {metric.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
              {metric.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Numeric: </span>
              {metric.numericValue ?? 'None'}
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Decimals: </span>
              {metric.decimals}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/50 rounded-b-2xl">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={index === 0 || isReordering}
              onClick={() => onMoveMetric(index, 'up')}
              title="Move Up"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <MoveUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalMetrics - 1 || isReordering}
              onClick={() => onMoveMetric(index, 'down')}
              title="Move Down"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <MoveDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onTogglePublished(metric)}
              title={metric.isActive ? 'Hide from website' : 'Publish to website'}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {metric.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={() => onOpenEdit(metric)}
              title="Edit Metric"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary-950/60 dark:hover:text-primary-400 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenDelete(metric)}
              title="Delete Metric"
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
        metric.isActive
          ? 'border-slate-200/90 dark:border-slate-800'
          : 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
      )}
    >
      <div className="flex items-center gap-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          #{index + 1}
        </span>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', colorTheme.bg, colorTheme.border)}>
          <IconComponent className={cn('h-5 w-5', colorTheme.text)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('text-lg font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent', colorTheme.gradient)}>
              {metric.value}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {metric.label}
            </span>
          </div>
          {metric.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {metric.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <ATMBadge
          color={metric.isActive ? 'success' : 'default'}
          label={metric.isActive ? 'Live' : 'Hidden'}
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0 || isReordering}
            onClick={() => onMoveMetric(index, 'up')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <MoveUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalMetrics - 1 || isReordering}
            onClick={() => onMoveMetric(index, 'down')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <MoveDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onTogglePublished(metric)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {metric.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(metric)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenDelete(metric)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
