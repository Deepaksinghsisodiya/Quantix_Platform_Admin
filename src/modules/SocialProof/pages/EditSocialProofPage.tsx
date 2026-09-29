import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { EditSocialProofWrapper } from '../Edit/EditSocialProofWrapper';
import { useGetSocialProofMetricByIdQuery } from '../Service/SocialProofService';

export const EditSocialProofPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: response,
    error: detailError,
    isLoading,
    isError,
    refetch,
  } = useGetSocialProofMetricByIdQuery(id || '', {
    skip: !id,
  });

  const metric = response?.data;

  const hasToastedLoadError = useRef(false);
  useEffect(() => {
    if (isError && !hasToastedLoadError.current) {
      hasToastedLoadError.current = true;
      toast.error(apiErrorMessage(detailError, 'Failed to load metric details.'));
    }
    if (!isError) {
      hasToastedLoadError.current = false;
    }
  }, [isError, detailError]);


  if (isLoading) {
    return (
      <div className="w-full space-y-6 max-w-[1600px] mx-auto px-1 sm:px-2 py-4 animate-fade-in">
        <div className="space-y-2">
          <ATMSkeleton variant="text" width="35%" height="2.2rem" />
          <ATMSkeleton variant="text" width="55%" height="1.1rem" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div className="lg:col-span-2 space-y-4">
            <ATMSkeleton variant="card" height="26rem" />
          </div>
          <div>
            <ATMSkeleton variant="card" height="18rem" />
          </div>
        </div>
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
