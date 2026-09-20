/**
 * Global Settings — 2026-08-07 rework: first-run platform setup gate.
 *
 * The platform is a SINGLE-COUNTRY deployment. On first login the admin must complete
 * this screen before any other activity (PlatformSetupGuard forces the redirect):
 *   • Country: USA or India — not preselected; FROZEN permanently once saved.
 *   • Currency: derived from country (USD / INR) — never chosen directly.
 *   • Timezone: options filtered by country; changeable later.
 *   • Support email: required at setup; changeable later.
 *   • Platform DBA Name + default language (English) — changeable later.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Save, Globe, Lock, Percent, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { countryName } from '@/lib/utils/countryName';
import {
  useGetSetupStatusQuery,
  useGetSetupCatalogQuery,
  useCompletePlatformSetupMutation,
  useBulkUpdateSettingsMutation,
} from '../services/settingsApi';

// 2026-08-30 (user directive): the supported-country list, its derived currencies, and
// per-country timezones all come from the SERVER CountryCatalog (GET /settings/setup-catalog)
// — this screen previously mirrored that catalog in three hardcoded maps, so supporting a
// new deployment country meant editing both sides. Country display names come from Intl.
/** "America/New_York" → "New York" — timezone labels derived from the IANA id, not a map. */
const timezoneLabel = (tz: string) => `${tz.split('/').pop()?.replace(/_/g, ' ') ?? tz} (${tz})`;

const LANGUAGES = [
  { value: 'en', label: 'English' },
];

