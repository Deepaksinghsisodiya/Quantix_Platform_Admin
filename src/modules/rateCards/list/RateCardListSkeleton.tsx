import { ATMSkeleton } from '@/shared/ui';
import { CreditCard } from 'lucide-react';

/**
 * Rate Cards page skeleton — mirrors the Feature Rate Cards layout:
 * page header (icon + title + search + actions), 4 stats tiles, and the
 * 4 category sections (modules / payments / services / limits) each with
 * a grid of item cards. Shown while the lazy route chunk loads; the page
 * itself renders synchronously from the local rate-cards store.
 */
export const RateCardListSkeleton: React.FC = () => (
  <div className="w-full max-w-[1600px] mx-auto space-y-6 animate-fade-in">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 dark:bg-surface-850">
          <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="space-y-2">
          <ATMSkeleton width="230px" height="18px" className="rounded-lg" />
          <ATMSkeleton width="300px" height="12px" className="rounded" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ATMSkeleton width="220px" height="38px" className="rounded-lg" />
        <ATMSkeleton width="124px" height="38px" className="rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <ATMSkeleton key={i} variant="card" height="118px" />
      ))}
    </div>

    <div className="space-y-8">
      {[0, 1, 2, 3].map((section) => (
        <div key={section} className="space-y-3">
          <ATMSkeleton width="180px" height="16px" className="rounded-lg" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200/80 bg-white/95 p-3 dark:border-gray-800/80 dark:bg-[#13151a]/95">
                <div className="flex items-center justify-between gap-3">
                  <ATMSkeleton width="55%" height="14px" className="rounded" />
                  <ATMSkeleton width="48px" height="14px" className="rounded" />
                </div>
                <ATMSkeleton width="80%" height="12px" className="mt-2 rounded" />
                <div className="mt-3 flex items-center justify-between">
                  <ATMSkeleton width="90px" height="12px" className="rounded" />
                  <ATMSkeleton width="62px" height="22px" className="rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RateCardListSkeleton;