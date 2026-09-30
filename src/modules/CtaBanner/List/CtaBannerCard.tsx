import React from 'react';
import {
  Sparkles,
  Building2,
  Utensils,
  Store,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { CtaBannerItem } from '../Model/CtaBannerTypes';

interface CtaBannerCardProps {
  item: CtaBannerItem;
  viewMode?: 'grid' | 'list';
  onOpenEdit: (item: CtaBannerItem) => void;
  onOpenDelete: (item: CtaBannerItem) => void;
  onToggleActive: (item: CtaBannerItem) => void;
}

export const CtaBannerCardSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#12151c] shadow-xs overflow-hidden animate-pulse">
      {/* Top Accent Gradient Line */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800" />

      <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-6 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Content Section */}
        <div className="space-y-2.5">
          <div className="h-4 w-44 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-4/5 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="h-3.5 w-3/4 rounded bg-slate-200/80 dark:bg-slate-800/80" />
          </div>
        </div>

        {/* Dual Button Chips Skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-7 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Telemetry Chips Strip Skeleton */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="h-3 w-36 rounded bg-slate-800" />
          <div className="space-y-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-700 shrink-0" />
                <div className="h-3 w-40 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges Row Skeleton */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Footer Actions Strip Skeleton */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
};

export const CtaBannerCard: React.FC<CtaBannerCardProps> = ({
  item,
  viewMode = 'grid',
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
}) => {
  const getSiteVariantBadge = () => {
    switch ((item?.siteVariant || '').toLowerCase()) {
      case 'restaurant':
        return {
          label: 'Restaurant & Dining',
          icon: Utensils,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'retail':
        return {
          label: 'Retail & Checkout',
          icon: Store,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      default:
        return {
          label: 'Enterprise Platform',
          icon: Building2,
          color: 'bg-orange-500/10 text-[#FF4F00] border-orange-500/20',
        };
    }
  };

  const variantBadge = getSiteVariantBadge();
  const VariantIcon = variantBadge.icon;

  // ==========================================
  // LIST / TABLE ROW VIEW
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-200 bg-white dark:bg-[#12151c]',
          item.isActive
            ? 'border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-orange-500/30'
            : 'border-dashed border-slate-300 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/30'
        )}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-orange-500/10 text-[#FF4F00] border-orange-500/20">
            <VariantIcon size={18} />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-syne font-bold text-slate-900 dark:text-white break-words">
                {item.heading}{' '}
                {item.headingAccent && (
                  <span className="text-[#FF4F00]">{item.headingAccent}</span>
                )}
              </h4>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {variantBadge.label}
              </span>
              {item.badge && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full">
                  <Sparkles size={9} /> {item.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 break-words whitespace-normal leading-relaxed">
              CTA: {item.primaryCta?.label || 'Action'} • Subheading: {item.subheading || 'Run Every Location From One Platform'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors',
              item.isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {item.isActive ? 'Live' : 'Hidden'}
          </span>

          <ATMContentActionButtons
            isActive={item.isActive}
            onToggleActive={() => onToggleActive(item)}
            onEdit={() => onOpenEdit(item)}
            onDelete={() => onOpenDelete(item)}
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // GRID / CARD VIEW
  // ==========================================
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden bg-white dark:bg-[#12151c]',
        item.isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-[#FF4F00]/40 shadow-xs hover:shadow-lg'
          : 'border-dashed border-slate-300 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/30'
      )}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={cn(
          'h-1.5 w-full transition-all duration-300',
          item.isActive
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-[#FF4F00]'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
        {/* Header Badges Row */}
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs',
              variantBadge.color
            )}
          >
            <VariantIcon size={12} strokeWidth={2.5} />
            {variantBadge.label}
          </span>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors',
              item.isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {item.isActive ? 'Live on Site' : 'Draft / Hidden'}
          </span>
        </div>

        {/* Eyebrow Badge & Heading */}
        <div className="space-y-2">
          {item.badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-[#FF4F00] dark:bg-orange-500/15 border border-orange-500/20">
              <Sparkles size={10} className="text-[#FF4F00]" />
              <span>{item.badge}</span>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug font-syne">
            {item.heading}{' '}
            {item.headingAccent && (
              <span className="text-[#FF4F00]">
                {item.headingAccent}
              </span>
            )}
          </h3>

          {item.subheading && (
            <p className="text-xs text-slate-600 dark:text-slate-400 break-words whitespace-normal leading-relaxed">
              {item.subheading}
            </p>
          )}
        </div>

        {/* Dual CTA Preview Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {item.primaryCta?.label && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF4F00] text-white shadow-xs">
              <span>{item.primaryCta.label}</span>
              <ArrowRight size={11} />
            </span>
          )}
          {item.secondaryCta?.label && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>{item.secondaryCta.label}</span>
            </span>
          )}
        </div>

        {/* Telemetry Chips Strip */}
        {item.telemetryChips && item.telemetryChips.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Active Telemetry Indicators ({item.telemetryChips.length})
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {item.telemetryChips.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className={cn('h-2 w-2 rounded-full shrink-0', chip.dotColor || 'bg-emerald-500')} />
                  <span className="text-[11.5px] font-medium text-slate-200 break-words whitespace-normal">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {item.trustBadges && item.trustBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {item.trustBadges.map((badge, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer Bar with ATMContentActionButtons */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400">
          Banner • {item.siteVariant}
        </span>

        <ATMContentActionButtons
          isActive={item.isActive}
          onToggleActive={() => onToggleActive(item)}
          onEdit={() => onOpenEdit(item)}
          onDelete={() => onOpenDelete(item)}
        />
      </div>
    </div>
  );
};
