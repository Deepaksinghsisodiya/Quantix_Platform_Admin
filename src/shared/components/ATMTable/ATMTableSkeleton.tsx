import React from 'react';
import clsx from 'clsx';

interface Props { 
  rows?: number; 
  columns?: number; 
  className?: string;
  isWide?: boolean;
}

export const ATMTableSkeleton: React.FC<Props> = ({ rows = 8, columns = 5, className, isWide = false }) => {
  return (
    <div className={clsx(
      "flex flex-col h-full w-full bg-zen-surface overflow-hidden",
      className
    )}>
      {/* 🧪 Toolbar Skeleton */}
      <div className="px-8 py-4 border-b border-slate-50 dark:border-gray-800 bg-zen-surface flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Skeleton */}
          <div className="w-[340px] h-10 bg-slate-100 dark:bg-gray-800/60 rounded-xl animate-skeleton-pulse" />
          {/* Filter Button Skeleton */}
          <div className="w-10 h-10 bg-slate-100 dark:bg-gray-800/60 rounded-xl animate-skeleton-pulse" />
        </div>
        <div className="flex items-center gap-3">
          {/* Extra Actions Skeleton */}
          <div className="w-24 h-10 bg-slate-100 dark:bg-gray-800/60 rounded-xl animate-skeleton-pulse" />
          <div className="w-32 h-10 bg-slate-100 dark:bg-gray-800/60 rounded-xl animate-skeleton-pulse" />
        </div>
      </div>

      {/* 🧪 Table Skeleton */}
      <div className="flex-1 overflow-hidden relative bg-zen-surface">
        <table className="w-full border-separate border-spacing-0" role="grid">
          <thead className="bg-zen-surface">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th 
                  key={i} 
                  className={clsx(
                    "border-b border-slate-50 dark:border-gray-800",
                    isWide ? 'px-10 py-5' : 'px-6 py-4'
                  )}
                >
                  <div className={clsx(
                    "h-3 bg-slate-200/60 dark:bg-gray-800/60 rounded-full animate-skeleton-pulse",
                    i === 0 ? "w-20" : i === columns - 1 ? "w-16 ml-auto" : "w-24"
                  )} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-zen-surface">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-slate-50/50 dark:border-gray-900/50">
                {Array.from({ length: columns }).map((_, c) => (
                  <td 
                    key={c} 
                    className={clsx(
                      "border-b border-slate-50/30 dark:border-gray-900/30",
                      isWide ? 'px-10 py-5' : 'px-6 py-4'
                    )}
                  >
                    <div 
                      className={clsx(
                        "h-3.5 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse",
                        c === 0 ? "w-32" : c === columns - 1 ? "w-8 ml-auto" : "w-full max-w-[120px]"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧪 Footer Skeleton (Pagination) */}
      <div className="border-t border-slate-50 dark:border-gray-800 px-8 py-4 bg-zen-surface flex items-center justify-between flex-shrink-0">
        <div className="w-32 h-4 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
          <div className="w-8 h-8 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
          <div className="w-8 h-8 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ATMTableSkeleton;
