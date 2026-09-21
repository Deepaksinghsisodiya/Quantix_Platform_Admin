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
  DEFAULT_STDC_MODULES,
  DEFAULT_STDC_PAYMENTS,
  DEFAULT_STDC_SERVICES,
  DEFAULT_STDC_LIMITS,
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
  { value: 'Enterprise cloud', label: 'Enterprise Cloud' },
];

// 2026-08-07: a Standalone POS merchant can run restaurant AND retail terminals — Both is valid.
const FLAVOUR_OPTIONS = [
  { value: 'RES', label: 'Restaurant' },
  { value: 'RET', label: 'Retail' },
  { value: 'BOT', label: 'Both (Restaurant + Retail)' },
];

// Advance features — matches Foundation.Licensing.FeatureCodes.Advance (6 codes).
const ALL_FEATURES = [
  { key: 'INV', label: 'Advance Inventory' },
  { key: 'FIN', label: 'Finance & Accounts' },
  { key: 'HRM', label: 'Human Resource Management' },
  { key: 'MKT', label: 'Marketing & Promotions' },
  { key: 'ANL', label: 'Advance Analytics & Reports' },
  { key: 'WTM', label: 'Waste Management (Restaurant-only)' },
];

// Payments — matches Foundation.Licensing.PaymentMethodCodes (7 codes).
const ALL_PAYMENTS = [
  { key: 'CSH', label: 'Cash' },
  { key: 'CRD', label: 'Card' },
  { key: 'GFT', label: 'Gift Card' },
  { key: 'STC', label: 'Store Credit' },
  { key: 'WLT', label: 'Mobile Wallet' },
  { key: 'EXT', label: 'External / Manual' },
  { key: 'CSL', label: 'Credit Sale' },
];

// Services — matches Foundation.Licensing.ServiceTypeCodes (10 codes).
// 2026-07-25: WOR dropped; SHP (Shipping) + INS (In-Store) added.
// Flavour hints in labels: (Restaurant) = Restaurant-only; (Retail) = Retail-only.
const ALL_SERVICES = [
  { key: 'DIN', label: 'Dine-In (Restaurant)' },
  { key: 'CTR', label: 'Counter (Restaurant)' },
  { key: 'PUP', label: 'Pickup' },
  { key: 'DLV', label: 'Delivery (in-house drivers)' },
  { key: 'CTG', label: 'Catering (Restaurant)' },
  { key: 'SNP', label: 'Snap Order' },
  { key: 'RSO', label: 'Reseller Order (Uber Eats / DoorDash)' },
  { key: 'SHP', label: 'Shipping (Retail)' },
  { key: 'INS', label: 'In-Store (Retail)' },
  { key: 'WRV', label: 'Web Reservation (Restaurant)' },
];

// Limits — matches Foundation.Licensing.LimitCodes exactly. 2026-07-19: fixed 7 wrong labels.
const ALL_LIMITS = [
  { key: 'MBU', label: 'Max Businesses' },
  { key: 'MLO', label: 'Max Locations' },
  { key: 'MTM', label: 'Max Terminals' },
  { key: 'MPR', label: 'Max Products' },
  { key: 'MDP', label: 'Max Delivery Partners' },
  { key: 'MKD', label: 'Max Kitchen Display Helpers' },
  { key: 'MDS', label: 'Max Dispatch Station Helpers' },
  { key: 'MIS', label: 'Max Inventory Station Helpers' },
  { key: 'MPW', label: 'Max Table POS Apps' },
  { key: 'MGB', label: 'Max Storage (GB)' },
  { key: 'MPG', label: 'Max Payment Gateways' },
  { key: 'MRS', label: 'Max Resellers (delivery partners)' },
  { key: 'MAC', label: 'Max Cloud Admin Portal Instances' },
  { key: 'MWR', label: 'Max Web Restaurant Storefronts' },
  { key: 'MWE', label: 'Max Web Retail Storefronts' },
  { key: 'MBR', label: 'Max Billing Revenue (cap)' },
];

