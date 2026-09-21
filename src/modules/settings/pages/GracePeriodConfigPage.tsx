import React, { useState } from 'react';
import { Save, Clock, Store, Cloud, Building2, AlertTriangle, Activity, Lock, Ban, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { cn } from '@/lib/utils/cn';
import {
  useGetGracePeriodsQuery,
  useUpdateGracePeriodMutation,
  type GracePeriodPolicy,
} from '../services/settingsApi';

/**
 * 2026-08-08 (user-locked grace redesign). Four stages, ALL anchored to the token
 * expiry date — not chained durations:
 *   Warning    — begins N days BEFORE expiry (default 3). Full functionality.
 *   Degraded   — begins N days AFTER expiry (default 0 = at expiry).
 *   Restricted — begins N days after expiry (default 1).
 *   Suspended  — begins N days after expiry (default 2). Terminal until recharge.
 * One policy per plan type; stamped into tokens at issuance and overridable there.
 */

const PLAN_TYPES: ReadonlyArray<{
  wire: GracePeriodPolicy['planType'];
  label: string;
  icon: typeof Store;
}> = [
  { wire: 'StandalonePos', label: 'Standalone POS', icon: Store },
  { wire: 'StandaloneCloud', label: 'Standalone Cloud', icon: Cloud },
  { wire: 'EnterpriseCloud', label: 'Enterprise Cloud', icon: Building2 },
];

interface StageField {
  key: 'warningDays' | 'degradedAfterDays' | 'restrictedAfterDays' | 'suspendedAfterDays';
  name: string;
  timing: string;
  description: string;
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  line: string;
}

const STAGES: StageField[] = [
  {
    key: 'warningDays',
    name: 'Warning',
    timing: 'days BEFORE expiry',
    description: 'Advance notice while the token is still valid. Everything keeps working — notifications only.',
    icon: AlertTriangle,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    line: 'bg-amber-400 dark:bg-amber-500',
  },
  {
    key: 'degradedAfterDays',
    name: 'Degraded',
    timing: 'days after expiry',
    description: 'Token has expired. Advance features stop; core billing continues. 0 = starts at expiry.',
    icon: Activity,
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    line: 'bg-orange-400 dark:bg-orange-500',
  },
  {
    key: 'restrictedAfterDays',
    name: 'Restricted',
    timing: 'days after expiry',
    description: 'Billing stops. The merchant can still view and download their data and reports.',
    icon: Lock,
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    line: 'bg-red-400 dark:bg-red-500',
  },
  {
    key: 'suspendedAfterDays',
    name: 'Suspended',
    timing: 'days after expiry',
    description: 'Terminal state — blocked until a new token is applied. There is no later stage.',
    icon: Ban,
    color: 'text-red-900 dark:text-red-200',
    bgColor: 'bg-red-100/80 dark:bg-red-900/40',
    line: 'bg-red-600 dark:bg-red-400',
  },
];

type Values = Record<StageField['key'], number>;

function PolicyCard({ policy, label, icon: Icon }: { policy: GracePeriodPolicy; label: string; icon: typeof Store }) {
  const [updatePolicy, { isLoading: saving }] = useUpdateGracePeriodMutation();
  const [values, setValues] = useState<Values>({
    warningDays: policy.warningDays,
    degradedAfterDays: policy.degradedAfterDays,
    restrictedAfterDays: policy.restrictedAfterDays,
    suspendedAfterDays: policy.suspendedAfterDays,
  });

  const dirty =
    values.warningDays !== policy.warningDays ||
    values.degradedAfterDays !== policy.degradedAfterDays ||
    values.restrictedAfterDays !== policy.restrictedAfterDays ||
    values.suspendedAfterDays !== policy.suspendedAfterDays;

  const orderInvalid =
    values.degradedAfterDays > values.restrictedAfterDays ||
    values.restrictedAfterDays > values.suspendedAfterDays;

  const handleSave = async () => {
    if (orderInvalid) return;
    try {
      await updatePolicy({ planType: policy.planType, ...values }).unwrap();
      toast.success(`${label} grace policy saved.`);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || `Failed to save ${label} grace policy.`);
    }
  };

  return (
    <ATMCard
      className="glass-card"
      header={
        <div className="relative flex items-center gap-3">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{label}</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">Grace period policy — stamped into tokens at issuance</p>
          </div>
          <ATMButton
            variant="primary"
            size="sm"
            icon={Save}
            className="ml-auto shrink-0"
            isLoading={saving}
            disabled={!dirty || orderInvalid}
            onClick={handleSave}
          >
            Save
          </ATMButton>
        </div>
      }
    >
      {/* Timeline strip */}
      <div className="flex flex-wrap items-center gap-1.5 px-1 pb-5">
        <span className="inline-flex items-center rounded-lg bg-amber-100/70 dark:bg-amber-900/30 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
          −{values.warningDays}d Warning
        </span>
        <ArrowRight size={12} className="text-slate-400" />
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <Clock size={10} strokeWidth={3} /> Expiry
        </span>
        <ArrowRight size={12} className="text-slate-400" />
        <span className="inline-flex items-center rounded-lg bg-orange-100/70 dark:bg-orange-900/30 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-300">
          +{values.degradedAfterDays}d Degraded
        </span>
        <ArrowRight size={12} className="text-slate-400" />
        <span className="inline-flex items-center rounded-lg bg-red-100/70 dark:bg-red-900/30 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">
          +{values.restrictedAfterDays}d Restricted
        </span>
        <ArrowRight size={12} className="text-slate-400" />
        <span className="inline-flex items-center rounded-lg bg-red-200/80 dark:bg-red-900/50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-900 dark:text-red-200">
          +{values.suspendedAfterDays}d Suspended
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="relative overflow-hidden rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 p-4"
          >
            <div className={cn('absolute inset-x-0 top-0 h-0.5', stage.line)} />
            <div className="mb-3 flex items-center gap-2.5">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', stage.bgColor, stage.color)}>
                <stage.icon size={16} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <span className={cn('block text-sm font-bold leading-tight', stage.color)}>{stage.name}</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {stage.timing}
                </span>
              </div>
            </div>
            <ATMTextField
              name={`${policy.planType}-${stage.key}`}
              type="number"
              label="Days"
              value={values[stage.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [stage.key]: Math.max(0, parseInt(e.target.value) || 0) }))
              }
              min={0}
              max={60}
              size="sm"
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">
              {stage.description}
            </p>
          </div>
        ))}
      </div>

      {orderInvalid && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200/80 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 p-3">
          <AlertTriangle size={15} className="mt-0.5 text-red-500 shrink-0" />
          <p className="text-xs font-bold text-red-600 dark:text-red-400">
            Stage order invalid — Degraded ≤ Restricted ≤ Suspended (days after expiry). Adjust the values before saving.
          </p>
        </div>
      )}
    </ATMCard>
  );
}

export function GracePeriodConfigPage() {
  const { data, isLoading, isError, refetch } = useGetGracePeriodsQuery();
  const policies = data?.data ?? [];

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter">
      {/* Header — title matches the sidebar label. */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
          <Clock size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Grace Period
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Four stages anchored to the token expiry date — Warning before expiry; Degraded, Restricted
            and Suspended after it. Configured per plan type, stamped into tokens at issuance, and
            overridable in Token Config.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <ATMSkeleton className="h-48 w-full" />
          <ATMSkeleton className="h-48 w-full" />
          <ATMSkeleton className="h-48 w-full" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/20 p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Failed to load grace policies.
          </p>
          <ATMButton variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </ATMButton>
        </div>
      ) : (
        PLAN_TYPES.map(({ wire, label, icon }) => {
          const policy = policies.find((p: GracePeriodPolicy) => p.planType === wire);
          return policy ? <PolicyCard key={wire} policy={policy} label={label} icon={icon} /> : null;
        })
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-1">
        Changes apply to newly issued tokens only — tokens already in the field keep the grace
        policy encoded at issuance.
      </p>
    </div>
  );
}

export default GracePeriodConfigPage;