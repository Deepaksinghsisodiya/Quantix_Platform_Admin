import React from 'react';
import {
  Clock,
  Phone,
  ShieldCheck,
  Zap,
  Server,
  Headphones,
  CheckCircle2,
  Sparkles,
  Building2,
  Utensils,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { SupportSectionItem } from '../Model/CustomerSupportTypes';

interface CustomerSupportCardProps {
  item: SupportSectionItem;
  viewMode?: 'grid' | 'list';
  onOpenEdit: (item: SupportSectionItem) => void;
  onOpenDelete: (item: SupportSectionItem) => void;
  onToggleActive: (item: SupportSectionItem) => void;
}

export const CustomerSupportCardSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#12151c] shadow-xs overflow-hidden animate-pulse">
      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800" />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-6 w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Content Section */}
        <div className="space-y-2.5">
          <div className="h-5 w-44 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-4/5 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="h-3.5 w-3/4 rounded bg-slate-200/80 dark:bg-slate-800/80" />
          </div>
        </div>

        {/* 3 Pillars Summary Cards */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 gap-1.5">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5"
              >
                <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-2.5 w-48 rounded bg-slate-200/70 dark:bg-slate-800/60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Representative & Direct Contact Strip */}
        <div className="p-3 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/40 dark:border-orange-900/30 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-1 min-w-0">
              <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-28 rounded bg-slate-200/70 dark:bg-slate-800/60" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Footer Actions Strip */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
};

export const CustomerSupportCard: React.FC<CustomerSupportCardProps> = ({
  item,
  viewMode = 'grid',
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
}) => {
  const getVariantDetails = (variant?: string) => {
    switch ((variant || '').toLowerCase()) {
      case 'enterprise':
        return {
          label: 'Enterprise Platform',
          icon: Building2,
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50',
        };
      case 'restaurant':
        return {
          label: 'Restaurant & Dining',
          icon: Utensils,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
        };
      case 'retail':
        return {
          label: 'Retail & Checkout',
          icon: Store,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
        };
      default:
        return {
          label: variant || 'Platform',
          icon: Headphones,
          color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const variantInfo = getVariantDetails(item?.siteVariant);
  const VariantIcon = variantInfo.icon;

  const renderPillarIcon = (key?: string) => {
    switch ((key || '').toLowerCase()) {
      case 'zap':
      case 'lightning':
        return Zap;
      case 'server':
        return Server;
      case 'shield':
      case 'shieldcheck':
        return ShieldCheck;
      case 'check':
        return CheckCircle2;
      default:
        return Headphones;
    }
  };

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
          {item.repAvatarUrl ? (
            <img
              src={item.repAvatarUrl}
              alt={item.repName || 'Specialist'}
              className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/customer_support_executive.jpg';
              }}
            />
          ) : (
            <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-[#FF4F00] flex items-center justify-center font-bold text-sm shrink-0 border border-orange-500/20">
              <Headphones size={20} />
            </div>
          )}

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-syne font-bold text-slate-900 dark:text-white break-words">
                {item.mainTitle}{' '}
                {item.highlightWord && (
                  <span className="text-[#FF4F00]">{item.highlightWord}</span>
                )}
              </h4>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0">
                {variantInfo.label}
              </span>
              {item.responseTimeBadge && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">
                  <Clock size={9} /> {item.responseTimeBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 break-words leading-relaxed">
              Rep: {item.repName || 'Support Specialist'} • Hotline: {item.directPhone || '24/7 Web Desk'}
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
      {/* Top Accent Gradient Line */}
      <div
        className={cn(
          'h-1.5 w-full transition-all duration-300',
          item.isActive
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-[#FF4F00]'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors',
              variantInfo.color
            )}
          >
            <VariantIcon size={13} />
            <span>{variantInfo.label}</span>
          </span>

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
            {item.isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        {/* Content Section */}
        <div className="space-y-2">
          {item.pillBadge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-[#FF4F00] bg-orange-500/10 border border-orange-500/20">
              <Sparkles size={10} />
              {item.pillBadge}
            </span>
          )}

          <h3 className="text-lg sm:text-xl font-syne font-black text-slate-900 dark:text-white leading-tight break-words">
            {item.mainTitle}{' '}
            {item.highlightWord && (
              <span className="text-[#FF4F00]">{item.highlightWord}</span>
            )}
          </h3>

          {item.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
              {item.description}
            </p>
          )}
        </div>

        {/* 3 Pillars Summary Cards */}
        {item?.pillars && item.pillars.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Support Pillars ({item.pillars.length})
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {(item.pillars || []).slice(0, 4).map((pillar, pIdx) => {
                const PillarIcon = renderPillarIcon(pillar?.iconKey);
                return (
                  <div
                    key={pIdx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5"
                  >
                    <div className="h-6 w-6 rounded-lg bg-orange-500/10 text-[#FF4F00] flex items-center justify-center shrink-0 mt-0.5">
                      <PillarIcon size={12} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px] font-bold text-slate-900 dark:text-white break-words">
                        {pillar?.title || 'Support Feature'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 break-words leading-relaxed mt-0.5">
                        {pillar?.desc || ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Representative & Direct Contact Strip */}
        <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2.5">
            {item.repAvatarUrl ? (
              <img
                src={item.repAvatarUrl}
                alt={item.repName || 'Specialist'}
                className="h-9 w-9 rounded-full object-cover border border-orange-200 dark:border-orange-800 shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/customer_support_executive.jpg';
                }}
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-orange-500/20 text-[#FF4F00] flex items-center justify-center font-bold text-xs shrink-0">
                {item.repName ? item.repName.charAt(0) : 'S'}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {item.repName || 'Dedicated Support'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {item.repRole || '24/7 Escalation Desk'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {item.responseTimeBadge && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                <Clock size={9} /> {item.responseTimeBadge}
              </span>
            )}
            {item.directPhone && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                <Phone size={9} /> {item.directPhone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions with ATMContentActionButtons */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400">
          Support Desk • {item.siteVariant}
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
