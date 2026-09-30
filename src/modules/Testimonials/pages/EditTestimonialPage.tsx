import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { EditTestimonialWrapper } from '../Edit/EditTestimonialWrapper';
import { useGetTestimonialByIdQuery } from '../Service/TestimonialService';

export const EditTestimonialPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useGetTestimonialByIdQuery(id || '', {
    skip: !id,
  });

  const testimonial = response?.data;

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <ATMSkeleton variant="text" width="300px" height="2rem" />
            <ATMSkeleton variant="text" width="480px" height="1rem" />
          </div>
          <div className="flex items-center gap-3">
            <ATMSkeleton variant="rect" rounded width="90px" height="2.5rem" />
            <ATMSkeleton variant="rect" rounded width="130px" height="2.5rem" />
          </div>
        </div>

        {/* Form Body Skeleton matching TestimonialForm layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
              <ATMSkeleton variant="text" width="220px" height="1.25rem" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ATMSkeleton variant="rect" rounded height="44px" />
                <ATMSkeleton variant="rect" rounded height="44px" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ATMSkeleton variant="rect" rounded height="44px" />
                <ATMSkeleton variant="rect" rounded height="44px" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
              <ATMSkeleton variant="text" width="200px" height="1.25rem" />
              <ATMSkeleton variant="rect" rounded height="44px" />
              <ATMSkeleton variant="rect" rounded height="110px" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
              <ATMSkeleton variant="text" width="160px" height="1.25rem" />
              <ATMSkeleton variant="rect" rounded height="220px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !testimonial) {
    return (
      <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle size={32} className="mx-auto" />
        <p className="font-syne font-bold">Failed to load testimonial review details</p>
        <div className="flex items-center justify-center gap-3">
          <ATMButton variant="secondary" onClick={() => navigate('/content/testimonials')}>
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
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title={`Edit Testimonial: ${testimonial.personName}`}
        subtitle={`Update quote, reviewer details, star rating, and outcome metrics.`}
        onBack={() => navigate('/content/testimonials')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Testimonials', href: '/content/testimonials' },
          { label: testimonial.personName },
        ]}
      />

      <div className="bg-transparent">
        <EditTestimonialWrapper
          testimonial={testimonial}
          onSuccess={() => navigate('/content/testimonials')}
          onCancel={() => navigate('/content/testimonials')}
        />
      </div>
    </div>
  );
};

export default EditTestimonialPage;
