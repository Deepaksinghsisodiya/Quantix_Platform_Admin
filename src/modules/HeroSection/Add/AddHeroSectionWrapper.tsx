import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useCreateHeroSlideMutation } from '../Service/HeroSectionService';
import { HeroSectionForm } from '../Form/HeroSectionForm';
import type { HeroSlideFormValues, SaveHeroSlideDto } from '../Model/HeroSectionTypes';

export const heroSlideValidationSchema = Yup.object().shape({
  siteVariant: Yup.string().required('Target website is required'),
  badge: Yup.string().trim().required('Badge pill text is required'),
  heading: Yup.string().trim().required('Heading / title is required').min(5, 'Heading must be at least 5 characters'),
  subheading: Yup.string().trim().nullable(),
  primaryCtaLabel: Yup.string().trim().required('Primary button label is required'),
  primaryCtaUrl: Yup.string().trim().required('Primary button URL is required'),
  secondaryCtaLabel: Yup.string().trim().nullable(),
  secondaryCtaUrl: Yup.string().trim().nullable(),
  sortOrder: Yup.number().typeError('Order must be a number').min(1, 'Order must be at least 1').required('Order is required'),
  isActive: Yup.boolean().required(),
});

interface AddHeroSectionWrapperProps {
  siteVariant?: string;
  defaultSortOrder?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddHeroSectionWrapper: React.FC<AddHeroSectionWrapperProps> = ({
  siteVariant = 'Enterprise',
  defaultSortOrder = 1,
  onSuccess,
  onCancel,
}) => {
  const [createSlide, createState] = useCreateHeroSlideMutation();

  const initialValues: HeroSlideFormValues = {
    siteVariant,
    badge: '',
    heading: '',
    subheading: '',
    primaryCtaLabel: 'Start Free Trial',
    primaryCtaUrl: '/contact',
    secondaryCtaLabel: 'Book Demo',
    secondaryCtaUrl: '/contact/demo',
    highlight1: '',
    highlight2: '',
    highlight3: '',
    mediaAssetId: '',
    imageUrl: '',
    sortOrder: defaultSortOrder,
    isActive: true,
  };

  const handleFormSubmit = async (
    values: HeroSlideFormValues,
    { setSubmitting }: FormikHelpers<HeroSlideFormValues>
  ) => {
    const highlights = [values.highlight1, values.highlight2, values.highlight3]
      .map((x) => x.trim())
      .filter(Boolean);

    const payload: SaveHeroSlideDto = {
      siteVariant: values.siteVariant,
      badge: values.badge.trim(),
      heading: values.heading.trim(),
      subheading: values.subheading.trim() || null,
      primaryCtaLabel: values.primaryCtaLabel.trim(),
      primaryCtaUrl: values.primaryCtaUrl.trim(),
      secondaryCtaLabel: values.secondaryCtaLabel.trim() || null,
      secondaryCtaUrl: values.secondaryCtaUrl.trim() || null,
      featureHighlights: highlights,
      mediaAssetId: values.mediaAssetId || null,
      imageUrl: values.imageUrl.trim() || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      await createSlide(payload).unwrap();
      toast.success('Hero slide created successfully.');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create hero slide.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={heroSlideValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <HeroSectionForm
          formikProps={formikProps}
          onCancel={onCancel}
          isLoading={createState.isLoading}
        />
      )}
    </Formik>
  );
};
