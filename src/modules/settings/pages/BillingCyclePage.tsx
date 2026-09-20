import React, { useEffect, useState } from 'react';
import { Save, Clock, Scale, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { get, put } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';

/**
 * 2026-08-09 (flexible tax-point remodel, user-locked): this screen configures the WHOLE
 * AUTOMATED BILLING CYCLE for Enterprise merchants. Wallets hold SERVICE TOKENS (money is
 * converted at the exchange rate on recharge — the wallet never holds money).
 *
 * The ENTERPRISE TAX POINT decides where tax applies:
 *   • Settlement (default): recharge = untaxed deposit (receipt); the periodic invoice is
 *     the tax document (subscription + commission taxed per scope, tokens deducted as
 *     adjustment, shortfall payable).
 *   • Recharge: every wallet recharge generates a TAXED Service Token invoice ASAP
 *     (ServiceTokenRecharge tax scope); the periodic document becomes an untaxed
 *     consumption statement.
 * The mode is stamped on each document at creation — changing it affects future events only.
 *
 * Standalone merchants are untouched by all of this: License Token sales are invoiced and
 * taxed at purchase, always.
 */

type Frequency = 'ASAP' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
type TaxPoint = 'Settlement' | 'Recharge';

interface CadenceForm {
  frequency: Frequency;
  hourUtc?: number;
  dayOfWeek?: string;
  dayOfMonth?: number;
  asapIntervalMinutes?: number;
}

const SCHEDULED_FREQUENCIES = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly', value: 'Yearly' },
];

const CHARGE_FREQUENCIES = [{ label: 'ASAP', value: 'ASAP' }, ...SCHEDULED_FREQUENCIES];

const DAYS_OF_WEEK = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'Sunday', value: 'Sunday' },
];

function CadenceCard({
  title,
  description,
  state,
  setState,
  frequencies,
  showAsap = false,
}: {
  title: string;
  description: string;
  state: CadenceForm;
  setState: (next: CadenceForm) => void;
  frequencies: { label: string; value: string }[];
  showAsap?: boolean;
}) {
  return (
    <ATMCard className="glass-card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6">{description}</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
        <ATMSelectField
          name="frequency"
          label="Frequency"
          value={state.frequency}
          onChange={(val) => setState({ ...state, frequency: (val ? String(val) : 'Daily') as Frequency })}
          options={frequencies}
        />

        {showAsap && state.frequency === 'ASAP' && (
          <ATMTextField
            name="asapIntervalMinutes"
            type="number"
            label="ASAP interval (minutes)"
            value={state.asapIntervalMinutes ?? 10}
            onChange={(e) => setState({ ...state, asapIntervalMinutes: Number(e.target.value) })}
            min={1}
          />
        )}

        {state.frequency !== 'ASAP' && (
          <ATMTextField
            name="hourUtc"
            type="number"
            label="Hour (UTC)"
            value={state.hourUtc ?? 1}
            onChange={(e) => setState({ ...state, hourUtc: Number(e.target.value) })}
            min={0}
            max={23}
          />
        )}

        {state.frequency === 'Weekly' && (
          <ATMSelectField
            name="dayOfWeek"
            label="Day of week"
            value={state.dayOfWeek ?? 'Monday'}
            onChange={(val) => setState({ ...state, dayOfWeek: val ? String(val) : 'Monday' })}
            options={DAYS_OF_WEEK}
          />
        )}

        {(state.frequency === 'Monthly' || state.frequency === 'Yearly') && (
          <ATMTextField
            name="dayOfMonth"
            type="number"
            label={state.frequency === 'Yearly' ? 'Day of January (1-28)' : 'Day of month (1-28)'}
            value={state.dayOfMonth ?? 1}
            onChange={(e) => setState({ ...state, dayOfMonth: Number(e.target.value) })}
            min={1}
            max={28}
          />
        )}
      </div>
    </ATMCard>
  );
}

interface SettingRow {
  settingKey: string;
  settingValue: string;
}

function readCadence(map: Record<string, string>, prefix: string, fallback: CadenceForm): CadenceForm {
  const freq = map[`${prefix}.frequency`];
  if (!freq) return fallback;
  return {
    frequency: freq as Frequency,
    hourUtc: Number(map[`${prefix}.hour_utc`] ?? 1),
    dayOfWeek: map[`${prefix}.day_of_week`] ?? 'Monday',
    dayOfMonth: Number(map[`${prefix}.day_of_month`] ?? 1),
    asapIntervalMinutes: Number(map[`${prefix}.asap_interval_minutes`] ?? 10),
  };
}

