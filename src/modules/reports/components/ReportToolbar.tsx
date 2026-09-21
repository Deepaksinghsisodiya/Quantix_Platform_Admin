import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ATMButton } from '@/shared/ui/ATMButton';
import { AlertTriangle } from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Shared chrome for every report page. The window selector, error banner and
 * empty state were copy-pasted across the seven report pages with subtly
 * different gray values; centralising them keeps one font/one palette.
 * ------------------------------------------------------------------------- */

export type ReportWindowChoice = '30d' | '90d' | '12m';

export const WINDOW_DAYS: Record<ReportWindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
export const WINDOW_LABEL: Record<ReportWindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

const WINDOW_OPTIONS: ReportWindowChoice[] = ['30d', '90d', '12m'];

export function ReportWindowTabs({
  value,
  onChange,
}: {
  value: ReportWindowChoice;
  onChange: (w: ReportWindowChoice) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/60">
      {WINDOW_OPTIONS.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onChange(w)}
          className={cn(
            'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap',
            value === w
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          )}
        >
          {WINDOW_LABEL[w]}
        </button>
      ))}
    </div>
  );
}

/** Uniform segmented choice for secondary filters (group-by, merchant type). */
export function ReportSegmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/60">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-300',
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
      <div className="flex min-w-0 items-center gap-2.5 text-sm text-red-700 dark:text-red-300">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="truncate">{message}</span>
      </div>
      <ATMButton variant="ghost" size="sm" onClick={onRetry}>
        Retry
      </ATMButton>
    </div>
  );
}

export function ReportEmpty({ text, className = 'h-40' }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      {text}
    </div>
  );
}

/** Consistent KPI grid wrapper — every report's headline numbers sit on the same rhythm. */
export function ReportKpis({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}

export default ReportWindowTabs;