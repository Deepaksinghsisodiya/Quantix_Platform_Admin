import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddTestimonialWrapper } from '../Add/AddTestimonialWrapper';

export const AddTestimonialPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = searchParams.get('siteVariant') || 'Enterprise';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title="Add Client Testimonial"
        subtitle={`Configure client review story, metrics, star rating, and testimonials for the ${siteVariant} website.`}
        onBack={() => navigate('/content/testimonials')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Testimonials', href: '/content/testimonials' },
          { label: 'New Testimonial' },
        ]}
      />

      <div className="bg-transparent">
        <AddTestimonialWrapper
          siteVariant={siteVariant}
          defaultSortOrder={defaultSortOrder}
          onSuccess={() => navigate('/content/testimonials')}
          onCancel={() => navigate('/content/testimonials')}
        />
      </div>
    </div>
  );
};

export default AddTestimonialPage;
