import React from 'react';
import {
  Edit2,
  Trash2,
  Sparkles,
  Building2,
  Utensils,
  Store,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { CtaBannerItem } from '../Model/CtaBannerTypes';

interface CtaBannerCardProps {
  item: CtaBannerItem;
  onOpenEdit: (item: CtaBannerItem) => void;
  onOpenDelete: (item: CtaBannerItem) => void;
  onToggleActive: (item: CtaBannerItem) => void;
}

export const CtaBannerCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
};

export const CtaBannerCard: React.FC<CtaBannerCardProps> = ({
  item,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
}) => {
  const getSiteVariantBadge = () => {
    switch (item.siteVariant.toLowerCase()) {
      case 'restaurant':
        return {
          label: 'Restaurant Website',
          icon: Utensils,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'retail':
        return {
          label: 'Retail Website',
          icon: Store,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      default:
        return {
          label: 'Enterprise Website',
          icon: Building2,
          color: 'bg-primary/10 text-primary border-primary/20',
        };
    }
  };

  const variantBadge = getSiteVariantBadge();
  const VariantIcon = variantBadge.icon;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden',
        item.isActive
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
      )}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={cn(
          'h-1.5 w-full transition-all duration-300',
          item.isActive
            ? 'bg-gradient-to-r from-primary via-orange-500 to-amber-500'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
        {/* Header Badges Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs',
                variantBadge.color
              )}
            >
              <VariantIcon size={12} strokeWidth={2.5} />
              {variantBadge.label}
            </span>
          </div>

          {/* Live / Hidden Badge */}
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4F00] via-[#FF6B2B] to-amber-500">
                {item.headingAccent}
              </span>
            )}
          </h3>

          {item.subheading && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
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
          <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Active Telemetry Indicators ({item.telemetryChips.length})
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {item.telemetryChips.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className={cn('h-2 w-2 rounded-full shrink-0', chip.dotColor || 'bg-emerald-500')} />
                  <span className="text-[11.5px] font-medium text-slate-200 truncate">{chip.label}</span>
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

      {/* Card Actions Footer Bar */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        {/* Quick Toggle Status */}
        <button
          type="button"
          onClick={() => onToggleActive(item)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs cursor-pointer',
            item.isActive
              ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
          )}
          title={item.isActive ? 'Click to hide from website' : 'Click to make live on website'}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            )}
          />
          <span>{item.isActive ? 'Live on Site' : 'Draft / Hidden'}</span>
        </button>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenEdit(item)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-orange-50 hover:text-[#FF4F00] hover:border-orange-300 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 dark:hover:border-orange-800 transition-all shadow-2xs cursor-pointer"
          >
            <Edit2 size={13} className="text-[#FF4F00]" />
            <span>Edit Banner</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDelete(item)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-2xs cursor-pointer"
            title="Delete Configuration"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
