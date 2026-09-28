import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddHeroSectionWrapper } from '../Add/AddHeroSectionWrapper';
import type { SiteVariantTab } from '../Model/HeroSectionTypes';

export const AddHeroBannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = (searchParams.get('siteVariant') as SiteVariantTab) || 'Enterprise';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title="Add New Hero Slide Banner"
        subtitle={`Configure a new hero slide showcase banner for the ${siteVariant} website with headlines, CTAs, and media.`}
        onBack={() => navigate('/content/hero-banners')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Hero Banners', href: '/content/hero-banners' },
          { label: 'New Slide' },
        ]}
      />

      <div className="bg-transparent">
        <AddHeroSectionWrapper
          siteVariant={siteVariant}
          defaultSortOrder={defaultSortOrder}
          onSuccess={() => navigate('/content/hero-banners')}
          onCancel={() => navigate('/content/hero-banners')}
        />
      </div>
    </div>
  );
};

export default AddHeroBannerPage;
