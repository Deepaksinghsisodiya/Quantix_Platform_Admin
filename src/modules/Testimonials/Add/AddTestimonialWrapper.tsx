import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useCreateTestimonialMutation } from '../Service/TestimonialService';
import { TestimonialForm } from '../Form/TestimonialForm';
import type { TestimonialFormValues, SaveTestimonialDto } from '../Model/TestimonialTypes';

export const testimonialValidationSchema = Yup.object().shape({
  siteVariant: Yup.string().required('Target website is required'),
  personName: Yup.string().trim().required('Reviewer name is required'),
  personRole: Yup.string().trim().nullable(),
  companyName: Yup.string().trim().nullable(),
  avatarUrl: Yup.string().trim().nullable(),
  metricText: Yup.string().trim().nullable(),
  rating: Yup.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').required('Rating is required'),
  title: Yup.string().trim().nullable(),
  body: Yup.string().trim().min(10, 'Review quote must be at least 10 characters').required('Review quote is required'),
  sortOrder: Yup.number().typeError('Sequence must be a number').min(1, 'Sequence must be at least 1').required('Sequence is required'),
  isActive: Yup.boolean().required(),
});

interface AddTestimonialWrapperProps {
  siteVariant?: string;
  defaultSortOrder?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTestimonialWrapper: React.FC<AddTestimonialWrapperProps> = ({
  siteVariant = 'Enterprise',
  defaultSortOrder = 1,
  onSuccess,
  onCancel,
}) => {
  const [createTestimonial, createState] = useCreateTestimonialMutation();

  const initialValues: TestimonialFormValues = {
    siteVariant,
    personName: '',
    personRole: '',
    companyName: '',
    avatarUrl: '',
    metricText: '',
    rating: 5,
    title: '',
    body: '',
    sortOrder: defaultSortOrder,
    isActive: true,
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
      const res = await createTestimonial(payload).unwrap();
      if (res?.success) {
        toast.success('Testimonial review created successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to create testimonial');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error creating testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={testimonialValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <TestimonialForm
          formikProps={formikProps}
          isEdit={false}
          onCancel={onCancel}
          isLoading={createState.isLoading}
        />
      )}
    </Formik>
  );
};
