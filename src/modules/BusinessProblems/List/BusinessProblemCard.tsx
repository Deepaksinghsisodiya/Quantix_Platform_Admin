import React, { useState } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  Layers,
  PackageX,
  Clock,
  ArrowRightLeft,
  RefreshCw,
  LineChart,
  Barcode,
  WifiOff,
  UtensilsCrossed,
  ChefHat,
  ShieldAlert,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import type { BusinessProblem } from '../Model/BusinessProblemTypes';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  TrendingDown,
  AlertTriangle,
  Layers,
  PackageX,
  Clock,
  ArrowRightLeft,
  RefreshCw,
  LineChart,
  Barcode,
  WifiOff,
  UtensilsCrossed,
  ChefHat,
};

interface BusinessProblemCardProps {
  problem: BusinessProblem;
  viewMode?: 'grid' | 'list';
  onEdit: (item: BusinessProblem) => void;
  onDelete: (item: BusinessProblem) => void;
  onToggleActive: (item: BusinessProblem) => void;
}

export const BusinessProblemCard: React.FC<BusinessProblemCardProps> = ({
  problem,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem');
  const isSolution = activeTab === 'solution';

  const MainIcon = ICON_MAP[problem?.iconKey || ''] || AlertTriangle;
  const MeterIcon = ICON_MAP[problem?.visualMeter?.iconKey || ''] || ArrowRightLeft;

  const severityStyles = (() => {
    switch ((problem?.severity || '').toUpperCase()) {
      case 'CRITICAL':
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'HIGH RISK':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'BLINDSPOT':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  })();

  // ==========================================
  // LIST / TABLE ROW VIEW
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-200 bg-white dark:bg-[#12151c]',
          problem.isActive
            ? 'border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-orange-500/30'
            : 'border-dashed border-slate-300 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/30'
        )}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-orange-500/10 dark:bg-orange-500/20 text-[#FF4F00] border-orange-500/20">
            <MainIcon size={18} />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                #{problem.sortOrder}
              </span>
              <h4 className="text-sm sm:text-base font-syne font-bold text-slate-900 dark:text-white truncate">
                {problem.title}
              </h4>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                Tab: {problem.shortTabLabel || problem.tag}
              </span>
              <span
                className={cn(
                  'text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border',
                  severityStyles
                )}
              >
                {problem.severity || 'CRITICAL'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {problem.visualMeter?.quantixText || problem.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors',
              problem.isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                problem.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {problem.isActive ? 'Live' : 'Hidden'}
          </span>

          <ATMContentActionButtons
            isActive={problem.isActive}
            onToggleActive={() => onToggleActive(problem)}
            onEdit={() => onEdit(problem)}
            onDelete={() => onDelete(problem)}
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
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 p-5 bg-white dark:bg-slate-900',
        problem.isActive
          ? isSolution
            ? 'border-[#FF4F00]/50 shadow-[0_10px_35px_rgba(255,79,0,0.1)] ring-2 ring-[#FF4F00]/10'
            : 'border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-orange-500/30 hover:shadow-md'
          : 'border-dashed border-slate-300 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-950/40'
      )}
    >
      {/* Top Brand Accent Hairline */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[3px] transition-all duration-300',
          isSolution
            ? 'bg-gradient-to-r from-[#FF4F00] via-[#FF6B2B] to-amber-400 opacity-100'
            : 'bg-gradient-to-r from-amber-400 via-orange-400 to-[#FF4F00] opacity-40 group-hover:opacity-100'
        )}
      />

      <div>
        {/* Top Header Row: Main Icon + Tags + Live Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                isSolution
                  ? 'bg-gradient-to-br from-[#FF4F00] to-[#FF6B2B] text-white border-[#FF4F00] shadow-sm shadow-orange-500/25'
                  : 'bg-orange-500/10 dark:bg-orange-500/15 text-[#FF4F00] border-orange-500/20 ring-2 ring-orange-500/5'
              )}
            >
              {isSolution ? <Zap size={18} /> : <MainIcon size={18} />}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {problem.tag || 'Problem Diagnostic'}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Tab: {problem.shortTabLabel || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                severityStyles
              )}
            >
              {problem.severity || 'CRITICAL'}
            </span>

            <span
              className={cn(
                'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                problem.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              )}
            >
              {problem.isActive ? 'Live' : 'Hidden'}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3.5">
          <h3 className="font-syne text-base font-bold text-slate-900 dark:text-white leading-snug">
            {problem.title}
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {problem.description}
          </p>
        </div>

        {/* Live Operational Reality Micro-Meter */}
        <div
          className={cn(
            'mt-3 rounded-xl border p-2.5 text-[11px] font-mono leading-relaxed transition-all duration-300',
            isSolution
              ? 'border-[#FF4F00]/25 bg-orange-500/[0.05] dark:bg-orange-500/[0.08]'
              : 'border-slate-200/90 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-800/40'
          )}
        >
          <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <MeterIcon size={11} className={isSolution ? 'text-[#FF4F00]' : 'text-slate-400'} />
              <span>Operational Reality</span>
            </span>
            <span
              className={cn(
                'text-[8.5px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0',
                isSolution
                  ? 'bg-orange-500/15 text-[#FF4F00] dark:text-orange-400'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
              )}
            >
              {isSolution ? 'Real-Time Sync' : 'Legacy Friction'}
            </span>
          </div>
          <p
            className={cn(
              'font-semibold text-xs leading-relaxed break-words',
              isSolution ? 'text-[#FF4F00] dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'
            )}
          >
            {isSolution
              ? problem.visualMeter?.quantixText || 'Quantix Live Engine Active'
              : problem.visualMeter?.legacyText || 'Legacy Friction'}
          </p>
        </div>

        {/* Interactive Segmented Switcher Preview */}
        <div className="mt-3">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('problem')}
              className={cn(
                'flex-1 py-1 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer select-none text-[10px]',
                !isSolution
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              )}
            >
              <ShieldAlert size={11} className={!isSolution ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} />
              <span>Friction</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('solution')}
              className={cn(
                'flex-1 py-1 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer select-none text-[10px]',
                isSolution
                  ? 'bg-gradient-to-r from-[#FF4F00] to-[#FF6B2B] text-white shadow-sm shadow-orange-500/25 font-bold'
                  : 'text-slate-500 hover:text-[#FF4F00] dark:text-slate-400'
              )}
            >
              <Zap size={11} className={isSolution ? 'text-white shrink-0' : 'text-[#FF4F00] shrink-0'} />
              <span>Quantix Fix</span>
            </button>
          </div>

          <div className="mt-2 min-h-[58px]">
            {!isSolution ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] dark:bg-amber-500/[0.08] p-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                  System Impact
                </span>
                <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {problem.impact}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#FF4F00]/30 bg-orange-500/[0.05] dark:bg-orange-500/[0.1] p-2 space-y-1">
                {(problem.fixes || []).slice(0, 2).map((fix, idx) => (
                  <div key={idx} className="flex items-start gap-1 text-[11px] text-slate-800 dark:text-slate-200">
                    <CheckCircle2 size={12} className="text-[#FF4F00] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{fix}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer with Unified Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">
          Order: #{problem.sortOrder}
        </span>

        <ATMContentActionButtons
          isActive={problem.isActive}
          onToggleActive={() => onToggleActive(problem)}
          onEdit={() => onEdit(problem)}
          onDelete={() => onDelete(problem)}
        />
      </div>
    </div>
  );
};

export const BusinessProblemCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-7 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};
