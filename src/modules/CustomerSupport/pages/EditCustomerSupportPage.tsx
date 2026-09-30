import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMSkeleton } from '@/shared/ui';
import { CustomerSupportForm, CustomerSupportFormValues } from '../Form/CustomerSupportForm';
import {
  useGetSupportSectionByIdQuery,
  useUpdateSupportSectionMutation,
} from '../Service/CustomerSupportService';

const validationSchema = Yup.object().shape({
  mainTitle: Yup.string().required('Main heading is required').trim(),
  siteVariant: Yup.string().required('Platform variant is required'),
});

export const EditCustomerSupportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: res, isLoading, isError } = useGetSupportSectionByIdQuery(id!, {
    skip: !id,
  });

  const [updateSupportSection] = useUpdateSupportSectionMutation();

  const item = res?.data;

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-fadeIn pb-12">
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

        {/* Form Grid Skeleton (Full Width 12-cols) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Form Sections */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Section 1: Platform Selector Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 animate-pulse">
              <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Section 2: Copy & Titles Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 animate-pulse">
              <div className="h-5 w-56 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-4">
                <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                </div>
                <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Section 3: Pillars Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3">
                <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Section 4: Contact & Rep Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-5 w-60 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Preview Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 space-y-3">
                <div className="h-4 w-28 rounded-full bg-slate-800" />
                <div className="h-5 w-40 rounded bg-slate-800" />
                <div className="h-3 w-full rounded bg-slate-800" />
                <div className="space-y-2 pt-2">
                  <div className="h-10 rounded-xl bg-slate-900 border border-slate-800" />
                  <div className="h-10 rounded-xl bg-slate-900 border border-slate-800" />
                </div>
                <div className="h-12 rounded-xl bg-slate-900 border border-slate-800 mt-2" />
                <div className="h-8 rounded-xl bg-slate-800 mt-2" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 animate-pulse">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
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
        Customer Support section not found.
      </div>
    );
  }

  const initialValues: CustomerSupportFormValues = {
    siteVariant: item.siteVariant || 'Enterprise',
    pillBadge: item.pillBadge || '',
    mainTitle: item.mainTitle || '',
    highlightWord: item.highlightWord || '',
    description: item.description || '',
    pillars: item.pillars?.length
      ? item.pillars
      : [
          {
            iconKey: 'Headphones',
            title: 'Dedicated Account Manager',
            desc: '1-on-1 technical onboarding and custom multi-store rollouts.',
          },
          {
            iconKey: 'Clock',
            title: 'Priority Direct Channel',
            desc: 'Instant voice hotline and live remote screen-share with zero IVR.',
          },
          {
            iconKey: 'ShieldCheck',
            title: '99.9% Uptime Guarantee',
            desc: 'Enterprise SLAs backed by round-the-clock infrastructure engineers.',
          },
        ],
    repName: item.repName || '',
    repRole: item.repRole || '',
    repAvatarUrl: item.repAvatarUrl || '/images/customer_support_executive.jpg',
    responseTimeBadge: item.responseTimeBadge || '< 45s Live Response',
    directPhone: item.directPhone || '',
    directEmail: item.directEmail || '',
    liveChatStatus: item.liveChatStatus || 'Online & Available',
    chatButtonText: item.chatButtonText || 'Start Live Technical Chat',
    isActive: item.isActive,
  };

  const handleSubmit = async (values: CustomerSupportFormValues) => {
    try {
      await updateSupportSection({
        id: item.supportSectionId,
        siteVariant: values.siteVariant,
        pillBadge: values.pillBadge?.trim(),
        mainTitle: values.mainTitle.trim(),
        highlightWord: values.highlightWord?.trim(),
        description: values.description?.trim(),
        pillars: values.pillars,
        repName: values.repName?.trim(),
        repRole: values.repRole?.trim(),
        repAvatarUrl: values.repAvatarUrl?.trim(),
        responseTimeBadge: values.responseTimeBadge?.trim(),
        directPhone: values.directPhone?.trim(),
        directEmail: values.directEmail?.trim(),
        liveChatStatus: values.liveChatStatus?.trim(),
        chatButtonText: values.chatButtonText?.trim(),
        isActive: values.isActive,
      }).unwrap();

      toast.success('Customer Support section updated successfully!');
      navigate('/content/customer-support');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update support desk.');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      <ATMPageHeader
        title={`Edit ${item.siteVariant} Support Desk`}
        subtitle="Update 24/7 technical guarantees, response time SLAs, and direct phone hotline numbers."
        onBack={() => navigate('/content/customer-support')}
        breadcrumbs={[
          { label: 'Content', href: '/content' },
          { label: 'Customer Support', href: '/content/customer-support' },
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
          <CustomerSupportForm
            formikProps={formikProps}
            isEdit={true}
            onCancel={() => navigate('/content/customer-support')}
          />
        )}
      </Formik>
    </div>
  );
};
