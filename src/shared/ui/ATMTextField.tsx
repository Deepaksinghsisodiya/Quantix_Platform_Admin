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
      disabled,
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
      md: 'rounded-xl',
      lg: 'rounded-xl',
    };

    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 px-0.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div
          className={clsx(
            'relative flex items-center w-full transition-all duration-200 border group shadow-2xs',
            containerSizeClasses[size],
            disabled
              ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 opacity-60 cursor-not-allowed'
              : error
                ? 'border-red-500 bg-red-50/10 focus-within:ring-4 focus-within:ring-red-500/10'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:border-primary-400 dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary-500/10 dark:focus-within:ring-primary-400/20'
          )}
        >
          {effectivePrefix && (
            <div className="pl-3.5 pr-1 flex items-center justify-center text-zinc-400 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
              {effectivePrefix}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            {...rest}
            className={clsx(
              'flex-1 w-full bg-transparent font-medium outline-none transition-all',
              disabled
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600',
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
