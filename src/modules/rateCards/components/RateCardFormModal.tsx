import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { RateCard } from '../types/rateCard.types';
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
  modulePrices: {
    INV: 10,
    FIN: 10,
    HRM: 10,
    MKT: 10,
    ANL: 10,
    WTM: 10,
  },
  paymentPrices: {
    CSH: 0,
    CRD: 0,
    EXT: 0,
    GFT: 3,
    STC: 3,
    WLT: 3,
    CSL: 3,
  },
  servicePrices: {
    DIN: 0,
    CTR: 0,
    PUP: 5,
    DLV: 5,
    CTG: 5,
    SNP: 5,
    RSO: 5,
    WOR: 5,
    WRV: 5,
  },
  limitPrices: {
    MBU: 20,
    MLO: 15,
    MTM: 5,
    MPR: 1,
    MPG: 1,
    MGB: 2,
    OTH: 2,
  },
};

const DollarPrefix = <span className="text-gray-400 font-bold text-xs">$</span>;
const MoSuffix = <span className="text-gray-400 text-[10px] font-bold">/mo</span>;

export const RateCardFormModal: React.FC<RateCardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'features' | 'payments' | 'limits'>('base');

  const formik = useFormik({
    initialValues: initialValues || DEFAULT_INITIAL,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });

  const tabs = [
    { id: 'base', label: 'Base Pricing' },
    { id: 'features', label: 'Feature Add-ons' },
    { id: 'payments', label: 'Payments & Order Types' },
    { id: 'limits', label: 'Limit Add-ons' },
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

          {/* TAB 3: PAYMENTS & SERVICES */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Payment Channels
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
                    label="Card (POS)"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.paymentPrices.CRD}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="paymentPrices.EXT"
                    label="UPI / QR"
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
                    label="Wallet"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.paymentPrices.WLT}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="paymentPrices.CSL"
                    label="Credit Ledger"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.paymentPrices.CSL}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Order / Service Types
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <ATMTextField
                    name="servicePrices.DIN"
                    label="Dine-In"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.DIN}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.CTR"
                    label="Counter/Takeaway"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.CTR}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.PUP"
                    label="Store Pickup"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.PUP}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.DLV"
                    label="Delivery Support"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.DLV}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.SNP"
                    label="Snap QR Order"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.SNP}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.WOR"
                    label="Web Order Store"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.WOR}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.CTG"
                    label="Catering & Events"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.CTG}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.RSO"
                    label="Table Reservation"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.RSO}
                    onChange={formik.handleChange}
                  />
                  <ATMTextField
                    name="servicePrices.WRV"
                    label="Waitlist Management"
                    type="number"
                    prefix={DollarPrefix}
                    suffix={MoSuffix}
                    value={formik.values.servicePrices.WRV}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIMIT ADD-ONS */}
          {activeTab === 'limits' && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Incremental Limit Unit Pricing
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ATMTextField
                  name="limitPrices.MBU"
                  label="Per Business Unit"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.MBU}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="limitPrices.MLO"
                  label="Per Location / Outlet"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.MLO}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="limitPrices.MTM"
                  label="Per POS Terminal"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.MTM}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="limitPrices.MPR"
                  label="Per 100 Products (above 500)"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.MPR}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="limitPrices.MPG"
                  label="Per 5 Product Groups"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.MPG}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="limitPrices.MGB"
                  label="Per GB Storage"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.MGB}
                  onChange={formik.handleChange}
                />
                <ATMTextField
                  name="limitPrices.OTH"
                  label="Per other quota items"
                  type="number"
                  prefix={DollarPrefix}
                  suffix={MoSuffix}
                  value={formik.values.limitPrices.OTH}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </ATMModal>
  );
};
