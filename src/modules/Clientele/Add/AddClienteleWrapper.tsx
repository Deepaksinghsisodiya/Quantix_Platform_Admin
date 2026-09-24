import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useCreateClientBrandMutation } from '../Service/ClienteleService';
import { ClienteleForm } from '../Form/ClienteleForm';
import type { ClienteleFormValues, SaveClientBrandDto } from '../Model/ClienteleTypes';

export const clienteleValidationSchema = Yup.object().shape({
  siteVariant: Yup.string().required('Target website is required'),
  name: Yup.string().trim().required('Brand/Company name is required'),
  category: Yup.string().required('Industry category is required'),
  industry: Yup.string().trim().nullable(),
  logoUrl: Yup.string().trim().nullable(),
  websiteUrl: Yup.string().trim().nullable(),
  tier: Yup.string().nullable(),
  locationsCount: Yup.number().typeError('Locations must be a number').nullable(),
  sortOrder: Yup.number().typeError('Order must be a number').min(0, 'Order must be at least 0').required('Order is required'),
  isFeatured: Yup.boolean().required(),
  isActive: Yup.boolean().required(),
});

interface AddClienteleWrapperProps {
  siteVariant?: string;
  defaultSortOrder?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddClienteleWrapper: React.FC<AddClienteleWrapperProps> = ({
  siteVariant = 'Enterprise',
  defaultSortOrder = 1,
  onSuccess,
  onCancel,
}) => {
  const [createBrand, createState] = useCreateClientBrandMutation();

  const initialValues: ClienteleFormValues = {
    siteVariant,
    name: '',
    category: 'Enterprise',
    industry: '',
    logoUrl: '',
    websiteUrl: '',
    tier: 'Enterprise',
    locationsCount: '',
    isFeatured: false,
    sortOrder: defaultSortOrder,
    isActive: true,
  };

  const handleFormSubmit = async (
    values: ClienteleFormValues,
    { setSubmitting }: FormikHelpers<ClienteleFormValues>
  ) => {
    const loc = values.locationsCount === '' || values.locationsCount === undefined || values.locationsCount === null
      ? null
      : Number(values.locationsCount);

    const payload: SaveClientBrandDto = {
      siteVariant: values.siteVariant,
      name: values.name.trim(),
      category: values.category,
      industry: values.industry.trim() || null,
      logoUrl: values.logoUrl.trim() || null,
      websiteUrl: values.websiteUrl.trim() || null,
      tier: values.tier || 'Enterprise',
      locationsCount: loc !== null && !isNaN(loc) ? loc : null,
      isFeatured: values.isFeatured,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      const res = await createBrand(payload).unwrap();
      if (res?.success) {
        toast.success('Brand partner added to marquee successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to add brand');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error adding brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={clienteleValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <ClienteleForm
          formikProps={formikProps}
          isEdit={false}
          onCancel={onCancel}
          isLoading={createState.isLoading}
        />
      )}
    </Formik>
  );
};
