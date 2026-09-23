import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { toast } from 'sonner';

import { useUpdateSocialProofMetricMutation } from '../Service/SocialProofService';
import { SocialProofForm } from '../Form/SocialProofForm';
import { socialProofValidationSchema } from '../Add/AddSocialProofWrapper';
import type { SocialProofMetric, SocialProofFormValues, SaveSocialProofMetricDto } from '../Model/SocialProofTypes';

interface EditSocialProofWrapperProps {
  metric: SocialProofMetric;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditSocialProofWrapper: React.FC<EditSocialProofWrapperProps> = ({
  metric,
  onSuccess,
  onCancel,
}) => {
  const [updateMetric, updateState] = useUpdateSocialProofMetricMutation();

  const initialValues: SocialProofFormValues = {
    siteVariant: metric.siteVariant || 'Enterprise',
    value: metric.value || '',
    numericValue: metric.numericValue ?? '',
    prefix: metric.prefix || '',
    suffix: metric.suffix || '',
    decimals: metric.decimals ?? 0,
    label: metric.label || '',
    description: metric.description || '',
    iconKey: metric.iconKey || 'Store',
    accentColor: metric.accentColor || 'orange',
    sortOrder: metric.sortOrder || 1,
    isActive: metric.isActive ?? true,
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
      const res = await updateMetric({
        id: metric.metricId,
        ...payload,
      }).unwrap();

      if (res?.success) {
        toast.success('Social proof metric updated successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to update metric');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error updating metric');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={socialProofValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <SocialProofForm
          formikProps={formikProps}
          isEdit={true}
          onCancel={onCancel}
          isLoading={updateState.isLoading}
        />
      )}
    </Formik>
  );
};
