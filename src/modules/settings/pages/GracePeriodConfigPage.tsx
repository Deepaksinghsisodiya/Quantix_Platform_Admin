import React, { useState } from 'react';
import { Save, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { cn } from '@/lib/utils/cn';

interface Phase {
  name: string;
  days: number;
  description: string;
  color: string;
  bgColor: string;
}

interface GraceConfig {
  enterprise: Phase[];
  standalone: Phase[];
}

const INITIAL: GraceConfig = {
  enterprise: [
    { name: 'Warning', days: 3, description: 'Full functionality. Overdue notifications sent daily via email and in-app.', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-100 dark:bg-amber-900/40' },
    { name: 'Degraded', days: 2, description: 'Advanced features disabled. Core POS and sync continue. Banner warning displayed.', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-100 dark:bg-orange-900/40' },
    { name: 'Restricted', days: 2, description: 'Read-only mode. No new transactions. Data export available. Urgent notifications.', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/40' },
    { name: 'Suspended', days: 0, description: 'Immediate suspension after restricted period. Login blocked. Data retained for 90 days.', color: 'text-red-900 dark:text-red-200', bgColor: 'bg-red-200 dark:bg-red-900/60' },
  ],
  standalone: [
    { name: 'Warning', days: 7, description: 'Full functionality. Overdue notifications sent daily via email and in-app.', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-100 dark:bg-amber-900/40' },
    { name: 'Degraded', days: 5, description: 'Token generation paused. Existing tokens continue working. In-app banners shown.', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-100 dark:bg-orange-900/40' },
    { name: 'Restricted', days: 3, description: 'POS operates offline only. Cloud features disabled. Export functionality available.', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/40' },
    { name: 'Suspended', days: 2, description: 'All tokens invalidated. Login blocked. Data retained for 90 days before deletion.', color: 'text-red-900 dark:text-red-200', bgColor: 'bg-red-200 dark:bg-red-900/60' },
  ],
};

export function GracePeriodConfigPage() {
  const [config, setConfig] = useState<GraceConfig>(INITIAL);
  const [activeTab, setActiveTab] = useState<'enterprise' | 'standalone'>('enterprise');
  const [saving, setSaving] = useState(false);

  const phases = config[activeTab];

  const updateDays = (index: number, days: number) => {
    setConfig((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((p, i) => (i === index ? { ...p, days } : p)),
    }));
  };

  const totalDays = phases.reduce((sum, p) => sum + p.days, 0);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Grace period configuration saved');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Grace Period Configuration
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Define the payment grace period phases for overdue accounts.
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} onClick={handleSave}>
          Save Changes
        </ATMButton>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl border border-gray-250 bg-gray-50/50 p-1 dark:border-gray-800 w-fit">
        {(['enterprise', 'standalone'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-bold capitalize transition-all rounded-lg',
              activeTab === tab
                ? 'bg-accent-600 text-white dark:bg-accent-500 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/80',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Visual timeline */}
      <ATMCard className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-450 dark:text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Grace Period Timeline ({totalDays} days total)
          </h3>
        </div>

        {/* Connected blocks */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {phases.map((phase, i) => (
            <div key={phase.name} className={cn('rounded-xl p-4', phase.bgColor)}>
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-sm font-bold', phase.color)}>{phase.name}</span>
              </div>
              <div className="mb-4">
                <ATMTextField
                  name={`days-${i}`}
                  type="number"
                  label="Days"
                  value={phase.days}
                  onChange={(e) => updateDays(i, parseInt(e.target.value) || 0)}
                  min={0}
                  max={30}
                  size="sm"
                />
              </div>
              <p className="text-xs leading-relaxed text-gray-650 dark:text-gray-400 font-semibold">
                {phase.description}
              </p>
            </div>
          ))}
        </div>
      </ATMCard>

      {/* Per-Plan Overrides */}
      <ATMCard title="Per-Plan Overrides (Enterprise)" className="glass-card">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Override the default grace periods for specific subscription plans.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3 font-extrabold">Plan</th>
                <th className="pb-3 text-center font-extrabold">Warning</th>
                <th className="pb-3 text-center font-extrabold">Degraded</th>
                <th className="pb-3 text-center font-extrabold">Restricted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold">
              {[
                { plan: 'Starter', warning: 3, degraded: 2, restricted: 2 },
                { plan: 'Professional', warning: 5, degraded: 3, restricted: 2 },
                { plan: 'Business', warning: 7, degraded: 5, restricted: 3 },
                { plan: 'Enterprise', warning: 14, degraded: 7, restricted: 5 },
              ].map((row) => (
                <tr key={row.plan} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10">
                  <td className="py-3 font-bold text-gray-900 dark:text-white">{row.plan}</td>
                  {[row.warning, row.degraded, row.restricted].map((days, i) => (
                    <td key={i} className="py-2 text-center">
                      <ATMTextField
                        name={`plan-${row.plan}-${i}`}
                        type="number"
                        defaultValue={days}
                        min={0}
                        max={30}
                        size="sm"
                        className="w-20 mx-auto"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>

      {/* Per-Tier Overrides */}
      <ATMCard title="Per-Tier Overrides (Standalone)" className="glass-card">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Override the default grace periods for specific Standalone token tiers.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3 font-extrabold">Tier</th>
                <th className="pb-3 text-center font-extrabold">Warning</th>
                <th className="pb-3 text-center font-extrabold">Degraded</th>
                <th className="pb-3 text-center font-extrabold">Restricted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold">
              {[
                { tier: 'Basic', warning: 7, degraded: 5, restricted: 3 },
                { tier: 'Standard', warning: 7, degraded: 5, restricted: 3 },
                { tier: 'Advance', warning: 10, degraded: 7, restricted: 5 },
                { tier: 'Premium', warning: 14, degraded: 10, restricted: 7 },
              ].map((row) => (
                <tr key={row.tier} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10">
                  <td className="py-3 font-bold text-gray-900 dark:text-white">{row.tier}</td>
                  {[row.warning, row.degraded, row.restricted].map((days, i) => (
                    <td key={i} className="py-2 text-center">
                      <ATMTextField
                        name={`tier-${row.tier}-${i}`}
                        type="number"
                        defaultValue={days}
                        min={0}
                        max={30}
                        size="sm"
                        className="w-20 mx-auto"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>

      {/* Info Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-850 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="text-sm text-amber-850 dark:text-amber-300 font-semibold">
          <p className="font-bold">Phase transitions are automatic.</p>
          <p className="mt-1 text-xs">Once a phase timer expires, the account moves to the next phase without manual intervention. Suspended accounts require manual reactivation by a Platform Admin after payment is received.</p>
        </div>
      </div>

      {/* Integration notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-accent-200 bg-accent-50/50 p-4 dark:border-accent-850 dark:bg-accent-950/10">
          <p className="text-sm font-bold text-accent-700 dark:text-accent-300">Enterprise: Platform Bridge Integration</p>
          <p className="mt-1.5 text-xs text-accent-600 dark:text-accent-400 font-semibold leading-relaxed">
            Grace period configuration is consumed by Platform Bridge (APP-T3-07). When the bridge syncs with an Enterprise merchant,
            it checks the current grace phase and enforces the corresponding behavior (feature restrictions, read-only mode, etc.).
            Changes here take effect on the next sync cycle.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-850 dark:bg-emerald-950/10">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Standalone: Recharge Token Encoding</p>
          <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
            Grace policy days are encoded in the Recharge Token payload as the <code className="font-mono text-[10px]">GracePolicyDays</code> field (FRS-SAP-1402).
            The POS terminal reads this value from the token and applies local grace period logic after token expiry.
            Changes here apply to newly generated tokens only — existing tokens retain their encoded grace policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GracePeriodConfigPage;
