import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { toast } from 'sonner';

import { useUpdateIntegrationMutation } from '../Service/IntegrationService';
import { IntegrationForm } from '../Form/IntegrationForm';
import { integrationValidationSchema } from '../Add/AddIntegrationWrapper';
import type {
  IntegrationItem,
  IntegrationFormValues,
  SaveIntegrationDto,
  IntegrationFeatureItem,
  IntegrationSetupStepItem,
  IntegrationFaqItem,
  IntegrationStatItem,
  IntegrationSpecItem,
} from '../Model/IntegrationTypes';

interface EditIntegrationWrapperProps {
  integration: IntegrationItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const safeJsonParse = <T,>(json: string | null | undefined, fallback: T): T => {
  if (!json || !json.trim()) return fallback;
  try {
    return JSON.parse(json.trim());
  } catch {
    return fallback;
  }
};

export const EditIntegrationWrapper: React.FC<EditIntegrationWrapperProps> = ({
  integration,
  onSuccess,
  onCancel,
}) => {
  const [updateIntegration, updateState] = useUpdateIntegrationMutation();

  const initialValues: IntegrationFormValues = {
    siteVariant: integration.siteVariant || 'Enterprise',
    slug: integration.slug || '',
    name: integration.name || '',
    category: integration.category || 'payments',
    categoryLabel: integration.categoryLabel || integration.category?.toUpperCase() || 'PAYMENTS',
    description: integration.description || '',
    logoUrl: integration.logoUrl || '',
    imageUrl: integration.imageUrl || '',
    websiteUrl: integration.websiteUrl || '',
    accent: integration.accent || '#635BFF',
    badge: integration.badge || '',
    heroHeadline: integration.heroHeadline || '',
    tagline: integration.tagline || '',
    syncSpeed: integration.syncSpeed || 'Real-Time Sync',
    syncSpeedIcon: integration.syncSpeedIcon || 'live',
    tags: safeJsonParse<string[]>(integration.tagsJson, []),
    features: safeJsonParse<IntegrationFeatureItem[]>(integration.featuresJson, []),
    setupSteps: safeJsonParse<IntegrationSetupStepItem[]>(integration.setupStepsJson, []),
    benefits: safeJsonParse<string[]>(integration.benefitsJson, []),
    faqs: safeJsonParse<IntegrationFaqItem[]>(integration.faqsJson, []),
    stats: safeJsonParse<IntegrationStatItem[]>(integration.statsJson, []),
    specs: safeJsonParse<IntegrationSpecItem[]>(integration.specsJson, []),
    isPopular: integration.isPopular || false,
    showInNavbar: integration.showInNavbar ?? true,
    sortOrder: integration.sortOrder || 0,
    isActive: integration.isActive ?? true,
  };

  const handleFormSubmit = async (
    values: IntegrationFormValues,
    { setSubmitting }: FormikHelpers<IntegrationFormValues>
  ) => {
    const cleanFeatures = values.features.filter((f) => (f.title?.trim() ?? '') || (f.desc?.trim() ?? ''));
    const cleanSteps = values.setupSteps.filter((s) => (s.title?.trim() ?? '') || (s.desc?.trim() ?? ''));
    const cleanBenefits = values.benefits.filter((b) => b.trim());
    const cleanFaqs = values.faqs.filter((f) => (f.question?.trim() ?? '') || (f.answer?.trim() ?? ''));
    const cleanStats = values.stats.filter((s) => (s.value?.trim() ?? '') || (s.label?.trim() ?? ''));
    const cleanSpecs = values.specs.filter((s) => (s.label?.trim() ?? '') || (s.value?.trim() ?? ''));

    const payload: SaveIntegrationDto = {
      siteVariant: values.siteVariant,
      slug: values.slug.trim().toLowerCase(),
      name: values.name.trim(),
      category: values.category.trim(),
      categoryLabel: values.categoryLabel.trim() || values.category.toUpperCase(),
      description: values.description.trim() || null,
      logoUrl: values.logoUrl.trim() || null,
      imageUrl: values.imageUrl.trim() || null,
      websiteUrl: values.websiteUrl.trim() || null,
      accent: values.accent.trim() || null,
      badge: values.badge.trim() || null,
      heroHeadline: values.heroHeadline.trim() || null,
      tagline: values.tagline.trim() || null,
      syncSpeed: values.syncSpeed.trim() || null,
      syncSpeedIcon: values.syncSpeedIcon.trim() || null,
      tagsJson: values.tags.length > 0 ? JSON.stringify(values.tags) : null,
      featuresJson: cleanFeatures.length > 0 ? JSON.stringify(cleanFeatures) : null,
      setupStepsJson: cleanSteps.length > 0 ? JSON.stringify(cleanSteps) : null,
      benefitsJson: cleanBenefits.length > 0 ? JSON.stringify(cleanBenefits) : null,
      faqsJson: cleanFaqs.length > 0 ? JSON.stringify(cleanFaqs) : null,
      statsJson: cleanStats.length > 0 ? JSON.stringify(cleanStats) : null,
      specsJson: cleanSpecs.length > 0 ? JSON.stringify(cleanSpecs) : null,
      isPopular: values.isPopular,
      showInNavbar: values.showInNavbar,
      sortOrder: Number(values.sortOrder) || 0,
      isActive: values.isActive,
    };

    try {
      const res = await updateIntegration({
        id: integration.integrationId || integration.id,
        ...payload,
      }).unwrap();

      if (res?.success) {
        toast.success('Integration updated successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to update integration');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error updating integration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={integrationValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <IntegrationForm
          formikProps={formikProps}
          isEdit={true}
          onCancel={onCancel}
          isLoading={updateState.isLoading}
        />
      )}
    </Formik>
  );
};

export default EditIntegrationWrapper;
