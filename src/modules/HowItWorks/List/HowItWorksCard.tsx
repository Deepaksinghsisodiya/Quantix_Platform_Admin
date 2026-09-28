import React, { useState } from 'react';
import {
  EyeOff,
  Image as ImageIcon,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { HowItWorksStepItem } from '../Model/HowItWorksTypes';

interface HowItWorksCardProps {
  step: HowItWorksStepItem;
  index: number;
  total: number;
  viewMode?: 'grid' | 'list';
  onOpenEdit: (step: HowItWorksStepItem) => void;
  onOpenDelete: (step: HowItWorksStepItem) => void;
  onToggleActive: (step: HowItWorksStepItem) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

export const HowItWorksCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-44 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export const HowItWorksCard: React.FC<HowItWorksCardProps> = ({
  step,
  index,
  total,
  viewMode = 'grid',
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
  isReordering = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const isActive = step.isActive ?? true;
  const stepNumber = String(step.stepNumber || index + 1).padStart(2, '0');
  const badgeLabel = step.badgeLabel || `Stage ${stepNumber}`;
  const statVal = step.statValue;
  const statLbl = step.statLabel;

  // ─── LIST VIEW ──────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200',
          isActive
            ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-[#FF4F00]/30 shadow-2xs hover:shadow-xs'
            : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail Preview */}
          <div className="relative w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center">
            {step.imageUrl && !imgError ? (
              <img
                src={step.imageUrl}
                alt={step.imageAlt || step.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-500" />
            )}
            <div className="absolute top-1 left-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-black/75 text-orange-400">
              {stepNumber}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-[#FF4F00] border border-orange-500/20">
                {badgeLabel}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate font-syne">
                {step.title}
              </h4>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                {isActive ? 'Live' : 'Hidden'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {step.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <ATMContentActionButtons
            isActive={isActive}
            onToggleActive={() => onToggleActive(step)}
            onEdit={() => onOpenEdit(step)}
            onDelete={() => onOpenDelete(step)}
            onMoveUp={() => onMove(index, 'up')}
            onMoveDown={() => onMove(index, 'down')}
            canMoveUp={index > 0 && !isReordering}
            canMoveDown={index < total - 1 && !isReordering}
            moveTooltip={{ up: 'Move Step Up', down: 'Move Step Down' }}
          />
        </div>
      </div>
    );
  }

  // ─── GRID VIEW ──────────────────────────────────────────────
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden',
        isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-[#FF4F00]/40 hover:shadow-xl dark:hover:shadow-[#FF4F00]/5'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
      )}
    >
      {/* Top Accent Line */}
      <div
        className={cn(
          'h-1.5 w-full transition-all duration-300',
          isActive
            ? 'bg-gradient-to-r from-[#FF4F00] via-orange-500 to-amber-500'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      {/* Main Content Container */}
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* Header: Step Number, Badge & Status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                'inline-flex items-center justify-center h-8 px-2.5 rounded-lg font-mono font-bold text-xs border shrink-0 shadow-2xs',
                isActive
                  ? 'bg-orange-500/10 text-[#FF4F00] border-orange-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              )}
            >
              Step {stepNumber}
            </span>

            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 truncate max-w-[180px]">
              {badgeLabel}
            </span>

            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
              #{step.sortOrder ?? index + 1}
            </span>
          </div>

          {/* Status Badge */}
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 shrink-0 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
              <EyeOff className="w-3 h-3" />
              Hidden
            </span>
          )}
        </div>

        {/* Large Media Image Preview */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-48 sm:h-52 flex items-center justify-center shrink-0 shadow-inner group/img">
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
        </div>

        {/* Titles & Copy */}
        <div className="space-y-1.5 flex-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF4F00] transition-colors font-syne">
            {step.title}
          </h3>
          {step.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {step.description}
            </p>
          )}
        </div>

        {/* Bullet Highlights */}
        {step.bullets && step.bullets.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Step Highlights ({step.bullets.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {step.bullets.slice(0, 3).map((bullet, bIdx) => (
                <span
                  key={bIdx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[220px]"
                >
                  <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0" />
                  <span className="truncate">{bullet}</span>
                </span>
              ))}
              {step.bullets.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center pl-1 font-mono">
                  +{step.bullets.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Bar with ATMContentActionButtons */}
      <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">
          Position: #{index + 1} of {total}
        </span>
        <ATMContentActionButtons
          isActive={isActive}
          onToggleActive={() => onToggleActive(step)}
          onEdit={() => onOpenEdit(step)}
          onDelete={() => onOpenDelete(step)}
          onMoveUp={() => onMove(index, 'up')}
          onMoveDown={() => onMove(index, 'down')}
          canMoveUp={index > 0 && !isReordering}
          canMoveDown={index < total - 1 && !isReordering}
          moveTooltip={{ up: 'Move Step Up', down: 'Move Step Down' }}
        />
      </div>
    </div>
  );
};

export default HowItWorksCard;