export function GlobalSettingsPage() {
  const { data: statusRes, isLoading } = useGetSetupStatusQuery();
  const { data: catalogRes } = useGetSetupCatalogQuery();
  const [completeSetup, { isLoading: settingUp }] = useCompletePlatformSetupMutation();
  const [bulkUpdate, { isLoading: savingLater }] = useBulkUpdateSettingsMutation();

  const catalog = useMemo(() => catalogRes?.data ?? [], [catalogRes]);
  const countryOptions = useMemo(
    () => catalog.map((c) => ({ value: c.code, label: countryName(c.code) || c.code })),
    [catalog],
  );

  const status = statusRes?.data;
  const isConfigured = status?.isConfigured ?? false;

  const [form, setForm] = useState({
    country: '', timezone: '', supportEmail: '', dbaName: '', language: 'en',
  });
  useEffect(() => {
    if (status) {
      setForm({
        country: status.country,
        timezone: status.timezone,
        supportEmail: status.supportEmail,
        dbaName: status.dbaName,
        language: status.language || 'en',
      });
    }
  }, [status]);

  const selectedCatalogRow = useMemo(
    () => catalog.find((c) => c.code === form.country),
    [catalog, form.country],
  );
  const timezones = useMemo(
    () => (selectedCatalogRow?.timezones ?? []).map((tz) => ({ value: tz, label: timezoneLabel(tz) })),
    [selectedCatalogRow],
  );
  const derivedCurrency = selectedCatalogRow?.currency ?? (form.country ? '…' : '—');

  const handleSave = async () => {
    if (!isConfigured) {
      // ── First-run setup: one-shot, country freezes after this. ──
      if (!form.country) { toast.error('Select the deployment country.'); return; }
      if (!form.timezone) { toast.error('Select a timezone.'); return; }
      if (!form.supportEmail.includes('@')) { toast.error('A valid support email is required.'); return; }
      try {
        await completeSetup({
          country: form.country,
          timezone: form.timezone,
          supportEmail: form.supportEmail,
          dbaName: form.dbaName || undefined,
          language: form.language || undefined,
        }).unwrap();
        toast.success('Platform setup complete. The deployment country is now locked.');
      } catch (e: any) {
        toast.error(e?.data?.message || 'Setup failed.');
      }
    } else {
      // ── Post-setup edits: everything except country + currency. ──
      if (!form.supportEmail.includes('@')) { toast.error('A valid support email is required.'); return; }
      try {
        // Backend PUT /settings/bulk expects a raw UpdateSettingDto[] array.
        await bulkUpdate([
          { settingKey: 'platform.timezone', settingValue: form.timezone },
          { settingKey: 'platform.support_email', settingValue: form.supportEmail },
          { settingKey: 'platform.dba_name', settingValue: form.dbaName },
          { settingKey: 'platform.language', settingValue: form.language },
        ] as any).unwrap();
        toast.success('Settings saved.');
      } catch (e: any) {
        toast.error(e?.data?.message || 'Save failed.');
      }
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-sm font-semibold text-slate-400">Loading settings…</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-page-enter max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Global Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            {isConfigured
              ? 'Platform-wide configuration. Country and currency are locked for this deployment.'
              : 'One-time platform setup — complete this before any other activity.'}
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Save} isLoading={settingUp || savingLater} onClick={handleSave}>
          {isConfigured ? 'Save Changes' : 'Complete Setup'}
        </ATMButton>
      </div>

      {/* First-run banner */}
      {!isConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
            <p className="font-black">Platform setup required</p>
            <p className="mt-0.5 font-medium">
              Choose the deployment country carefully — <b>it cannot be changed after saving</b>.
              Currency is set automatically from the country. All other screens stay locked until this is done.
            </p>
          </div>
        </div>
      )}

      {/* 2026-08-08 (tax redesign): advise the operator that platform tax starts at 0%. */}
      {!isConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <Percent className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-blue-800 dark:text-blue-300 font-semibold">
            <p className="font-black">Platform tax defaults to 0%</p>
            <p className="mt-0.5 font-medium">
              Every sale (daily subscription, commission, token purchase) is taxed through the
              seeded <b>Standard Tax</b>, which starts at <b>0%</b>. If your deployment must
              charge tax, set the rate after setup in <b>System Setup → Tax Settings</b> — the
              change applies everywhere at once.
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <ATMCard className="glass-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2">
          {/* Country — frozen after setup */}
          {isConfigured ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Deployment Country</label>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/40">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {countryName(form.country) || form.country}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <Lock size={10} /> Locked
                </span>
              </div>
            </div>
          ) : (
            <ATMSelectField
              name="country"
              label="Deployment Country"
              required
              value={form.country}
              onChange={(val) => {
                const c = val ? String(val) : '';
                setForm((p) => ({ ...p, country: c, timezone: '' }));
              }}
              options={countryOptions}
            />
          )}

          {/* Currency — always derived, never editable */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/40">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isConfigured ? status?.currency : derivedCurrency}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">From country</span>
            </div>
          </div>

          {/* Timezone — options depend on country */}
          <ATMSelectField
            name="timezone"
            label="Timezone"
            required
            value={form.timezone}
            onChange={(val) => setForm((p) => ({ ...p, timezone: val ? String(val) : '' }))}
            options={timezones}
          />

          {/* Language */}
          <ATMSelectField
            name="language"
            label="Default Language"
            value={form.language}
            onChange={(val) => setForm((p) => ({ ...p, language: val ? String(val) : 'en' }))}
            options={LANGUAGES}
          />

          {/* Support Email — required */}
          <ATMTextField
            name="supportEmail"
            type="email"
            label="Support Email"
            required
            placeholder="support@yourcompany.com"
            value={form.supportEmail}
            onChange={(e) => setForm((p) => ({ ...p, supportEmail: e.target.value }))}
          />

          {/* Platform DBA Name */}
          <ATMTextField
            name="dbaName"
            label="Platform DBA Name"
            placeholder="Doing-business-as name shown on invoices & emails"
            value={form.dbaName}
            onChange={(e) => setForm((p) => ({ ...p, dbaName: e.target.value }))}
          />
        </div>
      </ATMCard>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50/50 p-4 dark:border-accent-850 dark:bg-accent-950/20">
        <Globe className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" />
        <p className="text-sm text-accent-700 dark:text-accent-300 font-semibold">
          This platform serves a single country. Every merchant, plan price, and invoice on this
          deployment uses the country's currency and regulations.
        </p>
      </div>
    </div>
  );
}

export default GlobalSettingsPage;
