/**
 * Payment Methods — 2026-08-29 (Pass 44).
 *
 * Master enable/disable over the platform's payment-method catalog (one row per
 * Foundation PaymentMethodType member). The platform controls the entire business:
 * only enabled methods are offered wherever a payment is taken platform-side —
 * today that is Step 2 of the Generate Tokens wizard.
 */
import React from 'react';
import { CreditCard, AlertTriangle, Wallet, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ATMCard, ATMBadge, ATMSkeleton } from '@/shared/ui';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import {
  useGetPaymentMethodsQuery,
  useSetPaymentMethodEnabledMutation,
} from '../services/settingsApi';
import { cn } from '@/lib/utils/cn';

function CardHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
      <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{subtitle}</p>}
      </div>
    </div>
  );
}

const METHOD_TYPE_META: Record<string, { label: string; color: 'primary' | 'gray' | 'success' | 'warning' }> = {
  External: { label: 'Collected outside — reference required', color: 'primary' },
  Cash: { label: 'Offline — reference optional', color: 'gray' },
};

export const PaymentMethodsPage: React.FC = () => {
  const methodsQuery = useGetPaymentMethodsQuery();
  const [setEnabled, setEnabledState] = useSetPaymentMethodEnabledMutation();

  const methods = methodsQuery.data?.data ?? [];

  const handleToggle = async (methodType: string, isEnabled: boolean) => {
    try {
      const res = await setEnabled({ methodType, isEnabled }).unwrap();
      toast.success(`${res.data.displayName} ${isEnabled ? 'enabled' : 'disabled'} platform-wide`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update payment method');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Wallet}
        iconColor="theme"
        title="Payment Methods"
        subtitle="Master availability switch per payment method — only enabled methods are offered when the platform takes a payment (e.g. recharge token purchases)."
      />

      <ATMCard
        className="glass-card"
        header={
          <CardHeader icon={CreditCard} title="Method Catalog" subtitle="Platform-wide tender availability" />
        }
      >
        {methodsQuery.isLoading ? (
          <div className="space-y-3 animate-pulse">
            <ATMSkeleton width="40%" height="14px" className="rounded-lg" />
            <ATMSkeleton height="40px" className="rounded-lg" />
            <ATMSkeleton height="40px" className="rounded-lg" />
          </div>
        ) : methodsQuery.isError ? (
          <div className="flex items-center justify-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Failed to load payment methods.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
            {methods.map((m) => {
              const meta = METHOD_TYPE_META[m.methodType];
              return (
                <div key={m.paymentMethodId} className="flex items-center justify-between gap-4 py-3.5 first:pt-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                        m.isEnabled
                          ? 'bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/20'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                      )}
                    >
                      <Wallet size={16} strokeWidth={2.2} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{m.displayName}</span>
                      {meta && <ATMBadge size="sm" color={meta.color} label={meta.label} />}
                    </div>
                  </div>
                  <ATMSwitch
                    name={`method-${m.methodType}`}
                    checked={m.isEnabled}
                    disabled={setEnabledState.isLoading}
                    onChange={(checked) => handleToggle(m.methodType, checked)}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-[var(--zen-border)] bg-slate-50/60 dark:bg-slate-900/40 p-3.5">
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
            External means the payment is collected outside the platform (bank transfer,
            outside settlement, a card not linked to this system…) — only a reference number
            is recorded, and it is mandatory: that reference is the accounting trail. Every
            collection is stamped with the acting user for the reports &amp; analytics module.
          </p>
        </div>
      </ATMCard>
    </div>
  );
};

export default PaymentMethodsPage;