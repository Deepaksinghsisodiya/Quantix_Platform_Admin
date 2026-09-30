import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { CustomerSupportForm, CustomerSupportFormValues } from '../Form/CustomerSupportForm';
import { useCreateSupportSectionMutation } from '../Service/CustomerSupportService';

const validationSchema = Yup.object().shape({
  mainTitle: Yup.string().required('Main heading is required').trim(),
  siteVariant: Yup.string().required('Platform variant is required'),
});

export const AddCustomerSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVariant = searchParams.get('variant') || 'Enterprise';

  const [createSupportSection] = useCreateSupportSectionMutation();

  const initialValues: CustomerSupportFormValues = {
    siteVariant: initialVariant,
    pillBadge: '24/7/365 HUMAN CUSTOMER SUPPORT',
    mainTitle: `24/7 Dedicated ${initialVariant}`,
    highlightWord: 'Technical Support',
    description:
      'Multi-location operations need immediate resolution. Get round-the-clock technical assistance, dedicated account onboarding, and direct priority support across every store.',
    pillars: [
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
    repName: 'Sarah Jenkins',
    repRole: 'Enterprise Escalation Lead',
    repAvatarUrl: '/images/customer_support_executive.jpg',
    responseTimeBadge: '< 45s Live Response',
    directPhone: '+1 (800) 555-0199',
    directEmail: 'enterprise@quantixpos.com',
    liveChatStatus: 'Online & Available',
    chatButtonText: 'Start Live Technical Chat',
    isActive: true,
  };

  const handleSubmit = async (values: CustomerSupportFormValues) => {
    try {
      await createSupportSection({
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

      toast.success('Customer Support section created and published successfully!');
      navigate('/content/customer-support');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to save customer support section.');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      <ATMPageHeader
        title="Add Customer Support Desk"
        subtitle="Configure a dedicated 24/7 technical assistance desk, service pillars, and direct hotline numbers."
        onBack={() => navigate('/content/customer-support')}
        breadcrumbs={[
          { label: 'Content', href: '/content' },
          { label: 'Customer Support', href: '/content/customer-support' },
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
          <CustomerSupportForm
            formikProps={formikProps}
            isEdit={false}
            onCancel={() => navigate('/content/customer-support')}
          />
        )}
      </Formik>
    </div>
  );
};
