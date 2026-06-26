import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ATMActionSidebarItemProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'amber' | 'emerald' | 'rose';
  className?: string;
  isLoading?: boolean;
}

/**
 * ATMActionSidebarItem - Zen Pro Edition
 * Reusable action button for sidebar management sections.
 */
export const ATMActionSidebarItem: React.FC<ATMActionSidebarItemProps> = ({
  label,
  icon: Icon,
  onClick,
  variant = 'default',
  className,
  isLoading = false,
}) => {
  const variants = {
    default: "bg-zen-surface border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:border-accent-600 dark:hover:border-accent-500 hover:text-accent-600 dark:hover:text-accent-400",
    amber: "bg-zen-surface border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-500 dark:hover:text-amber-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
    rose: "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30",
  };

  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className={clsx(
        "w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-bold transition-all group",
        variants[variant],
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="truncate mr-2">{label}</span>
      {isLoading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={14} className={clsx(
            "shrink-0",
            variant === 'default' && "text-slate-400 dark:text-gray-600 group-hover:text-accent-600 dark:group-hover:text-accent-400",
            variant === 'amber' && "text-slate-400 dark:text-gray-600 group-hover:text-amber-500 dark:group-hover:text-amber-400"
        )} />
      )}
    </button>
  );
};

export default ATMActionSidebarItem;
