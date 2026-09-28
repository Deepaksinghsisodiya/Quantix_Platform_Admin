import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMSkeleton } from '@/shared/ui';
import { CtaBannerForm, CtaBannerFormValues } from '../Form/CtaBannerForm';
import {
  useGetCtaBannerByIdQuery,
  useUpdateCtaBannerMutation,
} from '../Service/CtaBannerService';

const validationSchema = Yup.object().shape({
  heading: Yup.string().required('Main heading is required').trim(),
  siteVariant: Yup.string().required('Platform variant is required'),
  primaryCtaText: Yup.string().required('Primary button label is required').trim(),
  primaryCtaHref: Yup.string().required('Primary button route is required').trim(),
});

export const EditCtaBannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: res, isLoading, isError } = useGetCtaBannerByIdQuery(id!, {
    skip: !id,
  });

  const [updateCtaBanner] = useUpdateCtaBannerMutation();

  const item = res?.data;

  if (isLoading) {
    return (
      <div className="w-full space-y-6 max-w-[1200px] mx-auto px-1 sm:px-2 py-4 animate-fade-in">
        <div className="space-y-2">
          <ATMSkeleton variant="text" width="35%" height="2.2rem" />
          <ATMSkeleton variant="text" width="55%" height="1.1rem" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div className="lg:col-span-2 space-y-4">
            <ATMSkeleton variant="card" height="26rem" />
          </div>
          <div>
            <ATMSkeleton variant="card" height="18rem" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-12 text-center text-red-500 font-syne">
        Final CTA Banner configuration not found.
      </div>
    );
  }

  const initialValues: CtaBannerFormValues = {
    siteVariant: item.siteVariant || 'Enterprise',
    badge: item.badge || '',
    heading: item.heading || '',
    headingAccent: item.headingAccent || '',
    subheading: item.subheading || '',
    primaryCtaText: item.primaryCta?.label || '',
    primaryCtaHref: item.primaryCta?.href || '',
    secondaryCtaText: item.secondaryCta?.label || '',
    secondaryCtaHref: item.secondaryCta?.href || '',
    telemetryChips: item.telemetryChips || [],
    trustBadges: item.trustBadges || [],
    isActive: item.isActive,
  };

  const handleSubmit = async (values: CtaBannerFormValues) => {
    try {
      await updateCtaBanner({
        id: item.ctaBannerId,
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

      toast.success('Final CTA Banner updated successfully!');
      navigate('/content/cta-banner');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update CTA Banner.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      <ATMPageHeader
        title={`Edit ${item.siteVariant} CTA Banner`}
        subtitle="Update banner messaging, conversion URLs, live telemetry chips, and trust badges."
        onBack={() => navigate('/content/cta-banner')}
        breadcrumbs={[
          { label: 'Content', href: '/content' },
          { label: 'CTA Banner', href: '/content/cta-banner' },
          { label: `Edit ${item.siteVariant}` },
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
            isEdit={true}
            onCancel={() => navigate('/content/cta-banner')}
          />
        )}
      </Formik>
    </div>
  );
};
