import React, { useEffect, useState } from 'react';
import { Save, Coins, RefreshCcw, Info, ArrowRightLeft, Calendar, PencilLine, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
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

function fmtDate(value?: string | null): string {
  if (!value || new Date(value).getFullYear() <= 2000) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function CardHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
      <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">{subtitle}</p>}
      </div>
    </div>
  );
}

export function ExchangeRatePage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      setErrors((prev) => ({ ...prev, [rate.currencyCode]: 'Must be a number greater than zero.' }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[rate.currencyCode];
      return next;
    });
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

  const hero = rates[0] ?? null;

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter pb-8">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
          <RefreshCcw size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          {/* Title matches the sidebar label. */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Exchange Rate</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Enterprise wallets hold Service Tokens, never money — every wallet recharge converts
            the paid amount into tokens at this rate. Each deployment serves exactly one country,
            so there is one currency and one rate (default 1:1).
          </p>
        </div>
      </div>

      {loading ? (
        <ATMSkeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Hero conversion strip */}
          {hero ? (
            <div className="relative overflow-hidden rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-400 p-6 text-white shadow-lg shadow-primary-500/20 dark:border-primary-900/40">
              <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-[-50px] right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/75">
                    <ArrowRightLeft size={12} strokeWidth={2.5} />
                    {hero.currencyCode} → Service Tokens
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    1 {hero.currencyCode} = <span className="text-white drop-shadow-sm">{hero.tokensPerCurrencyUnit} Token</span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
                      <Calendar size={11} strokeWidth={2.5} /> Last changed {fmtDate(hero.updatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
                      <RefreshCcw size={11} strokeWidth={2.5} /> Effective from {fmtDate(hero.effectiveFromDate)}
                    </span>
                  </div>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
                  <Coins size={28} strokeWidth={2} className="text-primary-100" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 py-12">
              <Coins className="h-9 w-9 text-slate-300 dark:text-gray-600 opacity-60" strokeWidth={1.8} />
              <p className="max-w-md text-center text-sm font-semibold text-red-500">
                No exchange rate available for this deployment. Complete platform setup first; if
                setup is done, restart the API so the seed runs, then reload.
              </p>
            </div>
          )}

          {rates.length > 0 && (
            <ATMCard
              className="glass-card"
              header={
                <CardHeader icon={Coins} title="Tokens per currency unit" subtitle="Edit the conversion rate — applies to future recharges" />
              }
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {rates.map((rate) => {
                  const value = pending[rate.currencyCode] ?? String(rate.tokensPerCurrencyUnit);
                  const dirty = value !== String(rate.tokensPerCurrencyUnit);
                  const error = errors[rate.currencyCode];
                  return (
                    <div
                      key={rate.currencyCode}
                      className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-5"
                    >
                      <div className="absolute -right-4 -top-6 h-16 w-16 rounded-full bg-primary-500/10 blur-xl" />
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/20">
                            <Coins size={18} strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-black text-slate-900 dark:text-white">{rate.currencyCode}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                              1 {rate.currencyCode} = <b>{rate.tokensPerCurrencyUnit} Service Tokens</b>
                            </p>
                          </div>
                          <div className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary-700 dark:bg-primary-950/30 dark:text-primary-400">
                            <PencilLine size={10} strokeWidth={2.5} /> Editable
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <ATMTextField
                              name={`rate-${rate.currencyCode}`}
                              type="number"
                              label="Tokens per unit"
                              value={value}
                              error={error}
                              onChange={(e) => {
                                setPending((p) => ({ ...p, [rate.currencyCode]: e.target.value }));
                                if (errors[rate.currencyCode]) setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next[rate.currencyCode];
                                  return next;
                                });
                              }}
                              min={0}
                            />
                          </div>
                          <ATMButton
                            variant="primary"
                            size="md"
                            icon={Save}
                            disabled={!dirty || !!error || savingCode === rate.currencyCode}
                            isLoading={savingCode === rate.currencyCode}
                            onClick={() => handleSave(rate)}
                          >
                            Save Rate
                          </ATMButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ATMCard>
          )}

          <div className="flex flex-wrap items-start gap-3 rounded-xl border border-[var(--zen-border)] bg-primary-50/50 dark:bg-primary-900/10 p-3.5">
            <Info size={14} className="mt-0.5 shrink-0 text-primary-500 dark:text-primary-400" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Changing the rate affects <b>future recharges only</b> — balances already in wallets keep
              their token count. Standalone merchants are unaffected — License Tokens are priced per plan,
              not exchanged.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default ExchangeRatePage;