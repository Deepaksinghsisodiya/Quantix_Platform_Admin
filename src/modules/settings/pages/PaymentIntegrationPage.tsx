import React, { useEffect, useState } from 'react';
import { CreditCard, Save, PlugZap, AlertTriangle, ShieldAlert, ShieldCheck, Landmark, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { get, put, post } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';

/**
 * 2026-08-10: the PLATFORM's own payment gateway — how this deployment charges merchants
 * (signup payment capture, online wallet recharge, invoice auto-charge). Settings keys
 * commercial.payment.*, secrets encrypted, write-only. NOT the in-store POS gateways —
 * those are configured per terminal inside the merchant solutions.
 *
 * Toggle OFF = online payments are BLOCKED with a clear error (never silently mocked);
 * offline recharge and manual payment recording keep working. A NAMED provider that is
 * misconfigured fails loudly — Mock only runs when nothing is configured (dev) or when
 * explicitly selected.
 */

interface ProviderMeta {
  providerKey: string;
  displayName: string;
  region: string;
  summary?: string | null;
  isImplemented: boolean;
}

interface PaymentForm {
  enabled: boolean;
  provider: string;      // '' = use server configuration
  apiKey: string;        // write-only
  apiSecret: string;     // write-only
  merchantId: string;
  environment: string;
  webhookSecret: string; // write-only
}

const EMPTY_FORM: PaymentForm = {
  enabled: true, provider: '', apiKey: '', apiSecret: '',
  merchantId: '', environment: 'Sandbox', webhookSecret: '',
};

interface SettingRow { settingKey: string; settingValue: string; isEncrypted: boolean }

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

export function PaymentIntegrationPage() {
  const [form, setForm] = useState<PaymentForm>(EMPTY_FORM);
  const [providers, setProviders] = useState<ProviderMeta[]>([]);
  const [secretsConfigured, setSecretsConfigured] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [settingsRes, providersRes] = await Promise.all([
          get<ApiResponse<SettingRow[]>>('/api/v1/settings'),
          get<ApiResponse<ProviderMeta[]>>('/api/v1/settings/payment/providers'),
        ]);
        if (cancelled) return;
        const rowsRaw = (settingsRes as any)?.data;
        const rows = (Array.isArray(rowsRaw) ? rowsRaw : []) as SettingRow[];
        const map: Record<string, SettingRow> = {};
        rows.forEach((r: any) => { map[r.settingKey] = r; });
        setForm({
          enabled: (map['commercial.payment.enabled']?.settingValue ?? 'true') !== 'false',
          provider: map['commercial.payment.provider']?.settingValue ?? '',
          apiKey: '',
          apiSecret: '',
          merchantId: map['commercial.payment.merchant_id']?.settingValue ?? '',
          environment: map['commercial.payment.environment']?.settingValue || 'Sandbox',
          webhookSecret: '',
        });
        setSecretsConfigured({
          apiKey: !!map['commercial.payment.api_key']?.settingValue,
          apiSecret: !!map['commercial.payment.api_secret']?.settingValue,
          webhookSecret: !!map['commercial.payment.webhook_secret']?.settingValue,
        });
        setProviders(((providersRes as any)?.data ?? []) as ProviderMeta[]);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load payment integration settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (key: keyof PaymentForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {
        'commercial.payment.enabled': String(form.enabled),
        'commercial.payment.provider': form.provider,
        'commercial.payment.merchant_id': form.merchantId,
        'commercial.payment.environment': form.environment,
      };
      // Secrets: only send when the operator typed a new value — never overwrite with blanks.
      if (form.apiKey) settings['commercial.payment.api_key'] = form.apiKey;
      if (form.apiSecret) settings['commercial.payment.api_secret'] = form.apiSecret;
      if (form.webhookSecret) settings['commercial.payment.webhook_secret'] = form.webhookSecret;

      const payload = Object.entries(settings).map(([settingKey, settingValue]) => ({ settingKey, settingValue }));
      await put('/api/v1/settings/bulk', payload);
      setSecretsConfigured((s) => ({
        apiKey: s.apiKey || !!form.apiKey,
        apiSecret: s.apiSecret || !!form.apiSecret,
        webhookSecret: s.webhookSecret || !!form.webhookSecret,
      }));
      setForm((f) => ({ ...f, apiKey: '', apiSecret: '', webhookSecret: '' }));
      toast.success('Payment integration saved — active on the next charge, no restart needed.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save payment integration settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await post<ApiResponse<{ message: string }>>('/api/v1/settings/payment/test', {});
      toast.success(((res as any)?.data?.message ?? 'Payment gateway is valid.') as string);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Payment gateway validation failed.');
    } finally {
      setTesting(false);
    }
  };

  const secretPlaceholder = (configured?: boolean) =>
    configured ? '•••••••• (configured — type to replace)' : 'Not configured';

  const isMockSelected = form.provider.toLowerCase().includes('mock');
  const providerOptions = [
    { label: 'Use server configuration', value: '' },
    ...providers.map((p) => ({
      label: p.isImplemented ? `${p.displayName} (${p.region})` : `${p.displayName} — coming soon`,
      value: p.providerKey,
      disabled: !p.isImplemented,
    })),
  ];

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter pb-8">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
          <CreditCard size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          {/* Title matches the sidebar label. */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Payment Integration</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            The platform's own gateway for charging merchants — signup payment, online wallet
            recharge, invoice auto-charge. Resolved on every charge, no restart needed.
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ATMButton variant="outline" size="md" icon={PlugZap} isLoading={testing} onClick={handleTest}>
            Test
          </ATMButton>
          <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} disabled={loading} onClick={handleSave}>
            Save
          </ATMButton>
        </div>
      </div>

      {loading ? (
        <ATMSkeleton className="h-72 w-full" />
      ) : (
        <>
          <ATMCard
            className="glass-card"
            header={
              <div className="flex items-center justify-between gap-4">
                <CardHeader icon={ShieldCheck} title="Use Payment Integration" subtitle="Master switch for all online payments" />
                <ATMSwitch name="paymentEnabled" checked={form.enabled}
                  onChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))} />
              </div>
            }
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold px-1 pb-4">
              When off, online payments are BLOCKED — merchants see a clear "online payment not
              enabled" message and can pay offline instead; invoice auto-charge is skipped. Save
              to apply.
            </p>
            {!form.enabled && (
              <div className="mt-1 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 leading-relaxed">
                  Payment is OFF — this deployment operates offline-payments-only. Signup payment
                  capture, online recharge and invoice auto-charge are all blocked until re-enabled.
                </p>
              </div>
            )}
            {form.enabled && (form.provider === '' || isMockSelected) && (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 leading-relaxed">
                  {isMockSelected
                    ? 'Mock gateway selected — charges SUCCEED WITHOUT MOVING MONEY. Dev/testing only, never production.'
                    : 'No portal provider selected — charges use the server configuration, or the Mock gateway (succeeds without moving money) if the server has none. Use Test to see which is active.'}
                </p>
              </div>
            )}
          </ATMCard>

          <ATMCard
            className="glass-card"
            header={
              <CardHeader icon={Landmark} title="Payment Provider" subtitle="Online HTTPS gateway — secrets stored encrypted" />
            }
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold px-1 pb-5">
              Online (HTTPS) gateways only — hardware terminals belong to the merchant POS
              solutions. Invoices and recharges are charged in the deployment currency.
              Secrets are stored encrypted and never displayed again.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              <ATMSelectField
                name="paymentProvider"
                label="Provider"
                value={form.provider}
                onChange={(val) => setForm((f) => ({ ...f, provider: val === null ? '' : String(val) }))}
                options={providerOptions}
              />
              <ATMSelectField
                name="environment"
                label="Environment"
                value={form.environment}
                onChange={(val) => setForm((f) => ({ ...f, environment: val ? String(val) : 'Sandbox' }))}
                options={[
                  { label: 'Sandbox (test)', value: 'Sandbox' },
                  { label: 'Production (live charges)', value: 'Production' },
                ]}
              />
              <ATMTextField name="merchantId" label="Merchant / account ID (provider-side)"
                placeholder="Provider account identifier"
                value={form.merchantId} onChange={set('merchantId')} />

              {form.provider !== '' && !isMockSelected && (
                <>
                  <ATMTextField name="apiKey" label="API key" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.apiKey)}
                    value={form.apiKey} onChange={set('apiKey')} />
                  <ATMTextField name="apiSecret" label="API secret (if the provider uses one)" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.apiSecret)}
                    value={form.apiSecret} onChange={set('apiSecret')} />
                  <ATMTextField name="webhookSecret" label="Webhook signing secret (optional)" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.webhookSecret)}
                    value={form.webhookSecret} onChange={set('webhookSecret')} />
                </>
              )}
            </div>
          </ATMCard>

          <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold px-1">
            In-store POS payment gateways (card terminals at the merchant's counter) are a
            separate concern — configured per terminal inside the merchant solutions, not here.
          </p>
        </>
      )}
    </div>
  );
}

export default PaymentIntegrationPage;