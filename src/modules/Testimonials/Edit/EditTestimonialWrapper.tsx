import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { toast } from 'sonner';

import { useUpdateTestimonialMutation } from '../Service/TestimonialService';
import { TestimonialForm } from '../Form/TestimonialForm';
import { testimonialValidationSchema } from '../Add/AddTestimonialWrapper';
import type { TestimonialItem, TestimonialFormValues, SaveTestimonialDto } from '../Model/TestimonialTypes';

interface EditTestimonialWrapperProps {
  testimonial: TestimonialItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditTestimonialWrapper: React.FC<EditTestimonialWrapperProps> = ({
  testimonial,
  onSuccess,
  onCancel,
}) => {
  const [updateTestimonial, updateState] = useUpdateTestimonialMutation();

  // Infer website variant from pageSlug or merchantType
  const derivedVariant = testimonial.pageSlug
    ? testimonial.pageSlug.charAt(0).toUpperCase() + testimonial.pageSlug.slice(1)
    : testimonial.merchantType === 'Enterprise'
    ? 'Enterprise'
    : 'Restaurant';

  const initialValues: TestimonialFormValues = {
    siteVariant: ['Enterprise', 'Restaurant', 'Retail'].includes(derivedVariant)
      ? derivedVariant
      : 'Enterprise',
    personName: testimonial.personName || '',
    personRole: testimonial.personRole || '',
    companyName: testimonial.companyName || '',
    avatarUrl: testimonial.avatarUrl || '',
    metricText: testimonial.metricText || '',
    rating: testimonial.rating || 5,
    title: testimonial.title || '',
    body: testimonial.body || '',
    sortOrder: testimonial.sortOrder || 1,
    isActive: testimonial.isActive ?? true,
  };

  const handleFormSubmit = async (
    values: TestimonialFormValues,
    { setSubmitting }: FormikHelpers<TestimonialFormValues>
  ) => {
    const payload: SaveTestimonialDto = {
      personName: values.personName.trim(),
      personRole: values.personRole.trim() || null,
      companyName: values.companyName.trim() || null,
      avatarUrl: values.avatarUrl.trim() || null,
      metricText: values.metricText.trim() || null,
      rating: Number(values.rating) || 5,
      merchantType: values.siteVariant === 'Enterprise' ? 'Enterprise' : 'Standalone',
      title: values.title.trim() || null,
      body: values.body.trim(),
      pageSlug: values.siteVariant.toLowerCase(),
      sortOrder: Number(values.sortOrder) || 1,
      isActive: values.isActive,
    };

    try {
      const res = await updateTestimonial({
        id: testimonial.testimonialId,
        ...payload,
      }).unwrap();

      if (res?.success) {
        toast.success('Testimonial review updated successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to update testimonial');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error updating testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={testimonialValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <TestimonialForm
          formikProps={formikProps}
          isEdit={true}
          onCancel={onCancel}
          isLoading={updateState.isLoading}
        />
      )}
    </Formik>
  );
};
