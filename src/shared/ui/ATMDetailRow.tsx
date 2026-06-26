import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ATMDetailRowProps {
  label: string;
  value?: string | number | null;
  icon: LucideIcon;
  variant?: 'accent' | 'emerald' | 'amber' | 'rose' | 'slate';
  isLast?: boolean;
  className?: string;
}

/**
 * ATMDetailRow - Zen Pro Edition
 * Standardized row for displaying information in detail views.
 */
export const ATMDetailRow: React.FC<ATMDetailRowProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'accent',
  isLast = false,
  className,
}) => {
  const variants = {
    accent: 'bg-accent-50/50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-100/50 dark:border-accent-900/30',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30',
    amber: 'bg-amber-50/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30',
    rose: 'bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/30',
    slate: 'bg-slate-50/50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100/50 dark:border-slate-900/30',
  };

  return (
    <div className={clsx(
      "flex items-start gap-4 py-3 border-slate-50 dark:border-gray-800",
      !isLast && "border-b",
      className
    )}>
      <div className={clsx(
        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-105",
        variants[variant]
      )}>
        <Icon size={14} strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.1em]">
          {label}
        </p>
        <p className="text-[13px] font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate">
          {value || '—'}
        </p>
      </div>
    </div>
  );
};

export default ATMDetailRow;
