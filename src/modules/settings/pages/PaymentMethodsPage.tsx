/**
 * Payment Methods — 2026-08-29 (Pass 44).
 *
 * Master enable/disable over the platform's payment-method catalog (one row per
 * Foundation PaymentMethodType member). The platform controls the entire business:
 * only enabled methods are offered wherever a payment is taken platform-side —
 * today that is Step 2 of the Generate Tokens wizard.
 */
import React from 'react';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { ATMCard, ATMBadge } from '@/shared/ui';
import {
  useGetPaymentMethodsQuery,
  useSetPaymentMethodEnabledMutation,
} from '../services/settingsApi';

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
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        {/* Title matches the sidebar label. */}
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Payment Methods
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Master availability switch per payment method — only enabled methods are offered
          when the platform takes a payment (e.g. recharge token purchases).
        </p>
      </div>

      <ATMCard className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Method Catalog</h2>
        </div>

        {methodsQuery.isLoading ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-400">Loading…</p>
        ) : methodsQuery.isError ? (
          <div className="flex items-center gap-2 py-6 justify-center">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Failed to load payment methods.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
            {methods.map((m) => (
              <div key={m.paymentMethodId} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {m.displayName}
                  </span>
                  {m.methodType === 'External' && (
                    <ATMBadge size="sm" color="primary" label="Collected outside — reference required" />
                  )}
                  {m.methodType === 'Cash' && (
                    <ATMBadge size="sm" color="gray" label="Offline — reference optional" />
                  )}
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={m.isEnabled}
                    disabled={setEnabledState.isLoading}
                    onChange={(e) => handleToggle(m.methodType, e.target.checked)}
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500 dark:bg-gray-700 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-[11px] text-gray-400 font-medium">
          External means the payment is collected outside the platform (bank transfer,
          outside settlement, a card not linked to this system…) — only a reference number
          is recorded, and it is mandatory: that reference is the accounting trail. Every
          collection is stamped with the acting user for the reports &amp; analytics module.
        </p>
      </ATMCard>
    </div>
  );
};

export default PaymentMethodsPage;
