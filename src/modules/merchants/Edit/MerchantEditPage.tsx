import React from 'react';
import { Form, FormikProps } from 'formik';
import { Save, AlertCircle, Globe } from 'lucide-react';
import { ATMInputField, ATMPhoneInputField, ATMFieldCell, ATMFormGrid } from '@/shared/components/form';
import { countryName } from '@/lib/utils/countryName';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';

export interface MerchantFormValues {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
}

// 2026-08-30 (user directive): hardcoded COUNTRY_OPTIONS removed — single-country
// deployment: the merchant's country IS platform.country (frozen at setup) and is
// displayed read-only; names come from Intl, never a hand-picked list.

interface MerchantEditPageProps {
  title: string;
  formikProps: FormikProps<MerchantFormValues>;
  onCancel: () => void;
}

export const MerchantEditPage: React.FC<MerchantEditPageProps> = ({
  title,
  formikProps,
  onCancel,
}) => {
  const { errors, touched, isSubmitting } = formikProps;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title={title}
        subtitle="Merchant Profile Management"
        onBack={onCancel}
        extraActions={
          <>
            <ATMButton type="button" variant="ghost" size="md" onClick={onCancel}>
              Discard
            </ATMButton>
            <ATMButton
              type="submit"
              variant="primary"
              size="md"
              form="merchant-edit-form"
              isLoading={isSubmitting}
              icon={Save}
            >
              Save Changes
            </ATMButton>
          </>
        }
      />

      <ATMCard padding="lg">
        <Form id="merchant-edit-form" className="space-y-16">
          {/* Section 1: Identity */}
          <div className="space-y-10">
            <div className="border-l-4 border-primary-600 dark:border-primary-500 pl-5">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
                Business Identity
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Core corporate details and main point of contact.</p>
            </div>

            <ATMFormGrid cols={2}>
              <ATMInputField
                name="businessName"
                label="Business Name"
                placeholder="e.g. Acme Enterprises LLC"
                required
              />
              <ATMInputField
                name="contactPerson"
                label="Contact Person (Representative)"
                placeholder="e.g. Jane Doe"
                required
              />
            </ATMFormGrid>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-10">
            <div className="border-l-4 border-primary-600 dark:border-primary-500 pl-5">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
                Communication & Location
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Email, telephone, and country configuration.</p>
            </div>

            <ATMFormGrid cols={2}>
              <ATMInputField
                name="email"
                label="Email Address"
                placeholder="e.g. contact@acme.com"
                required
              />
              <ATMPhoneInputField
                name="phone"
                label="Phone Number"
                placeholder="e.g. 555-0199"
                required
              />
              <ATMFieldCell
                className="md:col-span-2"
                label="Country"
                hint="Single-country deployment — fixed by platform setup, not editable per merchant."
              >
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 shadow-sm">
                  <Globe size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {countryName(formikProps.values.country) || '—'}
                  </span>
                </div>
              </ATMFieldCell>
            </ATMFormGrid>
          </div>

          {/* Error Feedback */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 animate-in fade-in flex items-center gap-4">
              <AlertCircle size={20} className="text-rose-600" />
              <div>
                <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Validation Blocked</p>
                <p className="text-[11px] text-rose-500 dark:text-rose-400/70 font-medium mt-0.5">Please resolve the highlighted fields to save changes.</p>
              </div>
            </div>
          )}
        </Form>
      </ATMCard>
    </div>
  );
};

export default MerchantEditPage;
