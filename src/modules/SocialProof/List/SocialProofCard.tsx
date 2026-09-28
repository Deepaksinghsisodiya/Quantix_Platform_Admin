import React from 'react';
import {
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
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
  BarChart3,
} from 'lucide-react';

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
  accentBar: string;
}

export const DEFAULT_COLOR_THEME: ColorTheme = {
  bg: 'bg-orange-500/10 dark:bg-orange-500/20',
  text: 'text-orange-600 dark:text-orange-400',
  border: 'border-orange-500/30',
  gradient: 'from-orange-500 to-amber-500',
  accentBar: 'from-primary via-orange-500 to-amber-500',
};

export const COLOR_MAP: Record<string, ColorTheme> = {
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500 to-amber-500',
    accentBar: 'from-primary via-orange-500 to-amber-500',
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
  const IconComponent = ICON_MAP[metric.iconKey] || BarChart3;
  const colorTheme = getColorTheme(metric.accentColor);

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white dark:bg-slate-900/70 p-4 shadow-xs transition-all duration-200 hover:shadow-md',
          metric.isActive
            ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary/40'
            : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 opacity-80 dark:bg-slate-950/40'
        )}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-400">
            #{index + 1}
          </span>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs',
              colorTheme.bg,
              colorTheme.border
            )}
          >
            <IconComponent className={cn('h-5 w-5', colorTheme.text)} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('text-lg font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent', colorTheme.gradient)}>
                {metric.value}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {metric.label}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                  metric.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', metric.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                {metric.isActive ? 'Live' : 'Hidden'}
              </span>
            </div>
            {metric.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{metric.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-0.5">
            <button
              type="button" disabled={index === 0 || isReordering} onClick={() => onMoveMetric(index, 'up')} title="Move Up"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
            ><MoveUp className="h-3.5 w-3.5" /></button>
            <button
              type="button" disabled={index === totalMetrics - 1 || isReordering} onClick={() => onMoveMetric(index, 'down')} title="Move Down"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
            ><MoveDown className="h-3.5 w-3.5" /></button>
          </div>
          <button
            type="button" onClick={() => onOpenEdit(metric)} title="Edit Metric"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 hover:text-[#FF4F00] hover:border-orange-300 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 transition-colors shadow-2xs cursor-pointer"
          ><Pencil className="h-3.5 w-3.5" /><span>Edit</span></button>
          <button
            type="button" onClick={() => onOpenDelete(metric)} title="Delete Metric"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          ><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden',
        metric.isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
      )}
    >
      <div className={cn('h-1.5 w-full transition-all duration-300', metric.isActive ? `bg-gradient-to-r ${colorTheme.accentBar}` : 'bg-slate-300 dark:bg-slate-700')} />

      <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Hash size={11} />#{index + 1} {metric.siteVariant ? `• ${metric.siteVariant}` : ''}
          </span>
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors', metric.isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', metric.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
            {metric.isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-xs', colorTheme.bg, colorTheme.border)}>
            <IconComponent className={cn('h-7 w-7', colorTheme.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-3xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent leading-none', colorTheme.gradient)}>
              {metric.value}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{metric.label}</div>
          </div>
        </div>

        {metric.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{metric.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Numeric</div>
            <div className="text-xs font-bold text-slate-800 dark:text-white">{metric.numericValue ?? '—'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Decimals</div>
            <div className="text-xs font-bold text-slate-800 dark:text-white">{metric.decimals ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1">
          <button type="button" disabled={index === 0 || isReordering} onClick={() => onMoveMetric(index, 'up')} title="Move Up"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <MoveUp className="h-3.5 w-3.5" /></button>
          <button type="button" disabled={index === totalMetrics - 1 || isReordering} onClick={() => onMoveMetric(index, 'down')} title="Move Down"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <MoveDown className="h-3.5 w-3.5" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onOpenEdit(metric)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-orange-50 hover:text-[#FF4F00] hover:border-orange-300 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 transition-all shadow-2xs cursor-pointer">
            <Pencil size={13} className="text-[#FF4F00]" /><span>Edit</span></button>
          <button type="button" onClick={() => onOpenDelete(metric)} title="Delete Metric"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-2xs cursor-pointer">
            <Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
};
