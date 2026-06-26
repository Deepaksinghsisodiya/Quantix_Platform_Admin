import React, { useState } from 'react';
import { Save, Globe } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';

interface GlobalSettings {
  platformName: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  legalEntityName: string;
}

const INITIAL: GlobalSettings = {
  platformName: 'Quantix Enterprise POS',
  supportEmail: 'support@quantix.io',
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  timezone: 'Asia/Dubai',
  legalEntityName: 'Quantix Technologies LLC',
};

const CURRENCIES = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'AED', value: 'AED' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'America/New York', value: 'America/New_York' },
  { label: 'America/Chicago', value: 'America/Chicago' },
  { label: 'America/Los Angeles', value: 'America/Los_Angeles' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
];

export function GlobalSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Global settings saved');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Global Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Configure platform-wide defaults and legal entity information.
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} onClick={handleSave}>
          Save Changes
        </ATMButton>
      </div>

      {/* Form Card */}
      <ATMCard className="glass-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2">
          {/* Platform Name */}
          <ATMTextField
            name="platformName"
            label="Platform Name"
            value={settings.platformName}
            onChange={(e) => update('platformName', e.target.value)}
          />

          {/* Support Email */}
          <ATMTextField
            name="supportEmail"
            type="email"
            label="Support Email"
            value={settings.supportEmail}
            onChange={(e) => update('supportEmail', e.target.value)}
          />

          {/* Default Currency */}
          <ATMSelectField
            name="defaultCurrency"
            label="Default Currency"
            value={settings.defaultCurrency}
            onChange={(val) => update('defaultCurrency', val ? String(val) : '')}
            options={CURRENCIES}
          />

          {/* Default Language */}
          <ATMSelectField
            name="defaultLanguage"
            label="Default Language"
            value={settings.defaultLanguage}
            onChange={(val) => update('defaultLanguage', val ? String(val) : '')}
            options={LANGUAGES}
          />

          {/* Timezone */}
          <ATMSelectField
            name="timezone"
            label="Timezone"
            value={settings.timezone}
            onChange={(val) => update('timezone', val ? String(val) : '')}
            options={TIMEZONES}
          />

          {/* Legal Entity Name */}
          <ATMTextField
            name="legalEntityName"
            label="Legal Entity Name"
            value={settings.legalEntityName}
            onChange={(e) => update('legalEntityName', e.target.value)}
          />
        </div>
      </ATMCard>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50/50 p-4 dark:border-accent-850 dark:bg-accent-950/20">
        <Globe className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" />
        <p className="text-sm text-accent-700 dark:text-accent-300 font-semibold">
          Changes to global settings affect all new merchants. Existing merchants retain their current configuration unless overridden.
        </p>
      </div>
    </div>
  );
}

export default GlobalSettingsPage;
