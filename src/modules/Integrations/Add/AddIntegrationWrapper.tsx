import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useCreateIntegrationMutation } from '../Service/IntegrationService';
import { IntegrationForm } from '../Form/IntegrationForm';
import type { IntegrationFormValues, SaveIntegrationDto } from '../Model/IntegrationTypes';

export const integrationValidationSchema = Yup.object().shape({
  siteVariant: Yup.string().required('Target website is required'),
  name: Yup.string().trim().required('Integration name is required'),
  slug: Yup.string().trim().required('URL slug is required'),
  category: Yup.string().required('Category is required'),
  sortOrder: Yup.number().typeError('Order must be a number').min(0, 'Order must be at least 0').required('Order is required'),
  isPopular: Yup.boolean().required(),
  showInNavbar: Yup.boolean().required(),
  isActive: Yup.boolean().required(),
});

interface AddIntegrationWrapperProps {
  siteVariant?: string;
  defaultSortOrder?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddIntegrationWrapper: React.FC<AddIntegrationWrapperProps> = ({
  siteVariant = 'Enterprise',
  defaultSortOrder = 1,
  onSuccess,
  onCancel,
}) => {
  const [createIntegration, createState] = useCreateIntegrationMutation();

  const initialValues: IntegrationFormValues = {
    siteVariant,
    slug: '',
    name: '',
    category: 'payments',
    categoryLabel: 'PAYMENTS',
    description: '',
    logoUrl: '',
    imageUrl: '',
    websiteUrl: '',
    accent: '#635BFF',
    badge: 'Official Partner',
    heroHeadline: '',
    tagline: '',
    syncSpeed: 'Real-Time Sync',
    syncSpeedIcon: 'live',
    tags: ['Tap to Pay', 'Apple Pay', 'Daily Payouts'],
    features: [
      { title: 'Tableside Card Readers', desc: 'Push order totals to card readers for tap, chip, and swipe payments.' },
      { title: 'Online Checkout', desc: 'Process card and mobile wallet payments on your direct online ordering page.' },
    ],
    setupSteps: [
      { step: '01', title: 'Connect Account', desc: 'Link your credentials in Settings → Payment Integrations.' },
      { step: '02', title: 'Pair Terminals', desc: 'Connect payment hardware via Bluetooth or network.' },
    ],
    benefits: [
      'Zero manual entry — totals push from POS to reader automatically',
      'Support for 135+ currencies and international cards',
      'PCI-DSS Level 1 compliant — enterprise-grade security',
    ],
    faqs: [
      { question: 'Do I need a separate account?', answer: 'Yes, you can connect your existing account or create one during setup.' },
    ],
    stats: [
      { value: '99.99%', label: 'Processing Uptime' },
      { value: '<1.2s', label: 'Average Checkout Speed' },
    ],
    specs: [
      { label: 'Supported Rails', value: 'Visa, MasterCard, Amex, Apple Pay, Google Pay' },
    ],
    isPopular: false,
    showInNavbar: true,
    sortOrder: defaultSortOrder,
    isActive: true,
  };

  const handleFormSubmit = async (
    values: IntegrationFormValues,
    { setSubmitting }: FormikHelpers<IntegrationFormValues>
  ) => {
    // Filter empty items
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
      const res = await createIntegration(payload).unwrap();
      if (res?.success) {
        toast.success('Integration added to catalog successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to add integration');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error adding integration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={integrationValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <IntegrationForm
          formikProps={formikProps}
          isEdit={false}
          onCancel={onCancel}
          isLoading={createState.isLoading}
        />
      )}
    </Formik>
  );
};

export default AddIntegrationWrapper;