export function BillingCyclePage() {
  const [taxPoint, setTaxPoint] = useState<TaxPoint>('Settlement');
  const [loadedTaxPoint, setLoadedTaxPoint] = useState<TaxPoint>('Settlement');
  const [collection, setCollection] = useState<CadenceForm>({ frequency: 'Daily', hourUtc: 1 });
  const [charge, setCharge] = useState<CadenceForm>({ frequency: 'ASAP', asapIntervalMinutes: 10 });
  const [invoice, setInvoice] = useState<CadenceForm>({ frequency: 'Monthly', hourUtc: 1, dayOfMonth: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const taxPointChanged = taxPoint !== loadedTaxPoint;
  const settlementMode = taxPoint === 'Settlement';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get<ApiResponse<SettingRow[]>>('/api/v1/settings');
        const rowsRaw = (res as any)?.data;
        const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
        const map: Record<string, string> = {};
        rows.forEach((r: any) => { map[r.settingKey ?? r.key] = r.settingValue ?? r.value; });
        if (cancelled) return;
        const tp = (map['billing.enterprise_tax_point'] === 'Recharge' ? 'Recharge' : 'Settlement') as TaxPoint;
        setTaxPoint(tp);
        setLoadedTaxPoint(tp);
        setCollection((prev) => readCadence(map, 'commission.collection', prev));
        setCharge((prev) => readCadence(map, 'commission.charge', prev));
        setInvoice((prev) => readCadence(map, 'invoice', prev));
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load billing cycle settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveAll = async () => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {
        'billing.enterprise_tax_point': taxPoint,
        'commission.collection.frequency': collection.frequency,
        'commission.collection.hour_utc': String(collection.hourUtc ?? 1),
        'commission.collection.day_of_week': collection.dayOfWeek ?? 'Monday',
        'commission.collection.day_of_month': String(collection.dayOfMonth ?? 1),
        'commission.charge.frequency': charge.frequency,
        'commission.charge.asap_interval_minutes': String(charge.asapIntervalMinutes ?? 10),
        'commission.charge.hour_utc': String(charge.hourUtc ?? 1),
        'commission.charge.day_of_week': charge.dayOfWeek ?? 'Monday',
        'commission.charge.day_of_month': String(charge.dayOfMonth ?? 1),
        'invoice.frequency': invoice.frequency,
        'invoice.hour_utc': String(invoice.hourUtc ?? 1),
        'invoice.day_of_month': String(invoice.dayOfMonth ?? 1),
        'invoice.day_of_week': invoice.dayOfWeek ?? 'Monday',
      };
      const payload = Object.entries(settings).map(([settingKey, settingValue]) => ({ settingKey, settingValue }));
      await put('/api/v1/settings/bulk', payload);
      setLoadedTaxPoint(taxPoint);
      toast.success('Billing cycle settings saved.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save billing cycle settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Title matches the sidebar label. */}
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Billing Cycle</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Configures the automated billing cycle for Enterprise merchants — collect revenue,
            charge commission, produce the periodic document. Wallets hold Service Tokens
            (money converts at the exchange rate on recharge). Subscription charges come from
            the merchant's plan and are deducted daily (fixed). On-demand billing remains
            available from the Billing menus. Standalone License Token sales are taxed at
            purchase and are not affected by anything here.
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} disabled={loading} onClick={saveAll}>
          Save Settings
        </ATMButton>
      </div>

      {loading ? (
        <div className="space-y-4">
          <ATMSkeleton className="h-44 w-full" />
          <ATMSkeleton className="h-44 w-full" />
          <ATMSkeleton className="h-44 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Enterprise tax point */}
          <ATMCard className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enterprise Tax Point</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6">
              Where tax applies for Enterprise billing — decide together with your tax advisor
              for this deployment's country. Standalone License Token sales are always taxed at
              purchase regardless of this setting.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
              <ATMSelectField
                name="taxPoint"
                label="Tax point"
                value={taxPoint}
                onChange={(val) => setTaxPoint((val === 'Recharge' ? 'Recharge' : 'Settlement') as TaxPoint)}
                options={[
                  { label: 'Tax at settlement — periodic invoice (default)', value: 'Settlement' },
                  { label: 'Tax at wallet recharge — invoice per recharge (ASAP)', value: 'Recharge' },
                ]}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold self-end pb-3">
                {settlementMode
                  ? 'Recharges issue an untaxed receipt; the periodic invoice taxes subscription + commission per their tax scopes.'
                  : 'Every recharge generates a taxed Service Token invoice immediately (ServiceTokenRecharge tax scope); the periodic document becomes an untaxed consumption statement.'}
              </p>
            </div>
            {taxPointChanged && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
                  <p className="font-black">Changing the tax point affects FUTURE events only.</p>
                  <p className="mt-0.5 font-medium">
                    Documents already issued keep the mode they were created under, and existing
                    wallet balances were taxed under the previous rule. Confirm this change with
                    your tax advisor before saving.
                  </p>
                </div>
              </div>
            )}
          </ATMCard>

          <CadenceCard
            title="Step 1 — Revenue Collection (Bridge API)"
            description="Commission is calculated on actual merchant revenue, which the Platform pulls from each Enterprise merchant's Cloud through the Bridge API — this sets how often that data is collected (always up to the last complete day). Subscription billing does not depend on this."
            state={collection}
            setState={setCollection}
            frequencies={SCHEDULED_FREQUENCIES}
          />

          <CadenceCard
            title="Step 2 — Commission Wallet Charge"
            description="How often the calculated commission (rate × collected revenue + tax) is deducted from the merchant's Service Token wallet. ASAP deducts as soon as a new revenue collection is ready, throttled by the interval below."
            state={charge}
            setState={setCharge}
            frequencies={CHARGE_FREQUENCIES}
            showAsap
          />

          <CadenceCard
            title={settlementMode ? 'Step 3 — Invoice Generation' : 'Step 3 — Statement Generation'}
            description={
              settlementMode
                ? 'How often the consolidated tax invoice is produced. Each invoice shows the period\'s subscription charges and commission (taxed per scope), the Service Tokens already deducted from the wallet as adjustment, and the balance payable when the wallet held too little.'
                : 'How often the consumption statement is produced. Tax was already settled on each recharge invoice, so the statement lists the period\'s subscription charges and commission without tax, the Service Tokens deducted as adjustment, and the balance payable when the wallet held too little.'
            }
            state={invoice}
            setState={setInvoice}
            frequencies={SCHEDULED_FREQUENCIES}
          />
        </div>
      )}
    </div>
  );
}

export default BillingCyclePage;
