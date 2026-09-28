import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { FeatureForm } from '../Form/FeatureForm';
import {
  useGetFeatureByIdQuery,
  useUpdateFeatureMutation,
} from '../Service/FeatureService';
import type { SavePlatformFeatureDto } from '../Model/FeatureTypes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
  slug: Yup.string().required('Slug is required').trim(),
});

export const EditFeaturePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: featureRes, isLoading: isFetching, isError, refetch } = useGetFeatureByIdQuery(id || '', {
    skip: !id,
  });

  const [updateFeature, { isLoading: isUpdating }] = useUpdateFeatureMutation();

  const featureItem = useMemo(() => featureRes?.data, [featureRes?.data]);

  const initialValues: SavePlatformFeatureDto = useMemo(() => {
    if (!featureItem) {
      return {
        siteVariant: 'Enterprise',
        slug: '',
        title: '',
        subtitle: '',
        category: 'Storefront',
        iconKey: 'Store',
        iconColor: 'text-[#FF4F00]',
        showInNavbar: true,
        showOnHomepage: true,
        isFeatured: false,
        navbarBadge: '',
        sortOrder: 1,
        isActive: true,
        numberLabel: '01',
        shortDescription: '',
        fullDescription: '',
        bullets: [],
        statValue: '',
        statLabel: '',
        imageUrl: '',
        imageAlt: '',
        topBadge: '',
        bottomBadge: '',
        ctaText: '',
        ctaHref: '',
        heroHeadline: '',
        heroSubheadline: '',
        keyCapabilities: [],
        workflows: [],
        faqs: [],
        relatedIntegrations: [],
      };
    }

    let bulletsList: string[] = featureItem.bullets || [];
    if ((!bulletsList || bulletsList.length === 0) && featureItem.bulletsJson) {
      try { bulletsList = JSON.parse(featureItem.bulletsJson); } catch {}
    }

    let capsList = featureItem.keyCapabilities || [];
    if ((!capsList || capsList.length === 0) && featureItem.keyCapabilitiesJson) {
      try { capsList = JSON.parse(featureItem.keyCapabilitiesJson); } catch {}
    }

    let wfList = featureItem.workflows || [];
    if ((!wfList || wfList.length === 0) && featureItem.workflowsJson) {
      try { wfList = JSON.parse(featureItem.workflowsJson); } catch {}
    }

    let faqList = featureItem.faqs || [];
    if ((!faqList || faqList.length === 0) && featureItem.faqsJson) {
      try { faqList = JSON.parse(featureItem.faqsJson); } catch {}
    }

    return {
      siteVariant: featureItem.siteVariant || 'Enterprise',
      slug: featureItem.slug || '',
      title: featureItem.title || '',
      subtitle: featureItem.subtitle || '',
      category: featureItem.category || 'Storefront',
      iconKey: featureItem.iconKey || 'Store',
      iconColor: featureItem.iconColor || 'text-[#FF4F00]',

      showInNavbar: featureItem.showInNavbar ?? true,
      showOnHomepage: featureItem.showOnHomepage ?? true,
      isFeatured: featureItem.isFeatured ?? false,
      navbarBadge: featureItem.navbarBadge || '',
      sortOrder: featureItem.sortOrder ?? 1,
      isActive: featureItem.isActive ?? true,

      numberLabel: featureItem.numberLabel || '01',
      shortDescription: featureItem.shortDescription || '',
      fullDescription: featureItem.fullDescription || '',

      bullets: bulletsList,
      statValue: featureItem.statValue || '',
      statLabel: featureItem.statLabel || '',
      imageUrl: featureItem.imageUrl || '',
      imageAlt: featureItem.imageAlt || '',
      topBadge: featureItem.topBadge || '',
      bottomBadge: featureItem.bottomBadge || '',
      ctaText: featureItem.ctaText || '',
      ctaHref: featureItem.ctaHref || '',

      heroHeadline: featureItem.heroHeadline || '',
      heroSubheadline: featureItem.heroSubheadline || '',

      keyCapabilities: capsList,
      workflows: wfList,
      faqs: faqList,
      relatedIntegrations: featureItem.relatedIntegrations || [],
    };
  }, [featureItem]);

  const handleSubmit = async (values: SavePlatformFeatureDto) => {
    if (!id) return;
    try {
      await updateFeature({ id, ...values }).unwrap();
      toast.success(`Feature '${values.title}' updated successfully!`);
      navigate('/content/features');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update feature.');
    }
  };

  if (isFetching) {
    return (
      <div className="w-full space-y-6 max-w-[1600px] mx-auto px-1 sm:px-2 py-4 animate-fade-in">
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

  if (isError || !featureItem) {
    return (
      <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle size={32} className="mx-auto" />
        <p className="font-syne font-bold">Failed to load feature details</p>
        <div className="flex items-center justify-center gap-3">
          <ATMButton variant="secondary" onClick={() => navigate('/content/features')}>
            Back to List
          </ATMButton>
          <ATMButton variant="primary" onClick={() => refetch()} icon={RefreshCw}>
            Retry
          </ATMButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in max-w-[1600px] mx-auto px-2">
      <ATMPageHeader
        title={`Edit Feature: ${featureItem.title}`}
        subtitle={`Update settings and content for feature '${featureItem.slug}' (${featureItem.siteVariant}).`}
        onBack={() => navigate('/content/features')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Features', href: '/content/features' },
          { label: featureItem.title },
        ]}
      />

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <FeatureForm
            formikProps={formikProps}
            isEdit={true}
            onCancel={() => navigate('/content/features')}
            isLoading={isUpdating}
          />
        )}
      </Formik>
    </div>
  );
};
