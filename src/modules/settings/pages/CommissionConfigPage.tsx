import React, { useState } from 'react';
import { Save, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { put } from '@/lib/api/client';

type Frequency = 'ASAP' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

interface CadenceForm {
  frequency: Frequency;
  hourUtc?: number;
  dayOfWeek?: string;
  dayOfMonth?: number;
  asapIntervalMinutes?: number;
}

const COLLECTION_FREQUENCIES = [
  { label: 'Hourly', value: 'Hourly' },
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

const CHARGE_FREQUENCIES = [
  { label: 'ASAP', value: 'ASAP' },
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

const INVOICE_FREQUENCIES = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
];

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
  showDayOfWeek = false,
  showDayOfMonth = false,
}: {
  title: string;
  description: string;
  state: CadenceForm;
  setState: (next: CadenceForm) => void;
  frequencies: { label: string; value: string }[];
  showAsap?: boolean;
  showDayOfWeek?: boolean;
  showDayOfMonth?: boolean;
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

        {state.frequency !== 'ASAP' && state.frequency !== 'Hourly' && (
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

        {showDayOfWeek && state.frequency === 'Weekly' && (
          <ATMSelectField
            name="dayOfWeek"
            label="Day of week"
            value={state.dayOfWeek ?? 'Monday'}
            onChange={(val) => setState({ ...state, dayOfWeek: val ? String(val) : 'Monday' })}
            options={DAYS_OF_WEEK}
          />
        )}

        {showDayOfMonth && (state.frequency === 'Monthly' || state.frequency === 'Quarterly') && (
          <ATMTextField
            name="dayOfMonth"
            type="number"
            label="Day of month (1-28)"
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

export function CommissionConfigPage() {
  const [collection, setCollection] = useState<CadenceForm>({ frequency: 'Daily', hourUtc: 1 });
  const [charge, setCharge] = useState<CadenceForm>({ frequency: 'ASAP', asapIntervalMinutes: 10 });
  const [invoice, setInvoice] = useState<CadenceForm>({ frequency: 'Monthly', hourUtc: 1, dayOfMonth: 1 });
  const [saving, setSaving] = useState(false);

  const saveAll = async () => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {
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
      await put('/api/v1/settings', settings);
      toast.success('Billing cadence settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Billing Cadence</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Three independent schedules drive the platform billing lifecycle. Subscription wallet
            deduction is daily-universal (not configurable). Plan-changes are immediate; the per-day
            accrual means the invoice is just a summary of what was deducted.
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Save} isLoading={saving} onClick={saveAll}>
          Save Settings
        </ATMButton>
      </div>

      <div className="flex flex-col gap-6">
        <CadenceCard
          title="Revenue Collection"
          description="How often Platform pulls revenue snapshots from each Enterprise merchant's Cloud (up to last complete day only)."
          state={collection}
          setState={setCollection}
          frequencies={COLLECTION_FREQUENCIES}
          showDayOfWeek
          showDayOfMonth
        />

        <CadenceCard
          title="Commission Wallet Charge"
          description="How often the commission (rate × revenue + tax) is deducted from the merchant's wallet. ASAP means as soon as a collection is ready, subject to the throttle interval."
          state={charge}
          setState={setCharge}
          frequencies={CHARGE_FREQUENCIES}
          showAsap
          showDayOfWeek
          showDayOfMonth
        />

        <CadenceCard
          title="Invoice Generation"
          description="How often the unified merchant invoice is produced. ONE invoice per merchant per period with 2 summary lines (Subscription always; Commission only if > 0). Tax applied per scope (Subscription / Commission / Both)."
          state={invoice}
          setState={setInvoice}
          frequencies={INVOICE_FREQUENCIES}
          showDayOfWeek
          showDayOfMonth
        />
      </div>
    </div>
  );
}

export default CommissionConfigPage;
