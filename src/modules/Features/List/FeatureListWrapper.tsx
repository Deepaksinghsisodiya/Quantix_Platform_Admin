import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { FeatureList } from './FeatureList';
import {
  useGetAdminFeaturesQuery,
  useToggleActiveFeatureMutation,
  useToggleNavbarFeatureMutation,
  useDeleteFeatureMutation,
} from '../Service/FeatureService';
import type { PlatformFeature } from '../Model/FeatureTypes';

export const FeatureListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeVariant, setActiveVariant] = useState<string>('Enterprise');
  const [deletingItem, setDeletingItem] = useState<PlatformFeature | null>(null);

  // Queries & Mutations
  const { data: featuresRes, isLoading, isFetching, isError, refetch } = useGetAdminFeaturesQuery();
  const [toggleActive] = useToggleActiveFeatureMutation();
  const [toggleNavbar] = useToggleNavbarFeatureMutation();
  const [deleteFeature, deleteState] = useDeleteFeatureMutation();

  const allFeatures = useMemo(() => featuresRes?.data || [], [featuresRes?.data]);

  const counts = useMemo(
    () => ({
      Enterprise: allFeatures.filter((f) => (f.siteVariant || '').toLowerCase() === 'enterprise').length,
      Restaurant: allFeatures.filter((f) => (f.siteVariant || '').toLowerCase() === 'restaurant').length,
      Retail: allFeatures.filter((f) => (f.siteVariant || '').toLowerCase() === 'retail').length,
    }),
    [allFeatures]
  );

  const filteredItems = useMemo(
    () => allFeatures.filter((f) => (f.siteVariant || '').toLowerCase() === activeVariant.toLowerCase()),
    [allFeatures, activeVariant]
  );

  const handleToggleActive = async (item: PlatformFeature) => {
    try {
      await toggleActive(item.featureId || item.id!).unwrap();
      toast.success(item.isActive ? 'Feature hidden from website.' : 'Feature published live to website.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle active status.');
    }
  };

  const handleToggleNavbar = async (item: PlatformFeature) => {
    try {
      await toggleNavbar(item.featureId || item.id!).unwrap();
      toast.success(item.showInNavbar ? 'Feature removed from Navbar.' : 'Feature added to Navbar MegaMenu.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle navbar status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteFeature(deletingItem.featureId || deletingItem.id!).unwrap();
      toast.success('Feature deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete feature.');
    }
  };

  return (
    <>
      <FeatureList
        items={filteredItems}
        counts={counts}
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/features/new?siteVariant=${activeVariant}`)}
        onOpenEdit={(item) => navigate(`/content/features/${item.featureId || item.id}/edit`)}
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
        onToggleNavbar={handleToggleNavbar}
      />

      {deletingItem && (
        <ATMConfirmModal
          isOpen={!!deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Feature Item"
          description={`Are you sure you want to delete '${deletingItem.title}'? This will remove it from the public API.`}
          confirmLabel="Delete Feature"
          variant="danger"
          isLoading={deleteState.isLoading}
        />
      )}
    </>
  );
};
