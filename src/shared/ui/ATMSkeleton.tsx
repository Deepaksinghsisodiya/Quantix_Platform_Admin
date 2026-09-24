import React from 'react';
import { cn } from '@/lib/utils/cn';

type SkeletonVariant =
  | 'text'
  | 'circle'
  | 'rect'
  | 'card'
  | 'table-row'
  | 'content-card'
  | 'content-row'
  | 'metric-card'
  | 'metric-row'
  | 'testimonial-card'
  | 'testimonial-row'
  | 'feature-card'
  | 'feature-row'
  | 'clientele-card'
  | 'clientele-row'
  | 'announcement-card'
  | 'integration-card'
  | 'integration-row'
  | 'kpi-card';

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

const shimmer = 'animate-pulse bg-slate-200 dark:bg-slate-800/70';

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
    case 'metric-card':
      return (
        <div
          className={cn(
            'flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-[#12151c] overflow-hidden',
            className
          )}
          aria-hidden="true"
        >
          {/* Ribbon Mockup Header Shimmer */}
          <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className={cn(shimmer, 'h-4 w-20 rounded-md bg-slate-800/90')} />
              <div className={cn(shimmer, 'h-4 w-12 rounded-full bg-slate-800/90')} />
            </div>
            <div className="mt-4 flex items-center gap-3.5">
              <div className={cn(shimmer, 'h-12 w-12 shrink-0 rounded-xl bg-slate-800/90')} />
              <div className="space-y-2 flex-1">
                <div className={cn(shimmer, 'h-7 w-24 rounded-lg bg-slate-800/90')} />
                <div className={cn(shimmer, 'h-3 w-32 rounded bg-slate-800/70')} />
              </div>
            </div>
          </div>

          {/* Card Body Shimmer */}
          <div className="p-4 space-y-3 flex-1">
            <div className="space-y-1.5">
              <div className={cn(shimmer, 'h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800/60')} />
              <div className={cn(shimmer, 'h-3 w-3/4 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className={cn(shimmer, 'h-8 rounded-lg bg-slate-100 dark:bg-slate-800/50')} />
              <div className={cn(shimmer, 'h-8 rounded-lg bg-slate-100 dark:bg-slate-800/50')} />
            </div>
          </div>

          {/* Action Toolbar Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/50 rounded-b-2xl">
            <div className="flex items-center gap-1">
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'metric-row':
      return (
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#12151c]',
            className
          )}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3.5 flex-1">
            <div className={cn(shimmer, 'h-7 w-7 shrink-0 rounded-lg')} />
            <div className={cn(shimmer, 'h-10 w-10 shrink-0 rounded-lg')} />
            <div className="space-y-1.5 flex-1 max-w-md">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-5 w-20 rounded-md')} />
                <div className={cn(shimmer, 'h-4 w-28 rounded')} />
              </div>
              <div className={cn(shimmer, 'h-3 w-48 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className={cn(shimmer, 'h-5 w-12 rounded-full')} />
            <div className="flex items-center gap-1">
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'testimonial-card':
      return (
        <div
          className={cn(
            'flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#12151c]',
            className
          )}
          aria-hidden="true"
        >
          {/* Header: Stars + Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn(shimmer, 'h-4 w-4 rounded-sm')} />
              ))}
            </div>
            <div className={cn(shimmer, 'h-5 w-20 rounded-full')} />
          </div>

          {/* Testimonial Quote & Title */}
          <div className="my-4 space-y-2.5 flex-1">
            <div className={cn(shimmer, 'h-5 w-3/4 rounded-lg')} />
            <div className="space-y-1.5 pt-1">
              <div className={cn(shimmer, 'h-3.5 w-full rounded bg-slate-200/70 dark:bg-slate-800/60')} />
              <div className={cn(shimmer, 'h-3.5 w-5/6 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
              <div className={cn(shimmer, 'h-3.5 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>
          </div>

          {/* Author Block */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className={cn(shimmer, 'h-10 w-10 shrink-0 rounded-full')} />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className={cn(shimmer, 'h-4 w-28 rounded')} />
              <div className={cn(shimmer, 'h-3 w-36 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100/80 dark:border-slate-800/50">
            <div className={cn(shimmer, 'h-5 w-14 rounded-full')} />
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'testimonial-row':
      return (
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#12151c]',
            className
          )}
          aria-hidden="true"
        >
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            <div className={cn(shimmer, 'h-10 w-10 shrink-0 rounded-full')} />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-4.5 w-32 rounded-md')} />
                <div className={cn(shimmer, 'h-4 w-16 rounded-full')} />
              </div>
              <div className={cn(shimmer, 'h-3.5 w-48 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
              <div className={cn(shimmer, 'h-3.5 w-3/4 rounded bg-slate-200/60 dark:bg-slate-800/40')} />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn(shimmer, 'h-3.5 w-3.5 rounded-sm')} />
              ))}
            </div>
            <div className={cn(shimmer, 'h-5 w-12 rounded-full')} />
            <div className="flex items-center gap-1">
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'feature-card':
      return (
        <div
          className={cn(
            'flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#12151c]',
            className
          )}
          aria-hidden="true"
        >
          {/* Header: Icon + Category + Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={cn(shimmer, 'h-10 w-10 shrink-0 rounded-xl')} />
              <div className="space-y-1">
                <div className={cn(shimmer, 'h-4 w-28 rounded')} />
                <div className={cn(shimmer, 'h-3 w-16 rounded-full')} />
              </div>
            </div>
            <div className={cn(shimmer, 'h-5 w-20 rounded-full')} />
          </div>

          {/* Title & Desc */}
          <div className="my-4 space-y-2 flex-1">
            <div className={cn(shimmer, 'h-5 w-4/5 rounded-lg')} />
            <div className="space-y-1.5 pt-1">
              <div className={cn(shimmer, 'h-3.5 w-full rounded bg-slate-200/70 dark:bg-slate-800/60')} />
              <div className={cn(shimmer, 'h-3.5 w-3/4 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>

            {/* Bullets List Shimmer */}
            <div className="space-y-2 pt-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(shimmer, 'h-2 w-2 rounded-full shrink-0')} />
                  <div className={cn(shimmer, 'h-3 w-full rounded bg-slate-200/60 dark:bg-slate-800/50')} />
                </div>
              ))}
            </div>
          </div>

          {/* ROI Stat Box */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className={cn(shimmer, 'h-9 w-full rounded-xl')} />
          </div>

          {/* Footer Toolbar */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100/80 dark:border-slate-800/50">
            <div className={cn(shimmer, 'h-5 w-14 rounded-full')} />
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'feature-row':
      return (
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#12151c]',
            className
          )}
          aria-hidden="true"
        >
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            <div className={cn(shimmer, 'h-10 w-10 shrink-0 rounded-xl')} />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-4.5 w-36 rounded-md')} />
                <div className={cn(shimmer, 'h-4 w-20 rounded-full')} />
              </div>
              <div className={cn(shimmer, 'h-3.5 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className={cn(shimmer, 'h-7 w-24 rounded-lg')} />
            <div className={cn(shimmer, 'h-5 w-12 rounded-full')} />
            <div className="flex items-center gap-1">
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'content-card':
      return (
        <div
          className={cn(
            'flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-[#12151c] overflow-hidden',
            className
          )}
          aria-hidden="true"
        >
          {/* 16:9 Thumbnail shimmer */}
          <div className={cn(shimmer, 'relative aspect-video w-full')}>
            <div className="absolute top-2.5 left-2.5 h-4 w-7 rounded-md bg-slate-300 dark:bg-slate-700/80" />
            <div className="absolute top-2.5 right-2.5 h-4 w-14 rounded-full bg-slate-300 dark:bg-slate-700/80" />
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 flex-1">
            <div className={cn(shimmer, 'h-4 w-24 rounded-md')} />
            <div className={cn(shimmer, 'h-5 w-4/5 rounded-lg')} />
            <div className="space-y-1.5">
              <div className={cn(shimmer, 'h-3 w-full rounded bg-slate-200/60 dark:bg-slate-800/50')} />
              <div className={cn(shimmer, 'h-3 w-2/3 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
            </div>
            <div className="flex gap-2 pt-1">
              <div className={cn(shimmer, 'h-4 w-20 rounded')} />
              <div className={cn(shimmer, 'h-4 w-16 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className={cn(shimmer, 'h-6 w-14 rounded-lg')} />
            <div className={cn(shimmer, 'h-6 w-20 rounded-lg')} />
          </div>
        </div>
      );
    case 'content-row':
      return (
        <div
          className={cn(
            'flex flex-col md:flex-row items-stretch rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4.5 gap-4 shadow-xs dark:border-slate-800 dark:bg-[#12151c]',
            className
          )}
          aria-hidden="true"
        >
          {/* Thumbnail */}
          <div className={cn(shimmer, 'relative aspect-video sm:aspect-[16/10] md:h-36 md:w-56 lg:w-64 shrink-0 overflow-hidden rounded-xl')}>
            <div className="absolute top-2.5 left-2.5 h-4 w-7 rounded-md bg-slate-300 dark:bg-slate-700/80" />
            <div className="absolute bottom-2.5 left-2.5 h-4 w-16 rounded-md bg-slate-300 dark:bg-slate-700/80" />
          </div>

          {/* Center */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-5 w-28 rounded-md')} />
                <div className={cn(shimmer, 'h-5 w-16 rounded-full')} />
              </div>
              <div className={cn(shimmer, 'h-6 w-3/4 rounded-lg')} />
              <div className="space-y-1.5 pt-1">
                <div className={cn(shimmer, 'h-3.5 w-full rounded bg-slate-200/60 dark:bg-slate-800/50')} />
                <div className={cn(shimmer, 'h-3.5 w-4/5 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-5 w-32 rounded-md')} />
                <div className={cn(shimmer, 'h-5 w-24 rounded-md')} />
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-4 w-24 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
                <div className={cn(shimmer, 'h-4 w-20 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
                <div className={cn(shimmer, 'h-4 w-24 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 md:pl-3">
            <div className={cn(shimmer, 'h-8 w-16 rounded-xl')} />
            <div className={cn(shimmer, 'h-8 w-24 rounded-xl')} />
          </div>
        </div>
      );
    case 'clientele-card':
      return (
        <div
          className={cn(
            'flex flex-col justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70',
            className
          )}
          aria-hidden="true"
        >
          {/* Top Row: Logo Box + Details & Status Pill */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={cn(shimmer, 'h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl border border-slate-200/80 dark:border-slate-800')} />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className={cn(shimmer, 'h-5 w-36 rounded-md')} />
                <div className={cn(shimmer, 'h-4 w-14 rounded-full')} />
              </div>
              <div className={cn(shimmer, 'h-3.5 w-28 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
              <div className={cn(shimmer, 'h-3 w-40 rounded bg-slate-200/60 dark:bg-slate-800/50')} />
            </div>
          </div>

          {/* Middle Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <div className={cn(shimmer, 'h-5 w-20 rounded-full')} />
            <div className={cn(shimmer, 'h-5 w-20 rounded-full')} />
            <div className={cn(shimmer, 'h-5 w-24 rounded-full')} />
          </div>

          {/* Bottom Action Controls Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className={cn(shimmer, 'h-8 w-16 rounded-lg')} />
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-16 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'clientele-row':
      return (
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70',
            className
          )}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(shimmer, 'h-12 w-12 shrink-0 rounded-xl')} />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-4.5 w-32 rounded-md')} />
                <div className={cn(shimmer, 'h-4 w-16 rounded-full')} />
              </div>
              <div className={cn(shimmer, 'h-3.5 w-48 rounded bg-slate-200/70 dark:bg-slate-800/60')} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto justify-between sm:justify-end">
            <div className={cn(shimmer, 'h-7.5 w-14 rounded-lg')} />
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-7.5 w-7.5 rounded-lg')} />
              <div className={cn(shimmer, 'h-7.5 w-7.5 rounded-lg')} />
              <div className={cn(shimmer, 'h-7.5 w-14 rounded-lg')} />
              <div className={cn(shimmer, 'h-7.5 w-7.5 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'announcement-card':
      return (
        <div
          className={cn(
            'rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4',
            className
          )}
          aria-hidden="true"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3 w-full">
              {/* Badge Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={cn(shimmer, 'h-5 w-20 rounded-full')} />
                <div className={cn(shimmer, 'h-5 w-24 rounded-full')} />
                <div className={cn(shimmer, 'h-5 w-16 rounded-full')} />
                <div className={cn(shimmer, 'h-5 w-20 rounded-full')} />
              </div>
              {/* Title & Body */}
              <div className="space-y-1.5">
                <div className={cn(shimmer, 'h-5 w-3/4 sm:w-1/2 rounded-md')} />
                <div className={cn(shimmer, 'h-4 w-full rounded')} />
              </div>
              {/* Navbar Preview Bar */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <div className={cn(shimmer, 'h-4 w-24 rounded')} />
                <div className={cn(shimmer, 'h-7 w-64 rounded-md')} />
              </div>
            </div>
            {/* Action Controls */}
            <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-3 md:pt-0 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <div className={cn(shimmer, 'h-8 w-16 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-16 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'integration-card':
      return (
        <div
          className={cn(
            'group relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 overflow-hidden',
            className
          )}
          aria-hidden="true"
        >
          <div className="space-y-3.5">
            {/* Header: Logo + Title + Sync badge */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div className={cn(shimmer, 'h-11 w-11 rounded-xl shrink-0')} />
                <div className="space-y-1.5">
                  <div className={cn(shimmer, 'h-4 w-28 rounded-md')} />
                  <div className={cn(shimmer, 'h-3 w-16 rounded')} />
                </div>
              </div>
              <div className={cn(shimmer, 'h-5 w-20 rounded-full shrink-0')} />
            </div>

            {/* Description lines */}
            <div className="space-y-1.5 pt-1">
              <div className={cn(shimmer, 'h-3.5 w-full rounded')} />
              <div className={cn(shimmer, 'h-3.5 w-4/5 rounded')} />
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <div className={cn(shimmer, 'h-5 w-14 rounded-md')} />
              <div className={cn(shimmer, 'h-5 w-16 rounded-md')} />
              <div className={cn(shimmer, 'h-5 w-12 rounded-md')} />
            </div>
          </div>

          {/* Card Footer: Action Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1">
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-16 rounded-lg')} />
              <div className={cn(shimmer, 'h-8 w-8 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'integration-row':
      return (
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70',
            className
          )}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(shimmer, 'h-7 w-7 rounded-lg shrink-0')} />
            <div className={cn(shimmer, 'h-11 w-11 rounded-xl shrink-0')} />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn(shimmer, 'h-4 w-32 rounded-md')} />
                <div className={cn(shimmer, 'h-3.5 w-16 rounded-full')} />
                <div className={cn(shimmer, 'h-4 w-20 rounded-full')} />
              </div>
              <div className={cn(shimmer, 'h-3 w-3/4 rounded')} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1">
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
              <div className={cn(shimmer, 'h-7 w-7 rounded-lg')} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn(shimmer, 'h-7.5 w-7.5 rounded-lg')} />
              <div className={cn(shimmer, 'h-7.5 w-7.5 rounded-lg')} />
              <div className={cn(shimmer, 'h-7.5 w-16 rounded-lg')} />
              <div className={cn(shimmer, 'h-7.5 w-7.5 rounded-lg')} />
            </div>
          </div>
        </div>
      );
    case 'kpi-card':
      return (
        <div
          className={cn(
            'rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between h-[76px] sm:h-[84px]',
            className
          )}
          aria-hidden="true"
        >
          <div className={cn(shimmer, 'h-3.5 w-20 sm:w-24 rounded')} />
          <div className="mt-1 flex items-baseline justify-between">
            <div className={cn(shimmer, 'h-6 sm:h-7 w-12 sm:w-16 rounded-md')} />
            <div className={cn(shimmer, 'h-4 sm:h-5 w-12 sm:w-14 rounded-full')} />
          </div>
        </div>
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
  variant,
  className,
  ...rest 
}) => {
  const isKpiGrid = variant === 'kpi-card';
  const isContentGrid = variant === 'content-card' || variant === 'testimonial-card' || variant === 'feature-card';
  const isMetricGrid = variant === 'metric-card';
  const isClienteleGrid = variant === 'clientele-card';
  const isIntegrationGrid = variant === 'integration-card';

  return (
    <div
      className={cn(
        isKpiGrid
          ? 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full'
          : isMetricGrid
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full'
          : isClienteleGrid
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full'
          : isIntegrationGrid
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full'
          : isContentGrid
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full'
          : 'flex flex-col gap-4 w-full',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonUnit key={i} variant={variant} {...rest} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default ATMSkeleton;
