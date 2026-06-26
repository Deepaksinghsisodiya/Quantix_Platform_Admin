import React from 'react';
import { cn } from '@/lib/utils/cn';
import { BarChart3 } from 'lucide-react';

export interface ChartEmptyStateProps {
  message?: string;
  className?: string;
}

/**
 * Empty state placeholder when a chart has no data.
 */
export function ChartEmptyState({
  message = 'No data available for this period.',
  className,
}: ChartEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <BarChart3 className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
