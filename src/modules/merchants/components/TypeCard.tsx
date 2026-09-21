import React from 'react';
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
 * TypeCard - Selectable card for choosing between merchant types.
 * Upgraded with premium off-black active accents and refined typography.
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
        'relative flex flex-col items-center gap-5 rounded-3xl border-2 p-6 text-center transition-all duration-300 w-full outline-none',
        selected
          ? 'border-slate-950 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 shadow-sm'
          : 'border-slate-200/60 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/10 dark:hover:border-slate-600',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {selected && (
        <div className="absolute -top-3 right-4 flex items-center gap-1.5 bg-slate-950 text-white dark:bg-white dark:text-slate-900 rounded-full px-2.5 py-0.5 shadow-md">
          <span className="text-[9px] font-black uppercase tracking-wider">
            Selected
          </span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-slate-950 dark:bg-slate-900 dark:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="h-2 w-2">
              <path d="M20 6L9 17L4 12" />
            </svg>
          </span>
        </div>
      )}
      <div className={cn(
        'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
        selected
          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
          : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500',
      )}>
        {icon}
      </div>
      <div>
        <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{title}</p>
        <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-[210px] mx-auto">{description}</p>
      </div>
    </button>
  );
}

export default TypeCard;
