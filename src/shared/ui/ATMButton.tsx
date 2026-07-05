import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface ATMButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success'; // added 'success'
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean; // added support for loading
  icon?: LucideIcon;
  leftIcon?: React.ReactNode; // added support for leftIcon
  rightIcon?: React.ReactNode; // added support for rightIcon
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white shadow-sm border border-transparent transition-all',
  secondary: 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 transition-all',
  danger: 'bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm border border-transparent',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm border border-transparent',
  ghost: 'bg-transparent text-slate-650 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-all',
  outline: 'border border-[var(--zen-border)] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-white dark:bg-transparent',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
};

const iconSizes: Record<string, number> = { sm: 14, md: 16, lg: 18 };

export const ATMButton = React.forwardRef<HTMLButtonElement, ATMButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading: externalIsLoading = false,
  loading = false,
  icon: Icon,
  leftIcon,
  rightIcon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}, ref) => {
  const isLoading = externalIsLoading || loading;
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 whitespace-nowrap interactive-bounce',
        'focus:outline-none focus:ring-4 focus:ring-accent-500/10',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-w-0 overflow-hidden">
          <span className="truncate">{children || 'Please wait...'}</span>
          <Loader2 size={iconSizes[size]} className="animate-spin ml-2 shrink-0" />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full min-w-0 overflow-hidden">
          {leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
          {Icon && iconPosition === 'left' && (
            React.isValidElement(Icon) ? Icon : <Icon size={iconSizes[size]} strokeWidth={2} className="mr-2 opacity-80 shrink-0" />
          )}
          <span className="truncate">{children}</span>
          {Icon && iconPosition === 'right' && (
            React.isValidElement(Icon) ? Icon : <Icon size={iconSizes[size]} strokeWidth={2} className="ml-2 opacity-80 shrink-0" />
          )}
          {rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
        </div>
      )}
    </button>
  );
});

ATMButton.displayName = 'ATMButton';
