import React, { useEffect, useState } from 'react';
import { Save, Coins } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { get, put } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';

/**
 * 2026-08-09: Service Token exchange rates. Enterprise wallets never hold money — a
 * recharge converts money into Service Tokens at the rate on this screen. One row per
 * currency; the deployment's own currency (locked at first-run setup) is the one that
 * matters and is highlighted.
 */

interface ExchangeRate {
  exchangeRateId: string;
  currencyCode: string;
  tokensPerCurrencyUnit: number;
  effectiveFromDate: string;
  updatedAt?: string | null;
}

export function ExchangeRatePage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [deploymentCurrency, setDeploymentCurrency] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const load = async () => {
    try {
      const [ratesRes, statusRes] = await Promise.all([
        get<ApiResponse<ExchangeRate[]>>('/api/v1/catalogs/exchange-rates'),
        get<ApiResponse<{ currency: string }>>('/api/v1/settings/setup-status'),
      ]);
      const currency = ((statusRes as any)?.data?.currency ?? '') as string;
      const all = ((ratesRes as any)?.data ?? []) as ExchangeRate[];
      // One deployment = one country = one currency: only the deployment currency is shown.
      setRates(currency ? all.filter((r) => r.currencyCode === currency) : all);
      setDeploymentCurrency(currency);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load exchange rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (rate: ExchangeRate) => {
    const raw = pending[rate.currencyCode];
    const value = Number(raw);
    if (!raw || Number.isNaN(value) || value <= 0) {
      toast.error('Tokens per currency unit must be a number greater than zero.');
      return;
    }
    setSavingCode(rate.currencyCode);
    try {
      await put(`/api/v1/catalogs/exchange-rates/${rate.currencyCode}`, { tokensPerCurrencyUnit: value });
      toast.success(`1 ${rate.currencyCode} now converts to ${value} Service Tokens.`);
      setPending((p) => { const { [rate.currencyCode]: _drop, ...rest } = p; return rest; });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to save the ${rate.currencyCode} rate.`);
    } finally {
      setSavingCode(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        {/* Title matches the sidebar label. */}
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Exchange Rate</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Enterprise wallets hold Service Tokens, never money — every wallet recharge converts the
          paid amount into tokens at this rate. Each deployment serves exactly one country, so
          there is one currency and one rate (default 1:1). Changing it affects future recharges
          only; balances already in wallets keep their token count.
        </p>
      </div>

      {loading ? (
        <ATMSkeleton className="h-40 w-full" />
      ) : (
        <ATMCard title="Tokens per currency unit" className="glass-card">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rates.map((rate) => {
              const isDeployment = rate.currencyCode === deploymentCurrency;
              const value = pending[rate.currencyCode] ?? String(rate.tokensPerCurrencyUnit);
              const dirty = value !== String(rate.tokensPerCurrencyUnit);
              return (
                <div key={rate.currencyCode} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 first:pt-2 last:pb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-black text-gray-900 dark:text-white">{rate.currencyCode}</span>
                      {isDeployment && <ATMBadge size="sm" color="primary" label="Deployment currency" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                      1 {rate.currencyCode} = {rate.tokensPerCurrencyUnit} Service Tokens
                      {rate.updatedAt && new Date(rate.updatedAt).getFullYear() > 2000 &&
                        ` · last changed ${new Date(rate.updatedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="w-full sm:w-56">
                    <ATMTextField
                      name={`rate-${rate.currencyCode}`}
                      type="number"
                      label="Tokens per unit"
                      value={value}
                      onChange={(e) => setPending((p) => ({ ...p, [rate.currencyCode]: e.target.value }))}
                      min={0}
                      size="sm"
                    />
                  </div>
                  <ATMButton
                    variant="primary"
                    size="sm"
                    icon={Save}
                    disabled={!dirty || savingCode === rate.currencyCode}
                    isLoading={savingCode === rate.currencyCode}
                    onClick={() => handleSave(rate)}
                  >
                    Save
                  </ATMButton>
                </div>
              );
            })}
            {rates.length === 0 && (
              <p className="py-6 text-sm font-semibold text-red-500">
                No exchange rate available for this deployment. Complete platform setup first; if
                setup is done, restart the API so the seed runs, then reload.
              </p>
            )}
          </div>
        </ATMCard>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold px-1">
        Standalone merchants are unaffected — License Tokens are priced per plan, not exchanged.
      </p>
    </div>
  );
}

export default ExchangeRatePage;
