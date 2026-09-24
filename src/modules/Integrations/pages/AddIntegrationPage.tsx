import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddIntegrationWrapper } from '../Add/AddIntegrationWrapper';
import type { SiteVariantTab } from '../Model/IntegrationTypes';

export const AddIntegrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = (searchParams.get('siteVariant') as SiteVariantTab) || 'Enterprise';

  return (
    <div className="w-full space-y-6 pb-12">
      <ATMPageHeader
        title="Add New Integration"
        subtitle={`Configure a new connector, terminal, or gateway for the ${siteVariant} website catalog.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Integrations', href: '/content/integrations' },
          { label: 'New Integration' },
        ]}
      />

      <div className="bg-transparent">
        <AddIntegrationWrapper
          siteVariant={siteVariant}
          onSuccess={() => navigate('/content/integrations')}
          onCancel={() => navigate('/content/integrations')}
        />
      </div>
    </div>
  );
};

export default AddIntegrationPage;
