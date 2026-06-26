import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { cn } from '@/lib/utils/cn';

interface TypeCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

/**
 * Reusable selectable card for choosing between merchant types
 * (Enterprise vs. Standalone). Used in both registration flows.
 */
export function TypeCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  disabled,
}: TypeCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all duration-300 w-full',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
        selected
          ? 'border-accent-600 bg-accent-50/30 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
          : 'border-surface-200 bg-zen-surface hover:border-accent-300 hover:shadow-sm dark:border-surface-800 dark:hover:border-accent-800',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {selected && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 bg-white dark:bg-gray-900 border border-accent-600 dark:border-accent-500 rounded-full px-2.5 py-0.5 shadow-sm">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Selected
          </span>
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent-600 text-white dark:bg-accent-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="h-1.5 w-1.5">
              <path d="M20 6L9 17L4 12" />
            </svg>
          </span>
        </div>
      )}
      <div className={cn(
        'flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300',
        selected
          ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400'
          : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
      )}>
        {icon}
      </div>
      <div>
        <p className="font-extrabold text-surface-900 dark:text-surface-100">{title}</p>
        <p className="mt-1 text-xs font-semibold text-surface-500 dark:text-surface-400 leading-normal">{description}</p>
      </div>
    </button>
  );
}
