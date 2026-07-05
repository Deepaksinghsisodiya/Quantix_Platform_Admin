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
  GFT: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  STC: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  WLT: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  CSL: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  PUP: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  DLV: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  CTG: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  SNP: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  RSO: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  WOR: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  WRV: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MBU: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MLO: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MTM: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MPR: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MPG: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  MGB: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  OTH: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
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
      GFT: defaultCard.paymentPrices.GFT,
      STC: defaultCard.paymentPrices.STC,
      WLT: defaultCard.paymentPrices.WLT,
      CSL: defaultCard.paymentPrices.CSL,
      PUP: defaultCard.servicePrices.PUP,
      DLV: defaultCard.servicePrices.DLV,
      CTG: defaultCard.servicePrices.CTG,
      SNP: defaultCard.servicePrices.SNP,
      RSO: defaultCard.servicePrices.RSO,
      WOR: defaultCard.servicePrices.WOR,
      WRV: defaultCard.servicePrices.WRV,
      MBU: defaultCard.limitPrices.MBU,
      MLO: defaultCard.limitPrices.MLO,
      MTM: defaultCard.limitPrices.MTM,
      MPR: defaultCard.limitPrices.MPR,
      MPG: defaultCard.limitPrices.MPG,
      MGB: defaultCard.limitPrices.MGB,
      OTH: defaultCard.limitPrices.OTH,
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

          {/* Section: Modules */}
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
                  label={`${key} - ${name} ($/mo)`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

          {/* Section: Payments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--zen-border)] pb-1.5">
              <Coins className="h-4.5 w-4.5 text-emerald-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Payment Channels (Paid)</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENTS_INFO.map(({ key, name }) => (
                <ATMTextField
                  key={key}
                  name={key}
                  label={`${key} - ${name} ($/mo)`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

          {/* Section: Services */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--zen-border)] pb-1.5">
              <Activity className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Operational Services (Paid)</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES_INFO.map(({ key, name }) => (
                <ATMTextField
                  key={key}
                  name={key}
                  label={`${key} - ${name} ($/mo)`}
                  type="number"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  required
                />
              ))}
            </div>
          </div>

          {/* Section: Limits */}
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

        </form>
      </FormikProvider>
    </ATMModal>
  );
};

export default RateCardEditModal;
