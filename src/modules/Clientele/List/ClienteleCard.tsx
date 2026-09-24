import React, { useState } from 'react';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  Store,
  Coffee,
  ShoppingBag,
  UtensilsCrossed,
  CheckCircle2,
  Star,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import type { ClientBrand } from '../Model/ClienteleTypes';

interface ClienteleCardProps {
  brand: ClientBrand;
  index: number;
  totalCount: number;
  viewMode?: 'grid' | 'list';
  onEdit: (brand: ClientBrand) => void;
  onDelete: (brand: ClientBrand) => void;
  onToggleActive: (brand: ClientBrand) => void;
  onToggleFeatured: (brand: ClientBrand) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

export const getCategoryIcon = (industry?: string | null, category?: string | null) => {
  const norm = `${industry || ''} ${category || ''}`.toLowerCase();
  if (norm.includes('coffee') || norm.includes('cafe')) return Coffee;
  if (norm.includes('restaurant') || norm.includes('dining') || norm.includes('hospitality')) return UtensilsCrossed;
  if (norm.includes('retail') || norm.includes('shop') || norm.includes('store') || norm.includes('apparel')) return ShoppingBag;
  if (norm.includes('franchise')) return Store;
  return Building2;
};

export const ClienteleCardSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
  return <ATMSkeleton variant={viewMode === 'list' ? 'clientele-row' : 'clientele-card'} />;
};

export const ClienteleCard: React.FC<ClienteleCardProps> = ({
  brand,
  index,
  totalCount,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onMove,
  isReordering = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const Icon = getCategoryIcon(brand?.industry, brand?.category);
  const name = brand?.name || brand?.title || 'Unnamed Brand';
  const category = brand?.category || 'Enterprise';
  const industry = brand?.industry || '';
  const locationsCount = brand?.locationsCount;
  const isFeatured = !!brand?.isFeatured;
  const isActive = brand?.isActive ?? true;
  const websiteUrl = brand?.websiteUrl || brand?.linkUrl;
  const logoUrl = !imgError && brand?.logoUrl ? brand.logoUrl : null;

  // 1. LIST VIEW RENDERING (Wide row on desktop, stack on mobile)
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group relative rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900/70 p-3.5 sm:p-4 shadow-xs',
          isActive
            ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-md'
            : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 opacity-80'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Main Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <>
                  {!imgLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700/80 rounded-xl" />
                  )}
                  <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    className={cn(
                      'max-h-full max-w-full object-contain filter dark:brightness-110 transition-opacity duration-200',
                      !imgLoaded ? 'opacity-0' : 'opacity-100'
                    )}
                  />
                </>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF4F00] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {name}
                </h3>
                {industry && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                    • {industry}
                  </span>
                )}
                {isFeatured && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Icon className="w-3 h-3 text-[#FF4F00]" />
                  {category}
                </span>
                {locationsCount ? (
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    • {locationsCount}+ Outlets
                  </span>
                ) : (
                  <span>• {brand?.tier || 'Enterprise'}</span>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline max-w-[160px] truncate"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-0.5">
              <button
                type="button"
                disabled={index === 0 || isReordering}
                onClick={() => onMove(index, 'up')}
                title="Move Up"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={index === totalCount - 1 || isReordering}
                onClick={() => onMove(index, 'down')}
                title="Move Down"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleFeatured(brand)}
                title={isFeatured ? 'Remove featured' : 'Mark featured'}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  isFeatured
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Star className={cn('h-3.5 w-3.5', isFeatured && 'fill-amber-500')} />
              </button>

              <button
                type="button"
                onClick={() => onToggleActive(brand)}
                title={isActive ? 'Hide brand' : 'Publish brand'}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>

              <ATMButton
                variant="outline"
                size="sm"
                onClick={() => onEdit(brand)}
                className="flex items-center gap-1 h-7.5 px-2 text-xs"
              >
                <Edit2 className="h-3 w-3 text-slate-500" />
                <span>Edit</span>
              </ATMButton>

              <button
                type="button"
                onClick={() => onDelete(brand)}
                title="Delete Brand"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. GRID VIEW RENDERING (Responsive card that looks gorgeous on mobile & desktop)
  return (
    <div
      className={cn(
        'group relative rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4',
        isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-md'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 opacity-80'
      )}
    >
      {/* Top Row: Logo, Brand Title, Category */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 shrink-0 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700/80 rounded-xl" />
              )}
              <img
                src={logoUrl}
                alt={`${name} logo`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={cn(
                  'max-h-full max-w-full object-contain filter dark:brightness-110 transition-opacity duration-200',
                  !imgLoaded ? 'opacity-0' : 'opacity-100'
                )}
              />
            </>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-[#FF4F00] flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {name}
            </h3>
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              )}
            >
              {isActive ? 'Active' : 'Draft'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {industry || category}
          </p>

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-primary-600 dark:text-primary-400 hover:underline max-w-[200px] truncate"
            >
              <span>{websiteUrl}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Middle Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Icon className="w-3 h-3 text-[#FF4F00]" />
          {category}
        </span>

        {isFeatured && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            FEATURED
          </span>
        )}

        {locationsCount ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <MapPin className="w-2.5 h-2.5" />
            {locationsCount}+ Units
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {brand?.tier || 'Enterprise'}
          </span>
        )}
      </div>

      {/* Bottom Action Controls: Reorder buttons on left, Actions on right */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Reorder Buttons */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-0.5">
          <button
            type="button"
            disabled={index === 0 || isReordering}
            onClick={() => onMove(index, 'up')}
            title="Move Up"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalCount - 1 || isReordering}
            onClick={() => onMove(index, 'down')}
            title="Move Down"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Feature / Active / Edit / Delete */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleFeatured(brand)}
            title={isFeatured ? 'Remove featured' : 'Mark featured'}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              isFeatured
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Star className={cn('h-4 w-4', isFeatured && 'fill-amber-500')} />
          </button>

          <button
            type="button"
            onClick={() => onToggleActive(brand)}
            title={isActive ? 'Hide from web' : 'Publish to web'}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <ATMButton
            variant="outline"
            size="sm"
            onClick={() => onEdit(brand)}
            className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit</span>
          </ATMButton>

          <button
            type="button"
            onClick={() => onDelete(brand)}
            title="Delete Brand"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
