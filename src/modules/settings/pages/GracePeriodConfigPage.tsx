import React, { useState } from 'react';
import { Save, Clock } from 'lucide-react';
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

const PLAN_TYPES: ReadonlyArray<{ wire: GracePeriodPolicy['planType']; label: string }> = [
  { wire: 'StandalonePos', label: 'Standalone POS' },
  { wire: 'StandaloneCloud', label: 'Standalone Cloud' },
  { wire: 'EnterpriseCloud', label: 'Enterprise Cloud' },
];

interface StageField {
  key: 'warningDays' | 'degradedAfterDays' | 'restrictedAfterDays' | 'suspendedAfterDays';
  name: string;
  timing: string;
  description: string;
  color: string;
  bgColor: string;
}

const STAGES: StageField[] = [
  {
    key: 'warningDays',
    name: 'Warning',
    timing: 'days BEFORE expiry',
    description: 'Advance notice while the token is still valid. Everything keeps working — notifications only.',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100/60 dark:bg-amber-900/30',
  },
  {
    key: 'degradedAfterDays',
    name: 'Degraded',
    timing: 'days after expiry',
    description: 'Token has expired. Advance features stop; core billing continues. 0 = starts at expiry.',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100/60 dark:bg-orange-900/30',
  },
  {
    key: 'restrictedAfterDays',
    name: 'Restricted',
    timing: 'days after expiry',
    description: 'Billing stops. The merchant can still view and download their data and reports.',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100/60 dark:bg-red-900/30',
  },
  {
    key: 'suspendedAfterDays',
    name: 'Suspended',
    timing: 'days after expiry',
    description: 'Terminal state — blocked until a new token is applied. There is no later stage.',
    color: 'text-red-900 dark:text-red-200',
    bgColor: 'bg-red-200/70 dark:bg-red-900/50',
  },
];

type Values = Record<StageField['key'], number>;

function PolicyCard({ policy, label }: { policy: GracePeriodPolicy; label: string }) {
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
    if (orderInvalid) {
      toast.error('Stage order invalid — Degraded ≤ Restricted ≤ Suspended (days after expiry).');
      return;
    }
    try {
      await updatePolicy({ planType: policy.planType, ...values }).unwrap();
      toast.success(`${label} grace policy saved.`);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || `Failed to save ${label} grace policy.`);
    }
  };

  return (
    <ATMCard className="glass-card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-black text-gray-900 dark:text-white">{label}</h3>
        <ATMButton
          variant="primary"
          size="sm"
          icon={Save}
          isLoading={saving}
          disabled={!dirty}
          onClick={handleSave}
        >
          Save
        </ATMButton>
      </div>

      {/* Timeline strip */}
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-amber-600 dark:text-amber-400">−{values.warningDays}d Warning</span>
        <span>→</span>
        <span className="text-gray-600 dark:text-gray-300">Expiry</span>
        <span>→</span>
        <span className="text-orange-600 dark:text-orange-400">+{values.degradedAfterDays}d Degraded</span>
        <span>→</span>
        <span className="text-red-600 dark:text-red-400">+{values.restrictedAfterDays}d Restricted</span>
        <span>→</span>
        <span className="text-red-800 dark:text-red-300">+{values.suspendedAfterDays}d Suspended</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => (
          <div key={stage.key} className={cn('rounded-xl p-4', stage.bgColor)}>
            <div className="mb-2">
              <span className={cn('text-sm font-bold', stage.color)}>{stage.name}</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {stage.timing}
              </span>
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
            <p className="mt-3 text-xs leading-relaxed text-gray-650 dark:text-gray-400 font-semibold">
              {stage.description}
            </p>
          </div>
        ))}
      </div>

      {orderInvalid && (
        <p className="mt-3 text-xs font-bold text-red-600 dark:text-red-400">
          Stage order invalid — Degraded ≤ Restricted ≤ Suspended (days after expiry).
        </p>
      )}
    </ATMCard>
  );
}

export function GracePeriodConfigPage() {
  const { data, isLoading, isError, refetch } = useGetGracePeriodsQuery();
  const policies = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header — title matches the sidebar label. */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Grace Period
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Four stages anchored to the token expiry date — Warning before expiry; Degraded, Restricted
          and Suspended after it. Configured per plan type, stamped into tokens at issuance, and
          overridable in Token Config.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <ATMSkeleton className="h-48 w-full" />
          <ATMSkeleton className="h-48 w-full" />
          <ATMSkeleton className="h-48 w-full" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm font-semibold text-red-500">
          Failed to load grace policies.
          <ATMButton variant="outline" size="sm" className="ml-3" onClick={() => refetch()}>
            Retry
          </ATMButton>
        </div>
      ) : (
        PLAN_TYPES.map(({ wire, label }) => {
          const policy = policies.find((p: GracePeriodPolicy) => p.planType === wire);
          return policy ? <PolicyCard key={wire} policy={policy} label={label} /> : null;
        })
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold px-1">
        Changes apply to newly issued tokens only — tokens already in the field keep the grace
        policy encoded at issuance.
      </p>
    </div>
  );
}

export default GracePeriodConfigPage;
