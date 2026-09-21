import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ATMFieldCellProps {
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * ATMFieldCell — consistent label + control + hint wrapper.
 * Every field rendered through this cell uses the SAME label size, spacing and
 * helper line, so controls in a grid stay vertically aligned (no "up/down" drift)
 * regardless of whether the inner control is a text input, a select or a textarea.
 */
export const ATMFieldCell: React.FC<ATMFieldCellProps> = ({
  label,
  required,
  hint,
  error,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col min-w-0', className)}>
      {label && (
        <label className="mb-1.5 flex items-center gap-1 px-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {(hint || error) && (
        <p
          className={cn(
            'mt-1.5 px-1 text-[11px] leading-normal',
            error
              ? 'font-bold text-red-600 dark:text-red-400'
              : 'font-medium text-gray-500 dark:text-gray-400',
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
};

export default ATMFieldCell;