import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
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
      <div className="p-12 text-center text-slate-400 animate-pulse">
        Loading FAQ question and answer details...
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

  const getSiteVariantFromMerchantType = (merchantType: string | null) => {
    if (merchantType === 'Enterprise') return 'Enterprise';
    if (merchantType === 'Standalone' || merchantType === 'Restaurant' || merchantType === 'Retail') {
      return merchantType;
    }
    return 'All';
  };

  const initialValues: FAQFormValues = {
    siteVariant: getSiteVariantFromMerchantType(item.merchantType),
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
        id: item.faqId,
        question: values.question.trim(),
        answer: values.answer.trim(),
        category: values.category.trim(),
        merchantType,
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
