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
  primary: 'bg-accent-600 dark:bg-accent-600 text-white hover:bg-accent-700 dark:hover:bg-accent-500 shadow-sm transition-all',
  secondary: 'bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 border border-accent-100 dark:border-accent-900/50 transition-all',
  danger: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border border-red-100 dark:border-red-900/50 transition-all',
  success: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-100 dark:border-emerald-900/50 transition-all', // added success color class
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-all',
  outline: 'border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all bg-zen-surface',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
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
        'inline-flex items-center justify-center font-semibold transition-all duration-200 whitespace-nowrap active:scale-[0.98]',
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
