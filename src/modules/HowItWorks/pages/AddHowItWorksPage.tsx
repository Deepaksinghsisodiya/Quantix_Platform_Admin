import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddHowItWorksWrapper } from '../Add/AddHowItWorksWrapper';
import type { SiteVariantTab } from '../Model/HowItWorksTypes';

export const AddHowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = (searchParams.get('siteVariant') as SiteVariantTab) || 'Enterprise';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  return (
    <div className="w-full space-y-6 pb-12">
      <ATMPageHeader
        title="Add New Workflow Step"
        subtitle={`Configure a new How It Works step for the ${siteVariant} website — step number, badge, image, metric pill, and telemetry chips.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'How It Works', href: '/content/how-it-works' },
          { label: 'New Step' },
        ]}
      />
      <AddHowItWorksWrapper
        siteVariant={siteVariant}
        defaultSortOrder={defaultSortOrder}
        onSuccess={() => navigate('/content/how-it-works')}
        onCancel={() => navigate('/content/how-it-works')}
      />
    </div>
  );
};

export default AddHowItWorksPage;
