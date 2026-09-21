import React, { useEffect, useState } from 'react';
import { Mail, Save, PlugZap, AlertTriangle, ShieldCheck, Send, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { get, put, post } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';

/**
 * 2026-08-10: Integrations split into three dedicated screens (Email / SMS / Payment), each
 * with a master toggle. This one owns the transactional email provider (settings keys
 * communication.email.*, secrets encrypted, write-only). Toggle OFF = every send is skipped
 * with an EMAIL_DISABLED failure (logged, never faked). The active provider is resolved per
 * send — no restart needed after saving.
 */

type Provider = '' | 'Mock' | 'SMTP' | 'SendGrid' | 'Mailgun';

interface EmailForm {
  enabled: boolean;
  provider: Provider;
  fromAddress: string;
  fromName: string;
  smtpHost: string;
  smtpPort: string;
  smtpUseSsl: string;
  smtpUsername: string;
  smtpPassword: string;      // write-only
  sendgridApiKey: string;    // write-only
  mailgunApiKey: string;     // write-only
  mailgunApiBaseUrl: string;
}

const EMPTY_FORM: EmailForm = {
  enabled: true, provider: '', fromAddress: '', fromName: '',
  smtpHost: '', smtpPort: '587', smtpUseSsl: 'true', smtpUsername: '', smtpPassword: '',
  sendgridApiKey: '', mailgunApiKey: '', mailgunApiBaseUrl: '',
};

interface SettingRow { settingKey: string; settingValue: string; isEncrypted: boolean }

type SecretField = 'smtpPassword' | 'sendgridApiKey' | 'mailgunApiKey';
const SECRET_FIELDS: readonly SecretField[] = ['smtpPassword', 'sendgridApiKey', 'mailgunApiKey'];
const SECRET_KEYS: Record<SecretField, string> = {
  smtpPassword: 'communication.email.smtp_password',
  sendgridApiKey: 'communication.email.sendgrid_api_key',
  mailgunApiKey: 'communication.email.mailgun_api_key',
};
const SECRET_LABELS: Record<SecretField, string> = {
  smtpPassword: 'SMTP password',
  sendgridApiKey: 'SendGrid API key',
  mailgunApiKey: 'Mailgun API key',
};
/** The provider each secret belongs to — a stored secret for another provider is dead weight. */
const SECRET_PROVIDER: Record<SecretField, Provider> = {
  smtpPassword: 'SMTP',
  sendgridApiKey: 'SendGrid',
  mailgunApiKey: 'Mailgun',
};
const NO_SECRETS: Record<SecretField, boolean> = { smtpPassword: false, sendgridApiKey: false, mailgunApiKey: false };

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

export function EmailIntegrationPage() {
  const [form, setForm] = useState<EmailForm>(EMPTY_FORM);
  const [secretsConfigured, setSecretsConfigured] = useState<Record<SecretField, boolean>>(NO_SECRETS);
  // 2026-09-04: secrets marked for removal on Save. Blanks are never sent for secrets (so
  // saving can't wipe one by accident), which also meant a stale secret — e.g. an SMTP
  // password stored with no host — could never be removed. An explicit Clear sends "".
  const [clearSecrets, setClearSecrets] = useState<Record<SecretField, boolean>>(NO_SECRETS);
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
          enabled: (map['communication.email.enabled']?.settingValue ?? 'true') !== 'false',
          provider: (map['communication.email.provider']?.settingValue ?? '') as Provider,
          fromAddress: map['communication.email.from_address']?.settingValue ?? '',
          fromName: map['communication.email.from_name']?.settingValue ?? '',
          smtpHost: map['communication.email.smtp_host']?.settingValue ?? '',
          smtpPort: map['communication.email.smtp_port']?.settingValue ?? '587',
          smtpUseSsl: map['communication.email.smtp_use_ssl']?.settingValue ?? 'true',
          smtpUsername: map['communication.email.smtp_username']?.settingValue ?? '',
          smtpPassword: '',
          sendgridApiKey: '',
          mailgunApiKey: '',
          mailgunApiBaseUrl: map['communication.email.mailgun_api_base_url']?.settingValue ?? '',
        });
        setSecretsConfigured({
          smtpPassword: !!map['communication.email.smtp_password']?.settingValue,
          sendgridApiKey: !!map['communication.email.sendgrid_api_key']?.settingValue,
          mailgunApiKey: !!map['communication.email.mailgun_api_key']?.settingValue,
        });
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load email integration settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (key: keyof EmailForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {
        'communication.email.enabled': String(form.enabled),
        'communication.email.provider': form.provider,
        'communication.email.from_address': form.fromAddress,
        'communication.email.from_name': form.fromName,
        'communication.email.smtp_host': form.smtpHost,
        'communication.email.smtp_port': form.smtpPort || '587',
        'communication.email.smtp_use_ssl': form.smtpUseSsl,
        'communication.email.smtp_username': form.smtpUsername,
        'communication.email.mailgun_api_base_url': form.mailgunApiBaseUrl,
      };
      // Secrets: only send when the operator typed a new value — never overwrite with blanks —
      // except an explicit Clear, which sends "" (the server stores it empty, unencrypted).
      for (const field of SECRET_FIELDS) {
        if (form[field]) settings[SECRET_KEYS[field]] = form[field];
        else if (clearSecrets[field]) settings[SECRET_KEYS[field]] = '';
      }

      const payload = Object.entries(settings).map(([settingKey, settingValue]) => ({ settingKey, settingValue }));
      await put('/api/v1/settings/bulk', payload);
      setSecretsConfigured((s) => {
        const next = { ...s };
        for (const field of SECRET_FIELDS) {
          if (form[field]) next[field] = true;
          else if (clearSecrets[field]) next[field] = false;
        }
        return next;
      });
      setClearSecrets(NO_SECRETS);
      setForm((f) => ({ ...f, smtpPassword: '', sendgridApiKey: '', mailgunApiKey: '' }));
      toast.success('Email integration saved — active immediately, no restart needed.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save email integration settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await post<ApiResponse<{ message: string }>>('/api/v1/settings/smtp/test', {});
      toast.success(((res as any)?.data?.message ?? 'Email provider is valid.') as string);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Email provider validation failed.');
    } finally {
      setTesting(false);
    }
  };

  const secretPlaceholder = (configured?: boolean) =>
    configured ? '•••••••• (configured — type to replace)' : 'Not configured';

  /** Under a secret field: its stored state plus Clear / Undo. */
  const secretHelper = (field: SecretField): React.ReactNode => {
    if (!secretsConfigured[field]) return 'Not stored. Type a value to store it.';
    if (clearSecrets[field]) {
      return (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="font-semibold text-amber-700 dark:text-amber-300">Will be removed when you Save.</span>
          <button type="button" className="text-xs font-semibold underline" onClick={() => setClearSecrets((c) => ({ ...c, [field]: false }))}>
            Undo
          </button>
        </span>
      );
    }
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>Stored (encrypted). Type a value to replace it.</span>
        <button
          type="button"
          className="text-xs font-semibold text-red-600 underline dark:text-red-400"
          onClick={() => setClearSecrets((c) => ({ ...c, [field]: true }))}
        >
          Clear stored value
        </button>
      </span>
    );
  };

  // Secrets stored for a provider other than the selected one — nothing reads them, and
  // "configured" chips for them mislead. Offered for clearing here since their fields are hidden.
  const unusedSecrets = SECRET_FIELDS.filter((field) => secretsConfigured[field] && SECRET_PROVIDER[field] !== form.provider);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Mail}
        iconColor="theme"
        title="Email Integration"
        subtitle="The provider every transactional email goes through. Changes apply immediately — the active provider is resolved on every send."
        extraActions={
          <div className="flex shrink-0 items-center gap-2">
            <ATMButton variant="outline" size="md" icon={PlugZap} isLoading={testing} onClick={handleTest}>
              Test
            </ATMButton>
            <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} disabled={loading} onClick={handleSave}>
              Save
            </ATMButton>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <ATMSkeleton width="40%" height="14px" className="rounded-lg" />
          <ATMSkeleton height="42px" className="rounded-lg" />
          <ATMSkeleton width="60%" height="14px" className="rounded-lg" />
          <ATMSkeleton height="110px" className="rounded-lg" />
          <ATMSkeleton width="35%" height="14px" className="rounded-lg" />
          <ATMSkeleton height="42px" className="rounded-lg" />
        </div>
      ) : (
        <>
          <ATMCard
            className="glass-card"
            header={
              <div className="flex items-center justify-between gap-4">
                <CardHeader icon={ShieldCheck} title="Use Email Integration" subtitle="Master switch for all transactional email" />
                <ATMSwitch name="emailEnabled" checked={form.enabled}
                  onChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))} />
              </div>
            }
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold px-1 pb-4">
              When off, NO email is sent — signup verification (OTP), password reset, invoices
              and lifecycle notices are all skipped with a logged failure. Save to apply.
            </p>
            {!form.enabled && (
              <div className="mt-1 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 leading-relaxed">
                  Email is OFF. New merchants cannot verify their signup email and staff cannot
                  reset passwords until it is re-enabled.
                </p>
              </div>
            )}
          </ATMCard>

          <ATMCard
            className="glass-card"
            header={
              <CardHeader icon={Send} title="Email Provider" subtitle="SMTP, SendGrid or Mailgun — secrets stored encrypted" />
            }
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold px-1 pb-5">
              "Use server configuration" defers to the API host's Communication:Email:* keys;
              with neither configured, emails go to the Mock provider (logged, never delivered).
              Secrets are stored encrypted and never displayed again.
            </p>

            {unusedSecrets.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Stored but unused by the selected provider:
                </p>
                <ul className="mt-1 space-y-1">
                  {unusedSecrets.map((field) => (
                    <li key={field} className="flex flex-wrap items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                      <span className="font-semibold">{SECRET_LABELS[field]}</span>
                      <span>({SECRET_PROVIDER[field]})</span>
                      {clearSecrets[field] ? (
                        <>
                          <span className="font-semibold">— will be removed when you Save.</span>
                          <button type="button" className="font-semibold underline" onClick={() => setClearSecrets((c) => ({ ...c, [field]: false }))}>
                            Undo
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="font-semibold text-red-600 underline dark:text-red-400"
                          onClick={() => setClearSecrets((c) => ({ ...c, [field]: true }))}
                        >
                          Clear stored value
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              <ATMSelectField
                name="provider"
                label="Provider"
                value={form.provider}
                onChange={(val) => setForm((f) => ({ ...f, provider: (val === null ? '' : String(val)) as Provider }))}
                options={[
                  { label: 'Use server configuration', value: '' },
                  { label: 'SMTP', value: 'SMTP' },
                  { label: 'SendGrid', value: 'SendGrid' },
                  { label: 'Mailgun', value: 'Mailgun' },
                  { label: 'Mock (log only — no delivery)', value: 'Mock' },
                ]}
              />
              <ATMTextField name="fromAddress" label="From address" placeholder="noreply@yourdomain.com"
                value={form.fromAddress} onChange={set('fromAddress')} />
              <ATMTextField name="fromName" label="From name" placeholder="Your brand name"
                value={form.fromName} onChange={set('fromName')} />

              {form.provider === 'SMTP' && (
                <>
                  <ATMTextField name="smtpHost" label="SMTP host" placeholder="smtp.yourdomain.com"
                    value={form.smtpHost} onChange={set('smtpHost')} />
                  <ATMTextField name="smtpPort" label="SMTP port" type="number"
                    value={form.smtpPort} onChange={set('smtpPort')} />
                  <ATMSelectField
                    name="smtpUseSsl"
                    label="Use SSL/TLS"
                    value={form.smtpUseSsl}
                    onChange={(val) => setForm((f) => ({ ...f, smtpUseSsl: val ? String(val) : 'true' }))}
                    options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]}
                  />
                  <ATMTextField name="smtpUsername" label="SMTP username"
                    value={form.smtpUsername} onChange={set('smtpUsername')} />
                  <ATMTextField name="smtpPassword" label="SMTP password" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.smtpPassword)}
                    helperText={secretHelper('smtpPassword')}
                    value={form.smtpPassword} onChange={set('smtpPassword')} />
                </>
              )}

              {form.provider === 'SendGrid' && (
                <ATMTextField name="sendgridApiKey" label="SendGrid API key" type="password"
                  placeholder={secretPlaceholder(secretsConfigured.sendgridApiKey)}
                  helperText={secretHelper('sendgridApiKey')}
                  value={form.sendgridApiKey} onChange={set('sendgridApiKey')} />
              )}

              {form.provider === 'Mailgun' && (
                <>
                  <ATMTextField name="mailgunApiKey" label="Mailgun API key" type="password"
                    placeholder={secretPlaceholder(secretsConfigured.mailgunApiKey)}
                    helperText={secretHelper('mailgunApiKey')}
                    value={form.mailgunApiKey} onChange={set('mailgunApiKey')} />
                  <ATMTextField name="mailgunApiBaseUrl" label="Mailgun API base URL (optional, EU region)"
                    placeholder="https://api.eu.mailgun.net/v3"
                    value={form.mailgunApiBaseUrl} onChange={set('mailgunApiBaseUrl')} />
                </>
              )}
            </div>
          </ATMCard>
        </>
      )}
    </div>
  );
}

export default EmailIntegrationPage;