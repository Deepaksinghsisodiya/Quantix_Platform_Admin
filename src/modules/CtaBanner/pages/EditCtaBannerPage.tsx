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
      <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* 12-Columns Form Skeleton */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Configuration Form Cards */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Platform Selection Skeleton */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Card 2: Messaging & Copy Skeleton */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3">
                <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                </div>
                <div className="h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Card 3: Dual CTA Buttons Skeleton */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                  <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                </div>
                <div className="space-y-2">
                  <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                  <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
            </div>

            {/* Card 4: Telemetry Chips Skeleton */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2.5">
                <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Preview Sticky Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="rounded-3xl border border-slate-800 bg-[#080B11] p-6 space-y-4 text-center">
                <div className="h-5 w-48 mx-auto rounded-full bg-slate-800" />
                <div className="h-7 w-4/5 mx-auto rounded-lg bg-slate-800" />
                <div className="h-3.5 w-full mx-auto rounded bg-slate-800/70" />
                <div className="h-3.5 w-3/4 mx-auto rounded bg-slate-800/70" />
                <div className="flex justify-center gap-2 pt-2">
                  <div className="h-6 w-28 rounded-full bg-slate-800" />
                  <div className="h-6 w-28 rounded-full bg-slate-800" />
                </div>
                <div className="flex justify-center gap-3 pt-3">
                  <div className="h-10 w-36 rounded-xl bg-slate-800" />
                  <div className="h-10 w-36 rounded-xl bg-slate-800" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-44 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
            </div>
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
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
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
