import React, { useEffect, useState } from 'react';
import { MessageSquare, Save, PlugZap, AlertTriangle } from 'lucide-react';
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
    <div className="flex flex-col gap-6 animate-page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Title matches the sidebar label. */}
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">SMS Integration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Text-message notifications to merchant contact phones — suspension, reactivation,
            low wallet balance, invoices. Off by default; every SMS costs money with a real provider.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <ATMCard className="glass-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Use SMS Integration</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  Master switch. When off, no SMS is sent anywhere on the platform — email
                  notifications continue unaffected. Save to apply.
                </p>
              </div>
              <ATMSwitch name="smsEnabled" checked={form.enabled}
                onChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))} />
            </div>
            {form.enabled && form.provider === '' && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  SMS is ON but no provider is selected — sends will use the server configuration,
                  or the Mock provider (logged, never delivered) if the server has none.
                </p>
              </div>
            )}
          </ATMCard>

          <ATMCard className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">SMS Provider</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6">
              "Use server configuration" defers to the API host's Communication:Sms:* keys;
              with neither configured, SMS goes to the Mock provider (logged, never delivered).
              Secrets are stored encrypted and never displayed again.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold px-1">
            Message bodies are edited on Settings → SMS Templates. Push-notification providers
            (Firebase / APNs) will get their own screen once a mobile consumer exists.
          </p>
        </>
      )}
    </div>
  );
}

export default SmsIntegrationPage;
