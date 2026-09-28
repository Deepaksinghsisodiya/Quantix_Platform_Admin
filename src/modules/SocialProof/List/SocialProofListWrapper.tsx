import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { SocialProofList } from './SocialProofList';
import {
  useGetAdminSocialProofMetricsQuery,
  useUpdateSocialProofMetricMutation,
  useDeleteSocialProofMetricMutation,
  useReorderSocialProofMetricsMutation,
} from '../Service/SocialProofService';
import type { SocialProofMetric, SiteVariantTab } from '../Model/SocialProofTypes';

export const SocialProofListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [deletingMetric, setDeletingMetric] = useState<SocialProofMetric | null>(null);

  // Queries & Mutations
  const { data: metricsRes, isLoading, isFetching, isError, refetch } = useGetAdminSocialProofMetricsQuery(undefined);
  const [updateMetric] = useUpdateSocialProofMetricMutation();
  const [deleteMetric, deleteState] = useDeleteSocialProofMetricMutation();
  const [reorderMetrics, reorderState] = useReorderSocialProofMetricsMutation();

  const allMetrics = useMemo(() => metricsRes?.data || [], [metricsRes?.data]);

  // Tab counts calculated dynamically across all websites
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allMetrics.filter((m) => m.siteVariant === 'Enterprise').length,
      Restaurant: allMetrics.filter((m) => m.siteVariant === 'Restaurant').length,
      Retail: allMetrics.filter((m) => m.siteVariant === 'Retail').length,
    }),
    [allMetrics]
  );

  // Metrics filtered by selected tab and sorted by sortOrder
  const metrics = useMemo(
    () =>
      allMetrics
        .filter((m) => m.siteVariant === activeTab)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allMetrics, activeTab]
  );

  // Handlers
  const handleTogglePublished = async (metric: SocialProofMetric) => {
    try {
      await updateMetric({
        id: metric.metricId,
        siteVariant: metric.siteVariant,
        value: metric.value,
        numericValue: metric.numericValue,
        prefix: metric.prefix,
        suffix: metric.suffix,
        decimals: metric.decimals,
        label: metric.label,
        description: metric.description,
        iconKey: metric.iconKey,
        accentColor: metric.accentColor,
        sortOrder: metric.sortOrder,
        isActive: !metric.isActive,
      }).unwrap();
      toast.success(
        metric.isActive
          ? 'Metric unpublished (hidden from website).'
          : 'Metric published to website successfully.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update metric status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMetric) return;
    try {
      await deleteMetric(deletingMetric.metricId).unwrap();
      toast.success('Social proof metric deleted successfully.');
      setDeletingMetric(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete metric.');
    }
  };

  const handleMoveMetric = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= metrics.length) return;

    const reordered = [...metrics];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((m) => m.metricId);
    try {
      await reorderMetrics({ orderedIds }).unwrap();
      toast.success('Metric display order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update metric order.');
    }
  };

  return (
    <>
      <SocialProofList
        metrics={metrics}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/social-proof/new?siteVariant=${activeTab}`)}
        onOpenEdit={(metric) => navigate(`/content/social-proof/${metric.metricId}/edit`)}
        onOpenDelete={(metric) => setDeletingMetric(metric)}
        onTogglePublished={handleTogglePublished}
        onMoveMetric={handleMoveMetric}
        isReordering={reorderState.isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingMetric}
        title="Delete Social Proof Metric"
        description={
          <span>
            Are you sure you want to delete the metric{' '}
            <strong className="text-slate-900 dark:text-white">
              &quot;{deletingMetric?.value} - {deletingMetric?.label}&quot;
            </strong>{' '}
            from the {deletingMetric?.siteVariant} website? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete Metric"
        cancelLabel="Keep Metric"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMetric(null)}
      />
    </>
  );
};

export default SocialProofListWrapper;
