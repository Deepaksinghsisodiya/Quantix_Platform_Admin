import React from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { RateCard } from '../types/rateCard.types';
import { cn } from '@/lib/utils/cn';
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

type SectionColor = 'amber' | 'indigo' | 'emerald';

const sectionChip: Record<SectionColor, string> = {
  amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/40 dark:border-amber-900/10',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/10',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/10',
};

/** Section header — colored icon chip + title + item count + divider. */
function SectionHeader({
  icon: Icon,
  title,
  count,
  color,
}: {
  icon: React.ComponentType<any>;
  title: string;
  count: number;
  color: SectionColor;
}) {
  return (
    <div className="flex items-center gap-2.5 pt-1">
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', sectionChip[color])}>
        <Icon size={16} className="stroke-[2.2]" />
      </span>
      <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{title}</h4>
      <span className={cn('px-1.5 py-0.5 rounded-md text-[9px] font-black', sectionChip[color])}>{count}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

/** Price cell — code badge + feature name + compact $-prefixed day-rate input. */
function PriceItemCell({
  code,
  name,
  unit,
  value,
  onChange,
  chipColor,
}: {
  code: string;
  name: string;
  unit: string;
  value: any;
  onChange: any;
  chipColor: SectionColor;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={cn('font-mono text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md uppercase', sectionChip[chipColor])}>
          {code}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">{unit}</span>
      </div>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mb-2" title={name}>
        {name}
      </p>
      <ATMTextField
        name={code}
        type="number"
        size="sm"
        prefix={<span className="text-[11px] font-bold text-slate-400">$</span>}
        placeholder="0.00"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

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
      subtitle="Daily baseline rates per unit — applied to tokens issued from the default rate card."
      size="3xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <ATMButton onClick={onClose} variant="outline" size="sm" className="h-9 rounded-lg">
            Cancel
          </ATMButton>
          <ATMButton
            type="button"
            onClick={() => formik.handleSubmit()}
            variant="primary"
            size="sm"
            className="h-9 rounded-lg"
          >
            Save Changes
          </ATMButton>
        </div>
      }
    >
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-7">

          {/* 1. Capacity & Limits */}
          <div className="space-y-3">
            <SectionHeader icon={Terminal} title="Capacity & Limits Rates" count={LIMITS_INFO.length} color="amber" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LIMITS_INFO.map(({ key, name, unit }) => (
                <PriceItemCell
                  key={key}
                  code={key}
                  name={name}
                  unit={unit || '/unit'}
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  chipColor="amber"
                />
              ))}
            </div>
          </div>

          {/* 2. Operation Services — all 10 token codes. */}
          <div className="space-y-3">
            <SectionHeader icon={Activity} title="Operational Services" count={SERVICES_INFO.length} color="indigo" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES_INFO.map(({ key, name }) => (
                <PriceItemCell
                  key={key}
                  code={key}
                  name={name}
                  unit="/day"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  chipColor="indigo"
                />
              ))}
            </div>
          </div>

          {/* 3. Payment Methods — 2026-07-25: moved to 3rd position per user; all 7 token codes shown. */}
          <div className="space-y-3">
            <SectionHeader icon={Coins} title="Payment Methods" count={PAYMENTS_INFO.length} color="emerald" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENTS_INFO.map(({ key, name }) => (
                <PriceItemCell
                  key={key}
                  code={key}
                  name={name}
                  unit="/day"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  chipColor="emerald"
                />
              ))}
            </div>
          </div>

          {/* 4. Premium Modules */}
          <div className="space-y-3">
            <SectionHeader icon={Layers} title="Premium Modules Add-ons" count={MODULES_INFO.length} color="indigo" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODULES_INFO.map(({ key, name }) => (
                <PriceItemCell
                  key={key}
                  code={key}
                  name={name}
                  unit="/day"
                  value={(formik.values as any)[key]}
                  onChange={formik.handleChange}
                  chipColor="indigo"
                />
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
            Prices are daily, per unit or feature. Empty fields fall back to $0.00 on the default card.
          </p>

        </form>
      </FormikProvider>
    </ATMModal>
  );
};

export default RateCardEditModal;
