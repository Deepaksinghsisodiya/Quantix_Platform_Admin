import React from 'react';
import { Form, FormikProvider, type FormikProps } from 'formik';
import { Store, Coins, ArrowLeft } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';
import { ATMInputField, ATMPhoneInputField, ATMSelectField, ATMTextAreaField } from '@/shared/components/form';

export interface StandaloneRegisterFormValues {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  businessNature: string;
  initialTokenTier: 'Basic' | 'Standard' | 'Advance' | 'Premium';
  initialTokenValidityDays: number;
}

interface StandaloneRegisterFormProps {
  formikProps: FormikProps<StandaloneRegisterFormValues>;
  isLoading: boolean;
  apiError?: string;
  onCancel: () => void;
}

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'India', value: 'IN' },
  { label: 'UAE', value: 'AE' },
  { label: 'Singapore', value: 'SG' },
];

const TIER_OPTIONS = [
  { label: 'Basic', value: 'Basic' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Advance', value: 'Advance' },
  { label: 'Premium', value: 'Premium' },
];

const VALIDITY_OPTIONS = [
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '180 Days', value: 180 },
  { label: '365 Days', value: 365 },
];

export const StandaloneRegisterForm: React.FC<StandaloneRegisterFormProps> = ({
  formikProps,
  isLoading,
  apiError,
  onCancel,
}) => {
  return (
    <FormikProvider value={formikProps}>
      <div className="w-full h-full bg-zen-surface animate-in fade-in duration-500 flex flex-col overflow-hidden">
        {/* Header matching UserForm (Image 2) */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-zen-surface z-20 shadow-sm">
          <div className="flex items-center gap-5">
            <ATMIconButton
              type="button"
              icon={ArrowLeft}
              onClick={onCancel}
              variant="default"
              size="md"
              className="hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-100 dark:border-gray-800 text-slate-400"
            />
            <div className="w-px h-10 bg-slate-100 dark:bg-gray-800" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Register Standalone Merchant
              </h1>
              <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                Create a token-based offline merchant profile ready for activation token generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ATMButton
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="px-10 h-14 font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900"
            >
              Cancel
            </ATMButton>
            <ATMButton
              type="button"
              variant="primary"
              isLoading={isLoading}
              icon={Store}
              onClick={() => formikProps.handleSubmit()}
              className="px-16 h-14 bg-accent-600 text-white hover:bg-accent-700 rounded-2xl shadow-2xl shadow-accent-900/20 transition-all active:scale-95 font-black uppercase tracking-[0.2em]"
            >
              Register Merchant
            </ATMButton>
          </div>
        </div>

        {/* Content matching UserForm (Image 2) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-gray-900/10">
          <Form className="px-10 py-12 space-y-16 max-w-full" noValidate>
            {apiError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                {apiError}
              </div>
            )}

            {/* Section 1: Business Information */}
            <div className="space-y-10">
              <div className="border-l-4 border-violet-500 pl-5">
                <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Store size={14} className="text-violet-500" />
                  Business Information
                </h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                  Essential standalone business contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-6">
                <ATMInputField name="businessName" label="Business Name" placeholder="Corner Cafe" required />
                <ATMInputField name="contactPerson" label="Contact Person" placeholder="Primary contact" required />
                <ATMInputField name="email" label="Email Address" type="email" placeholder="owner@business.com" required />
                <ATMPhoneInputField name="phone" label="Phone Number" required />
                <ATMSelectField name="country" label="Country" options={COUNTRY_OPTIONS} required />
              </div>
            </div>

            {/* Section 2: Initial Token Config */}
            <div className="space-y-10">
              <div className="border-l-4 border-amber-500 pl-5">
                <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Coins size={14} className="text-amber-500" />
                  Initial Token Configuration
                </h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                  Set initial offline license tier and validity period.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-6">
                <ATMSelectField name="initialTokenTier" label="Initial Token Tier" options={TIER_OPTIONS} required />
                <ATMSelectField name="initialTokenValidityDays" label="Initial Token Validity" options={VALIDITY_OPTIONS} required />
                <div className="md:col-span-2 lg:col-span-3">
                  <ATMTextAreaField name="businessNature" label="Business Nature" placeholder="Restaurant, pharmacy, retail, services..." />
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </FormikProvider>
  );
};

export default StandaloneRegisterForm;
