import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
import { EditHeroSectionWrapper } from '../Edit/EditHeroSectionWrapper';
import { useGetHeroSlideByIdQuery } from '../Service/HeroSectionService';

export const EditHeroBannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useGetHeroSlideByIdQuery(id || '', {
    skip: !id,
  });

  const slide = response?.data;

  if (isLoading) {
    return (
      <div className="w-full py-16 text-center space-y-3">
        <RefreshCw size={28} className="mx-auto animate-spin text-[#FF4F00]" />
        <p className="text-sm font-syne font-bold text-slate-600 dark:text-slate-400">Loading Hero Slide Details...</p>
      </div>
    );
  }

  if (isError || !slide) {
    return (
      <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle size={32} className="mx-auto" />
        <p className="font-syne font-bold">Failed to load hero slide details</p>
        <div className="flex items-center justify-center gap-3">
          <ATMButton variant="secondary" onClick={() => navigate('/content/hero-banners')}>
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
        title={`Edit Hero Slide: ${slide.heading}`}
        subtitle={`Update messaging, CTA conversions, and showcase visuals for the ${slide.siteVariant} website.`}
        onBack={() => navigate('/content/hero-banners')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Hero Banners', href: '/content/hero-banners' },
          { label: slide.heading },
        ]}
      />

      <div className="bg-transparent">
        <EditHeroSectionWrapper
          slide={slide}
          onSuccess={() => navigate('/content/hero-banners')}
          onCancel={() => navigate('/content/hero-banners')}
        />
      </div>
    </div>
  );
};

export default EditHeroBannerPage;
