import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { FAQForm, FAQFormValues } from '../Form/FAQForm';
import { useCreateFaqMutation } from '../Service/FAQService';

const validationSchema = Yup.object().shape({
  question: Yup.string().required('Question title is required').trim(),
  answer: Yup.string().required('Detailed answer is required').trim(),
  category: Yup.string().required('Category name is required').trim(),
});

export const AddFAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVariant = searchParams.get('variant') || 'Enterprise';

  const [createFaq] = useCreateFaqMutation();

  const initialValues: FAQFormValues = {
    siteVariant: initialVariant === 'all' ? 'All' : initialVariant,
    category: 'Platform',
    question: '',
    answer: '',
    sortOrder: 1,
    isActive: true,
  };

  const handleSubmit = async (values: FAQFormValues) => {
    try {
      const merchantType =
        values.siteVariant === 'Enterprise'
          ? 'Enterprise'
          : values.siteVariant === 'All'
            ? null
            : 'Standalone';

      await createFaq({
        question: values.question.trim(),
        answer: values.answer.trim(),
        category: values.category.trim(),
        merchantType,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      }).unwrap();

      toast.success('FAQ question and answer created successfully.');
      navigate('/content/faq');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create FAQ.');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      <ATMPageHeader
        title="Add Storefront FAQ"
        subtitle="Create a new frequently asked question and answer for your customers and storefront visitors."
        onBack={() => navigate('/content/faq')}
        breadcrumbs={[
          { label: 'Content', href: '/content' },
          { label: 'FAQ', href: '/content/faq' },
          { label: 'Add FAQ' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <FAQForm
            formikProps={formikProps}
            onCancel={() => navigate('/content/faq')}
          />
        )}
      </Formik>
    </div>
  );
};
