import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { SolutionForm } from '../Form/SolutionForm';
import { useCreateSolutionMutation } from '../Service/SolutionService';
import type { SolutionFormValues, SaveSolutionItemDto } from '../Model/SolutionTypes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
});

export const AddSolutionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialItemType = (searchParams.get('itemType') as 'PromoCard' | 'SectorItem') || 'PromoCard';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  const [createSolution, { isLoading }] = useCreateSolutionMutation();

  const initialValues: SolutionFormValues = {
    siteVariant: 'Enterprise',
    itemType: initialItemType,
    title: '',
    description: '',
    badge: initialItemType === 'PromoCard' ? 'RESTAURANT SOFTWARE' : '',
    badgeColor: '',
    imageUrl: initialItemType === 'PromoCard' ? '/images/nav_restaurant_bundle.png' : '/images/ent_hospitality_bundle.png',
    imageAlt: '',
    slug: '',
    href: '',
    isSubdomain: initialItemType === 'PromoCard',

    // Promo Card
    ctaText: 'Visit Site',
    externalUrl: 'http://localhost:3002',

    // Sector Item
    categoryTitle: 'RESTAURANT & FOODSERVICE SOFTWARE',
    iconKey: 'Utensils',
    iconColor: 'text-amber-500',

    // Landing Page
    eyebrow: '',
    heroTitle: '',
    heroDescription: '',
    topBadge: '',
    bottomBadge: '',
    ctaLabel: 'Book Walkthrough',
    detailImageUrl: '',
    detailImageAlt: '',

    points: [
      { title: 'Interactive Workflows', desc: 'Real-time synchronization across terminals and stations.' },
      { title: 'Central Management', desc: 'Unified control over menus, pricing, and live performance.' },
      { title: 'Offline Resilience', desc: 'Continuous till caching with zero downtime operations.' },
    ],
    workflows: [
      { title: 'Station Floor Routing', desc: 'Automate queue balancing and service timings.' },
      { title: 'Integrated Payment Till', desc: 'Instant card and cash reconciliation.' },
    ],
    faqs: [
      { question: 'How quickly does it deploy?', answer: 'Deploy across your entire fleet in under 15 minutes.' },
    ],

    sortOrder: defaultSortOrder,
    isActive: true,
  };

  const handleSubmit = async (values: SolutionFormValues) => {
    try {
      const payload: SaveSolutionItemDto = {
        siteVariant: 'Enterprise',
        itemType: values.itemType,
        title: values.title.trim(),
        description: values.description.trim(),
        badge: values.badge?.trim() || undefined,
        badgeColor: values.badgeColor?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
        imageAlt: values.imageAlt?.trim() || undefined,
        slug: values.slug?.trim() || undefined,
        href: values.itemType === 'PromoCard' ? values.externalUrl?.trim() : `/solutions/${values.slug?.trim() || 'restaurants'}`,
        isSubdomain: values.itemType === 'PromoCard',
        ctaText: values.ctaText?.trim() || undefined,
        externalUrl: values.externalUrl?.trim() || undefined,
        categoryTitle: values.categoryTitle?.trim() || undefined,
        iconKey: values.iconKey?.trim() || undefined,
        iconColor: values.iconColor?.trim() || undefined,
        eyebrow: values.eyebrow?.trim() || undefined,
        heroTitle: values.heroTitle?.trim() || undefined,
        heroDescription: values.heroDescription?.trim() || undefined,
        topBadge: values.topBadge?.trim() || undefined,
        bottomBadge: values.bottomBadge?.trim() || undefined,
        ctaLabel: values.ctaLabel?.trim() || undefined,
        detailImageUrl: values.detailImageUrl?.trim() || values.imageUrl?.trim() || undefined,
        detailImageAlt: values.detailImageAlt?.trim() || undefined,
        points: values.points,
        workflows: values.workflows,
        faqs: values.faqs,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };

      await createSolution(payload).unwrap();
      toast.success('Solution created successfully.');
      navigate('/content/solutions');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create solution.');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 max-w-[1600px] mx-auto px-1 sm:px-2 animate-fade-in">
      <ATMPageHeader
        title="Add New Solution"
        subtitle="Configure a new MegaMenu dropdown card or sector landing page for the Enterprise website."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Solutions', href: '/content/solutions' },
          { label: 'New Solution' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <SolutionForm
            formikProps={formikProps}
            isEdit={false}
            onCancel={() => navigate('/content/solutions')}
            isLoading={isLoading}
          />
        )}
      </Formik>
    </div>
  );
};

export default AddSolutionPage;
