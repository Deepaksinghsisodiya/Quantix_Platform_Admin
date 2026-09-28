import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { EditHowItWorksWrapper } from '../Edit/EditHowItWorksWrapper';
import { useGetHowItWorksStepByIdQuery } from '../Service/HowItWorksService';

const EditSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="lg:col-span-2">
        <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  </div>
);

export const EditHowItWorksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useGetHowItWorksStepByIdQuery(id || '', {
    skip: !id,
  });

  const step = response?.data;

  if (isLoading) return <EditSkeleton />;

  if (isError || !step) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="inline-flex p-4 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step Not Found</h2>
        <p className="text-sm text-slate-500">The requested workflow step could not be loaded.</p>
        <button
          type="button"
          onClick={() => navigate('/content/how-it-works')}
          className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
        >
          ← Back to How It Works
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <ATMPageHeader
        title={`Edit Step: ${step.title}`}
        subtitle={`Update content, image, metric pill, and telemetry chips for Step ${step.stepNumber} on the ${step.siteVariant} website.`}
        onBack={() => navigate('/content/how-it-works')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'How It Works', href: '/content/how-it-works' },
          { label: step.title },
        ]}
      />
      <EditHowItWorksWrapper
        step={step}
        onSuccess={() => navigate('/content/how-it-works')}
        onCancel={() => navigate('/content/how-it-works')}
      />
    </div>
  );
};

export default EditHowItWorksPage;
