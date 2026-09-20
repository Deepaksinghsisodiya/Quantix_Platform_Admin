import React from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import {
  Check,
  X,
  Pencil,
  Archive,
  Users,
  MapPin,
  Monitor,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Plan } from '../types/plan.types';

interface PlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleStatus: (planId: string) => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();
  if (!plan) return null;

  return (
    <ATMModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Subscription Plan: ${plan.name}`}
      subtitle="Complete subscription tier specifications, merchant entitlement quotas, and pricing breakdown"
      size="3xl"
      footer={
        <div className="flex items-center justify-between w-full border-t border-gray-150/80 dark:border-gray-800/80 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{plan.merchantCount} Subscribed Merchants</span>
          </div>

          <div className="flex items-center gap-2">
            <ATMButton
              variant="outline"
              size="sm"
              icon={Pencil}
              onClick={() => {
                onClose();
                onEdit(plan);
              }}
              className="rounded-xl border-gray-200 dark:border-gray-800 font-bold"
            >
              Edit Plan
            </ATMButton>
            <ATMButton
              variant="ghost"
              size="sm"
              icon={Archive}
              onClick={() => {
                onClose();
                onDelete(plan);
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold px-3"
            >
              Remove Plan
            </ATMButton>
          </div>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Top Summary Header Banner */}
        <div
          className="p-6 rounded-[24px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
          style={{
            borderColor: `${plan.color}25`,
            background: `linear-gradient(135deg, ${plan.color}0a 0%, ${plan.color}15 100%)`,
          }}
        >
          {/* Subtle background blur circle */}
          <div
            className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: plan.color }}
          />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <ATMBadge
                color={plan.planType === 'Enterprise cloud' ? 'purple' : 'success'}
                label={plan.planType}
                size="md"
              />
              {plan.popular && (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Popular Plan
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed max-w-md">
              {plan.planType === 'Enterprise cloud'
                ? 'Centralized Cloud Multi-Store Management with Real-time Terminal Sync.'
                : 'Standalone Local POS Hardware Terminal with Offline Cash Register & Settlement.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 relative z-10">
            <div>
              <p className="text-xs font-black text-gray-800 dark:text-gray-200">Active Status</p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{plan.status === 'Active' ? 'Enabled for signups' : 'Disabled'}</p>
            </div>
            <ATMSwitch
              name="detail-status-switch"
              checked={plan.status === 'Active'}
              onChange={() => onToggleStatus(plan.id)}
              size="sm"
            />
          </div>
        </div>

        {/* Pricing Cycles Breakdowns */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Pricing Cycles</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-[20px] bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Daily Price</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatCurrencyOrDash(plan.dailyPrice, currency)}</p>
            </div>
            <div className="p-3.5 rounded-[20px] bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Weekly Price</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatCurrencyOrDash(plan.weeklyPrice, currency)}</p>
            </div>
            <div className="p-3.5 rounded-[20px] bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Monthly Price</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatCurrencyOrDash(plan.monthlyPrice, currency)}</p>
            </div>
            <div className="p-3.5 rounded-[20px] bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Yearly Price</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatCurrencyOrDash(plan.yearlyPrice, currency)}</p>
            </div>
          </div>
        </div>

        {/* 2 Capacity Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-[20px] bg-gray-50/50 dark:bg-gray-950/30 border border-gray-200/80 dark:border-gray-800/80 space-y-1 hover:shadow-md transition-shadow">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Allowed Outlets</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-1.5">
              <MapPin className="h-5 w-5 text-blue-500 shrink-0" /> {plan.maxLocations === 0 ? 'Unlimited' : plan.maxLocations}
            </p>
            <p className="text-[10px] font-bold text-gray-450 dark:text-gray-500">Max merchant stores</p>
          </div>

          <div className="p-4 rounded-[20px] bg-gray-50/50 dark:bg-gray-950/30 border border-gray-200/80 dark:border-gray-800/80 space-y-1 hover:shadow-md transition-shadow">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">POS Terminals</span>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight flex items-center gap-1.5">
              <Monitor className="h-5 w-5 text-purple-500 shrink-0" /> {plan.maxTerminals === 0 ? 'Unlimited' : plan.maxTerminals}
            </p>
            <p className="text-[10px] font-bold text-gray-450 dark:text-gray-500">Max POS registers</p>
          </div>
        </div>

        {/* Detailed Entitlements & Configuration Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left: General Settings & Quotas */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-150 dark:border-gray-800/80 pb-2">
              Plan Quotas & Specs
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-800 text-xs transition-colors hover:border-gray-300 dark:hover:border-gray-700">
                <span className="font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" /> Free Trial Duration
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white">
                  {plan.trialPeriod ? `${plan.trialPeriod} Days Free Trial` : 'No Free Trial'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-800 text-xs transition-colors hover:border-gray-300 dark:hover:border-gray-700">
                <span className="font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" /> Priority Rank
                </span>
                <span className="font-extrabold text-purple-650 dark:text-purple-400">Rank: {plan.priority}</span>
              </div>
            </div>
          </div>

          {/* Right: Included & Excluded Features */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-150 dark:border-gray-800/80 pb-2">
              Marketing Bullet Points ({plan.features.length})
            </h3>

            <ul className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800/40">
                  {feature.included ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/10">
                      <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 flex items-center justify-center shrink-0 mt-0.5 border border-gray-100 dark:border-gray-800/60">
                      <X className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  )}
                  <span
                    className={cn(
                      'text-xs font-semibold leading-relaxed transition-colors',
                      feature.included
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 line-through dark:text-gray-600'
                    )}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ATMModal>
  );
};
export default PlanDetailModal;
