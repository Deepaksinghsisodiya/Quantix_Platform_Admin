import React from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface ATMSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  variant?: 'border-bottom' | 'border-left';
  color?: 'accent' | 'emerald' | 'amber' | 'rose' | 'slate';
  noBorder?: boolean;
}

/**
 * ATMSectionHeader - Zen Pro Edition
 * Standardized header for card sections with two visual styles.
 */
export const ATMSectionHeader: React.FC<ATMSectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  className,
  variant = 'border-bottom',
  color = 'accent',
  noBorder = false,
}) => {
  const colors = {
    accent: 'border-accent-600 text-accent-600',
    emerald: 'border-emerald-500 text-emerald-500',
    amber: 'border-amber-500 text-amber-500',
    rose: 'border-rose-500 text-rose-500',
    slate: 'border-slate-400 text-slate-400',
  };

  if (variant === 'border-left') {
    return (
      <div className={clsx("border-l-4 pl-4", colors[color], className)}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          {Icon && <Icon size={14} />}
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className={clsx(
      "flex flex-col gap-1 pb-5 mb-5",
      !noBorder && "border-b border-slate-100 dark:border-gray-800",
      className
    )}>
       <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={colors[color].split(' ')[1]} />}
          <h3 className="text-[10px] font-bold text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em]">
            {title}
          </h3>
       </div>
       {subtitle && <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest">{subtitle}</p>}
    </div>
  );
};

export default ATMSectionHeader;
