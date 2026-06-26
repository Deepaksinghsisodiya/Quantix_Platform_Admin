import React from 'react';
import { cn } from '@/lib/utils/cn';

type SelectSize = 'sm' | 'md' | 'lg';

export interface ATMSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ATMSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: ATMSelectOption[];
  placeholder?: string;
  size?: SelectSize;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'h-8 text-xs rounded-md',
  md: 'h-10 text-sm rounded-lg',
  lg: 'h-12 text-base rounded-lg',
};

export const ATMSelect = React.forwardRef<HTMLSelectElement, ATMSelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      size = 'md',
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const selectId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-0.5"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={cn(
            'w-full appearance-none border bg-white px-3 pr-10 text-gray-900',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800',
            'dark:focus:ring-accent-400 dark:focus:border-accent-400',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400'
              : 'border-gray-200 dark:border-gray-800',
            sizeStyles[size],
            /* chevron background */
            'bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat',
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")]",
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <p id={`${selectId}-error`} className="text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

ATMSelect.displayName = 'ATMSelect';

export default ATMSelect;
