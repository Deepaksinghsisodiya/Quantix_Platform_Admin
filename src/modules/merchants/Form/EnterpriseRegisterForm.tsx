import React from 'react';
import { Form, FormikProvider, type FormikProps } from 'formik';
import { Building2 } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui/ATMButton';
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
      <div className="flex h-full flex-col bg-zen-surface">
        <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <ATMPageHeader
            icon={Building2}
            title="Register Enterprise Merchant"
            subtitle="Create a cloud-connected SaaS merchant with billing and database provisioning metadata."
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Form className="mx-auto max-w-4xl space-y-6" noValidate>
            {apiError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                {apiError}
              </div>
            )}

            <div className="grid gap-5 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:grid-cols-2">
              <ATMInputField name="businessName" label="Business Name" placeholder="Acme Restaurants LLC" required />
              <ATMInputField name="contactPerson" label="Contact Person" placeholder="Primary contact" required />
              <ATMInputField name="email" label="Email Address" type="email" placeholder="admin@business.com" required />
              <ATMPhoneInputField name="phone" label="Phone Number" required />
              <ATMSelectField name="country" label="Country" options={COUNTRY_OPTIONS} required />
              <ATMSelectField name="plan" label="Plan" options={PLAN_OPTIONS} required />
              <ATMSelectField name="billingFrequency" label="Billing Cycle" options={BILLING_OPTIONS} required />
              <ATMSelectField name="preferredPaymentMethod" label="Payment Method" options={PAYMENT_OPTIONS} required />
              <ATMSelectField name="dbEngine" label="Database Engine" options={DB_OPTIONS} required />
              <div className="md:col-span-2">
                <ATMTextAreaField name="businessNature" label="Business Nature" placeholder="Restaurant, pharmacy, retail, services..." />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <ATMButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </ATMButton>
              <ATMButton type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                Register Merchant
              </ATMButton>
            </div>
          </Form>
        </div>
      </div>
    </FormikProvider>
  );
};

export default EnterpriseRegisterForm;
