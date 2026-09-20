import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { RateCard } from '../types/rateCard.types';
import { LIMITS_INFO, SERVICES_INFO } from '../list/RateCardListPage';
import { cn } from '@/lib/utils/cn';

interface RateCardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<RateCard, 'id'> & { id?: string }) => void;
  initialValues?: RateCard | null;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Name is required'),
  baseDailyPrice: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  baseWeeklyPrice: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  baseMonthlyPrice: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  baseYearlyPrice: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
});

const DEFAULT_INITIAL = {
  name: '',
  isDefault: false,
  baseDailyPrice: 1.0,
  baseWeeklyPrice: 7.0,
  baseMonthlyPrice: 29.0,
  baseYearlyPrice: 290.0,
  // 2026-08-08 (user-approved split): fully-loaded total ≈ $22.50/day — basics free,
  // premium modules priced highest, infra-heavy limits above commodity ones.
  modulePrices: { INV: 1.25, FIN: 1.25, HRM: 1.0, MKT: 1.0, ANL: 1.0, WTM: 0.5 },
  paymentPrices: { CSH: 0, CRD: 0.75, EXT: 0.25, GFT: 0.5, STC: 0.5, WLT: 0.5, CSL: 1.0 },
  servicePrices: {
    DIN: 0, CTR: 0, INS: 0,
    PUP: 0.5, DLV: 0.75, CTG: 0.75, SNP: 0.5, RSO: 1.0, SHP: 0.75, WRV: 0.75,
  },
  limitPrices: {
    MBU: 1.0, MLO: 1.0, MTM: 0.75, MPR: 0.25,
    MDP: 0.25, MKD: 0.5, MDS: 0.5, MIS: 0.5, MPW: 0.5,
    MGB: 0.25, MPG: 0.5, MRS: 0.5, MAC: 0.5, MWR: 0.5, MWE: 0.5,
    MBR: 0,
  },
};

const DollarPrefix = <span className="text-gray-400 font-bold text-xs">$</span>;
const MoSuffix = <span className="text-gray-400 text-[10px] font-bold">/day</span>;

export const RateCardFormModal: React.FC<RateCardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'limits' | 'services' | 'features' | 'payments'>('base');

  const formik = useFormik({
    initialValues: initialValues || DEFAULT_INITIAL,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });

  // 2026-07-25: section order — Limits, Services, Payment Methods, Modules.
  const tabs = [
    { id: 'base', label: 'Base Pricing' },
    { id: 'limits', label: 'Capacity & Limits' },
    { id: 'services', label: 'Operation Services' },
    { id: 'payments', label: 'Payment Methods' },
    { id: 'features', label: 'Feature Add-ons' },
  ] as const;

  return (
    <ATMModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialValues ? `Edit Rate Card: ${initialValues.name}` : 'Create Rate Card'}
      subtitle="Define pricing formulas for tokens, feature toggles, and limits"
      size="2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full border-t border-gray-100 dark:border-gray-800 pt-4">
          <ATMButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </ATMButton>
          <ATMButton type="button" variant="primary" onClick={() => formik.handleSubmit()}>
            Save Rate Card
          </ATMButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-150 dark:border-gray-800 gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-1 max-h-[480px] overflow-y-auto pr-1">
          {/* GENERAL INFO (Always Visible) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-800/60 pb-4">
            <ATMTextField
              name="name"
              label="Rate Card Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              placeholder="e.g. Standard POS V3.5"
              required
              error={formik.touched.name && formik.errors.name ? String(formik.errors.name) : undefined}
            />
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Default Rate Card</p>
                <p className="text-[10px] text-gray-500 font-medium">Use to auto-calculate plan pricing</p>
              </div>
              <ATMSwitch
                name="isDefault"
                checked={formik.values.isDefault}
                onChange={(c) => formik.setFieldValue('isDefault', c)}
                size="sm"
              />
            </div>
          </div>

          {/* TAB 1: BASE PRICING */}
          {activeTab === 'base' && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Base Billing Cycle Pricing
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ATMTextField
                  name="baseDailyPrice"
                  label="Daily Price"
                  type="number"
                  prefix={DollarPrefix}
                  value={formik.values.baseDailyPrice}
                  onChange={formik.handleChange}
                  required
                />
                <ATMTextField
                  name="baseWeeklyPrice"
                  label="Weekly Price"
                  type="number"
                  prefix={DollarPrefix}
                  value={formik.values.baseWeeklyPrice}
                  onChange={formik.handleChange}
                  required
                />
                <ATMTextField
                  name="baseMonthlyPrice"
                  label="Monthly Price"
                  type="number"
                  prefix={DollarPrefix}
                  value={formik.values.baseMonthlyPrice}
                  onChange={formik.handleChange}
                  required
                />
                <ATMTextField
                  name="baseYearlyPrice"
                  label="Yearly Price"
                  type="number"
                  prefix={DollarPrefix}
                  value={formik.values.baseYearlyPrice}
                  onChange={formik.handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* TAB 2: MODULE ADD-ONS */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Module Incremental Pricing
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ATMTextField
                  name="modulePrices.INV"
                  label="Inventory Management"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.modulePrices.INV}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="modulePrices.FIN"
                  label="Finance / Accounting"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.modulePrices.FIN}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="modulePrices.HRM"
                  label="HR & Staff Management"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.modulePrices.HRM}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="modulePrices.MKT"
                  label="Marketing & Loyalty"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.modulePrices.MKT}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="modulePrices.ANL"
                  label="Analytics & Reports"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.modulePrices.ANL}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="modulePrices.WTM"
                  label="Workforce / Table-Turn"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.modulePrices.WTM}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          )}

          {/* TAB: OPERATION SERVICES — 2026-07-25: split out from combined payments+services tab;
              data-driven from SERVICES_INFO (10 canonical codes). */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Operational Service Pricing
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                Restaurant-only: DIN, CTR, CTG, WRV. Retail-only: SHP, INS. Others apply to both flavours.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SERVICES_INFO.map(({ key, name }) => (
                  <ATMTextField
                    key={key}
                    name={`servicePrices.${key}`}
                    label={`${key} — ${name}`}
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={(formik.values.servicePrices as any)[key] ?? 0}
                    onChange={formik.handleChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENT CHANNELS — only the 7 payment codes. */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Payment Channel Pricing
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ATMTextField
                  name="paymentPrices.CSH"
                  label="Cash"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.CSH}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="paymentPrices.CRD"
                  label="Card"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.CRD}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="paymentPrices.EXT"
                  label="External / Manual"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.EXT}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="paymentPrices.GFT"
                  label="Gift Card"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.GFT}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="paymentPrices.STC"
                  label="Store Credit"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.STC}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="paymentPrices.WLT"
                  label="Mobile Wallet"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.WLT}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="paymentPrices.CSL"
                  label="Credit Sale"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.paymentPrices.CSL}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          )}

          {/* TAB 4: LIMIT ADD-ONS — 2026-07-19: data-driven from LIMITS_INFO (16 canonical codes). */}
          {activeTab === 'limits' && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Incremental Limit Unit Pricing
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                Rates are per day per unit — priced from unit 1, no free baseline. MPR bills per block of 100 products; MBR is a hard cap (usually $0).
              </p>
              <div className="grid grid-cols-2 gap-4">
                {LIMITS_INFO.map(({ key, name, unit }) => (
                  <ATMTextField
                    key={key}
                    name={`limitPrices.${key}`}
                    label={`${key} — ${name} (${unit ?? '/unit'})`}
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={(formik.values.limitPrices as any)[key] ?? 0}
                    onChange={formik.handleChange}
                  />
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </ATMModal>
  );
};
