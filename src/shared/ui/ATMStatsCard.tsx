import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ATMStatsCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  variant?: 'accent' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';
  description?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * ATMStatsCard - Zen High-Fidelity Edition
 * Inspired by premium analytics dashboards with watermark icons and theme-synced typography.
 */
export const ATMStatsCard: React.FC<ATMStatsCardProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'accent',
  description,
  className,
  onClick,
}) => {
  const variants = {
    accent: {
      bg: 'bg-blue-50/50 dark:bg-blue-500/5',
      border: 'border-blue-100/50 dark:border-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100/50 dark:bg-blue-500/20',
    },
    emerald: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
      border: 'border-emerald-100/50 dark:border-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100/50 dark:bg-emerald-500/20',
    },
    amber: {
      bg: 'bg-amber-50/50 dark:bg-amber-500/5',
      border: 'border-amber-100/50 dark:border-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100/50 dark:bg-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-50/50 dark:bg-rose-500/5',
      border: 'border-rose-100/50 dark:border-rose-900/20',
      text: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100/50 dark:bg-rose-500/20',
    },
    indigo: {
      bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
      border: 'border-indigo-100/50 dark:border-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100/50 dark:bg-indigo-500/20',
    },
    purple: {
      bg: 'bg-purple-50/50 dark:bg-purple-500/5',
      border: 'border-purple-100/50 dark:border-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100/50 dark:bg-purple-500/20',
    },
    slate: {
      bg: 'bg-slate-50/50 dark:bg-slate-500/5',
      border: 'border-slate-100/50 dark:border-slate-900/20',
      text: 'text-slate-600 dark:text-slate-400',
      iconBg: 'bg-slate-100/50 dark:bg-slate-500/20',
    },
  };

  const style = variants[variant];

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "relative p-5 rounded-2xl border overflow-hidden transition-all duration-500 group hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-none hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        style.bg,
        style.border,
        className
    )}>
      {/* Watermark Icon - Decorative background element */}
      <div className={clsx(
        "absolute -top-3 -right-3 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0",
        style.text
      )}>
        <Icon size={80} strokeWidth={1} />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
           <div className={clsx(
             "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:shadow-md",
             style.iconBg,
             style.text
           )}>
             <Icon size={16} strokeWidth={2.5} />
           </div>
         </div>

        <div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors group-hover:text-slate-600 dark:group-hover:text-gray-400">
            {label}
          </p>
          <div className={clsx(
            "text-2xl font-bold tracking-tight leading-none transition-all duration-300 group-hover:scale-102 origin-left",
            style.text
          )}>
            {value}
          </div>
          {description && (
            <p className="text-[9px] text-slate-500 dark:text-gray-600 mt-1.5 italic font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATMStatsCard;
