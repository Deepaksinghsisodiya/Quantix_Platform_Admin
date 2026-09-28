import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { RefreshCw, AlertCircle } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
import { SolutionForm } from '../Form/SolutionForm';
import { useGetSolutionByIdQuery, useUpdateSolutionMutation } from '../Service/SolutionService';
import type { SolutionFormValues, SaveSolutionItemDto } from '../Model/SolutionTypes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
});

export const EditSolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: res, isLoading, isError, refetch } = useGetSolutionByIdQuery(id || '', {
    skip: !id,
  });
  const [updateSolution, { isLoading: isUpdating }] = useUpdateSolutionMutation();

  const item = res?.data;

  const initialValues: SolutionFormValues = useMemo(() => {
    if (!item) {
      return {
        siteVariant: 'Enterprise',
        itemType: 'SectorItem',
        title: '',
        description: '',
        badge: '',
        badgeColor: '',
        imageUrl: '',
        imageAlt: '',
        slug: '',
        href: '',
        isSubdomain: false,
        ctaText: '',
        externalUrl: '',
        categoryTitle: '',
        iconKey: 'Utensils',
        iconColor: 'text-amber-500',
        eyebrow: '',
        heroTitle: '',
        heroDescription: '',
        topBadge: '',
        bottomBadge: '',
        ctaLabel: '',
        detailImageUrl: '',
        detailImageAlt: '',
        points: [],
        workflows: [],
        faqs: [],
        sortOrder: 1,
        isActive: true,
      };
    }

    return {
      siteVariant: item.siteVariant || 'Enterprise',
      itemType: item.itemType || (item.isSubdomain ? 'PromoCard' : 'SectorItem'),
      title: item.title || '',
      description: item.description || '',
      badge: item.badge || '',
      badgeColor: item.badgeColor || '',
      imageUrl: item.imageUrl || '',
      imageAlt: item.imageAlt || '',
      slug: item.slug || '',
      href: item.href || '',
      isSubdomain: !!item.isSubdomain,
      ctaText: item.ctaText || '',
      externalUrl: item.externalUrl || item.href || '',
      categoryTitle: item.categoryTitle || 'RESTAURANT & FOODSERVICE SOFTWARE',
      iconKey: item.iconKey || 'Utensils',
      iconColor: item.iconColor || 'text-amber-500',
      eyebrow: item.eyebrow || '',
      heroTitle: item.heroTitle || '',
      heroDescription: item.heroDescription || '',
      topBadge: item.topBadge || '',
      bottomBadge: item.bottomBadge || '',
      ctaLabel: item.ctaLabel || 'Book Walkthrough',
      detailImageUrl: item.detailImageUrl || item.imageUrl || '',
      detailImageAlt: item.detailImageAlt || '',
      points: item.points || [],
      workflows: item.workflows || [],
      faqs: item.faqs || [],
      sortOrder: item.sortOrder ?? 1,
      isActive: item.isActive ?? true,
    };
  }, [item]);

  const handleSubmit = async (values: SolutionFormValues) => {
    if (!id) return;
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

      await updateSolution({ id, ...payload }).unwrap();
      toast.success('Solution updated successfully.');
      navigate('/content/solutions');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update solution.');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 max-w-[1600px] mx-auto px-1 sm:px-2 animate-fade-in">
      <ATMPageHeader
        title={`Edit: ${item?.title || 'Solution Item'}`}
        subtitle="Update MegaMenu dropdown configuration and landing page contents."
        onBack={() => navigate('/content/solutions')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Solutions', href: '/content/solutions' },
          { label: item?.title || 'Edit Item' },
        ]}
      />

      {isLoading && (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#13151a]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-500 mb-2" />
          <p className="text-sm text-slate-500">Loading solution details...</p>
        </div>
      )}

      {isError && (
        <div className="p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <div className="text-base font-bold text-rose-800 dark:text-rose-200">Failed to load solution item</div>
          <ATMButton variant="secondary" onClick={refetch} className="gap-2 mx-auto">
            <RefreshCw size={14} /> Retry
          </ATMButton>
        </div>
      )}

      {!isLoading && !isError && item && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps) => (
            <SolutionForm
              formikProps={formikProps}
              isEdit={true}
              onCancel={() => navigate('/content/solutions')}
              isLoading={isUpdating}
            />
          )}
        </Formik>
      )}
    </div>
  );
};

export default EditSolutionPage;
