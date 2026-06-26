import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ChartSkeletonProps {
  /** Height of the skeleton area. */
  height?: string;
  className?: string;
}

/**
 * Skeleton loading state for chart components.
 * Shows a pulsing placeholder with faux axis lines.
 */
export function ChartSkeleton({ height = '320px', className }: ChartSkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg', className)}
      style={{ height }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="flex h-full w-full items-end gap-1 p-4">
        {/* Y-axis labels */}
        <div className="flex h-full w-10 flex-col justify-between py-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-2.5 w-8 rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
        {/* Chart area with faux bars */}
        <div className="flex flex-1 items-end gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gray-200 dark:bg-gray-700"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex gap-2 px-14">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <span className="sr-only">Loading chart...</span>
    </div>
  );
}