const ToggleGrid: React.FC<{
  label: string;
  count: string;
  items: { key: string; label: string }[];
  field: string;
  formik: any;
}> = ({ label, count, items, field, formik }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between px-1 border-b border-slate-100 dark:border-slate-800/65 pb-1">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <span className="text-[10px] text-slate-400 font-bold">{count}</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
      {items.map(({ key, label: name }) => {
        const isOn = !!formik.values[field]?.[key];
        return (
          <div
            key={key}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[var(--zen-surface)] border border-[var(--zen-border)] dark:bg-[#13151a]/20"
          >
            <span className={cn('text-xs font-semibold', isOn ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
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
  const featureOn = ALL_FEATURES.filter((f) => !!formik.values.planFeatures?.[f.key]).length;
  const payOn = ALL_PAYMENTS.filter((p) => !!formik.values.planPayments?.[p.key]).length;
  const svcOn = ALL_SERVICES.filter((s) => !!formik.values.planServices?.[s.key]).length;

  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const activeRateCard = rateCards.find((c) => c.isDefault) || rateCards[0];
  const [autoCalculate, setAutoCalculate] = useState(!formik.values.isManualPrice);

  useEffect(() => {
    setAutoCalculate(!formik.values.isManualPrice);
  }, [formik.values.isManualPrice]);

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

  useEffect(() => {
    const daily = Number(formik.values.dailyPrice || 0);
    formik.setFieldValue('weeklyPrice', Number((daily * 7).toFixed(2)));
    formik.setFieldValue('monthlyPrice', Number((daily * 30).toFixed(2)));
    formik.setFieldValue('yearlyPrice', Number((daily * 365).toFixed(2)));
  }, [formik.values.dailyPrice]);

  // When planType changes, reload defaults matching the new deployment mode.
  // 2026-08-08 (27-plan matrix): every plan type supports RES / RET / BOT — the chosen
  // flavour is kept across type switches.
  const lastPlanTypeRef = React.useRef(formik.values.planType);
  useEffect(() => {
    if (formik.values.planType !== lastPlanTypeRef.current) {
      lastPlanTypeRef.current = formik.values.planType;
      if (formik.values.planType === 'Enterprise cloud') {
        formik.setFieldValue('planFeatures', { ...DEFAULT_ENT_MODULES });
        formik.setFieldValue('planPayments', { ...DEFAULT_ENT_PAYMENTS });
        formik.setFieldValue('planServices', { ...DEFAULT_ENT_SERVICES });
        formik.setFieldValue('planLimits', { ...DEFAULT_ENT_LIMITS });
      } else if (formik.values.planType === 'Standalone Cloud') {
        formik.setFieldValue('planFeatures', { ...DEFAULT_STDC_MODULES });
        formik.setFieldValue('planPayments', { ...DEFAULT_STDC_PAYMENTS });
        formik.setFieldValue('planServices', { ...DEFAULT_STDC_SERVICES });
        formik.setFieldValue('planLimits', { ...DEFAULT_STDC_LIMITS });
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
      <form onSubmit={formik.handleSubmit} className="space-y-4 py-1">
        {/* ── Basic Info ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ATMTextField
            name="name"
            label="Plan Name (unique, internal)"
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="e.g. Standalone POS · Restaurant · Pro"
            required
          />
          <ATMTextField
            name="displayName"
            label="Display Name (website)"
            value={formik.values.displayName}
            onChange={formik.handleChange}
            placeholder="e.g. Basic / Pro / Advance"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ATMSelectField
            name="planType"
            label="Plan Type"
            options={PLAN_TYPE_OPTIONS}
            value={formik.values.planType}
            onChange={(val) => formik.setFieldValue('planType', val)}
            required
          />
          <ATMSelectField
            name="flavour"
            label="Flavour"
            options={FLAVOUR_OPTIONS}
            value={formik.values.flavour}
            onChange={(val) => formik.setFieldValue('flavour', val)}
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
            <p className="text-[10px] text-slate-400 font-bold">Use active Rate Card formulas to calculate prices</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-amber-200/20 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-500">Enable Manual Price Override</p>
              <p className="text-[10px] text-slate-400 font-bold">Manually override calculated cycle prices with a custom price</p>
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

        {/* ── Pricing ── */}
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
            className="bg-slate-50/50 dark:bg-[#13151a]/20 font-semibold"
          />
          <ATMTextField
            name="priceVariation"
            label="Price Variation ($)"
            type="number"
            placeholder="e.g. +5.00 or -3.00"
            value={formik.values.priceVariation}
            onChange={formik.handleChange}
            disabled={!autoCalculate}
            className="bg-slate-50/50 dark:bg-[#13151a]/20 font-semibold"
          />
        </div>

        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--zen-surface)] border border-[var(--zen-border)]">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Active — Available for signups</p>
          <ATMSwitch
            name="statusSwitch"
            checked={formik.values.status === 'Active'}
            onChange={(c) => formik.setFieldValue('status', c ? 'Active' : 'Inactive')}
            size="md"
          />
        </div>

        {/* Access Configuration — 2026-07-25: reordered to match Rate Card layout:
            Capacity & Limits → Operational Services → Payment Methods → Premium Modules. */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-4">
          <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">
            Access Configuration — mirrors the V3 token dictionaries
          </p>

          {/* 1. Capacity & Limits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 border-b border-slate-100 dark:border-slate-800/65 pb-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Capacity & Limits</p>
              <span className="text-[10px] text-slate-400 font-bold">0 = unlimited where applicable</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {ALL_LIMITS.map(({ key, label: name }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3.5 rounded-lg bg-[var(--zen-surface)] border border-[var(--zen-border)] dark:bg-[#13151a]/20"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
                      {name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 tracking-wider">{key}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={formik.values.planLimits?.[key] ?? 0}
                    onChange={(e) => formik.setFieldValue(`planLimits.${key}`, Number(e.target.value) || 0)}
                    className="w-20 h-8 text-center text-xs font-mono font-bold px-2 py-1 rounded-lg border border-[var(--zen-border)] bg-white dark:bg-[#13151a] text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all ml-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Operational Services */}
          <ToggleGrid
            label="Operational Services"
            count={`${svcOn}/${ALL_SERVICES.length} ON`}
            items={ALL_SERVICES}
            field="planServices"
            formik={formik}
          />

          {/* 3. Payment Methods */}
          <ToggleGrid
            label="Payment Methods"
            count={`${payOn}/${ALL_PAYMENTS.length} ON`}
            items={ALL_PAYMENTS}
            field="planPayments"
            formik={formik}
          />

          {/* 4. Premium Modules Add-ons */}
          <ToggleGrid
            label="Premium Modules Add-ons"
            count={`${featureOn}/${ALL_FEATURES.length} ON`}
            items={ALL_FEATURES}
            field="planFeatures"
            formik={formik}
          />
        </div>

        {/* Display Features (marketing labels) */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800'
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
