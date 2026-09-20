import React from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { Check, X, Pencil, Archive, Users, MapPin, Monitor } from 'lucide-react';
import type { Plan } from '../types/plan.types';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleStatus: (planId: string) => void;
  onViewDetails: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}) => {
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();
  const annualSavingsPercent =
    plan.monthlyPrice > 0
      ? Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
      : 0;

  const isPopular = plan.popular;
  const isInactive = plan.status === 'Inactive';
  const accentColor = plan.color || '#3b82f6';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[32px] border transition-all duration-500',
        'bg-white dark:bg-slate-900/60 backdrop-blur-xl',
        isInactive
          ? 'border-slate-100 dark:border-slate-900 opacity-60'
          : isPopular
            ? 'border-slate-900 dark:border-slate-200'
            : 'border-slate-150/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)]',
        'hover:-translate-y-2 hover:border-slate-400 dark:hover:border-slate-650'
      )}
      style={{
        boxShadow: !isInactive
          ? `hover: 0 20px 40px -15px ${accentColor}20`
          : undefined,
      }}
    >
      {/* Decorative top gradient header section */}
      <div 
        className="h-28 relative flex items-end p-6 border-b border-slate-100 dark:border-slate-800/40"
        style={{
          background: `linear-gradient(135deg, ${accentColor}0d 0%, ${accentColor}1c 100%)`,
        }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <StatusBadge status={plan.status} />
          <ATMSwitch
            name={`card-switch-${plan.id}`}
            checked={plan.status === 'Active'}
            onChange={() => onToggleStatus(plan.id)}
            size="sm"
          />
        </div>

        <div className="space-y-1 z-10">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
              plan.planType === 'Enterprise cloud'
                ? 'bg-purple-100/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                : 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
            )}
          >
            {plan.planType}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {plan.name}
          </h3>
        </div>
      </div>

      {/* Main card body */}
      <div className="p-7 space-y-6 flex-1 flex flex-col justify-between">
        
        {/* Pricing block */}
        <div className="space-y-1.5 cursor-pointer" onClick={() => onViewDetails(plan)}>
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrencyOrDash(plan.monthlyPrice, currency)}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">/mo</span>
          </div>
          
          <div className="flex items-center justify-between">
            {annualSavingsPercent > 0 ? (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>Billed {formatCurrencyOrDash(plan.yearlyPrice, currency)}/yr</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  Save {annualSavingsPercent}%
                </span>
              </p>
            ) : (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Billed monthly</span>
            )}
            <span className="text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500">Priority: {plan.priority}</span>
          </div>
        </div>

        {/* Quotas & Capacity Lists */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800/40">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-blue-500" /> Stores
            </span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {plan.maxLocations === 0 ? 'Unlimited' : `${plan.maxLocations} Locations`}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Monitor className="h-3 w-3 text-purple-500" /> Registers
            </span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {plan.maxTerminals === 0 ? 'Unlimited' : `${plan.maxTerminals} Terminals`}
            </p>
          </div>
        </div>

        {/* Capabilities Checklist */}
        <div className="space-y-3 pt-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
            Capabilities Included
          </span>
          <ul className="space-y-3">
            {plan.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                {feature.included ? (
                  <div className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3.5]" />
                  </div>
                ) : (
                  <div className="h-4.5 w-4.5 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-350 dark:text-slate-655 flex items-center justify-center shrink-0">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" />
                  </div>
                )}
                <span
                  className={cn(
                    'text-xs font-semibold leading-none',
                    feature.included
                      ? 'text-slate-700 dark:text-slate-250'
                      : 'text-slate-400 line-through dark:text-slate-655'
                  )}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-7 pb-7 pt-4 bg-slate-50/20 dark:bg-slate-950/20 flex items-center justify-between border-t border-slate-100 dark:border-slate-900/50">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-450 dark:text-slate-500">
          <Users className="h-4 w-4 text-slate-400" />
          <span>{plan.merchantCount} subscribers</span>
        </div>

        <div className="flex items-center gap-2">
          <ATMButton
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(plan)}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl px-2 h-8 text-[11px] font-bold"
          >
            Details
          </ATMButton>
          <button
            type="button"
            onClick={() => onEdit(plan)}
            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all shadow-sm active:scale-[0.97]"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(plan)}
            className="inline-flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl p-2 transition-all"
            title="Remove Plan"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default PlanCard;
