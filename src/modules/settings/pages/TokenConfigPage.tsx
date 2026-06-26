import React, { useState } from 'react';
import { Shield, Key, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMCheckbox } from '@/shared/ui/ATMCheckbox';
import { ATMTextField } from '@/shared/ui/ATMTextField';

interface TokenTierConfig {
  tier: string;
  maxTokens: number;
  maxDevices: number;
  expiryDays: number;
  gracePolicyDays: number;
  color: string;
}

const TIER_CONFIGS: TokenTierConfig[] = [
  { tier: 'Basic', maxTokens: 5, maxDevices: 2, expiryDays: 365, gracePolicyDays: 7, color: 'border-gray-200 dark:border-gray-800' },
  { tier: 'Standard', maxTokens: 25, maxDevices: 10, expiryDays: 365, gracePolicyDays: 7, color: 'border-accent-400 dark:border-accent-600' },
  { tier: 'Advance', maxTokens: 100, maxDevices: 50, expiryDays: 730, gracePolicyDays: 14, color: 'border-indigo-400 dark:border-indigo-600' },
  { tier: 'Premium', maxTokens: -1, maxDevices: -1, expiryDays: 730, gracePolicyDays: 21, color: 'border-amber-400 dark:border-amber-600' },
];

const PAYLOAD_FIELDS = [
  { key: 'MerchantId', label: 'Merchant ID', description: 'Unique merchant identifier', checked: true },
  { key: 'BusinessId', label: 'Business ID', description: 'Business registration reference', checked: true },
  { key: 'LocationId', label: 'Location ID', description: 'Licensed location binding', checked: true },
  { key: 'TerminalId', label: 'Terminal ID', description: 'Specific terminal binding (optional)', checked: false },
  { key: 'ValidFrom', label: 'Valid From', description: 'Token activation start date', checked: true },
  { key: 'ValidTo', label: 'Valid To', description: 'Token expiry date', checked: true },
  { key: 'LimitsPayload', label: 'Limits Payload', description: 'Rate limits, transaction caps, product limits', checked: true },
  { key: 'FeatureMap', label: 'Feature Map', description: 'Enabled features for this tier', checked: true },
  { key: 'GracePolicyDays', label: 'Grace Policy Days', description: 'Days after expiry before degradation', checked: true },
  { key: 'Tier', label: 'Tier', description: 'Basic/Standard/Advance/Premium tier identifier', checked: true },
];

export function TokenConfigPage() {
  const [fields, setFields] = useState(PAYLOAD_FIELDS);
  const [saving, setSaving] = useState(false);

  const toggleField = (key: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, checked: !f.checked } : f)));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Token configuration saved');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Token Configuration
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Manage encryption, signing, payload fields, and tier-based token limits.
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} onClick={handleSave}>
          Save Changes
        </ATMButton>
      </div>

      {/* Encryption & Signing */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-950/40">
              <Shield className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Encryption</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Token payload encryption method</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-250 bg-gray-55/40 px-4 py-3.5 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">AES-256-GCM</p>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-450 font-semibold">Read-only. Encryption algorithm cannot be changed at runtime.</p>
          </div>
        </ATMCard>

        <ATMCard className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
              <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Signing Key Rotation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Automatic key rotation schedule</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-450">Current Key ID</span>
              <span className="font-mono text-gray-900 dark:text-white">qx-sign-2026-03</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-450">Rotation Interval</span>
              <span className="text-gray-900 dark:text-white">90 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-450">Next Rotation</span>
              <span className="text-gray-900 dark:text-white">2026-06-15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-450">Algorithm</span>
              <span className="font-mono text-gray-900 dark:text-white">RS256</span>
            </div>
          </div>
          <ATMButton variant="secondary" size="sm" icon={RefreshCw} className="mt-4" onClick={() => toast('Key rotation initiated')}>
            Rotate Now
          </ATMButton>
        </ATMCard>
      </div>

      {/* Payload Fields */}
      <ATMCard title="Token Payload Fields" className="glass-card">
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">
          ATMSelect which fields are included in generated token payloads.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-55/20 px-4 py-3 dark:border-gray-800/80 dark:bg-gray-900/10">
              <ATMCheckbox
                name={f.key}
                checked={f.checked}
                onChange={() => toggleField(f.key)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-250">{f.label}</span>
                <p className="text-xs text-gray-500 dark:text-gray-450 font-semibold mt-0.5">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ATMCard>

      {/* Validation Rules */}
      <ATMCard title="Validation Rules" className="glass-card">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 pt-2">
          <ATMTextField
            name="minTokenLength"
            type="number"
            label="Min Token Length"
            defaultValue={32}
          />
          <ATMTextField
            name="maxActivations"
            type="number"
            label="Max Activations Per Token"
            defaultValue={3}
          />
          <ATMTextField
            name="gracePeriod"
            type="number"
            label="Grace Period (hours)"
            defaultValue={24}
          />
        </div>
      </ATMCard>

      {/* Tier Limits */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Template Limits per Tier
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_CONFIGS.map((tier) => (
            <div key={tier.tier} className={`rounded-xl border-2 ${tier.color} bg-white dark:bg-gray-900 p-5 shadow-sm`}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tier.tier}</h3>
              <div className="mt-4 space-y-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-450">Max Tokens</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {tier.maxTokens === -1 ? 'Unlimited' : tier.maxTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-450">Max Devices</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {tier.maxDevices === -1 ? 'Unlimited' : tier.maxDevices}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-450">Expiry</span>
                  <span className="text-gray-900 dark:text-white font-bold">{tier.expiryDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-450">Grace Policy</span>
                  <span className="text-gray-900 dark:text-white font-bold">{tier.gracePolicyDays} days</span>
                </div>
              </div>
              <p className="mt-3.5 text-[10px] text-gray-400 dark:text-gray-550 font-bold italic">
                GracePolicyDays encoded in Recharge Token payload
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TokenConfigPage;
