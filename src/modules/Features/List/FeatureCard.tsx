import React, { useState } from 'react';
import {
  Store,
  Boxes,
  ChefHat,
  LineChart,
  Zap,
  ShoppingBag,
  Shirt,
  Sparkles,
  Smartphone,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { PlatformFeature } from '../Model/FeatureTypes';

interface FeatureCardProps {
  item: PlatformFeature;
  index: number;
  total: number;
  viewMode?: 'grid' | 'list';
  onOpenEdit: (item: PlatformFeature) => void;
  onOpenDelete: (item: PlatformFeature) => void;
  onToggleActive: (item: PlatformFeature) => void;
  onToggleNavbar: (item: PlatformFeature) => void;
}

export const FeatureCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-44 sm:h-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  item,
  index,
  total,
  viewMode = 'grid',
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onToggleNavbar,
}) => {
  const [imgError, setImgError] = useState(false);
  const isActive = item.isActive ?? true;

  const getIcon = (key: string) => {
    switch (key?.toLowerCase()) {
      case 'boxes':
        return Boxes;
      case 'chefhat':
        return ChefHat;
      case 'linechart':
        return LineChart;
      case 'zap':
        return Zap;
      case 'shoppingbag':
        return ShoppingBag;
      case 'shirt':
        return Shirt;
      case 'smartphone':
        return Smartphone;
      default:
        return Store;
    }
  };

  const IconComp = getIcon(item.iconKey);

  // ==========================================
  // LIST / TABLE ROW VIEW
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-200 bg-white dark:bg-[#12151c]',
          isActive
            ? 'border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-orange-500/30'
            : 'border-dashed border-slate-300 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/30'
        )}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-slate-100 dark:bg-slate-850 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-center">
            {item.imageUrl && !imgError ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                onError={() => setImgError(true)}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <span className="text-[#FF4F00]">
                <IconComp size={20} />
              </span>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.numberLabel && (
                <span className="text-xs font-mono font-bold text-[#FF4F00]">
                  [{item.numberLabel}]
                </span>
              )}
              <h4 className="text-sm sm:text-base font-syne font-bold text-slate-900 dark:text-white truncate">
                {item.title}
              </h4>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {item.siteVariant} • {item.category}
              </span>
              {item.showInNavbar && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <Navigation size={9} /> Navbar
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {item.shortDescription || item.fullDescription || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onToggleNavbar(item)}
            className={cn(
              'text-[10.5px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer',
              item.showInNavbar
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            )}
            title="Toggle navbar visibility"
          >
            <Navigation size={11} />
            <span className="hidden md:inline">{item.showInNavbar ? 'Navbar: Live' : 'Navbar: Off'}</span>
          </button>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors',
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {isActive ? 'Active' : 'Inactive'}
          </span>

          <ATMContentActionButtons
            isActive={isActive}
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
        'group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#13151a]/95 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden',
        isActive
          ? 'border-slate-200/90 dark:border-gray-800/80 hover:border-primary-500/50 dark:hover:border-primary-500/40'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 opacity-75 bg-slate-50/50 dark:bg-slate-950/40'
      )}
    >
      {/* Top Accent Line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 z-10',
          isActive
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-[#FF4F00]'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-[#FF4F00]">
              <IconComp size={16} />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
              {item.siteVariant} • {item.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {item.showInNavbar && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                <Navigation size={10} /> Navbar
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border transition-colors',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                )}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Feature Image Preview */}
        <div className="relative h-44 sm:h-48 w-full rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-2">
          {item.imageUrl && !imgError ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1">
              <IconComp size={32} />
              <span className="text-[11px] font-mono">No Image Preview</span>
            </div>
          )}

          {item.statValue && (
            <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 text-white text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Sparkles size={11} className="text-[#FF4F00]" />
              <span>{item.statLabel || 'Stat'}: {item.statValue}</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {item.numberLabel && (
              <span className="text-xs font-mono font-bold text-[#FF4F00]">[{item.numberLabel}]</span>
            )}
            <h3 className="font-syne text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF4F00] transition-colors">
              {item.title}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.shortDescription || item.fullDescription || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Footer Actions Bar with Unified Action Buttons */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleNavbar(item)}
          className={cn(
            'text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer',
            item.showInNavbar
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          )}
        >
          <Navigation size={12} />
          <span>{item.showInNavbar ? 'In Navbar' : 'Add to Navbar'}</span>
        </button>

        <ATMContentActionButtons
          isActive={isActive}
          onToggleActive={() => onToggleActive(item)}
          onEdit={() => onOpenEdit(item)}
          onDelete={() => onOpenDelete(item)}
        />
      </div>
    </div>
  );
};
