import React from 'react';
import { Form, FormikProvider, type FormikProps } from 'formik';
import { Building2, CreditCard, ArrowLeft } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';
import { ATMInputField, ATMPhoneInputField, ATMSelectField, ATMTextAreaField } from '@/shared/components/form';

export interface EnterpriseRegisterFormValues {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  businessNature: string;
  plan: string;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annual';
  preferredPaymentMethod: 'CreditCard' | 'BankTransfer' | 'Invoice';
  dbEngine: 'PostgreSQL' | 'MySQL' | 'SQLServer' | 'SQLite';
}

interface EnterpriseRegisterFormProps {
  formikProps: FormikProps<EnterpriseRegisterFormValues>;
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

const PLAN_OPTIONS = [
  { label: 'Starter', value: 'Starter' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Business', value: 'Business' },
  { label: 'Enterprise', value: 'Enterprise' },
];

const BILLING_OPTIONS = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annual', value: 'Annual' },
];

const PAYMENT_OPTIONS = [
  { label: 'Credit Card', value: 'CreditCard' },
  { label: 'Bank Transfer', value: 'BankTransfer' },
  { label: 'Invoice', value: 'Invoice' },
];

const DB_OPTIONS = [
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'SQL Server', value: 'SQLServer' },
  { label: 'SQLite', value: 'SQLite' },
];

export const EnterpriseRegisterForm: React.FC<EnterpriseRegisterFormProps> = ({
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
                Register Enterprise Merchant
              </h1>
              <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                Create a cloud-connected SaaS merchant with billing and database provisioning metadata
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
              icon={Building2}
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
              <div className="border-l-4 border-accent-600 pl-5">
                <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Building2 size={14} className="text-accent-600" />
                  Business Information
                </h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                  Essential business contact and registration details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-6">
                <ATMInputField name="businessName" label="Business Name" placeholder="Acme Restaurants LLC" required />
                <ATMInputField name="contactPerson" label="Contact Person" placeholder="Primary contact" required />
                <ATMInputField name="email" label="Email Address" type="email" placeholder="admin@business.com" required />
                <ATMPhoneInputField name="phone" label="Phone Number" required />
                <ATMSelectField name="country" label="Country" options={COUNTRY_OPTIONS} required />
                <ATMSelectField name="plan" label="Plan" options={PLAN_OPTIONS} required />
              </div>
            </div>

            {/* Section 2: Billing & Infrastructure */}
            <div className="space-y-10">
              <div className="border-l-4 border-purple-500 pl-5">
                <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CreditCard size={14} className="text-purple-500" />
                  Billing & Infrastructure
                </h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                  Configure payment method, billing cycle, and database engine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-6">
                <ATMSelectField name="billingFrequency" label="Billing Cycle" options={BILLING_OPTIONS} required />
                <ATMSelectField name="preferredPaymentMethod" label="Payment Method" options={PAYMENT_OPTIONS} required />
                <ATMSelectField name="dbEngine" label="Database Engine" options={DB_OPTIONS} required />
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

export default EnterpriseRegisterForm;
