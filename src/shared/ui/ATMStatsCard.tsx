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
      bg: 'bg-primary-50/40 dark:bg-primary-500/10',
      border: 'border-primary-100 dark:border-primary-900/30',
      text: 'text-primary-700 dark:text-primary-300',
      iconBg: 'bg-gradient-to-br from-primary-600 to-primary-400 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-400 text-white',
    },
    amber: {
      bg: 'bg-amber-50/40 dark:bg-amber-500/10',
      border: 'border-amber-100 dark:border-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-400 text-white',
    },
    rose: {
      bg: 'bg-rose-50/40 dark:bg-rose-500/10',
      border: 'border-rose-100 dark:border-rose-900/30',
      text: 'text-rose-700 dark:text-rose-300',
      iconBg: 'bg-gradient-to-br from-rose-600 to-rose-400 text-white',
    },
    indigo: {
      bg: 'bg-indigo-50/40 dark:bg-indigo-500/10',
      border: 'border-indigo-100 dark:border-indigo-900/30',
      text: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'bg-gradient-to-br from-indigo-600 to-indigo-400 text-white',
    },
    purple: {
      bg: 'bg-purple-50/40 dark:bg-purple-500/10',
      border: 'border-purple-100 dark:border-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-gradient-to-br from-purple-600 to-purple-400 text-white',
    },
    slate: {
      bg: 'bg-slate-50/40 dark:bg-slate-500/10',
      border: 'border-slate-100 dark:border-slate-800/80',
      text: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-gradient-to-br from-slate-600 to-slate-400 text-white',
    },
  };

  const style = variants[variant];

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "relative p-5 rounded-2xl border bg-white/70 dark:bg-[#13151a]/80 backdrop-blur-md overflow-hidden transition-all duration-300 group hover:shadow-lg shadow-sm",
        style.border,
        onClick && "cursor-pointer",
        className
    )}>

      {/* Decorative gradient blur in background */}
      <div className={clsx("absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full opacity-20 dark:opacity-10 pointer-events-none transition-all duration-500 group-hover:scale-110", style.bg)} />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
           <div className={clsx(
             "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md",
             style.iconBg
           )}>
             <Icon size={20} strokeWidth={2} />
           </div>
         </div>

        <div>
          <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 transition-colors">
            {label}
          </p>
          <div className={clsx(
            "font-mono text-3xl font-black tracking-tight leading-none transition-all duration-300",
            style.text
          )}>
            {value}
          </div>
          {description && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATMStatsCard;
