import React from 'react';
import { cn } from '@/lib/utils/cn';

type ATMPageSkeletonVariant =
  | 'dashboard'
  | 'stats'
  | 'table'
  | 'detail'
  | 'panel'
  | 'header';

export interface ATMPageSkeletonProps {
  /** Page layout to simulate while data loads. */
  variant?: ATMPageSkeletonVariant;
  /** Number of stat cards for `dashboard` / `stats` (default 4). */
  cards?: number;
  /** Number of rows for `table` (default 6). */
  rows?: number;
  /** Height override for the `panel` variant (default "18rem"). */
  height?: string;
  /** Title bar width for `header` (default "200px"). */
  titleWidth?: string;
  className?: string;
}

const BLOCK = 'animate-pulse bg-slate-200 dark:bg-slate-800';
const CARD =
  'rounded-2xl border border-slate-200/80 bg-white/95 dark:border-gray-800/80 dark:bg-[#13151a]/95';
const ROOT = 'flex flex-1 flex-col gap-6 w-full animate-fade-in';

function HeaderSkeleton({ titleWidth = '200px' }: { titleWidth?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <div className="space-y-2">
        <div className={cn(BLOCK, 'h-6 rounded-lg')} style={{ width: titleWidth }} />
        <div className={cn(BLOCK, 'h-3.5 w-[300px] max-w-full rounded-md')} />
      </div>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <div className={cn(BLOCK, 'h-9 w-24 rounded-xl')} />
        <div className={cn(BLOCK, 'h-9 w-28 rounded-xl')} />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className={cn(CARD, 'flex h-[150px] flex-col justify-between p-5')}>
      <div className="flex items-center gap-3">
        <div className={cn(BLOCK, 'h-9 w-9 rounded-xl')} />
        <div className={cn(BLOCK, 'h-3.5 w-20 rounded-md')} />
      </div>
      <div className={cn(BLOCK, 'h-8 w-28 rounded-lg')} />
      <div className="flex items-center gap-2">
        <div className={cn(BLOCK, 'h-3.5 w-14 rounded-md')} />
        <div className={cn(BLOCK, 'h-3.5 w-10 rounded-md')} />
      </div>
    </div>
  );
}

