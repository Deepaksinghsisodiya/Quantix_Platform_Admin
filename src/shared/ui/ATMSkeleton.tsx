import React from 'react';
import { cn } from '@/lib/utils/cn';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card' | 'table-row';

export interface ATMSkeletonProps {
  variant?: SkeletonVariant;
  /** Number of skeleton items to render. */
  count?: number;
  /** Width override (e.g. "100%", "200px"). */
  width?: string;
  /** Height override. */
  height?: string;
  rounded?: boolean; // backwards compatibility with original ATMSkeleton
  className?: string;
}

const shimmer = 'animate-pulse bg-gray-200 dark:bg-gray-800/60';

function SkeletonUnit({
  variant = 'text',
  width,
  height,
  rounded = false,
  className,
}: Omit<ATMSkeletonProps, 'count'>) {
  switch (variant) {
    case 'circle':
      return (
        <div
          className={cn(shimmer, 'rounded-full', className)}
          style={{ width: width ?? '2.5rem', height: height ?? '2.5rem' }}
          aria-hidden="true"
        />
      );
    case 'rect':
      return (
        <div
          className={cn(shimmer, 'rounded-lg', className)}
          style={{ width: width ?? '100%', height: height ?? '6rem' }}
          aria-hidden="true"
        />
      );
    case 'card':
      return (
        <div
          className={cn(shimmer, 'rounded-xl', className)}
          style={{ width: width ?? '100%', height: height ?? '10rem' }}
          aria-hidden="true"
        />
      );
    case 'table-row':
      return (
        <div className={cn('flex gap-4 w-full', className)} aria-hidden="true">
          <div className={cn(shimmer, 'h-4 w-10 rounded')} />
          <div className={cn(shimmer, 'h-4 flex-1 rounded')} />
          <div className={cn(shimmer, 'h-4 w-24 rounded')} />
          <div className={cn(shimmer, 'h-4 w-20 rounded')} />
          <div className={cn(shimmer, 'h-4 w-16 rounded')} />
        </div>
      );
    case 'text':
    default:
      return (
        <div
          className={cn(shimmer, 'h-4 rounded', rounded ? 'rounded-full' : 'rounded-lg', className)}
          style={{ width: width ?? '100%', height: height }}
          aria-hidden="true"
        />
      );
  }
}

export const ATMSkeleton: React.FC<ATMSkeletonProps> = ({ 
  count = 1, 
  ...rest 
}) => {
  return (
    <div className="flex flex-col gap-3 w-full" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonUnit key={i} {...rest} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default ATMSkeleton;
