import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { EditHowItWorksWrapper } from '../Edit/EditHowItWorksWrapper';
import { useGetHowItWorksStepByIdQuery } from '../Service/HowItWorksService';

const EditSkeleton: React.FC = () => (
  <div className="w-full space-y-6 pb-12 animate-pulse">
    {/* Page Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>

    {/* 12-Column Grid matching HowItWorksForm */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Columns: Form Input Cards */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Identity & Target Website */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Card 2: Copy & Feature Capabilities */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="h-5 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Card 3: Media Asset */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Card 4: Metrics & Telemetry Chips */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="h-5 w-60 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Step Showcase & Publishing Controls */}
      <div className="lg:col-span-5 space-y-6">
        {/* Showcase Simulation Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>

        {/* Publishing & Status Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
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
