import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddSocialProofWrapper } from '../Add/AddSocialProofWrapper';

export const AddSocialProofPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = searchParams.get('siteVariant') || 'Enterprise';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title="Add New Social Proof Metric"
        subtitle={`Configure a new stat metric counter for the ${siteVariant} website with numbers, labels, icons, and live preview.`}
        onBack={() => navigate('/content/social-proof')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Social Proof', href: '/content/social-proof' },
          { label: 'New Metric' },
        ]}
      />

      <div className="bg-transparent">
        <AddSocialProofWrapper
          siteVariant={siteVariant}
          defaultSortOrder={defaultSortOrder}
          onSuccess={() => navigate('/content/social-proof')}
          onCancel={() => navigate('/content/social-proof')}
        />
      </div>
    </div>
  );
};

export default AddSocialProofPage;
