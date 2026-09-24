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
  CreditCard,
  Truck,
  Calculator,
  Printer,
  ShoppingBag,
  Cpu,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMButton } from '@/shared/ui';
import type { IntegrationItem } from '../Model/IntegrationTypes';

interface IntegrationCardProps {
  integration: IntegrationItem;
  index: number;
  totalCount: number;
  viewMode?: 'grid' | 'list';
  onEdit: (integration: IntegrationItem) => void;
  onDelete: (integration: IntegrationItem) => void;
  onToggleActive: (integration: IntegrationItem) => void;
  onTogglePopular: (integration: IntegrationItem) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

export const getIntegrationCategoryIcon = (category?: string | null) => {
  const norm = (category || '').toLowerCase();
  if (norm.includes('pay') || norm.includes('card') || norm.includes('settle')) return CreditCard;
  if (norm.includes('deliver') || norm.includes('dispatch') || norm.includes('courier')) return Truck;
  if (norm.includes('account') || norm.includes('tax') || norm.includes('book') || norm.includes('cogs')) return Calculator;
  if (norm.includes('print') || norm.includes('hard') || norm.includes('kds')) return Printer;
  if (norm.includes('omni') || norm.includes('commerce') || norm.includes('store')) return ShoppingBag;
  return Cpu;
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  index,
  totalCount,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onToggleActive,
  onTogglePopular,
  onMove,
  isReordering = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const Icon = getIntegrationCategoryIcon(integration.category);

  const isActive = integration.isActive ?? true;
  const isPopular = !!integration.isPopular;
  const accentColor = integration.accent || '#6366f1';

  // Stats count preview
  let statsCount = 0;
  if (integration.statsJson) {
    try {
      const parsed = JSON.parse(integration.statsJson);
      if (Array.isArray(parsed)) statsCount = parsed.length;
    } catch {
      // ignore
    }
  }

  // 1. LIST VIEW RENDERING
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
            {/* Index Badge */}
            <div className="flex flex-col items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              #{index + 1}
            </div>

            {/* Logo container */}
            <div
              className="relative w-12 h-12 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 shrink-0 flex items-center justify-center overflow-hidden"
              style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
            >
              {!imgError && integration.logoUrl ? (
                <>
                  {!imgLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700/80 rounded-xl" />
                  )}
                  <img
                    src={integration.logoUrl}
                    alt={integration.name}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    className={cn(
                      'max-h-full max-w-full object-contain filter dark:brightness-110 transition-opacity duration-200',
                      !imgLoaded ? 'opacity-0' : 'opacity-100'
                    )}
                  />
                </>
              ) : (
                <Icon className="w-5 h-5 text-primary" style={{ color: accentColor }} />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {integration.name}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  /{integration.slug}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {integration.category}
                </span>
                {integration.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
                    {integration.badge}
                  </span>
                )}
                {isPopular && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    Popular
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                {integration.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto justify-between sm:justify-end">
            {/* Reorder Buttons */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-0.5">
              <button
                type="button"
                disabled={index === 0 || isReordering}
                onClick={() => onMove(index, 'up')}
                title="Move Up"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={index === totalCount - 1 || isReordering}
                onClick={() => onMove(index, 'down')}
                title="Move Down"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Popular toggle */}
              <button
                type="button"
                onClick={() => onTogglePopular(integration)}
                title={isPopular ? 'Remove popular' : 'Mark popular'}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors cursor-pointer',
                  isPopular
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Star className={cn('h-3.5 w-3.5', isPopular && 'fill-amber-500')} />
              </button>

              {/* Active toggle */}
              <button
                type="button"
                onClick={() => onToggleActive(integration)}
                title={isActive ? 'Hide integration' : 'Publish integration'}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors cursor-pointer',
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={() => onEdit(integration)}
                title="Edit Integration"
                className="inline-flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
              >
                <Edit2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>Edit</span>
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDelete(integration)}
                title="Delete Integration"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. GRID VIEW RENDERING
  return (
    <div
      className={cn(
        'group relative rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 overflow-hidden',
        isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-md'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 opacity-80'
      )}
    >
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-80 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />

      <div className="space-y-3.5">
        {/* Top Header: Logo, Title, Active Pill */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 shrink-0 flex items-center justify-center overflow-hidden"
            style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
          >
            {!imgError && integration.logoUrl ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700/80 rounded-xl" />
                )}
                <img
                  src={integration.logoUrl}
                  alt={integration.name}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  className={cn(
                    'max-h-full max-w-full object-contain filter dark:brightness-110 transition-opacity duration-200',
                    !imgLoaded ? 'opacity-0' : 'opacity-100'
                  )}
                />
              </>
            ) : (
              <Icon className="w-6 h-6 text-primary" style={{ color: accentColor }} />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {integration.name}
              </h3>
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                )}
              >
                {isActive ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                slug: <strong>{integration.slug}</strong>
              </span>
              {integration.websiteUrl && (
                <a
                  href={integration.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {integration.description || 'No description provided.'}
        </p>

        {/* Middle Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Icon className="w-3 h-3 text-primary-600" />
            {integration.category.toUpperCase()}
          </span>

          {isPopular && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              POPULAR
            </span>
          )}

          {integration.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
              {integration.badge}
            </span>
          )}

          {statsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              {statsCount} Metrics
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Controls: Reorder buttons on left, Actions on right */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Reorder Buttons */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-0.5">
          <span className="text-[11px] font-mono font-bold text-slate-400 px-1.5">
            #{index + 1}
          </span>
          <button
            type="button"
            disabled={index === 0 || isReordering}
            onClick={() => onMove(index, 'up')}
            title="Move Up"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalCount - 1 || isReordering}
            onClick={() => onMove(index, 'down')}
            title="Move Down"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Feature / Active / Edit / Delete */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onTogglePopular(integration)}
            title={isPopular ? 'Remove popular badge' : 'Feature as popular'}
            className={cn(
              'p-2 rounded-lg border transition-colors cursor-pointer',
              isPopular
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Star className={cn('h-4 w-4', isPopular && 'fill-amber-500')} />
          </button>

          <button
            type="button"
            onClick={() => onToggleActive(integration)}
            title={isActive ? 'Hide from website' : 'Publish to website'}
            className={cn(
              'p-2 rounded-lg border transition-colors cursor-pointer',
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(integration)}
            title="Edit Integration"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(integration)}
            title="Delete Integration"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
