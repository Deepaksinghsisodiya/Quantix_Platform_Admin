import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMSkeleton } from '@/shared/ui';
import { FAQForm, FAQFormValues } from '../Form/FAQForm';
import {
  useGetFaqByIdQuery,
  useUpdateFaqMutation,
} from '../Service/FAQService';

const validationSchema = Yup.object().shape({
  question: Yup.string().required('Question title is required').trim(),
  answer: Yup.string().required('Detailed answer is required').trim(),
  category: Yup.string().required('Category name is required').trim(),
});

export const EditFAQPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading, isError } = useGetFaqByIdQuery(id!, {
    skip: !id,
  });

  const [updateFaq] = useUpdateFaqMutation();

  if (isLoading) {
    return (
      <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <ATMSkeleton variant="text" width="280px" height="2rem" />
            <ATMSkeleton variant="text" width="460px" height="1rem" />
          </div>
          <div className="flex items-center gap-3">
            <ATMSkeleton variant="rect" rounded width="90px" height="2.5rem" />
            <ATMSkeleton variant="rect" rounded width="130px" height="2.5rem" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
            <ATMSkeleton variant="text" width="220px" height="1.25rem" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <ATMSkeleton key={i} variant="rect" rounded height="96px" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-5">
              <ATMSkeleton variant="text" width="200px" height="1.25rem" />
              <div className="space-y-3">
                <ATMSkeleton variant="text" width="120px" height="0.9rem" />
                <ATMSkeleton variant="rect" rounded height="44px" />
              </div>
              <div className="space-y-3">
                <ATMSkeleton variant="text" width="140px" height="0.9rem" />
                <ATMSkeleton variant="rect" rounded height="130px" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-5">
              <ATMSkeleton variant="text" width="180px" height="1.25rem" />
              <div className="space-y-3">
                <ATMSkeleton variant="text" width="100px" height="0.9rem" />
                <ATMSkeleton variant="rect" rounded height="44px" />
              </div>
              <div className="space-y-3">
                <ATMSkeleton variant="text" width="100px" height="0.9rem" />
                <ATMSkeleton variant="rect" rounded height="44px" />
              </div>
              <ATMSkeleton variant="rect" rounded height="48px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-12 text-center text-red-500">
        FAQ item not found.
      </div>
    );
  }

  const getSiteVariant = (item: any) => {
    if (item.siteVariant) return item.siteVariant;
    if (item.merchantType === 'Enterprise') return 'Enterprise';
    if (item.merchantType === 'Restaurant' || item.merchantType === 'Retail' || item.merchantType === 'Standalone') {
      return item.merchantType;
    }
    return 'All';
  };

  const initialValues: FAQFormValues = {
    siteVariant: getSiteVariant(item),
    category: item.category || 'Platform',
    question: item.question || '',
    answer: item.answer || '',
    sortOrder: item.sortOrder || 1,
    isActive: item.isActive,
  };

  const handleSubmit = async (values: FAQFormValues) => {
    try {
      const merchantType =
        values.siteVariant === 'Enterprise'
          ? 'Enterprise'
          : values.siteVariant === 'All'
            ? null
            : 'Standalone';

      await updateFaq({
        id: item.faqId || (item as any).id,
        question: values.question.trim(),
        answer: values.answer.trim(),
        category: values.category.trim(),
        merchantType,
        siteVariant: values.siteVariant === 'All' ? 'Enterprise' : values.siteVariant,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      }).unwrap();

      toast.success('FAQ updated successfully.');
      navigate('/content/faq');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update FAQ.');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      <ATMPageHeader
        title="Edit Storefront FAQ"
        subtitle={`Update question, answer, category, or storefront audience for "${item.question}".`}
        onBack={() => navigate('/content/faq')}
        breadcrumbs={[
          { label: 'Content', href: '/content' },
          { label: 'FAQ', href: '/content/faq' },
          { label: 'Edit FAQ' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <FAQForm
            formikProps={formikProps}
            isEdit
            onCancel={() => navigate('/content/faq')}
          />
        )}
      </Formik>
    </div>
  );
};
