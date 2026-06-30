import React from 'react';
import { Form, FormikProvider, type FormikProps } from 'formik';
import { Store } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui/ATMButton';
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

const VALIDITY_OPTIONS = [30, 60, 90, 180, 365].map((days) => ({ label: `${days} Days`, value: days }));

export const StandaloneRegisterForm: React.FC<StandaloneRegisterFormProps> = ({
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
            icon={Store}
            title="Register Standalone Merchant"
            subtitle="Create a token-based offline merchant profile ready for activation token generation."
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
              <ATMInputField name="businessName" label="Business Name" placeholder="Corner Cafe" required />
              <ATMInputField name="contactPerson" label="Contact Person" placeholder="Primary contact" required />
              <ATMInputField name="email" label="Email Address" type="email" placeholder="owner@business.com" required />
              <ATMPhoneInputField name="phone" label="Phone Number" required />
              <ATMSelectField name="country" label="Country" options={COUNTRY_OPTIONS} required />
              <ATMSelectField name="initialTokenTier" label="Initial Token Tier" options={TIER_OPTIONS} required />
              <ATMSelectField name="initialTokenValidityDays" label="Initial Token Validity" options={VALIDITY_OPTIONS} required />
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

export default StandaloneRegisterForm;
