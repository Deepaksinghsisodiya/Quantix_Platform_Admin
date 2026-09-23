import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useCreateSocialProofMetricMutation } from '../Service/SocialProofService';
import { SocialProofForm } from '../Form/SocialProofForm';
import type { SocialProofFormValues, SaveSocialProofMetricDto } from '../Model/SocialProofTypes';

export const socialProofValidationSchema = Yup.object().shape({
  siteVariant: Yup.string().required('Target website is required'),
  value: Yup.string().trim().required('Display value is required (e.g. 50K+)'),
  label: Yup.string().trim().required('Metric headline is required (e.g. ACTIVE OUTLETS)'),
  description: Yup.string().trim().nullable(),
  iconKey: Yup.string().required('Icon is required'),
  accentColor: Yup.string().required('Accent color is required'),
  sortOrder: Yup.number().typeError('Order must be a number').min(1, 'Order must be at least 1').required('Order is required'),
  isActive: Yup.boolean().required(),
});

interface AddSocialProofWrapperProps {
  siteVariant?: string;
  defaultSortOrder?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddSocialProofWrapper: React.FC<AddSocialProofWrapperProps> = ({
  siteVariant = 'Enterprise',
  defaultSortOrder = 1,
  onSuccess,
  onCancel,
}) => {
  const [createMetric, createState] = useCreateSocialProofMetricMutation();

  const initialValues: SocialProofFormValues = {
    siteVariant,
    value: '',
    numericValue: '',
    prefix: '',
    suffix: '',
    decimals: 0,
    label: '',
    description: '',
    iconKey: 'Store',
    accentColor: 'orange',
    sortOrder: defaultSortOrder,
    isActive: true,
  };

  const handleFormSubmit = async (
    values: SocialProofFormValues,
    { setSubmitting }: FormikHelpers<SocialProofFormValues>
  ) => {
    const num = values.numericValue === '' || values.numericValue === undefined || values.numericValue === null
      ? null
      : Number(values.numericValue);

    const payload: SaveSocialProofMetricDto = {
      siteVariant: values.siteVariant,
      value: values.value.trim(),
      numericValue: num !== null && !isNaN(num) ? num : null,
      prefix: values.prefix.trim() || null,
      suffix: values.suffix.trim() || null,
      decimals: Number(values.decimals) || 0,
      label: values.label.trim(),
      description: values.description.trim() || null,
      iconKey: values.iconKey,
      accentColor: values.accentColor,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      const res = await createMetric(payload).unwrap();
      if (res?.success) {
        toast.success('Social proof metric created successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to create metric');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error creating metric');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={socialProofValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <SocialProofForm
          formikProps={formikProps}
          isEdit={false}
          onCancel={onCancel}
          isLoading={createState.isLoading}
        />
      )}
    </Formik>
  );
};
