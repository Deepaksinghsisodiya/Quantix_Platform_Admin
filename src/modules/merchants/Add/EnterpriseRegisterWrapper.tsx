import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as Yup from 'yup';

import { usePermission } from '@/shared/hooks/usePermission';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { useRegisterEnterpriseMutation } from '../services/merchantApi';
import EnterpriseRegisterForm, { type EnterpriseRegisterFormValues } from '../Form/EnterpriseRegisterForm';

const validationSchema = Yup.object({
  businessName: Yup.string().trim().min(2).max(200).required('Business name is required'),
  contactPerson: Yup.string().trim().min(2).max(100).required('Contact person is required'),
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  phone: Yup.string().trim().min(6).max(20).required('Phone number is required'),
  country: Yup.string().required('Country is required'),
  plan: Yup.string().required('Plan is required'),
  billingFrequency: Yup.string().oneOf(['Monthly', 'Quarterly', 'Annual']).required('Billing cycle is required'),
  preferredPaymentMethod: Yup.string().oneOf(['CreditCard', 'BankTransfer', 'Invoice']).required('Payment method is required'),
  dbEngine: Yup.string().oneOf(['PostgreSQL', 'MySQL', 'SQLServer', 'SQLite']).required('Database engine is required'),
  businessNature: Yup.string().trim().max(200),
});

const initialValues: EnterpriseRegisterFormValues = {
  businessName: '',
  contactPerson: '',
  email: '',
  phone: '',
  country: 'US',
  businessNature: '',
  plan: 'Professional',
  billingFrequency: 'Monthly',
  preferredPaymentMethod: 'CreditCard',
  dbEngine: 'PostgreSQL',
};

const getErrorMessage = (err: any) => err?.data?.message || err?.data?.Message || err?.message || 'Failed to register merchant. Please try again.';

export const EnterpriseRegisterWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { canAdd, isAdmin } = usePermission();
  const [registerEnterprise, { isLoading }] = useRegisterEnterpriseMutation();
  const [apiError, setApiError] = useState('');

  const canRegister = isAdmin || canAdd('merchants');

  const formik = useFormik<EnterpriseRegisterFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      setApiError('');
      try {
        const res = await registerEnterprise({
          businessName: values.businessName.trim(),
          businessNature: values.businessNature.trim(),
          contactPerson: values.contactPerson.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          country: values.country,
          plan: values.plan,
          tier: values.plan,
          billingFrequency: values.billingFrequency,
          preferredPaymentMethod: values.preferredPaymentMethod,
          dbEngine: values.dbEngine,
          featureFlags: {
            multiLocation: true,
            apiAccess: true,
            webhooks: false,
            whiteLabel: false,
            customDomain: false,
          },
          limits: {
            maxLocations: 5,
            maxTerminals: 20,
            maxProducts: 10000,
            maxUsers: 50,
            apiRateLimit: 1000,
          },
        }).unwrap();

        toast.success('Enterprise merchant registered successfully');
        navigate(res.data?.id ? `/merchants/${res.data.id}` : '/merchants');
      } catch (err: any) {
        const message = getErrorMessage(err);
        setApiError(message);
        toast.error(message);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  if (!canRegister) {
    return (
      <div className="flex h-full items-center justify-center bg-zen-surface p-6">
        <div className="max-w-md rounded-lg border border-gray-100 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <ATMBadge color="danger" label="Access Denied" />
          <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
            Your role does not include merchant creation permission.
          </p>
          <ATMButton className="mt-5" variant="outline" onClick={() => navigate('/merchants')}>
            Back to Merchants
          </ATMButton>
        </div>
      </div>
    );
  }

  return (
    <EnterpriseRegisterForm
      formikProps={formik}
      isLoading={isLoading || formik.isSubmitting}
      apiError={apiError}
      onCancel={() => navigate('/merchants')}
    />
  );
};

export default EnterpriseRegisterWrapper;
