import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { BusinessProblemForm } from '../Form/BusinessProblemForm';
import { useCreateBusinessProblemMutation } from '../Service/BusinessProblemService';
import type { SaveBusinessProblemDto } from '../Model/BusinessProblemTypes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
  cardKey: Yup.string().required('Card Key is required').trim(),
});

export const AddBusinessProblemPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVariant = searchParams.get('siteVariant') || 'Enterprise';

  const [createProblem, { isLoading }] = useCreateBusinessProblemMutation();

  const initialValues: SaveBusinessProblemDto = {
    siteVariant: initialVariant,
    cardKey: '',
    shortTabLabel: '',
    iconKey: 'TrendingDown',
    tag: '',
    severity: 'CRITICAL',
    title: '',
    description: '',
    impact: '',
    visualMeterIconKey: 'ArrowRightLeft',
    legacyText: '',
    quantixText: '',
    fixes: [
      'Multi-Store Auto-Dispatch & Stock Rebalancing Engine',
      '1-Tap Inter-Branch Warehouse Transfer & GRN Audit',
    ],
    sortOrder: 1,
    isActive: true,
  };

  const handleSubmit = async (values: SaveBusinessProblemDto) => {
    try {
      const payload: SaveBusinessProblemDto = {
        ...values,
        cardKey: values.cardKey || values.title.toLowerCase().replace(/\s+/g, '-'),
        shortTabLabel: values.shortTabLabel || values.title.slice(0, 12),
      };

      await createProblem(payload).unwrap();
      toast.success(`Business problem '${values.title}' created successfully!`);
      navigate('/content/business-problems');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create business problem.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in max-w-[1600px] mx-auto px-2 pb-12">
      <ATMPageHeader
        title="Add New Business Problem"
        subtitle={`Create a diagnostic friction card and resolution for target platform variant '${initialVariant}'.`}
        icon={AlertTriangle}
        iconColor="theme"
        onBack={() => navigate('/content/business-problems')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Business Problems', href: '/content/business-problems' },
          { label: 'Add New' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form id="business-problem-form">
          <BusinessProblemForm
            isLoading={isLoading}
            onCancel={() => navigate('/content/business-problems')}
            isEdit={false}
          />
        </Form>
      </Formik>
    </div>
  );
};
