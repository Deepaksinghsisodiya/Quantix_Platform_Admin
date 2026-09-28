import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
import { EditClienteleWrapper } from '../Edit/EditClienteleWrapper';
import { useGetClientBrandByIdQuery } from '../Service/ClienteleService';

export const EditClientelePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useGetClientBrandByIdQuery(id || '', {
    skip: !id,
  });

  const brand = response?.data;

  if (isLoading) {
    return (
      <div className="w-full py-16 text-center space-y-3">
        <RefreshCw size={28} className="mx-auto animate-spin text-[#FF4F00]" />
        <p className="text-sm font-syne font-bold text-slate-600 dark:text-slate-400">Loading Brand Partner Details...</p>
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle size={32} className="mx-auto" />
        <p className="font-syne font-bold">Failed to load brand partner details</p>
        <div className="flex items-center justify-center gap-3">
          <ATMButton variant="secondary" onClick={() => navigate('/content/clientele')}>
            Back to List
          </ATMButton>
          <ATMButton variant="primary" onClick={() => refetch()} icon={RefreshCw}>
            Retry
          </ATMButton>
        </div>
      </div>
    );
  }

  const brandName = brand.name || brand.title || 'Brand Partner';

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title={`Edit Brand: ${brandName}`}
        subtitle={`Update brand name, category, logo image, and visibility on the ${brand.siteVariant} marquee.`}
        onBack={() => navigate('/content/clientele')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Clientele', href: '/content/clientele' },
          { label: brandName },
        ]}
      />

      <div className="bg-transparent">
        <EditClienteleWrapper
          brand={brand}
          onSuccess={() => navigate('/content/clientele')}
          onCancel={() => navigate('/content/clientele')}
        />
      </div>
    </div>
  );
};

export default EditClientelePage;
