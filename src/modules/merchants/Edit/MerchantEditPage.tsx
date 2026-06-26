import React from 'react';
import { Form, FormikProps } from 'formik';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { ATMInputField, ATMSelectField, ATMPhoneInputField } from '@/shared/components/form';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';

export interface MerchantFormValues {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
}

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'India', value: 'IN' },
  { label: 'UAE', value: 'AE' },
  { label: 'Saudi Arabia', value: 'SA' },
  { label: 'Singapore', value: 'SG' },
];

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
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-zen-surface z-25 shadow-sm">
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
            onClick={onCancel}
            className="px-10 h-14 font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900"
          >
            Discard
          </ATMButton>
          <ATMButton
            type="submit"
            variant="primary"
            form="merchant-edit-form"
            isLoading={isSubmitting}
            icon={Save}
            className="px-16 h-14 bg-accent-600 text-white hover:bg-accent-700 rounded-2xl shadow-2xl shadow-accent-900/20 transition-all active:scale-95 font-black uppercase tracking-[0.2em]"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pl-6">
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
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-10">
            <div className="border-l-4 border-slate-300 dark:border-gray-700 pl-5">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em]">
                Communication & Location
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">Email, telephone, and country configuration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pl-6">
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
              <div className="md:col-span-2">
                <ATMSelectField
                  name="country"
                  label="Country"
                  options={COUNTRY_OPTIONS}
                  required
                />
              </div>
            </div>
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
