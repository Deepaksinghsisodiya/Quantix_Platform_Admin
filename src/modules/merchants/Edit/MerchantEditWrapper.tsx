import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useGetMerchantQuery, useUpdateMerchantMutation } from '../services/merchantApi';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';
import { ArrowLeft } from 'lucide-react';
import MerchantEditPage, { MerchantFormValues } from './MerchantEditPage';

const validationSchema = Yup.object().shape({
  businessName: Yup.string().required('Business Name is required'),
  contactPerson: Yup.string().required('Contact Person is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  country: Yup.string().required('Country is required'),
});

export const MerchantEditWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch Merchant
  const { data: merchantRes, isLoading: isMerchantLoading } = useGetMerchantQuery(id ?? '', {
    skip: !id,
  });

  // Mutation
  const [updateMerchant] = useUpdateMerchantMutation();

  const handleCancel = () => {
    navigate(`/merchants/${id}`);
  };

  const handleSubmit = async (values: MerchantFormValues) => {
    if (!id) return;
    try {
      await updateMerchant({
        id,
        data: {
          businessName: values.businessName,
          contactPerson: values.contactPerson,
          email: values.email,
          phone: values.phone,
          country: values.country,
        },
      }).unwrap();
      toast.success('Merchant details updated successfully');
      navigate(`/merchants/${id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update merchant details');
    }
  };

  if (isMerchantLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 animate-fade-in w-full">
        {/* Simple skeleton header */}
        <div className="flex items-center gap-4 py-4">
          <ATMIconButton
            type="button"
            icon={ArrowLeft}
            onClick={handleCancel}
            variant="default"
            size="md"
            className="text-slate-400"
          />
          <div className="w-px h-10 bg-slate-100 dark:bg-gray-800" />
          <ATMSkeleton className="h-8 w-64 rounded-lg" />
        </div>
        <ATMSkeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const merchant = merchantRes?.data;
  if (!merchant) {
    return (
      <div className="p-10 text-center font-black text-rose-500 uppercase tracking-widest">
        Merchant not found
      </div>
    );
  }

  const initialValues: MerchantFormValues = {
    businessName: merchant.businessName || '',
    contactPerson: merchant.contactPerson || '',
    email: merchant.email || '',
    phone: merchant.phone || '',
    country: merchant.country || 'US',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps: FormikProps<MerchantFormValues>) => (
        <MerchantEditPage
          title={`Edit ${merchant.businessName}`}
          formikProps={formikProps}
          onCancel={handleCancel}
        />
      )}
    </Formik>
  );
};

export default MerchantEditWrapper;
