import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Utensils,
  Store,
  Cloud,
  Globe,
  HelpCircle,
  ListOrdered,
  Activity,
  Image as ImageIcon,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SolutionItem } from '../Model/SolutionTypes';

interface SolutionCardProps {
  item: SolutionItem;
  index: number;
  total: number;
  onOpenEdit: (item: SolutionItem) => void;
  onOpenDelete: (item: SolutionItem) => void;
  onToggleActive: (item: SolutionItem) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

export const SolutionCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-52 sm:h-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl pt-2" />
    </div>
  );
};

export const SolutionCard: React.FC<SolutionCardProps> = ({
  item,
  index,
  total,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
  isReordering = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const isActive = item.isActive ?? true;
  const isPromo = item.itemType === 'PromoCard';

  const pointsCount = item.points?.length ?? (item.pointsJson ? JSON.parse(item.pointsJson).length : 0);
  const workflowsCount = item.workflows?.length ?? (item.workflowsJson ? JSON.parse(item.workflowsJson).length : 0);
  const faqsCount = item.faqs?.length ?? (item.faqsJson ? JSON.parse(item.faqsJson).length : 0);

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#13151a]/95 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden',
        isActive
          ? 'border-slate-200/90 dark:border-gray-800/80 hover:border-primary-500/50 dark:hover:border-primary-500/40'
          : 'border-dashed border-slate-300 dark:border-slate-800/80 opacity-75 bg-slate-50/50 dark:bg-slate-950/40'
      )}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 z-10',
          isActive
            ? isPromo
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-primary-500'
              : 'bg-gradient-to-r from-primary-500 via-indigo-500 to-sky-400'
            : 'bg-slate-300 dark:bg-slate-700'
        )}
      />

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* Header: Type, Badge & Live Status */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {/* Sort order index pill */}
            <span
              className={cn(
                'inline-flex items-center justify-center h-7 px-2.5 rounded-lg font-mono font-bold text-xs border shrink-0 shadow-2xs',
                isActive
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              )}
            >
              #{item.sortOrder ?? index + 1}
            </span>

            {/* Type Identifier Badge */}
            {isPromo ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                <ExternalLink size={11} strokeWidth={2.5} />
                Subdomain Card (Left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 border border-primary-200/70 dark:border-primary-800/60">
                <Layers size={11} strokeWidth={2.5} />
                Sector Solution (Right)
              </span>
            )}

            {item.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[160px]">
                {item.badge}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 shrink-0 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
              <EyeOff className="w-3.5 h-3.5" />
              Hidden
            </span>
          )}
        </div>

        {/* Media Image Showcase Container (h-52 sm:h-56) */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-52 sm:h-56 flex items-center justify-center shrink-0 shadow-inner group/img p-4">
          {item.imageUrl && !imgError ? (
            <>
              <img
                src={item.imageUrl}
                alt={item.imageAlt || item.title}
                onError={() => setImgError(true)}
                className="max-h-full max-w-full object-contain filter drop-shadow-lg group-hover/img:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-600 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium">No Hardware Image</span>
              <span className="text-[10px] text-slate-500">Add image in edit form</span>
            </div>
          )}

          {/* Floating Pill on Image Bottom */}
          {isPromo ? (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-white/15 shadow-lg flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-amber-300 truncate">
                  {item.externalUrl || item.href || 'http://localhost:3002'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded shrink-0">
                Subdomain
              </span>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-white/15 shadow-lg flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                <span className="text-[11px] font-bold text-white truncate">
                  {item.categoryTitle || 'SECTOR SOLUTION'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-primary-300 bg-primary-950/60 border border-primary-500/40 px-2 py-0.5 rounded shrink-0">
                /{item.slug || 'restaurants'}
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1 font-syne">
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Dynamic Telemetry / Destination Strip */}
        {isPromo ? (
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
              <span>External Destination:</span>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                CTA: <strong>{item.ctaText || 'Visit Site'}</strong>
              </span>
            </div>
            <div className="text-[11px] font-mono text-amber-800 dark:text-amber-300 break-all">
              {item.externalUrl || item.href}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                <Compass size={13} />
                Landing Page Telemetry:
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                /solutions/{item.slug}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <div className="p-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white">{pointsCount}</div>
                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Points</div>
              </div>
              <div className="p-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white">{workflowsCount}</div>
                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Workflows</div>
              </div>
              <div className="p-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white">{faqsCount}</div>
                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">FAQs</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-2 px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        {/* Reordering Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0 || isReordering}
            onClick={() => onMove(index, 'up')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move item up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            disabled={index === total - 1 || isReordering}
            onClick={() => onMove(index, 'down')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move item down"
          >
            <ArrowDown size={13} />
          </button>
        </div>

        {/* Actions: Toggle, Edit, Delete */}
        <div className="flex items-center gap-2">
          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            className={cn(
              'p-2 rounded-lg border text-xs font-semibold transition-colors shadow-2xs',
              isActive
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            )}
            title={isActive ? 'Hide from website' : 'Publish live to website'}
          >
            {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onOpenEdit(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 dark:hover:bg-primary-950/40 dark:hover:border-primary-700 transition-colors shadow-2xs"
          >
            <Edit2 size={12} />
            Edit
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onOpenDelete(item)}
            className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-2xs"
            title="Delete this solution"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
