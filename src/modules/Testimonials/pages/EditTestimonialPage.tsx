import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
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
      <div className="w-full py-16 text-center space-y-3">
        <RefreshCw size={28} className="mx-auto animate-spin text-[#FF4F00]" />
        <p className="text-sm font-syne font-bold text-slate-600 dark:text-slate-400">Loading Testimonial Details...</p>
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
