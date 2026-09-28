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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
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
