import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { FAQList } from './FAQList';
import {
  useGetAdminFaqsQuery,
  useGetFaqCategoriesQuery,
  useToggleActiveFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
} from '../Service/FAQService';
import type { FAQItem, FAQFilter } from '../Model/FAQTypes';

export const FAQListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FAQFilter>({
    siteVariant: 'all',
    category: 'all',
    status: 'ALL',
    searchQuery: '',
  });

  const [deletingItem, setDeletingItem] = useState<FAQItem | null>(null);

  // RTK Queries & Mutations
  const { data: res, isLoading } = useGetAdminFaqsQuery(undefined);
  const { data: catRes } = useGetFaqCategoriesQuery();
  const [toggleActive] = useToggleActiveFaqMutation();
  const [deleteFaq, deleteState] = useDeleteFaqMutation();
  const [reorderFaqs] = useReorderFaqsMutation();

  const allItems = useMemo(() => res?.data || [], [res?.data]);
  const categories = useMemo(() => catRes?.data || [], [catRes?.data]);

  const handleFilterChange = (newFilter: Partial<FAQFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleAddNew = () => {
    const vParam = filter.siteVariant !== 'all' ? `?variant=${filter.siteVariant}` : '';
    navigate(`/content/faq/new${vParam}`);
  };

  const handleOpenEdit = (item: FAQItem) => {
    navigate(`/content/faq/edit/${item.faqId}`);
  };

  const handleToggleActive = async (item: FAQItem) => {
    try {
      const id = item.faqId || (item as any).id;
      await toggleActive({ id, isActive: !item.isActive }).unwrap();
      toast.success(
        item.isActive
          ? 'FAQ is now hidden from the website.'
          : 'FAQ is now live on the website.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle status.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= allItems.length) return;

    const list = [...allItems];
    const moved = list[index];
    const target = list[targetIndex];
    if (!moved || !target) return;

    list[index] = target;
    list[targetIndex] = moved;

    try {
      await reorderFaqs(list.map((f) => f.faqId || (f as any).id)).unwrap();
      toast.success('FAQ order updated.');
    } catch {
      toast.error('Failed to update FAQ order.');
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await reorderFaqs(orderedIds).unwrap();
      toast.success('FAQs reordered successfully.');
    } catch {
      toast.error('Failed to save reordered FAQs.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      const id = deletingItem.faqId || (deletingItem as any).id;
      await deleteFaq(id).unwrap();
      toast.success('FAQ deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete FAQ.');
    }
  };

  return (
    <>
      <FAQList
        items={allItems}
        categories={categories}
        isLoading={isLoading}
        filter={filter}
        onFilterChange={handleFilterChange}
        onAddNew={handleAddNew}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
        onMove={handleMove}
        onReorder={handleReorder}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={Boolean(deletingItem)}
        title="Delete FAQ?"
        description={`Are you sure you want to delete "${deletingItem?.question}"? This action cannot be undone and will remove it from all connected storefronts.`}
        confirmLabel="Yes, Delete FAQ"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};
