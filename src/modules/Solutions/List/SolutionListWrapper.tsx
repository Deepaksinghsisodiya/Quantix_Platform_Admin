import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { SolutionList } from './SolutionList';
import {
  useGetAdminSolutionsQuery,
  useToggleActiveSolutionMutation,
  useDeleteSolutionMutation,
  useReorderSolutionsMutation,
} from '../Service/SolutionService';
import type { SolutionItem, SiteVariantTab } from '../Model/SolutionTypes';

export const SolutionListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeSiteVariant, setActiveSiteVariant] = useState<SiteVariantTab>('Enterprise');
  const [activeTab, setActiveTab] = useState<'PromoCard' | 'SectorItem' | 'All'>('All');
  const [deletingItem, setDeletingItem] = useState<SolutionItem | null>(null);

  // Queries & Mutations (Fetch all solutions and filter client-side for instant switching)
  const { data: solutionsRes, isLoading, isFetching, isError, refetch } = useGetAdminSolutionsQuery(undefined);
  const [toggleActive] = useToggleActiveSolutionMutation();
  const [deleteSolution, deleteState] = useDeleteSolutionMutation();
  const [reorderSolutions, reorderState] = useReorderSolutionsMutation();

  const allItems = useMemo(() => solutionsRes?.data || [], [solutionsRes?.data]);

  // Variant counts
  const siteVariantCounts = useMemo<Record<SiteVariantTab, number>>(
    () => ({
      Enterprise: allItems.filter((s) => (s.siteVariant || '').toLowerCase() === 'enterprise' && !s.isSubdomain).length,
      Restaurant: allItems.filter((s) => (s.siteVariant || '').toLowerCase() === 'restaurant' && !s.isSubdomain).length,
      Retail: allItems.filter((s) => (s.siteVariant || '').toLowerCase() === 'retail' && !s.isSubdomain).length,
      Subdomains: allItems.filter((s) => (s.siteVariant || '').toLowerCase() === 'subdomains' || s.isSubdomain).length,
      All: allItems.length,
    }),
    [allItems]
  );

  // Items filtered by current site variant
  const variantItems = useMemo(() => {
    if (activeSiteVariant === 'All') return allItems;
    if (activeSiteVariant === 'Subdomains') {
      return allItems.filter(
        (s) => (s.siteVariant || '').toLowerCase() === 'subdomains' || s.isSubdomain
      );
    }
    if (activeSiteVariant === 'Enterprise') {
      return allItems.filter(
        (s) => (s.siteVariant || '').toLowerCase() === 'enterprise' && !s.isSubdomain
      );
    }
    return allItems.filter(
      (s) => (s.siteVariant || '').toLowerCase() === activeSiteVariant.toLowerCase() && !s.isSubdomain
    );
  }, [allItems, activeSiteVariant]);

  // Type counts within the selected variant
  const counts = useMemo(
    () => ({
      PromoCard: variantItems.filter((s) => s.itemType === 'PromoCard').length,
      SectorItem: variantItems.filter((s) => s.itemType === 'SectorItem').length,
      All: variantItems.length,
    }),
    [variantItems]
  );

  const displayedItems = useMemo(() => {
    let filtered = variantItems;
    if (activeTab !== 'All') {
      filtered = variantItems.filter((s) => s.itemType === activeTab);
    }
    return filtered.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  }, [variantItems, activeTab]);

  const handleToggleActive = async (item: SolutionItem) => {
    try {
      await toggleActive(item.solutionId || item.id!).unwrap();
      toast.success(item.isActive ? 'Solution hidden from website.' : 'Solution published live to website.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteSolution(deletingItem.solutionId || deletingItem.id!).unwrap();
      toast.success('Solution removed successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete solution.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= displayedItems.length) return;

    const reordered = [...displayedItems];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((s) => s.solutionId || s.id!);
    try {
      await reorderSolutions({ orderedIds }).unwrap();
      toast.success('Display order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update order.');
    }
  };

  return (
    <>
      <SolutionList
        items={displayedItems}
        activeSiteVariant={activeSiteVariant}
        onSiteVariantChange={setActiveSiteVariant}
        siteVariantCounts={siteVariantCounts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => {
          const sv = activeSiteVariant === 'All' ? 'Enterprise' : activeSiteVariant;
          const it = activeTab === 'All' ? (sv === 'Enterprise' ? 'SectorItem' : 'SectorItem') : activeTab;
          navigate(`/content/solutions/new?siteVariant=${sv}&itemType=${it}&order=${displayedItems.length + 1}`);
        }}
        onOpenEdit={(item) =>
          navigate(`/content/solutions/${item.solutionId || item.id}/edit`)
        }
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
        onMove={handleMove}
        isReordering={reorderState.isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingItem}
        title="Delete Solution Item?"
        description={`Are you sure you want to permanently remove "${deletingItem?.title}" from ${deletingItem?.siteVariant || 'Enterprise'}? This will remove it from the live website.`}
        confirmLabel="Yes, Delete"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};

export default SolutionListWrapper;
