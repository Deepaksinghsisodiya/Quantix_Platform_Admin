import React, { useState } from 'react';
import {
  HelpCircle,
  Building2,
  Utensils,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { FAQItem } from '../Model/FAQTypes';

interface FAQCardProps {
  item: FAQItem;
  index: number;
  totalCount: number;
  viewMode?: 'grid' | 'list';
  onOpenEdit: (item: FAQItem) => void;
  onOpenDelete: (item: FAQItem) => void;
  onToggleActive: (item: FAQItem) => void;
  onMove?: (index: number, direction: 'up' | 'down') => void;
}

export const FAQCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export const FAQCard: React.FC<FAQCardProps> = ({
  item,
  index,
  totalCount,
  viewMode = 'grid',
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Platform discriminator & accent colors
  const getSiteVariantConfig = () => {
    const mt = (item.merchantType || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    if (mt === 'enterprise' || cat === 'enterprise') {
      return {
        label: 'Enterprise Platform',
        icon: Building2,
        accentColor: '#FF4F00',
        badgeColor: 'bg-orange-500/10 text-[#FF4F00] border-orange-500/20',
      };
    }
    if (
      mt === 'restaurant' ||
      cat === 'restaurant' ||
      item.question.toLowerCase().includes('restaurant') ||
      item.question.toLowerCase().includes('kds')
    ) {
      return {
        label: 'Restaurant & Dining',
        icon: Utensils,
        accentColor: '#f59e0b',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    }
    if (
      mt === 'retail' ||
      cat === 'retail' ||
      item.question.toLowerCase().includes('retail') ||
      item.question.toLowerCase().includes('barcode')
    ) {
      return {
        label: 'Retail & Checkout',
        icon: Store,
        accentColor: '#10b981',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    }

    return {
      label: item.merchantType || 'Global Platform',
      icon: HelpCircle,
      accentColor: '#FF4F00',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    };
  };

  const config = getSiteVariantConfig();
  const Icon = config.icon;
  const isActive = item.isActive ?? true;

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
          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500">
            #{index + 1}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-syne font-bold text-slate-900 dark:text-white truncate">
                {item.question}
              </h4>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {item.category || 'General'}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {config.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {item.answer}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
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
            {isActive ? 'Live' : 'Hidden'}
          </span>

          <ATMContentActionButtons
            isActive={isActive}
            onToggleActive={() => onToggleActive(item)}
            onEdit={() => onOpenEdit(item)}
            onDelete={() => onOpenDelete(item)}
            onMoveUp={onMove ? () => onMove(index, 'up') : undefined}
            onMoveDown={onMove ? () => onMove(index, 'down') : undefined}
            canMoveUp={index > 0}
            canMoveDown={index < totalCount - 1}
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
        isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-[#FF4F00]/40 shadow-xs hover:shadow-lg'
          : 'border-dashed border-slate-300 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/30'
      )}
    >
      {/* Top Accent Gradient Line */}
      <div
        className={cn(
          'h-1.5 w-full transition-all duration-300',
          isActive
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-[#FF4F00]'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs',
                config.badgeColor
              )}
            >
              <Icon size={12} strokeWidth={2.5} />
              {config.label}
            </span>
            {item.category && (
              <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {item.category}
              </span>
            )}
          </div>

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
            {isActive ? 'Live on Site' : 'Hidden'}
          </span>
        </div>

        {/* Question & Answer */}
        <div className="space-y-2">
          <h3 className="font-syne text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#FF4F00] transition-colors">
            {item.question}
          </h3>

          <div className="relative">
            <p
              className={cn(
                'text-xs text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-200',
                isExpanded ? '' : 'line-clamp-3'
              )}
            >
              {item.answer}
            </p>
            {item.answer && item.answer.length > 150 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-[#FF4F00] hover:underline cursor-pointer"
              >
                <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Meta / Date */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Sort: #{item.sortOrder || index + 1}</span>
          {item.createdAt && <span>{new Date(item.createdAt).toLocaleDateString()}</span>}
        </div>
      </div>

      {/* Card Action Footer with ATMContentActionButtons */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-400">
          FAQ #{index + 1}
        </span>

        <ATMContentActionButtons
          isActive={isActive}
          onToggleActive={() => onToggleActive(item)}
          onEdit={() => onOpenEdit(item)}
          onDelete={() => onOpenDelete(item)}
          onMoveUp={onMove ? () => onMove(index, 'up') : undefined}
          onMoveDown={onMove ? () => onMove(index, 'down') : undefined}
          canMoveUp={index > 0}
          canMoveDown={index < totalCount - 1}
        />
      </div>
    </div>
  );
};