function CardsGrid({ cards }: { cards: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

function DashboardSkeleton({ cards, height, titleWidth, className }: Required<Pick<ATMPageSkeletonProps, 'cards' | 'height' | 'titleWidth'>> & { className?: string }) {
  return (
    <div className={cn(ROOT, className)}>
      <HeaderSkeleton titleWidth={titleWidth} />
      <CardsGrid cards={cards} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={cn(CARD, 'lg:col-span-2')} style={{ height }} />
        <div className={cn(CARD, 'lg:col-span-1')} style={{ height }} />
      </div>
    </div>
  );
}

function StatsSkeleton({ cards, titleWidth, className }: Pick<ATMPageSkeletonProps, 'cards' | 'titleWidth'> & { className?: string }) {
  return (
    <div className={cn(ROOT, className)}>
      <HeaderSkeleton titleWidth={titleWidth} />
      <CardsGrid cards={cards ?? 4} />
    </div>
  );
}

function TableSkeleton({ rows, titleWidth, className }: Pick<ATMPageSkeletonProps, 'rows' | 'titleWidth'> & { className?: string }) {
  return (
    <div className={cn(ROOT, className)}>
      <HeaderSkeleton titleWidth={titleWidth} />
      <div className={cn(CARD, 'overflow-hidden')}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 sm:px-6 dark:border-slate-800">
          <div className={cn(BLOCK, 'h-9 w-56 max-w-full rounded-lg')} />
          <div className="hidden items-center gap-2 sm:flex">
            <div className={cn(BLOCK, 'h-9 w-24 rounded-lg')} />
            <div className={cn(BLOCK, 'h-9 w-24 rounded-lg')} />
          </div>
        </div>
        <div className="flex flex-col">
          {Array.from({ length: rows ?? 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 sm:px-6 dark:border-slate-800/60"
            >
              <div className={cn(BLOCK, 'h-3.5 w-6 rounded')} />
              <div className={cn(BLOCK, 'h-3.5 flex-1 rounded')} />
              <div className={cn(BLOCK, 'hidden h-3.5 w-24 rounded sm:block')} />
              <div className={cn(BLOCK, 'hidden h-3.5 w-20 rounded md:block')} />
              <div className={cn(BLOCK, 'hidden h-3.5 w-16 rounded lg:block')} />
              <div className={cn(BLOCK, 'h-6 w-16 rounded-md')} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton({ titleWidth, className }: Pick<ATMPageSkeletonProps, 'titleWidth'> & { className?: string }) {
  return (
    <div className={cn(ROOT, className)}>
      <HeaderSkeleton titleWidth={titleWidth} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={cn(CARD, 'space-y-5 p-6')}>
            <div className={cn(BLOCK, 'h-4 w-36 rounded-md')} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className={cn(BLOCK, 'h-3 w-20 rounded-md')} />
                  <div className={cn(BLOCK, i % 3 === 1 ? 'h-10 w-full rounded-xl' : 'h-10 w-full rounded-xl bg-slate-200/60 dark:bg-slate-800/60')} />
                </div>
              ))}
            </div>
          </div>
          <div className={cn(CARD, 'space-y-4 p-6')}>
            <div className={cn(BLOCK, 'h-4 w-44 rounded-md')} />
            <div className={cn(BLOCK, 'h-24 w-full rounded-2xl')} />
          </div>
        </div>
        <div className="space-y-6">
          <div className={cn(CARD, 'space-y-4 p-6')}>
            <div className="flex items-center gap-3">
              <div className={cn(BLOCK, 'h-12 w-12 rounded-full')} />
              <div className="space-y-2">
                <div className={cn(BLOCK, 'h-3.5 w-28 rounded-md')} />
                <div className={cn(BLOCK, 'h-3 w-20 rounded-md')} />
              </div>
            </div>
            <div className={cn(BLOCK, 'h-10 w-full rounded-xl')} />
          </div>
          <div className={cn(CARD, 'space-y-3 p-6')}>
            <div className={cn(BLOCK, 'h-4 w-32 rounded-md')} />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className={cn(BLOCK, 'h-3.5 w-24 rounded-md')} />
                <div className={cn(BLOCK, 'h-3.5 w-12 rounded-md')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelSkeleton({ height, titleWidth, className }: Pick<ATMPageSkeletonProps, 'height' | 'titleWidth'> & { className?: string }) {
  return (
    <div className={cn(ROOT, className)}>
      <HeaderSkeleton titleWidth={titleWidth} />
      <div className={cn(CARD, 'p-1')} style={{ height: height ?? '18rem' }} />
    </div>
  );
}

/**
 * Reusable page-level skeleton. Renders a realistic placeholder layout (header bar,
 * stat cards, table rows or a detail/form grid) that matches the design system's
 * card chrome. Swap it into any wrapper's `isLoading` branch — one line instead of
 * hand-built `ATMSkeleton` grids.
 */
export const ATMPageSkeleton: React.FC<ATMPageSkeletonProps> = ({
  variant = 'dashboard',
  cards = 4,
  rows,
  height = '360px',
  titleWidth = '200px',
  className,
}) => {
  const wrapperClass = className;

  switch (variant) {
    case 'stats':
      return <StatsSkeleton cards={cards} titleWidth={titleWidth} className={wrapperClass} />;
    case 'table':
      return <TableSkeleton rows={rows} titleWidth={titleWidth} className={wrapperClass} />;
    case 'detail':
      return <DetailSkeleton titleWidth={titleWidth} className={wrapperClass} />;
    case 'panel':
      return <PanelSkeleton height={height} titleWidth={titleWidth} className={wrapperClass} />;
    case 'header':
      return <div className={cn(ROOT, wrapperClass)}><HeaderSkeleton titleWidth={titleWidth} /></div>;
    case 'dashboard':
    default:
      return <DashboardSkeleton cards={cards} height={height} titleWidth={titleWidth} className={wrapperClass} />;
  }
};

export default ATMPageSkeleton;