import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { IntegrationList } from './IntegrationList';
import {
  useGetAdminIntegrationsQuery,
  useToggleActiveIntegrationMutation,
  useTogglePopularIntegrationMutation,
  useToggleNavbarIntegrationMutation,
  useDeleteIntegrationMutation,
  useReorderIntegrationsMutation,
} from '../Service/IntegrationService';
import type { IntegrationItem, SiteVariantTab } from '../Model/IntegrationTypes';

export const IntegrationListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [deletingItem, setDeletingItem] = useState<IntegrationItem | null>(null);

  // Queries & Mutations
  const { data: integrationsRes, isLoading, isError, refetch } = useGetAdminIntegrationsQuery();
  const [toggleActive] = useToggleActiveIntegrationMutation();
  const [togglePopular] = useTogglePopularIntegrationMutation();
  const [toggleNavbar] = useToggleNavbarIntegrationMutation();
  const [deleteIntegration, deleteState] = useDeleteIntegrationMutation();
  const [reorderIntegrations, reorderState] = useReorderIntegrationsMutation();

  const allItems = useMemo(() => integrationsRes?.data || [], [integrationsRes?.data]);

  // Tab counts dynamically across all websites
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allItems.filter((b) => b.siteVariant === 'Enterprise').length,
      Restaurant: allItems.filter((b) => b.siteVariant === 'Restaurant').length,
      Retail: allItems.filter((b) => b.siteVariant === 'Retail').length,
    }),
    [allItems]
  );

  // Items filtered by selected tab and sorted by sortOrder
  const items = useMemo(
    () =>
      allItems
        .filter((b) => b.siteVariant === activeTab)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allItems, activeTab]
  );

  // Handlers
  const handleToggleActive = async (item: IntegrationItem) => {
    try {
      await toggleActive(item.integrationId || item.id).unwrap();
      toast.success(
        item.isActive
          ? 'Integration hidden from website catalog.'
          : 'Integration published live to website catalog.'
      );
    } catch {
      toast.error('Failed to toggle status.');
    }
  };

  const handleTogglePopular = async (item: IntegrationItem) => {
    try {
      await togglePopular(item.integrationId || item.id).unwrap();
      toast.success(
        item.isPopular
          ? 'Removed from home ticker/popular.'
          : 'Marked as popular / home ticker item.'
      );
    } catch {
      toast.error('Failed to toggle popular badge.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteIntegration(deletingItem.integrationId || deletingItem.id).unwrap();
      toast.success('Integration removed successfully.');
      setDeletingItem(null);
    } catch {
      toast.error('Failed to delete integration.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((i) => i.integrationId || i.id);

    try {
      await reorderIntegrations({ orderedIds }).unwrap();
      toast.success('Integrations order updated.');
    } catch {
      toast.error('Failed to update integration order.');
    }
  };

  return (
    <>
      <IntegrationList
        integrations={items}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/integrations/new?siteVariant=${activeTab}`)}
        onOpenEdit={(item) => navigate(`/content/integrations/${item.integrationId || item.id}/edit`)}
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
        onTogglePopular={handleTogglePopular}
        onMove={handleMove}
        isReordering={reorderState.isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingItem}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Integration"
        description={`Are you sure you want to delete ${deletingItem?.name || 'this integration'}? This will remove it from the ${deletingItem?.siteVariant} integrations catalog.`}
        confirmLabel="Delete Integration"
        variant="danger"
        isLoading={deleteState.isLoading}
      />
    </>
  );
};

export default IntegrationListWrapper;
