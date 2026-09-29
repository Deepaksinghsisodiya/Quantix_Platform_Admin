import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMSkeleton } from '@/shared/ui';
import { BusinessProblemForm } from '../Form/BusinessProblemForm';
import {
  useGetBusinessProblemByIdQuery,
  useUpdateBusinessProblemMutation,
} from '../Service/BusinessProblemService';
import type { SaveBusinessProblemDto } from '../Model/BusinessProblemTypes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
  cardKey: Yup.string().required('Card Key is required').trim(),
});

export const EditBusinessProblemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: itemRes, isLoading: isFetching, isError, refetch } =
    useGetBusinessProblemByIdQuery(id!, { skip: !id });

  const [updateProblem, { isLoading: isUpdating }] = useUpdateBusinessProblemMutation();

  const problem = itemRes?.data;

  const initialValues: SaveBusinessProblemDto = useMemo(() => {
    if (!problem) {
      return {
        siteVariant: 'Enterprise',
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
        fixes: [],
        sortOrder: 1,
        isActive: true,
      };
    }

    return {
      siteVariant: problem.siteVariant || 'Enterprise',
      cardKey: problem.cardKey || '',
      shortTabLabel: problem.shortTabLabel || '',
      iconKey: problem.iconKey || 'TrendingDown',
      tag: problem.tag || '',
      severity: problem.severity || 'CRITICAL',
      title: problem.title || '',
      description: problem.description || '',
      impact: problem.impact || '',
      visualMeterIconKey: problem.visualMeter?.iconKey || 'ArrowRightLeft',
      legacyText: problem.visualMeter?.legacyText || '',
      quantixText: problem.visualMeter?.quantixText || '',
      fixes: problem.fixes || [],
      sortOrder: problem.sortOrder ?? 1,
      isActive: problem.isActive ?? true,
    };
  }, [problem]);

  const handleSubmit = async (values: SaveBusinessProblemDto) => {
    if (!id) return;
    try {
      await updateProblem({ id, ...values }).unwrap();
      toast.success(`Business problem '${values.title}' updated successfully!`);
      navigate('/content/business-problems');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update business problem.');
    }
  };

  if (isFetching) {
    return (
      <div className="w-full space-y-6 max-w-[1600px] mx-auto px-2 pb-12 animate-fade-in">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <ATMSkeleton width="220px" height="14px" className="rounded" />
            <ATMSkeleton width="320px" height="28px" className="rounded-lg" />
            <ATMSkeleton width="260px" height="14px" className="rounded" />
          </div>
          <div className="flex items-center gap-2">
            <ATMSkeleton width="80px" height="38px" className="rounded-xl" />
            <ATMSkeleton width="120px" height="38px" className="rounded-xl" />
          </div>
        </div>

        {/* Form and Preview Layout Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Form Sections (7 Cols) */}
          <div className="xl:col-span-7 space-y-6">
            {/* Section 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                <ATMSkeleton width="24px" height="24px" className="rounded-full" />
                <ATMSkeleton width="200px" height="16px" className="rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ATMSkeleton height="38px" className="rounded-lg" />
                <ATMSkeleton height="38px" className="rounded-lg" />
                <ATMSkeleton height="38px" className="rounded-lg" />
              </div>
            </div>

            {/* Section 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                <ATMSkeleton width="24px" height="24px" className="rounded-full" />
                <ATMSkeleton width="180px" height="16px" className="rounded" />
              </div>
              <div className="space-y-3">
                <ATMSkeleton height="38px" className="rounded-lg" />
                <ATMSkeleton height="76px" className="rounded-lg" />
                <ATMSkeleton height="60px" className="rounded-lg" />
              </div>
            </div>

            {/* Section 3 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                <ATMSkeleton width="24px" height="24px" className="rounded-full" />
                <ATMSkeleton width="220px" height="16px" className="rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ATMSkeleton height="38px" className="rounded-lg" />
                <ATMSkeleton height="38px" className="rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <ATMSkeleton height="38px" className="rounded-lg" />
                <ATMSkeleton height="38px" className="rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right Live Preview Card (5 Cols) */}
          <div className="xl:col-span-5 sticky top-24">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <ATMSkeleton width="140px" height="16px" className="rounded" />
                <ATMSkeleton width="60px" height="20px" className="rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                <ATMSkeleton width="44px" height="44px" className="rounded-2xl" />
                <ATMSkeleton width="80px" height="20px" className="rounded" />
              </div>
              <div className="space-y-2">
                <ATMSkeleton width="85%" height="20px" className="rounded" />
                <ATMSkeleton width="100%" height="14px" className="rounded" />
                <ATMSkeleton width="70%" height="14px" className="rounded" />
              </div>
              <ATMSkeleton height="60px" className="rounded-xl" />
              <ATMSkeleton height="36px" className="rounded-xl" />
              <ATMSkeleton height="80px" className="rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="w-full max-w-[800px] mx-auto p-12 text-center rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/20 my-12">
        <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Business Problem Not Found
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The requested business problem card could not be loaded or has been deleted.
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold"
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/content/business-problems')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4F00] text-white text-xs font-semibold"
          >
            <span>Back to List</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in max-w-[1600px] mx-auto px-2 pb-12">
      <ATMPageHeader
        title={`Edit: ${problem.title}`}
        subtitle={`Updating diagnostic card for ${problem.siteVariant} platform.`}
        icon={AlertTriangle}
        iconColor="theme"
        onBack={() => navigate('/content/business-problems')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Business Problems', href: '/content/business-problems' },
          { label: 'Edit' },
        ]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        <Form id="business-problem-form">
          <BusinessProblemForm
            isLoading={isUpdating}
            onCancel={() => navigate('/content/business-problems')}
            isEdit={true}
          />
        </Form>
      </Formik>
    </div>
  );
};
