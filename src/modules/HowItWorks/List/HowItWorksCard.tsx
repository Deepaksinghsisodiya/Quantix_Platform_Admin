import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Radio,
  Image as ImageIcon,
  GripVertical,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { HowItWorksStepItem } from '../Model/HowItWorksTypes';

interface HowItWorksCardProps {
  step: HowItWorksStepItem;
  index: number;
  total: number;
  onOpenEdit: (step: HowItWorksStepItem) => void;
  onOpenDelete: (step: HowItWorksStepItem) => void;
  onToggleActive: (step: HowItWorksStepItem) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

export const HowItWorksCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-60 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl pt-2" />
    </div>
  );
};

export const HowItWorksCard: React.FC<HowItWorksCardProps> = ({
  step,
  index,
  total,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
  isReordering = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const isActive = step.isActive ?? true;

  // Normalize step number
  const stepNumber = step.stepNumber || step.number || `0${index + 1}`;
  const badgeLabel = step.badgeLabel || `Step ${stepNumber}`;

  // Normalize stats
  const statVal = step.stat?.value || step.statValue;
  const statLbl = step.stat?.label || step.statLabel;

  // Normalized bullets
  const bullets = Array.isArray(step.bullets) ? step.bullets : [];

  // Normalized chips
  const chips = Array.isArray(step.telemetryChips) ? step.telemetryChips : [];

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#13151a]/95 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden',
        isActive
          ? 'border-slate-200/90 dark:border-gray-800/80 hover:border-primary-500/50 dark:hover:border-primary-500/40'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 opacity-75 bg-slate-50/50 dark:bg-slate-950/40'
      )}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 z-10',
          isActive
            ? 'bg-gradient-to-r from-primary-500 via-orange-500 to-amber-400'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      {/* Main Content Container */}
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* Header: Step Number, Badge & Status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Step number badge */}
            <span
              className={cn(
                'inline-flex items-center justify-center h-8 px-2.5 rounded-lg font-mono font-bold text-xs border shrink-0 shadow-2xs',
                isActive
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              )}
            >
              Step {stepNumber}
            </span>

            {/* Badge Label */}
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 truncate max-w-[200px]">
              {badgeLabel}
            </span>

            {/* Sort order pill */}
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
              #{step.sortOrder ?? index + 1}
            </span>
          </div>

          {/* Status Badge */}
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 shrink-0 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
              <EyeOff className="w-3.5 h-3.5" />
              Hidden
            </span>
          )}
        </div>

        {/* Large Media Image Preview Container (Increased Height) */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-56 sm:h-64 flex items-center justify-center shrink-0 shadow-inner group/img">
          {step.imageUrl && !imgError ? (
            <>
              <img
                src={step.imageUrl}
                alt={step.imageAlt || step.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-600 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium">No Image Configured</span>
              <span className="text-[10px] text-slate-500">Provide image URL in edit form</span>
            </div>
          )}

          {/* Floating Metric Pill on Image Bottom */}
          {statVal && (
            <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-white/15 shadow-lg flex items-center gap-2 z-10">
              <Activity className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-orange-400 font-mono leading-none tracking-tight">
                  {statVal}
                </div>
                {statLbl && (
                  <div className="text-[10px] text-slate-300 font-medium leading-none mt-0.5">
                    {statLbl}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Site Variant Tag on Image Top-Right */}
          <div className="absolute top-3 right-3 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 border border-white/10 text-[10px] font-mono text-slate-300 z-10">
            {step.siteVariant}
          </div>
        </div>

        {/* Step Title & Full Description */}
        <div className="space-y-1.5 pt-1">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {step.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {step.description || 'No description provided.'}
          </p>
        </div>

        {/* Key Highlights / Bullets (Fully Displayed, No Hidden Truncation) */}
        {bullets.length > 0 && (
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Workflow Capabilities ({bullets.length})
              </span>
            </div>
            <ul className="space-y-1.5">
              {bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Telemetry Chips Grid */}
        {chips.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary-500" />
              Live Telemetry Indicators
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chips.map((chip, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-2.5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2"
                >
                  <Radio
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 mt-0.5',
                      chip.status === 'active' && 'text-orange-500 animate-pulse',
                      chip.status === 'verified' && 'text-emerald-500',
                      chip.status === 'ready' && 'text-amber-500'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {chip.label}
                    </div>
                    {chip.sublabel && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {chip.sublabel}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer (Dashboard style) */}
      <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
        {/* Reordering Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0 || isReordering}
            title="Move step earlier in sequence"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 'down')}
            disabled={index === total - 1 || isReordering}
            title="Move step later in sequence"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 pl-1">
            {index + 1}/{total}
          </span>
        </div>

        {/* Action Buttons: Toggle, Edit, Delete */}
        <div className="flex items-center gap-2">
          {/* Toggle Active */}
          <button
            type="button"
            onClick={() => onToggleActive(step)}
            title={isActive ? 'Hide from live website' : 'Publish to live website'}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              isActive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isActive ? 'Live' : 'Hidden'}</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onOpenEdit(step)}
            title="Edit Step Details"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary-500" />
            <span>Edit</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onOpenDelete(step)}
            title="Delete Step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksCard;
