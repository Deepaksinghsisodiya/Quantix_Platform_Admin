import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { FeatureForm } from '../Form/FeatureForm';
import { useCreateFeatureMutation } from '../Service/FeatureService';
import type { SavePlatformFeatureDto } from '../Model/FeatureTypes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
  slug: Yup.string().required('Slug is required').trim(),
});

export const AddFeaturePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVariant = searchParams.get('siteVariant') || 'Enterprise';

  const [createFeature, { isLoading }] = useCreateFeatureMutation();

  const initialValues: SavePlatformFeatureDto = {
    siteVariant: initialVariant,
    slug: '',
    title: '',
    subtitle: '',
    category: 'Storefront',
    iconKey: 'Store',
    iconColor: 'text-[#FF4F00]',

    showInNavbar: true,
    showOnHomepage: true,
    isFeatured: false,
    navbarBadge: 'HOT',
    sortOrder: 1,
    isActive: true,

    numberLabel: '01',
    shortDescription: '',
    fullDescription: '',

    bullets: [
      'Offline-first mesh network keeps registers ringing during WAN drops.',
      '1-Click master catalog rollout across all branches in < 2.4s.',
    ],

    statValue: '< 2.4s',
    statLabel: 'Global Sync',
    imageUrl: '/images/ent_global_pos_bundle.png',
    imageAlt: 'Feature Screenshot',
    topBadge: 'Dual-Screen POS',
    bottomBadge: 'Auto-Sync Active',
    ctaText: 'Explore Feature Architecture',
    ctaHref: '/features/cloud-pos',

    heroHeadline: '',
    heroSubheadline: '',

    keyCapabilities: [
      { title: 'Peer-to-Peer LAN Mesh', desc: 'Registers communicate directly over local Wi-Fi when internet connection drops.', iconKey: 'Globe' },
    ],

    workflows: [
      { stepNumber: '01', title: 'Register Pairing', desc: 'Pair countertop tills and pinpads automatically via standard network discovery.' },
    ],

    faqs: [
      { id: 'f-1', question: 'Does this feature work offline?', answer: 'Yes, all register transactions queue locally during WAN cuts and auto-sync when online.' },
    ],

    relatedIntegrations: ['stripe'],
  };

  const handleSubmit = async (values: SavePlatformFeatureDto) => {
    try {
      const payload: SavePlatformFeatureDto = {
        ...values,
        slug: values.slug || values.title.toLowerCase().replace(/\s+/g, '-'),
      };

      await createFeature(payload).unwrap();
      toast.success(`Feature '${values.title}' created successfully!`);
      navigate('/content/features');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create feature.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in max-w-[1600px] mx-auto px-2">
      <ATMPageHeader
        title="Add New Feature"
        subtitle={`Create a new product feature capability for target platform variant '${initialVariant}'.`}
        onBack={() => navigate('/content/features')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Features', href: '/content/features' },
          { label: 'New Feature' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <FeatureForm
            formikProps={formikProps}
            isEdit={false}
            onCancel={() => navigate('/content/features')}
            isLoading={isLoading}
          />
        )}
      </Formik>
    </div>
  );
};
