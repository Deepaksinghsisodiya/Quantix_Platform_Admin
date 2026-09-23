import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { toast } from 'sonner';

import { useUpdateHeroSlideMutation } from '../Service/HeroSectionService';
import { HeroSectionForm } from '../Form/HeroSectionForm';
import { heroSlideValidationSchema } from '../Add/AddHeroSectionWrapper';
import type { HeroSlide, HeroSlideFormValues, SaveHeroSlideDto } from '../Model/HeroSectionTypes';

interface EditHeroSectionWrapperProps {
  slide: HeroSlide;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditHeroSectionWrapper: React.FC<EditHeroSectionWrapperProps> = ({
  slide,
  onSuccess,
  onCancel,
}) => {
  const [updateSlide, updateState] = useUpdateHeroSlideMutation();

  const highlights = slide.featureHighlights || [];

  const initialValues: HeroSlideFormValues = {
    siteVariant: slide.siteVariant || 'Enterprise',
    badge: slide.badge || '',
    heading: slide.heading || '',
    subheading: slide.subheading || '',
    primaryCtaLabel: slide.primaryCtaLabel || '',
    primaryCtaUrl: slide.primaryCtaUrl || '',
    secondaryCtaLabel: slide.secondaryCtaLabel || '',
    secondaryCtaUrl: slide.secondaryCtaUrl || '',
    highlight1: highlights[0] || '',
    highlight2: highlights[1] || '',
    highlight3: highlights[2] || '',
    mediaAssetId: slide.mediaAssetId || '',
    imageUrl: slide.imageUrl || '',
    sortOrder: slide.sortOrder || 1,
    isActive: slide.isActive ?? true,
  };

  const handleFormSubmit = async (
    values: HeroSlideFormValues,
    { setSubmitting }: FormikHelpers<HeroSlideFormValues>
  ) => {
    const featureHighlights = [values.highlight1, values.highlight2, values.highlight3]
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
      featureHighlights,
      mediaAssetId: values.mediaAssetId || null,
      imageUrl: values.imageUrl.trim() || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      await updateSlide({ id: slide.heroSlideId, ...payload }).unwrap();
      toast.success('Hero slide updated successfully.');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update hero slide.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={heroSlideValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <HeroSectionForm
          formikProps={formikProps}
          isEdit
          onCancel={onCancel}
          isLoading={updateState.isLoading}
        />
      )}
    </Formik>
  );
};
