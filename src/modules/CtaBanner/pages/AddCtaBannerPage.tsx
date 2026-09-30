import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { CtaBannerForm, CtaBannerFormValues } from '../Form/CtaBannerForm';
import { useCreateCtaBannerMutation } from '../Service/CtaBannerService';

const validationSchema = Yup.object().shape({
  heading: Yup.string().required('Main heading is required').trim(),
  siteVariant: Yup.string().required('Platform variant is required'),
  primaryCtaText: Yup.string().required('Primary button label is required').trim(),
  primaryCtaHref: Yup.string().required('Primary button route is required').trim(),
});

export const AddCtaBannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVariant = searchParams.get('variant') || 'Enterprise';

  const [createCtaBanner] = useCreateCtaBannerMutation();

  const initialValues: CtaBannerFormValues = {
    siteVariant: initialVariant,
    badge: 'DEPLOYMENT READY',
    heading: 'Take Control of Your Enterprise Operations',
    headingAccent: 'in Days, Not Months',
    subheading:
      'Join 1,200+ multi-unit operators orchestrating real-time supply chain, store ops, and cloud financials from a single pane of glass.',
    primaryCtaText: 'Request Enterprise Demo',
    primaryCtaHref: '/contact',
    secondaryCtaText: 'Calculate Enterprise ROI',
    secondaryCtaHref: '/pricing',
    telemetryChips: [
      {
        id: '1',
        label: '99.99% Core Uptime SLA',
        dotColor: '#10B981',
        pingColor: '#34D399',
      },
      {
        id: '2',
        label: '< 15ms Query Latency',
        dotColor: '#10B981',
        pingColor: '#34D399',
      },
      {
        id: '3',
        label: 'Zero Data Loss Protocol',
        dotColor: '#FF4F00',
        pingColor: '#FB923C',
      },
    ],
    trustBadges: [
      'SOC 2 Type II Certified',
      'No Long-term Lock-in',
      'White-Glove Migration Included',
      '24/7 Dedicated Slack Channel',
    ],
    isActive: true,
  };

  const handleSubmit = async (values: CtaBannerFormValues) => {
    try {
      await createCtaBanner({
        siteVariant: values.siteVariant,
        badge: values.badge?.trim(),
        heading: values.heading.trim(),
        headingAccent: values.headingAccent?.trim(),
        subheading: values.subheading?.trim(),
        primaryCtaText: values.primaryCtaText.trim(),
        primaryCtaHref: values.primaryCtaHref.trim(),
        secondaryCtaText: values.secondaryCtaText?.trim(),
        secondaryCtaHref: values.secondaryCtaHref?.trim(),
        telemetryChips: values.telemetryChips,
        trustBadges: values.trustBadges,
        isActive: values.isActive,
      }).unwrap();

      toast.success('Final CTA Banner created and published successfully!');
      navigate('/content/cta-banner');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to save CTA Banner.');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      <ATMPageHeader
        title="Create Final CTA Banner"
        subtitle="Configure high-converting storefront hero CTA banner with telemetry metrics, dual conversion routes, and trust guarantees."
        onBack={() => navigate('/content/cta-banner')}
        breadcrumbs={[
          { label: 'Content', href: '/content' },
          { label: 'CTA Banner', href: '/content/cta-banner' },
          { label: 'Add New' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <CtaBannerForm
            formikProps={formikProps}
            isEdit={false}
            onCancel={() => navigate('/content/cta-banner')}
          />
        )}
      </Formik>
    </div>
  );
};
