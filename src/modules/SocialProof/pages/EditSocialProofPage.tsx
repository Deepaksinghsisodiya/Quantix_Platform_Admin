import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
import { EditSocialProofWrapper } from '../Edit/EditSocialProofWrapper';
import { useGetSocialProofMetricByIdQuery } from '../Service/SocialProofService';

export const EditSocialProofPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useGetSocialProofMetricByIdQuery(id || '', {
    skip: !id,
  });

  const metric = response?.data;

  if (isLoading) {
    return (
      <div className="w-full py-16 text-center space-y-3">
        <RefreshCw size={28} className="mx-auto animate-spin text-[#FF4F00]" />
        <p className="text-sm font-syne font-bold text-slate-600 dark:text-slate-400">Loading Metric Details...</p>
      </div>
    );
  }

  if (isError || !metric) {
    return (
      <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle size={32} className="mx-auto" />
        <p className="font-syne font-bold">Failed to load metric details</p>
        <div className="flex items-center justify-center gap-3">
          <ATMButton variant="secondary" onClick={() => navigate('/content/social-proof')}>
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
        title={`Edit Metric: ${metric.value} - ${metric.label}`}
        subtitle={`Update counter numbers, label description, icon, and visual accent for the ${metric.siteVariant} website.`}
        onBack={() => navigate('/content/social-proof')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Social Proof', href: '/content/social-proof' },
          { label: `${metric.value} ${metric.label}` },
        ]}
      />

      <div className="bg-transparent">
        <EditSocialProofWrapper
          metric={metric}
          onSuccess={() => navigate('/content/social-proof')}
          onCancel={() => navigate('/content/social-proof')}
        />
      </div>
    </div>
  );
};

export default EditSocialProofPage;
