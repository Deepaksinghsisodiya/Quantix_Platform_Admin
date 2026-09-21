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
  Banknote,
  Coins,
  CalendarDays,
  CalendarRange,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import type { Plan } from '../types/plan.types';
import { FLAVOUR_DISPLAY } from '../types/plan.types';

interface PlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleStatus: (planId: string) => void;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
    <span className="h-px w-4 bg-slate-200 dark:bg-slate-700" />
    {children}
  </p>
);

const InfoTile: React.FC<{
  icon: LucideIcon;
  tint: string;
  label: string;
  value: React.ReactNode;
}> = ({ icon: Icon, tint, label, value }) => (
  <div className="p-4 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#13151a] flex items-start gap-3">
    <div className={cn('p-2 rounded-lg mt-0.5', tint)}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

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

  const accentColor = plan.color || '#3b82f6';
  const isMuted = plan.status !== 'Active';

  const pricingTiles = [
    { label: 'Daily Price', value: formatCurrencyOrDash(plan.dailyPrice, currency), icon: Coins, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
    { label: 'Weekly Price', value: formatCurrencyOrDash(plan.weeklyPrice, currency), icon: CalendarDays, tint: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' },
    { label: 'Monthly Price', value: formatCurrencyOrDash(plan.monthlyPrice, currency), icon: Banknote, tint: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' },
    { label: 'Yearly Price', value: formatCurrencyOrDash(plan.yearlyPrice, currency), icon: CalendarRange, tint: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
  ];

  return (
    <ATMModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Subscription Plan: ${plan.name}`}
      subtitle="Complete subscription tier specifications, entitlement quotas, and pricing breakdown"
      size="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{plan.merchantCount > 0 ? `${plan.merchantCount.toLocaleString()} Subscribed Merchants` : 'No Subscribers Yet'}</span>
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
              className="rounded-xl border-slate-200 dark:border-slate-800 font-bold"
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
      <div className="space-y-6 py-1">
        {/* Identity banner */}
        <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}b3)`,
                boxShadow: `0 4px 12px ${accentColor}40`,
              }}
            >
              <Banknote size={22} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">{plan.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <ATMBadge color={plan.planType === 'Enterprise cloud' ? 'purple' : 'success'} label={plan.planType} size="md" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {FLAVOUR_DISPLAY[plan.flavour]}
                </span>
                {plan.popular && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Sparkles className="h-3 w-3" /> Popular Plan
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <StatusBadge status={plan.status} />
            <div className="flex items-center gap-2 bg-white/60 dark:bg-[#13151a]/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                {isMuted ? 'Disabled' : 'Enabled'}
              </p>
              <ATMSwitch
                name="detail-status-switch"
                checked={!isMuted}
                onChange={() => onToggleStatus(plan.id)}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Emphasis price + quick capacity chips */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-[#13151a]/80 p-5 flex flex-col xl:flex-row gap-5 xl:items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Monthly Subscription</p>
            <div className="flex items-end gap-1.5 mt-1.5">
              <span
                className={cn('text-4xl font-black tracking-tighter tabular-nums leading-none', isMuted ? 'text-slate-400' : 'text-slate-900 dark:text-white')}
                style={isMuted ? undefined : { color: accentColor }}
              >
                {formatCurrencyOrDash(plan.monthlyPrice, currency)}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">/month</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1.5">
              Billed {formatCurrencyOrDash(plan.yearlyPrice, currency)}/yr · {formatCurrencyOrDash(plan.dailyPrice, currency)}/day
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 max-w-lg">
            <InfoTile
              icon={MapPin}
              tint="bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              label="Stores"
              value={plan.maxLocations === 0 ? 'Unlimited' : plan.maxLocations}
            />
            <InfoTile
              icon={Monitor}
              tint="bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              label="Registers"
              value={plan.maxTerminals === 0 ? 'Unlimited' : plan.maxTerminals}
            />
            <InfoTile
              icon={Users}
              tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              label="Subscribers"
              value={plan.merchantCount?.toLocaleString?.() ?? plan.merchantCount}
            />
          </div>
        </div>

        {/* Pricing cycles */}
        <div className="space-y-3">
          <SectionLabel>Pricing Cycles</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pricingTiles.map((p, i) => (
              <InfoTile key={i} icon={p.icon} tint={p.tint} label={p.label} value={p.value} />
            ))}
          </div>
        </div>

        {/* Specs + capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="space-y-3">
            <SectionLabel>Plan Specs</SectionLabel>
            <div className="space-y-3">
              <InfoTile
                icon={Layers}
                tint="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                label="Priority Rank"
                value={`Rank #${plan.priority}`}
              />
              <InfoTile
                icon={Clock}
                tint="bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                label="Free Trial"
                value={plan.trialPeriod ? `${plan.trialPeriod} days` : 'No free trial'}
              />
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <SectionLabel>Capabilities ({plan.features.length})</SectionLabel>
            {plan.features.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                All standard POS capabilities included.
              </p>
            ) : (
              <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl border border-transparent"
                  >
                    {feature.included ? (
                      <span
                        className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${accentColor}1a`,
                          color: accentColor,
                          border: `1px solid ${accentColor}33`,
                        }}
                      >
                        <Check className="h-3 w-3 stroke-[3.5]" />
                      </span>
                    ) : (
                      <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-800/60">
                        <X className="h-3 w-3 stroke-[2.5]" />
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-xs font-semibold leading-relaxed',
                        feature.included
                          ? 'text-slate-700 dark:text-slate-200'
                          : 'text-slate-400 line-through dark:text-slate-600',
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ATMModal>
  );
};

export default PlanDetailModal;