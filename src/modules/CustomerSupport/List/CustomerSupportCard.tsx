import React from 'react';
import {
  Edit2,
  Trash2,
  Headphones,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Zap,
  Building2,
  Utensils,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SupportSectionItem } from '../Model/CustomerSupportTypes';

interface CustomerSupportCardProps {
  item: SupportSectionItem;
  onOpenEdit: (item: SupportSectionItem) => void;
  onOpenDelete: (item: SupportSectionItem) => void;
  onToggleActive: (item: SupportSectionItem) => void;
}

export const CustomerSupportCardSkeleton: React.FC = () => {
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
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
};

export const CustomerSupportCard: React.FC<CustomerSupportCardProps> = ({
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

  const renderPillarIcon = (iconKey?: string): LucideIcon => {
    switch (iconKey?.toLowerCase()) {
      case 'clock':
        return Clock;
      case 'shieldcheck':
      case 'shield':
        return ShieldCheck;
      case 'phone':
        return Phone;
      case 'zap':
        return Zap;
      default:
        return Headphones;
    }
  };

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

      <div className="p-6 sm:p-7 space-y-6 flex-1 flex flex-col justify-between">
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
            {item.isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          {item.pillBadge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-primary bg-primary/10 border border-primary/20">
              <Sparkles size={10} />
              {item.pillBadge}
            </span>
          )}

          <h3 className="text-xl sm:text-2xl font-syne font-black text-slate-900 dark:text-white leading-tight">
            {item.mainTitle}{' '}
            {item.highlightWord && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
                {item.highlightWord}
              </span>
            )}
          </h3>

          {item.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* 3 Pillars Summary Cards */}
        {item.pillars && item.pillars.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Support Pillars ({item.pillars.length})
            </span>
            <div className="grid grid-cols-1 gap-2">
              {item.pillars.slice(0, 3).map((pillar, pIdx) => {
                const PillarIcon = renderPillarIcon(pillar.iconKey);
                return (
                  <div
                    key={pIdx}
                    className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5"
                  >
                    <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <PillarIcon size={12} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate">
                        {pillar.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {pillar.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Representative & Direct Contact Strip */}
        <div className="p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {item.repAvatarUrl ? (
              <img
                src={item.repAvatarUrl}
                alt={item.repName || 'Support Specialist'}
                className="h-10 w-10 rounded-full object-cover border border-orange-200 dark:border-orange-800 shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/customer_support_executive.jpg';
                }}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {item.repName ? item.repName.charAt(0) : 'S'}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {item.repName || 'Dedicated Support Specialist'}
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {item.repRole || '24/7 Escalation Engineer'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.responseTimeBadge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-900/30 border border-emerald-300/40 px-2.5 py-1 rounded-full">
                <Clock size={10} />
                {item.responseTimeBadge}
              </span>
            )}
            {item.directPhone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                <Phone size={10} />
                {item.directPhone}
              </span>
            )}
          </div>
        </div>
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
            <span>Edit Desk</span>
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
