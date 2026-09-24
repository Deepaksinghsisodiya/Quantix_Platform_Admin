import React from 'react';
import { cn } from '@/lib/utils/cn';

const BLOCK = 'animate-pulse bg-slate-200 dark:bg-slate-800/80';
const CARD = 'rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60';

export const IntegrationFormSkeleton: React.FC<{ isEdit?: boolean }> = ({ isEdit = true }) => {
  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in" aria-hidden="true" role="status">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="space-y-2">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2">
            <div className={cn(BLOCK, 'h-3.5 w-16 rounded')} />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className={cn(BLOCK, 'h-3.5 w-20 rounded')} />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className={cn(BLOCK, 'h-3.5 w-28 rounded')} />
          </div>
          {/* Title */}
          <div className={cn(BLOCK, 'h-7 w-64 sm:w-80 rounded-lg')} />
          {/* Subtitle */}
          <div className={cn(BLOCK, 'h-4 w-96 max-w-full rounded')} />
        </div>
      </div>

      {/* 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* LEFT COLUMN: Main Form Skeleton (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 w-full">
          {/* SECTION 1: Target Website & Identity */}
          <div className={cn(CARD, 'space-y-5')}>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className={cn(BLOCK, 'h-4 w-4 rounded')} />
              <div className={cn(BLOCK, 'h-4 w-52 rounded')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-24 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-28 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-24 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-28 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-28 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Visual Assets & External URLs */}
          <div className={cn(CARD, 'space-y-5')}>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className={cn(BLOCK, 'h-4 w-4 rounded')} />
              <div className={cn(BLOCK, 'h-4 w-48 rounded')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-32 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
              <div className="space-y-1.5">
                <div className={cn(BLOCK, 'h-3.5 w-32 rounded')} />
                <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className={cn(BLOCK, 'h-3.5 w-28 rounded')} />
              <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
            </div>
          </div>

          {/* SECTION 3: Deep Feature & Content Builders */}
          <div className={cn(CARD, 'space-y-5')}>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className={cn(BLOCK, 'h-4 w-4 rounded')} />
              <div className={cn(BLOCK, 'h-4 w-56 rounded')} />
            </div>

            {/* Builder tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <div className={cn(BLOCK, 'h-8 w-24 rounded-lg')} />
              <div className={cn(BLOCK, 'h-8 w-24 rounded-lg')} />
              <div className={cn(BLOCK, 'h-8 w-24 rounded-lg')} />
              <div className={cn(BLOCK, 'h-8 w-20 rounded-lg')} />
              <div className={cn(BLOCK, 'h-8 w-20 rounded-lg')} />
            </div>

            {/* Builder items */}
            <div className="space-y-3 pt-2">
              <div className={cn(BLOCK, 'h-20 w-full rounded-xl')} />
              <div className={cn(BLOCK, 'h-20 w-full rounded-xl')} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Live Preview & Action Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Card Preview Skeleton */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className={cn(BLOCK, 'h-3 w-32 rounded bg-slate-800')} />
              <div className={cn(BLOCK, 'h-4 w-16 rounded-full bg-slate-800')} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(BLOCK, 'h-10 w-10 rounded-xl')} />
                  <div className="space-y-1">
                    <div className={cn(BLOCK, 'h-3.5 w-24 rounded')} />
                    <div className={cn(BLOCK, 'h-2.5 w-16 rounded')} />
                  </div>
                </div>
                <div className={cn(BLOCK, 'h-5 w-16 rounded-full')} />
              </div>
              <div className={cn(BLOCK, 'h-16 w-full rounded')} />
              <div className="flex gap-1 pt-1">
                <div className={cn(BLOCK, 'h-4 w-12 rounded')} />
                <div className={cn(BLOCK, 'h-4 w-12 rounded')} />
              </div>
            </div>
          </div>

          {/* Publication Switches Skeleton */}
          <div className={cn(CARD, 'space-y-4')}>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className={cn(BLOCK, 'h-4 w-4 rounded')} />
              <div className={cn(BLOCK, 'h-4 w-44 rounded')} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={cn(BLOCK, 'h-4 w-36 rounded')} />
                <div className={cn(BLOCK, 'h-5 w-10 rounded-full')} />
              </div>
              <div className="flex items-center justify-between">
                <div className={cn(BLOCK, 'h-4 w-40 rounded')} />
                <div className={cn(BLOCK, 'h-5 w-10 rounded-full')} />
              </div>
              <div className="flex items-center justify-between">
                <div className={cn(BLOCK, 'h-4 w-44 rounded')} />
                <div className={cn(BLOCK, 'h-5 w-10 rounded-full')} />
              </div>
            </div>
          </div>

          {/* Form Actions Buttons Skeleton */}
          <div className={cn(CARD, 'space-y-3')}>
            <div className={cn(BLOCK, 'h-11 w-full rounded-xl')} />
            <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading integration editor...</span>
    </div>
  );
};

export default IntegrationFormSkeleton;
