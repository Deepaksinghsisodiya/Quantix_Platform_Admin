import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { RateCard } from '../types/rateCard.types';
import { Layers, Coins, Activity, Terminal } from 'lucide-react';
import {
  MODULES_INFO,
  PAYMENTS_INFO,
  SERVICES_INFO,
  LIMITS_INFO
} from '../list/RateCardListPage';

interface RateCardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  defaultCard: RateCard;
}

const validationSchema = Yup.object().shape({
  INV: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  FIN: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  HRM: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MKT: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  ANL: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  WTM: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  // 7 canonical payment codes — matches Quantix.Foundation.Licensing.PaymentMethodCodes.
  CSH: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  CRD: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  GFT: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  STC: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  WLT: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  EXT: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  CSL: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  DIN: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  CTR: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  PUP: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  DLV: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  CTG: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  SNP: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  RSO: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  SHP: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  INS: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  WRV: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  // 16 canonical limit codes — matches Quantix.Foundation.Licensing.LimitCodes.
  MBU: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MLO: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MTM: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MPR: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MDP: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MKD: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MDS: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MIS: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MPW: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MGB: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MPG: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MRS: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MAC: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MWR: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MWE: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MBR: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
});

export const RateCardEditModal: React.FC<RateCardEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultCard,
}) => {
  const formik = useFormik({
    initialValues: {
      INV: defaultCard.modulePrices.INV,
      FIN: defaultCard.modulePrices.FIN,
      HRM: defaultCard.modulePrices.HRM,
      MKT: defaultCard.modulePrices.MKT,
      ANL: defaultCard.modulePrices.ANL,
      WTM: defaultCard.modulePrices.WTM,
      CSH: defaultCard.paymentPrices.CSH,
      CRD: defaultCard.paymentPrices.CRD,
      GFT: defaultCard.paymentPrices.GFT,
      STC: defaultCard.paymentPrices.STC,
      WLT: defaultCard.paymentPrices.WLT,
      EXT: defaultCard.paymentPrices.EXT,
      CSL: defaultCard.paymentPrices.CSL,
      DIN: defaultCard.servicePrices.DIN,
      CTR: defaultCard.servicePrices.CTR,
      PUP: defaultCard.servicePrices.PUP,
      DLV: defaultCard.servicePrices.DLV,
      CTG: defaultCard.servicePrices.CTG,
      SNP: defaultCard.servicePrices.SNP,
      RSO: defaultCard.servicePrices.RSO,
      SHP: defaultCard.servicePrices.SHP,
      INS: defaultCard.servicePrices.INS,
      WRV: defaultCard.servicePrices.WRV,
      MBU: defaultCard.limitPrices.MBU,
      MLO: defaultCard.limitPrices.MLO,
      MTM: defaultCard.limitPrices.MTM,
      MPR: defaultCard.limitPrices.MPR,
      MDP: defaultCard.limitPrices.MDP,
      MKD: defaultCard.limitPrices.MKD,
      MDS: defaultCard.limitPrices.MDS,
      MIS: defaultCard.limitPrices.MIS,
      MPW: defaultCard.limitPrices.MPW,
      MGB: defaultCard.limitPrices.MGB,
      MPG: defaultCard.limitPrices.MPG,
      MRS: defaultCard.limitPrices.MRS,
      MAC: defaultCard.limitPrices.MAC,
      MWR: defaultCard.limitPrices.MWR,
      MWE: defaultCard.limitPrices.MWE,
      MBR: defaultCard.limitPrices.MBR,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <ATMModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Feature Rate Cards"
      size="3xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full border-t border-[var(--zen-border)] pt-4">
          <ATMButton onClick={onClose} variant="outline" size="sm" className="h-9 rounded-lg">
            Cancel
          </ATMButton>
          <ATMButton
            type="button"
            onClick={() => formik.handleSubmit()}
            variant="primary"
            size="sm"
            className="h-9 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white font-semibold"
          >
            Save Changes
          </ATMButton>
        </div>
      }
    >
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-6 max-h-[500px] overflow-y-auto pr-1">

          {/* 1. Capacity & Limits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--zen-border)] pb-1.5">
              <Terminal className="h-4.5 w-4.5 text-amber-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Capacity & Limits Rates</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LIMITS_INFO.map(({ key, name, unit }) => (
                <ATMTextField
                  key={key}
                  name={key}
                  label={`${key} - ${name} ($${unit || '/unit'})`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

          {/* 2. Operation Services — all 10 token codes. */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--zen-border)] pb-1.5">
              <Activity className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Operational Services</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES_INFO.map(({ key, name }) => (
                <ATMTextField
                  key={key}
                  name={key}
                  label={`${key} - ${name} ($/day)`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

          {/* 3. Payment Methods — 2026-07-25: moved to 3rd position per user; all 7 token codes shown. */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--zen-border)] pb-1.5">
              <Coins className="h-4.5 w-4.5 text-emerald-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Payment Methods</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENTS_INFO.map(({ key, name }) => (
                <ATMTextField
                  key={key}
                  name={key}
                  label={`${key} - ${name} ($/day)`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

          {/* 4. Premium Modules */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--zen-border)] pb-1.5">
              <Layers className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Premium Modules Add-ons</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MODULES_INFO.map(({ key, name }) => (
                <ATMTextField
                  key={key}
                  name={key}
                  label={`${key} - ${name} ($/day)`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

        </form>
      </FormikProvider>
    </ATMModal>
  );
};

export default RateCardEditModal;
