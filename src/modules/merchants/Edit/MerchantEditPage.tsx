import React from 'react';
import { Form, FormikProps } from 'formik';
import { Save, ArrowLeft, AlertCircle, Globe } from 'lucide-react';
import { ATMInputField, ATMPhoneInputField, ATMFieldCell, ATMFormGrid } from '@/shared/components/form';
import { countryName } from '@/lib/utils/countryName';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';

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
    <div className="w-full h-full bg-zen-surface animate-in fade-in duration-500 flex flex-col overflow-hidden">
      {/* TimeForge Style Header */}
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1.5">Merchant Profile Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ATMButton
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
          >
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
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-gray-900/10">
        <Form id="merchant-edit-form" className="px-10 py-12 space-y-16 max-w-full">
          
          {/* Section 1: Identity */}
          <div className="space-y-10">
            <div className="border-l-4 border-slate-900 dark:border-accent-600 pl-5">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em]">
                Business Identity
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">Core corporate details and main point of contact.</p>
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
            <div className="border-l-4 border-slate-900 dark:border-accent-600 pl-5">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em]">
                Communication & Location
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">Email, telephone, and country configuration.</p>
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
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-slate-50 dark:bg-zinc-900/40 shadow-sm">
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
            <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 animate-in fade-in flex items-center gap-4 mx-6">
              <AlertCircle size={20} className="text-rose-600" />
              <div>
                <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Validation Blocked</p>
                <p className="text-[11px] text-rose-500 dark:text-rose-400/70 font-medium mt-0.5">Please resolve the highlighted fields to save changes.</p>
              </div>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default MerchantEditPage;
