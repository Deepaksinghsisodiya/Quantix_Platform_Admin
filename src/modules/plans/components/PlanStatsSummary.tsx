import React from 'react';
import { Layers, ShieldCheck, Power, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PlanStatsSummaryProps {
  totalPlans: number;
  activeCount: number;
  inactiveCount: number;
  totalMerchants: number;
}

export const PlanStatsSummary: React.FC<PlanStatsSummaryProps> = ({
  totalPlans,
  activeCount,
  inactiveCount,
  totalMerchants,
}) => {
  const cards = [
    {
      label: 'Configured Plans',
      value: totalPlans,
      icon: Layers,
      themeColor: 'blue',
      bgClass: 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10 dark:border-blue-500/20',
      iconClass: 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100/50 dark:border-blue-900/30',
    },
    {
      label: 'Active Tiers',
      value: activeCount,
      icon: ShieldCheck,
      themeColor: 'emerald',
      bgClass: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20',
      iconClass: 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100/50 dark:border-emerald-900/30',
    },
    {
      label: 'Legacy / Inactive',
      value: inactiveCount,
      icon: Power,
      themeColor: 'amber',
      bgClass: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20',
      iconClass: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100/50 dark:border-amber-900/30',
    },
    {
      label: 'Active Subscribers',
      value: totalMerchants,
      icon: Users,
      themeColor: 'purple',
      bgClass: 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/10 dark:border-purple-500/20',
      iconClass: 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-100/50 dark:border-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="group relative overflow-hidden rounded-[24px] border border-slate-150 dark:border-slate-800/80 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/40 dark:to-slate-900/10 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
          >
            {/* Glowing top line accent */}
            <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300 opacity-30 group-hover:opacity-100", 
              card.themeColor === 'blue' ? 'from-blue-500 to-indigo-500' :
              card.themeColor === 'emerald' ? 'from-emerald-500 to-teal-500' :
              card.themeColor === 'amber' ? 'from-amber-500 to-orange-500' :
              'from-purple-500 to-pink-500'
            )} />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                  {card.label}
                </span>
                <span className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tighter block leading-none">
                  {card.value}
                </span>
              </div>
              <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110', card.iconClass)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
