import React from 'react';
import clsx from 'clsx';

export interface ATMTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ATMTextField = React.forwardRef<HTMLInputElement, ATMTextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      prefix,
      suffix,
      leftIcon,
      rightIcon,
      className,
      required,
      size = 'lg',
      ...rest
    },
    ref
  ) => {
    const effectivePrefix = prefix ?? leftIcon;
    const effectiveSuffix = suffix ?? rightIcon;

    const inputSizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-sm',
    };

    const containerSizeClasses = {
      sm: 'rounded-lg',
      md: 'rounded-lg',
      lg: 'rounded-lg',
    };

    return (
      <div className={clsx('flex flex-col gap-2', className)}>
        {label && (
          <label className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 px-0.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div
          className={clsx(
            'relative flex items-center w-full transition-all duration-200 border group shadow-[inset_0_1px_2px_rgba(0,0,0,0.005)] border-[var(--zen-border)] bg-[var(--zen-surface)] dark:bg-zinc-950/50',
            containerSizeClasses[size],
            error
              ? 'border-red-500 bg-red-50/10'
              : 'hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:border-primary-400 dark:focus-within:bg-zinc-950/70',
            'focus-within:ring-4 focus-within:ring-primary-500/10 dark:focus-within:ring-primary-400/10'
          )}
        >
          {effectivePrefix && (
            <div className="pl-4 pr-1 flex items-center justify-center text-gray-400 transition-colors group-focus-within:text-accent-600">
              {effectivePrefix}
            </div>
          )}

          <input
            ref={ref}
            {...rest}
            className={clsx(
              'flex-1 w-full bg-transparent font-medium outline-none transition-all',
              'text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600',
              inputSizeClasses[size],
              effectivePrefix && 'pl-2'
            )}
          />

          {effectiveSuffix && (
            <div className="pr-2 flex items-center justify-center">
              {effectiveSuffix}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-bold text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 px-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 px-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ATMTextField.displayName = 'ATMTextField';
