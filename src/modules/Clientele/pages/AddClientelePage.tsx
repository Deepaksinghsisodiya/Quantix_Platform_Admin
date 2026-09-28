import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddClienteleWrapper } from '../Add/AddClienteleWrapper';

export const AddClientelePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = searchParams.get('siteVariant') || 'Enterprise';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title="Add Brand Partner"
        subtitle={`Add a new client partner brand to the client logo showcase for the ${siteVariant} website.`}
        onBack={() => navigate('/content/clientele')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Clientele', href: '/content/clientele' },
          { label: 'New Brand Partner' },
        ]}
      />

      <div className="bg-transparent">
        <AddClienteleWrapper
          siteVariant={siteVariant}
          defaultSortOrder={defaultSortOrder}
          onSuccess={() => navigate('/content/clientele')}
          onCancel={() => navigate('/content/clientele')}
        />
      </div>
    </div>
  );
};

export default AddClientelePage;
