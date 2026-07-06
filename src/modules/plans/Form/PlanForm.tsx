import React, { useState, useEffect } from 'react';
import { FormikProvider } from 'formik';
import { cn } from '@/lib/utils/cn';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMButton } from '@/shared/ui/ATMButton';
import { Check, Plus, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { calculatePlanPrice } from '@/modules/rateCards/utils/priceCalculator';
import {
  DEFAULT_ENT_MODULES,
  DEFAULT_ENT_PAYMENTS,
  DEFAULT_ENT_SERVICES,
  DEFAULT_ENT_LIMITS,
  DEFAULT_STD_MODULES,
  DEFAULT_STD_PAYMENTS,
  DEFAULT_STD_SERVICES,
  DEFAULT_STD_LIMITS,
} from '../types/plan.types';

interface PlanFormProps {
  formik: any;
  addFeatureRow: () => void;
  removeFeatureRow: (idx: number) => void;
  toggleFeatureIncluded: (idx: number) => void;
}

const PLAN_TYPE_OPTIONS = [
  { value: 'Standalone POS', label: 'Standalone POS' },
  { value: 'Standalone Cloud', label: 'Standalone Cloud' },
  { value: 'Enterprise cloud', label: 'Enterprise cloud' },
];

const ALL_FEATURES = [
  { key: 'INV', label: 'Inventory Management' },
  { key: 'FIN', label: 'Finance / Accounting' },
  { key: 'HRM', label: 'HR & Staff Management' },
  { key: 'MKT', label: 'Marketing & Loyalty' },
  { key: 'ANL', label: 'Analytics & Reports' },
  { key: 'WTM', label: 'Workforce / Table-Turn' },
];

const ALL_PAYMENTS = [
  { key: 'CSH', label: 'Cash' },
  { key: 'CRD', label: 'Card (POS/EDC)' },
  { key: 'EXT', label: 'UPI / QR / Online' },
  { key: 'GFT', label: 'Gift Card' },
  { key: 'STC', label: 'Store Credit' },
  { key: 'WLT', label: 'In-app Wallet' },
  { key: 'CSL', label: 'Credit Sale / Udhar' },
];

const ALL_SERVICES = [
  { key: 'DIN', label: 'Dine-In' },
  { key: 'CTR', label: 'Counter / Takeaway' },
  { key: 'PUP', label: 'Pickup' },
  { key: 'DLV', label: 'Delivery' },
  { key: 'CTG', label: 'Catering / Bulk' },
  { key: 'SNP', label: 'QR / Self-Order' },
  { key: 'RSO', label: 'Reservation Order' },
  { key: 'WOR', label: 'Web Ordering' },
  { key: 'WRV', label: 'Waitlist / Reservation' },
];

const ALL_LIMITS = [
  { key: 'MBU', label: 'Business Units' },
  { key: 'MLO', label: 'Locations / Outlets' },
  { key: 'MTM', label: 'POS Terminals' },
  { key: 'MPR', label: 'Products' },
  { key: 'MPG', label: 'Product Groups' },
  { key: 'MGB', label: 'Storage (GB)' },
  { key: 'MDP', label: 'Delivery Partners' },
  { key: 'MKD', label: 'Kitchen Displays' },
  { key: 'MDS', label: 'Dine-in Sections' },
  { key: 'MIS', label: 'Integration Slots' },
  { key: 'MPW', label: 'Payment Gateways' },
  { key: 'MRS', label: 'Reservation Slots/day' },
  { key: 'MAC', label: 'Active Campaigns' },
  { key: 'MWR', label: 'Warehouses' },
  { key: 'MWE', label: 'Staff Logins' },
  { key: 'MBR', label: 'Branches' },
];

const ToggleGrid: React.FC<{
  label: string;
  count: string;
  items: { key: string; label: string }[];
  field: string;
  formik: any;
}> = ({ label, count, items, field, formik }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between px-1 border-b border-gray-100 dark:border-gray-800/65 pb-1">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <span className="text-[10px] text-gray-400 font-bold">{count}</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
      {items.map(({ key, label: name }) => {
        const isOn = !!formik.values[field]?.[key];
        return (
          <div
            key={key}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[var(--zen-surface)] border border-[var(--zen-border)] dark:bg-zinc-955/20"
          >
            <span className={cn('text-xs font-semibold', isOn ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>
              {name}
            </span>
            <ATMSwitch
              name={`${field}.${key}`}
              checked={isOn}
              onChange={(c) => formik.setFieldValue(`${field}.${key}`, c)}
              size="md"
            />
          </div>
        );
      })}
    </div>
  </div>
);

export const PlanForm: React.FC<PlanFormProps> = ({
  formik,
  addFeatureRow,
  removeFeatureRow,
  toggleFeatureIncluded,
}) => {
  const isEnterprise = formik.values.planType === 'Enterprise cloud';
  const featureOn = ALL_FEATURES.filter((f) => !!formik.values.planFeatures?.[f.key]).length;
  const payOn = ALL_PAYMENTS.filter((p) => !!formik.values.planPayments?.[p.key]).length;
  const svcOn = ALL_SERVICES.filter((s) => !!formik.values.planServices?.[s.key]).length;

  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const activeRateCard = rateCards.find((c) => c.isDefault) || rateCards[0];
  const [autoCalculate, setAutoCalculate] = useState(!formik.values.isManualPrice);

  // Sync state if formik values change (e.g. during reinitialization on Edit)
  useEffect(() => {
    setAutoCalculate(!formik.values.isManualPrice);
  }, [formik.values.isManualPrice]);

  // Dynamic formula calculation hook
  useEffect(() => {
    if (autoCalculate && activeRateCard) {
      const calc = calculatePlanPrice({
        planFeatures: formik.values.planFeatures,
        planPayments: formik.values.planPayments,
        planServices: formik.values.planServices,
        planLimits: formik.values.planLimits,
      }, activeRateCard);

      const variation = Number(formik.values.priceVariation || 0);
      const finalDaily = Number(Math.max(0, calc.dailyPrice + variation).toFixed(2));
      formik.setFieldValue('dailyPrice', finalDaily);
    }
  }, [
    formik.values.planFeatures,
    formik.values.planPayments,
    formik.values.planServices,
    formik.values.planLimits,
    formik.values.priceVariation,
    activeRateCard,
    autoCalculate,
  ]);

  // Keep weekly, monthly, and yearly prices in sync with dailyPrice for API compatibility
  useEffect(() => {
    const daily = Number(formik.values.dailyPrice || 0);
    formik.setFieldValue('weeklyPrice', Number((daily * 7).toFixed(2)));
    formik.setFieldValue('monthlyPrice', Number((daily * 30).toFixed(2)));
    formik.setFieldValue('yearlyPrice', Number((daily * 365).toFixed(2)));
  }, [formik.values.dailyPrice]);

  const lastPlanTypeRef = React.useRef(formik.values.planType);
  useEffect(() => {
    if (formik.values.planType !== lastPlanTypeRef.current) {
      lastPlanTypeRef.current = formik.values.planType;
      if (formik.values.planType === 'Enterprise cloud') {
        formik.setFieldValue('planFeatures', { ...DEFAULT_ENT_MODULES });
        formik.setFieldValue('planPayments', { ...DEFAULT_ENT_PAYMENTS });
        formik.setFieldValue('planServices', { ...DEFAULT_ENT_SERVICES });
        formik.setFieldValue('planLimits', { ...DEFAULT_ENT_LIMITS });
      } else {
        formik.setFieldValue('planFeatures', { ...DEFAULT_STD_MODULES });
        formik.setFieldValue('planPayments', { ...DEFAULT_STD_PAYMENTS });
        formik.setFieldValue('planServices', { ...DEFAULT_STD_SERVICES });
        formik.setFieldValue('planLimits', { ...DEFAULT_STD_LIMITS });
      }
    }
  }, [formik.values.planType]);

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-4 py-1 max-h-[500px] overflow-y-auto pr-1">
        {/* ── Basic Info ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ATMTextField
            name="name"
            label="Plan Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="e.g. Professional"
            required
          />
          <ATMSelectField
            name="planType"
            label="Plan Type"
            options={PLAN_TYPE_OPTIONS}
            value={formik.values.planType}
            onChange={(val) => formik.setFieldValue('planType', val)}
            required
          />
          <ATMTextField
            name="priority"
            label="Display Priority"
            type="number"
            value={formik.values.priority}
            onChange={formik.handleChange}
            placeholder="1"
            required
          />
        </div>

        {/* ── Auto-Calculate Price Toggle ── */}
        <div className="p-3.5 rounded-lg border border-[var(--zen-border)] bg-[var(--zen-surface)] flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">Auto-calculate from Rate Card</p>
            <p className="text-[10px] text-gray-400 font-bold">Use active Rate Card formulas to calculate prices</p>
          </div>
          <ATMSwitch
            name="autoCalcToggle"
            checked={autoCalculate}
            onChange={(val) => {
              setAutoCalculate(val);
              if (val) {
                formik.setFieldValue('isManualPrice', false);
              }
            }}
            size="md"
          />
        </div>

        {/* ── Manual Override Section ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-amber-250/20 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-955/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-500">Enable Manual Price Override</p>
              <p className="text-[10px] text-gray-400 font-bold">Manually override calculated cycle prices with a custom price</p>
            </div>
            <ATMSwitch
              name="isManualPrice"
              checked={formik.values.isManualPrice}
              onChange={(c) => {
                formik.setFieldValue('isManualPrice', c);
                if (c) {
                  setAutoCalculate(false);
                }
              }}
              size="md"
            />
          </div>
          {formik.values.isManualPrice && (
            <ATMTextField
              name="manualPrice"
              label="Custom Manual Price ($)"
              type="number"
              value={formik.values.manualPrice}
              onChange={formik.handleChange}
              placeholder="e.g. 99"
              required
            />
          )}
        </div>

        {/* ── Pricing Configuration (Daily Price & Price Variation) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ATMTextField
            name="dailyPrice"
            label="Daily Base Price ($)"
            type="number"
            value={formik.values.dailyPrice}
            onChange={(e) => {
              formik.handleChange(e);
              setAutoCalculate(false);
            }}
            disabled={autoCalculate}
            required
            className="bg-slate-50/50 dark:bg-zinc-950/20 font-semibold"
          />
          <ATMTextField
            name="priceVariation"
            label="Price Variation ($)"
            type="number"
            placeholder="e.g. +5.00 or -3.00"
            value={formik.values.priceVariation}
            onChange={formik.handleChange}
            disabled={!autoCalculate}
            className="bg-slate-50/50 dark:bg-zinc-950/20 font-semibold"
          />
        </div>

        {/* Background Billing Summary Box */}
        {/* <div className="p-3.5 rounded-lg border border-[var(--zen-border)] bg-slate-50/10 dark:bg-zinc-950/15">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Cycle Calculation Sync (Background API)</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="py-2 px-1 rounded border border-[var(--zen-border)] bg-slate-50/20 dark:bg-zinc-950/25">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Price</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 inline-block">${formik.values.weeklyPrice} /wk</span>
            </div>
            <div className="py-2 px-1 rounded border border-[var(--zen-border)] bg-slate-50/20 dark:bg-zinc-950/25 ring-1 ring-primary-500/10">
              <span className="text-[9px] font-bold text-primary-500 uppercase tracking-wider block font-semibold">Monthly Price</span>
              <span className="text-xs font-black text-primary-600 dark:text-primary-400 mt-0.5 inline-block">${formik.values.monthlyPrice} /mo</span>
            </div>
            <div className="py-2 px-1 rounded border border-[var(--zen-border)] bg-slate-50/20 dark:bg-zinc-950/25">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Yearly Price</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 inline-block">${formik.values.yearlyPrice} /yr</span>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ATMTextField
            name="trialPeriod"
            label="Trial Period (Days)"
            type="number"
            value={formik.values.trialPeriod}
            onChange={formik.handleChange}
          />
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--zen-surface)] border border-[var(--zen-border)]">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-250">Active — Available for signups</p>
            <ATMSwitch
              name="statusSwitch"
              checked={formik.values.status === 'Active'}
              onChange={(c) => formik.setFieldValue('status', c ? 'Active' : 'Inactive')}
              size="md"
            />
          </div>
        </div>

        {/* Section: Toggles — Features / Payments / Services */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-4">
          <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
            {isEnterprise ? 'Enterprise Cloud' : 'Standalone POS'} — Access Config
          </p>

          <ToggleGrid
            label="Modules"
            count={`${featureOn}/${ALL_FEATURES.length} ON`}
            items={ALL_FEATURES}
            field="planFeatures"
            formik={formik}
          />
          <ToggleGrid
            label="Payment Methods"
            count={`${payOn}/${ALL_PAYMENTS.length} ON`}
            items={ALL_PAYMENTS}
            field="planPayments"
            formik={formik}
          />
          <ToggleGrid
            label="Order Types"
            count={`${svcOn}/${ALL_SERVICES.length} ON`}
            items={ALL_SERVICES}
            field="planServices"
            formik={formik}
          />
        </div>

        {/* Section: Limits */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              Limits
            </p>
            <span className="text-[10px] text-gray-400">0 = unlimited</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALL_LIMITS.map(({ key, label: name }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 px-3.5 rounded-lg bg-[var(--zen-surface)] border border-[var(--zen-border)] dark:bg-zinc-955/20"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate flex-1">
                  {name}
                </span>
                <input
                  type="number"
                  min={0}
                  value={formik.values.planLimits?.[key] ?? 0}
                  onChange={(e) => formik.setFieldValue(`planLimits.${key}`, Number(e.target.value) || 0)}
                  className="w-20 h-8 text-center text-xs font-mono font-bold px-2 py-1 rounded-lg border border-[var(--zen-border)] bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all ml-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Display Features (marketing labels) */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Marketing Bullet Points ({formik.values.features.length})
            </p>
            <ATMButton
              type="button"
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={addFeatureRow}
              className="text-blue-600 hover:bg-blue-50/30"
            >
              Add Bullet Point
            </ATMButton>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {formik.values.features.map((feat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFeatureIncluded(idx)}
                  className={cn(
                    'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer',
                    feat.included
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                  )}
                >
                  {feat.included ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3 stroke-[2]" />}
                </button>
                <ATMTextField
                  name={`features[${idx}].text`}
                  value={feat.text}
                  onChange={formik.handleChange}
                  placeholder={`Bullet point ${idx + 1}`}
                  className="flex-1 !gap-0"
                />
                {formik.values.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeatureRow(idx)}
                    className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </FormikProvider>
  );
};
export default PlanForm;
