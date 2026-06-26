import React from 'react';
import { cn } from '@/lib/utils/cn';

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

export interface ATMProgressBarProps {
  /** Percentage value 0-100. */
  value: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  /** Show percentage label to the right. */
  showLabel?: boolean;
  /** Accessible label text. */
  label?: string;
  className?: string;
}

const fillColors: Record<ProgressVariant, string> = {
  default: 'bg-accent-600 dark:bg-accent-500',
  success: 'bg-emerald-600 dark:bg-emerald-500',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-red-600 dark:bg-red-500',
  info: 'bg-blue-600 dark:bg-blue-500',
};

const trackSizes: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ATMProgressBar: React.FC<ATMProgressBarProps> = ({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-3 w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}% complete`}
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800',
          trackSizes[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            fillColors[variant],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">
          {clamped}%
        </span>
      )}
    </div>
  );
};

export default ATMProgressBar;
