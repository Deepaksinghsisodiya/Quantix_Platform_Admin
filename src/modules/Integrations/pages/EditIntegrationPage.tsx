import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { IntegrationFormSkeleton } from '../components/IntegrationFormSkeleton';
import { EditIntegrationWrapper } from '../Edit/EditIntegrationWrapper';
import { useGetIntegrationByIdQuery } from '../Service/IntegrationService';

export const EditIntegrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useGetIntegrationByIdQuery(id || '', {
    skip: !id,
  });

  const integration = response?.data;

  if (isLoading) {
    return <IntegrationFormSkeleton isEdit={true} />;
  }

  if (isError || !integration) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Integration Not Found</h2>
        <p className="text-sm text-slate-500">The requested integration could not be loaded or has been deleted.</p>
        <button
          type="button"
          onClick={() => navigate('/content/integrations')}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
        >
          Back to Integrations List
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <ATMPageHeader
        title={`Edit Integration: ${integration.name}`}
        subtitle={`Update copy, specs, and publication settings for ${integration.name} (${integration.siteVariant}).`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Integrations', href: '/content/integrations' },
          { label: integration.name },
        ]}
      />

      <div className="bg-transparent">
        <EditIntegrationWrapper
          integration={integration}
          onSuccess={() => navigate('/content/integrations')}
          onCancel={() => navigate('/content/integrations')}
        />
      </div>
    </div>
  );
};

export default EditIntegrationPage;
