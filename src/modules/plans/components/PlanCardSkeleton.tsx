import React from 'react';
import { cn } from '@/lib/utils/cn';

const shimmer = 'animate-pulse bg-slate-200/70 dark:bg-slate-800/60';

export const PlanCardSkeleton: React.FC = () => (
  <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#13151a]/80 backdrop-blur-md shadow-sm p-5">
    {/* Identity header */}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(shimmer, 'h-12 w-12 rounded-xl shrink-0')} />
        <div className="min-w-0 space-y-2">
          <div className={cn(shimmer, 'h-4 w-32 rounded')} />
          <div className={cn(shimmer, 'h-3 w-24 rounded')} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={cn(shimmer, 'h-5 w-16 rounded-full')} />
        <div className={cn(shimmer, 'h-4 w-7 rounded-full')} />
      </div>
    </div>

    {/* Price block */}
    <div className="mt-4 space-y-2">
      <div className="flex items-baseline gap-2">
        <div className={cn(shimmer, 'h-8 w-32 rounded-lg')} />
        <div className={cn(shimmer, 'h-3 w-10 rounded')} />
      </div>
      <div className={cn(shimmer, 'h-3 w-48 rounded')} />
    </div>

    {/* Info tiles */}
    <div className="mt-4 grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 flex items-start gap-3">
          <div className={cn(shimmer, 'h-8 w-8 rounded-lg shrink-0 mt-0.5')} />
          <div className="flex-1 min-w-0 space-y-2">
            <div className={cn(shimmer, 'h-2.5 w-16 rounded')} />
            <div className={cn(shimmer, 'h-3.5 w-20 rounded')} />
          </div>
        </div>
      ))}
    </div>

    {/* Capabilities */}
    <div className="pt-5 flex-1">
      <div className={cn(shimmer, 'h-3 w-36 rounded mb-3')} />
      <div className="space-y-2.5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={cn(shimmer, 'h-[18px] w-[18px] rounded-full shrink-0')} />
            <div className={cn(shimmer, 'h-3 flex-1 rounded', i === 2 && 'w-2/3 flex-none')} />
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="mt-4 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60">
      <div className={cn(shimmer, 'h-3 w-24 rounded')} />
      <div className="flex items-center gap-1">
        <div className={cn(shimmer, 'h-7 w-14 rounded-lg')} />
        <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
        <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
      </div>
    </div>
  </div>
);

export default PlanCardSkeleton;