import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { CustomerSupportList } from './CustomerSupportList';
import {
  useGetAdminSupportSectionsQuery,
  useToggleActiveSupportSectionMutation,
  useDeleteSupportSectionMutation,
} from '../Service/CustomerSupportService';
import type { SupportSectionItem, CustomerSupportFilter } from '../Model/CustomerSupportTypes';

export const CustomerSupportListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CustomerSupportFilter>({
    siteVariant: 'all',
    status: 'ALL',
    searchQuery: '',
  });

  const [deletingItem, setDeletingItem] = useState<SupportSectionItem | null>(null);

  // RTK Query
  const { data: res, isLoading, refetch } = useGetAdminSupportSectionsQuery(undefined);
  const [toggleActive] = useToggleActiveSupportSectionMutation();
  const [deleteSection, deleteState] = useDeleteSupportSectionMutation();

  const allItems = useMemo(() => res?.data || [], [res?.data]);

  const handleFilterChange = (newFilter: Partial<CustomerSupportFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleAddNew = () => {
    navigate('/content/customer-support/new');
  };

  const handleOpenEdit = (item: SupportSectionItem) => {
    navigate(`/content/customer-support/edit/${item.supportSectionId}`);
  };

  const handleToggleActive = async (item: SupportSectionItem) => {
    try {
      await toggleActive(item.supportSectionId).unwrap();
      toast.success(
        item.isActive
          ? 'Support section is now hidden from the website.'
          : 'Support section is now live on the website.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteSection(deletingItem.supportSectionId).unwrap();
      toast.success('Customer Support section deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete support section.');
    }
  };

  return (
    <>
      <CustomerSupportList
        items={allItems}
        isLoading={isLoading}
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
        title="Delete Customer Support Configuration?"
        description={`Are you sure you want to delete the support desk for "${deletingItem?.siteVariant} Website"? This will remove the 24/7 dedicated support section from the live homepage.`}
        confirmLabel="Yes, Delete Configuration"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};
