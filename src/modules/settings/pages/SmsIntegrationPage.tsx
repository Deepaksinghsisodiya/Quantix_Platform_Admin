import React, { useEffect, useState } from 'react';
import { MessageSquare, Save, PlugZap, AlertTriangle, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react';
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
 * 2026-08-10: SMS Integration (settings keys communication.sms.*, secrets encrypted,
 * write-only). SMS defaults OFF — it costs money per message. When ON, merchant lifecycle
 * notifications (suspension, reactivation, low wallet balance, invoices) go out via SMS
 * alongside email, using the bodies on Settings → SMS Templates. The active provider is
 * resolved per send — no restart needed.
 */

type Provider = '' | 'Mock' | 'Twilio' | 'Vonage' | 'MSG91' | 'Plivo';

interface SmsForm {
  enabled: boolean;
  provider: Provider;
  apiKey: string;      // write-only
  apiSecret: string;   // write-only
  senderPhone: string;
  senderName: string;
  apiEndpoint: string;
  statusCallbackUrl: string;
}

const EMPTY_FORM: SmsForm = {
  enabled: false, provider: '', apiKey: '', apiSecret: '',
  senderPhone: '', senderName: '', apiEndpoint: '', statusCallbackUrl: '',
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

export function SmsIntegrationPage() {
  const [form, setForm] = useState<SmsForm>(EMPTY_FORM);
  const [secretsConfigured, setSecretsConfigured] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get<ApiResponse<SettingRow[]>>('/api/v1/settings');
        const rowsRaw = (res as any)?.data;
        const rows = (Array.isArray(rowsRaw) ? rowsRaw : []) as SettingRow[];
        const map: Record<string, SettingRow> = {};
        rows.forEach((r: any) => { map[r.settingKey] = r; });
        if (cancelled) return;
        setForm({
          enabled: map['communication.sms.enabled']?.settingValue === 'true',
          provider: (map['communication.sms.provider']?.settingValue ?? '') as Provider,
          apiKey: '',
          apiSecret: '',
          senderPhone: map['communication.sms.sender_phone']?.settingValue ?? '',
          senderName: map['communication.sms.sender_name']?.settingValue ?? '',
          apiEndpoint: map['communication.sms.api_endpoint']?.settingValue ?? '',
          statusCallbackUrl: map['communication.sms.status_callback_url']?.settingValue ?? '',
        });
        setSecretsConfigured({
          apiKey: !!map['communication.sms.api_key']?.settingValue,
          apiSecret: !!map['communication.sms.api_secret']?.settingValue,
        });
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load SMS integration settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (key: keyof SmsForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {
        'communication.sms.enabled': String(form.enabled),
        'communication.sms.provider': form.provider,
        'communication.sms.sender_phone': form.senderPhone,
        'communication.sms.sender_name': form.senderName,
        'communication.sms.api_endpoint': form.apiEndpoint,
        'communication.sms.status_callback_url': form.statusCallbackUrl,
      };
      // Secrets: only send when the operator typed a new value — never overwrite with blanks.
      if (form.apiKey) settings['communication.sms.api_key'] = form.apiKey;
      if (form.apiSecret) settings['communication.sms.api_secret'] = form.apiSecret;

      const payload = Object.entries(settings).map(([settingKey, settingValue]) => ({ settingKey, settingValue }));
      await put('/api/v1/settings/bulk', payload);
      setSecretsConfigured((s) => ({
        apiKey: s.apiKey || !!form.apiKey,
        apiSecret: s.apiSecret || !!form.apiSecret,
      }));
      setForm((f) => ({ ...f, apiKey: '', apiSecret: '' }));
      toast.success('SMS integration saved — active immediately, no restart needed.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save SMS integration settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await post<ApiResponse<{ message: string }>>('/api/v1/settings/sms/test', {});
      toast.success(((res as any)?.data?.message ?? 'SMS provider is valid.') as string);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'SMS provider validation failed.');
    } finally {
      setTesting(false);
    }
  };

  const secretPlaceholder = (configured?: boolean) =>
    configured ? '•••••••• (configured — type to replace)' : 'Not configured';

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter pb-8">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
          <MessageSquare size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          {/* Title matches the sidebar label. */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">SMS Integration</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Text-message notifications to merchant contact phones — suspension, reactivation,
            low wallet balance, invoices. Off by default; every SMS costs money with a real provider.
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
                <CardHeader icon={ShieldCheck} title="Use SMS Integration" subtitle="Master switch for all SMS notifications" />
                <ATMSwitch name="smsEnabled" checked={form.enabled}
                  onChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))} />
              </div>
            }
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold px-1 pb-4">
              When off, no SMS is sent anywhere on the platform — email notifications continue
              unaffected. Save to apply.
            </p>
            {form.enabled && form.provider === '' && (
              <div className="mt-1 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 leading-relaxed">
                  SMS is ON but no provider is selected — sends will use the server configuration,
                  or the Mock provider (logged, never delivered) if the server has none.
                </p>
              </div>
            )}
          </ATMCard>

          <ATMCard
            className="glass-card"
            header={
              <CardHeader icon={Smartphone} title="SMS Provider" subtitle="Twilio, Vonage, MSG91 or Plivo — secrets stored encrypted" />
            }
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold px-1 pb-5">
              "Use server configuration" defers to the API host's Communication:Sms:* keys;
              with neither configured, SMS goes to the Mock provider (logged, never delivered).
              Secrets are stored encrypted and never displayed again.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              <ATMSelectField
                name="smsProvider"
                label="Provider"
                value={form.provider}
                onChange={(val) => setForm((f) => ({ ...f, provider: (val === null ? '' : String(val)) as Provider }))}
                options={[
                  { label: 'Use server configuration', value: '' },
                  { label: 'Twilio', value: 'Twilio' },
                  { label: 'Vonage (Nexmo)', value: 'Vonage' },
                  { label: 'MSG91', value: 'MSG91' },
                  { label: 'Plivo', value: 'Plivo' },
                  { label: 'Mock (log only — no delivery)', value: 'Mock' },
                ]}
              />
              <ATMTextField name="senderPhone" label="Sender phone / ID" placeholder="+14155550100 or QUANTX"
                value={form.senderPhone} onChange={set('senderPhone')} />
              <ATMTextField name="senderName" label="Sender name (optional)" placeholder="Your brand name"
                value={form.senderName} onChange={set('senderName')} />

              {form.provider !== '' && form.provider !== 'Mock' && (
                <>
                  <ATMTextField name="apiKey" label="API key / Account SID" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.apiKey)}
                    value={form.apiKey} onChange={set('apiKey')} />
                  <ATMTextField name="apiSecret" label="API secret / Auth token" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.apiSecret)}
                    value={form.apiSecret} onChange={set('apiSecret')} />
                  <ATMTextField name="apiEndpoint" label="API endpoint (optional)"
                    placeholder="Provider default when blank"
                    value={form.apiEndpoint} onChange={set('apiEndpoint')} />
                  <ATMTextField name="statusCallbackUrl" label="Delivery status callback URL (optional)"
                    placeholder="https://yourdomain.com/webhooks/sms-status"
                    value={form.statusCallbackUrl} onChange={set('statusCallbackUrl')} />
                </>
              )}
            </div>
          </ATMCard>

          <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold px-1">
            Message bodies are edited on Settings → SMS Templates. Push-notification providers
            (Firebase / APNs) will get their own screen once a mobile consumer exists.
          </p>
        </>
      )}
    </div>
  );
}

export default SmsIntegrationPage;