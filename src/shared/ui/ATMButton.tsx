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
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-transparent transition-all active:scale-[0.98]',
  secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm border border-transparent active:scale-[0.98]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm border border-transparent active:scale-[0.98]',
  ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all',
  outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900 shadow-sm active:scale-[0.98]',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2.5 rounded-lg',
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
