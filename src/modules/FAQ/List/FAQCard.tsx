import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  HelpCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Building2,
  Utensils,
  Store,
  Globe,
  Layers,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FAQItem } from '../Model/FAQTypes';

interface FAQCardProps {
  item: FAQItem;
  index: number;
  totalCount: number;
  onOpenEdit: (item: FAQItem) => void;
  onOpenDelete: (item: FAQItem) => void;
  onToggleActive: (item: FAQItem) => void;
  onMove?: (index: number, direction: 'up' | 'down') => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  isDragging?: boolean;
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
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
  onDragStart,
  onDrop,
  isDragging = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Platform discriminator & accent colors
  const getSiteVariantConfig = () => {
    const mt = (item.merchantType || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    if (mt === 'enterprise' || cat === 'enterprise') {
      return {
        label: 'Enterprise Website',
        icon: Building2,
        accentColor: '#6366f1',
        badgeColor: 'bg-primary/10 text-primary border-primary/20',
      };
    }
    if (
      mt === 'restaurant' ||
      cat === 'restaurant' ||
      item.question.toLowerCase().includes('restaurant') ||
      item.question.toLowerCase().includes('kds')
    ) {
      return {
        label: 'Restaurant Website',
        icon: Utensils,
        accentColor: '#f59e0b',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    }
    if (
      mt === 'retail' ||
      cat === 'retail' ||
      item.question.toLowerCase().includes('retail') ||
      item.question.toLowerCase().includes('inventory')
    ) {
      return {
        label: 'Retail Storefront',
        icon: Store,
        accentColor: '#10b981',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    }
    return {
      label: 'All Storefronts',
      icon: Globe,
      accentColor: '#3b82f6',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    };
  };

  const config = getSiteVariantConfig();
  const Icon = config.icon;
  const isActive = item.isActive ?? true;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        'group relative rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 overflow-hidden',
        isDragging && 'opacity-40 scale-[0.99]',
        isActive
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-md'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 opacity-80'
      )}
    >
      {/* Top Accent Gradient Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-80 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${config.accentColor}, transparent)`,
        }}
      />

      <div className="space-y-3.5">
        {/* Top Header Row: Icon, Title, Status */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Left Icon box with left color indicator */}
          <div
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 shrink-0 flex items-center justify-center overflow-hidden"
            style={{ borderLeftColor: config.accentColor, borderLeftWidth: 3 }}
          >
            <HelpCircle className="w-5 h-5 text-primary" style={{ color: config.accentColor }} />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-left font-bold text-slate-900 dark:text-white hover:text-primary transition-colors text-sm sm:text-base leading-snug line-clamp-2 cursor-pointer"
              >
                {item.question}
              </button>

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
                sort: <strong>#{item.sortOrder}</strong>
              </span>
              {item.category && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Answer Content */}
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-0 sm:pl-1">
          <p className={cn('whitespace-pre-wrap', !isExpanded && 'line-clamp-2')}>
            {item.answer}
          </p>
          {item.answer.length > 120 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Middle Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Icon className="w-3 h-3 text-primary-600" />
            {config.label.toUpperCase()}
          </span>
          {item.createdAt && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Controls Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2">
        {/* Reordering Controls / Index */}
        <div className="flex items-center gap-1">
          <div
            className="flex items-center justify-center shrink-0 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mr-1 cursor-grab"
            title="Drag to reorder"
          >
            #{index + 1}
          </div>
          {onMove && (
            <>
              <button
                type="button"
                onClick={() => onMove(index, 'up')}
                disabled={index === 0}
                title="Move up"
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <MoveUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 'down')}
                disabled={index === totalCount - 1}
                title="Move down"
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <MoveDown className="h-3 w-3" />
              </button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Active toggle */}
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            title={isActive ? 'Hide FAQ' : 'Publish FAQ'}
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
            onClick={() => onOpenEdit(item)}
            title="Edit FAQ"
            className="inline-flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>Edit</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onOpenDelete(item)}
            title="Delete FAQ"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
