import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { CtaBannerList } from './CtaBannerList';
import {
  useGetAdminCtaBannersQuery,
  useToggleActiveCtaBannerMutation,
  useDeleteCtaBannerMutation,
} from '../Service/CtaBannerService';
import type { CtaBannerItem, CtaBannerFilter } from '../Model/CtaBannerTypes';

export const CtaBannerListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CtaBannerFilter>({
    siteVariant: 'all',
    status: 'ALL',
    searchQuery: '',
  });

  const [deletingItem, setDeletingItem] = useState<CtaBannerItem | null>(null);

  // RTK Query
  const { data: res, isLoading } = useGetAdminCtaBannersQuery(undefined);
  const [toggleActive] = useToggleActiveCtaBannerMutation();
  const [deleteBanner, deleteState] = useDeleteCtaBannerMutation();

  const allItems = useMemo(() => res?.data || [], [res?.data]);

  const handleFilterChange = (newFilter: Partial<CtaBannerFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleAddNew = () => {
    navigate('/content/cta-banner/new');
  };

  const handleOpenEdit = (item: CtaBannerItem) => {
    navigate(`/content/cta-banner/edit/${item.ctaBannerId}`);
  };

  const handleToggleActive = async (item: CtaBannerItem) => {
    try {
      await toggleActive(item.ctaBannerId).unwrap();
      toast.success(
        item.isActive
          ? `Final CTA for ${item.siteVariant} is now hidden from the website.`
          : `Final CTA for ${item.siteVariant} is now live on the website!`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteBanner(deletingItem.ctaBannerId).unwrap();
      toast.success('CTA Banner configuration deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete CTA Banner.');
    }
  };

  return (
    <>
      <CtaBannerList
        items={allItems}
        isLoading={isLoading && !allItems.length}
        filter={filter}
        onFilterChange={handleFilterChange}
        onAddNew={handleAddNew}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingItem}
        title="Delete Final CTA Banner?"
        description={`Are you sure you want to delete the Final CTA configuration for "${deletingItem?.siteVariant} Website"? This will remove the conversion banner from the live storefront.`}
        confirmLabel="Yes, Delete Banner"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};
