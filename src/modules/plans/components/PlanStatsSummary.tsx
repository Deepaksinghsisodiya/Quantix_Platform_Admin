import React from 'react';
import { Layers, ShieldCheck, Power, Users } from 'lucide-react';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { cn } from '@/lib/utils/cn';

interface PlanStatsSummaryProps {
  totalPlans: number;
  activeCount: number;
  inactiveCount: number;
  totalMerchants: number;
  isLoading?: boolean;
}

const shimmer = 'animate-pulse bg-slate-200/70 dark:bg-slate-800/60';

export const PlanStatsSummary: React.FC<PlanStatsSummaryProps> = ({
  totalPlans,
  activeCount,
  inactiveCount,
  totalMerchants,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#13151a]/80 p-5 shadow-sm"
          >
            <div className="space-y-3">
              <div className={cn(shimmer, 'h-10 w-10 rounded-xl')} />
              <div className="space-y-2.5">
                <div className={cn(shimmer, 'h-3 w-24 rounded')} />
                <div className={cn(shimmer, 'h-8 w-16 rounded-lg')} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ATMStatsCard
        label="Configured Plans"
        value={totalPlans}
        icon={Layers}
        variant="accent"
        description="All configured subscription tiers"
      />
      <ATMStatsCard
        label="Active Tiers"
        value={activeCount}
        icon={ShieldCheck}
        variant="emerald"
        description="Plans active and accepting signups"
      />
      <ATMStatsCard
        label="Legacy / Inactive"
        value={inactiveCount}
        icon={Power}
        variant="amber"
        description="Inactive or deprecated plans"
      />
      <ATMStatsCard
        label="Active Subscribers"
        value={totalMerchants}
        icon={Users}
        variant="purple"
        description="Merchants currently subscribed"
      />
    </div>
  );
};