import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { ATMModal } from '@/shared/ui';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { ClienteleList } from './ClienteleList';
import { AddClienteleWrapper } from '../Add/AddClienteleWrapper';
import { EditClienteleWrapper } from '../Edit/EditClienteleWrapper';
import {
  useGetAdminClienteleQuery,
  useToggleActiveClientBrandMutation,
  useToggleFeaturedClientBrandMutation,
  useDeleteClientBrandMutation,
  useReorderClienteleMutation,
} from '../Service/ClienteleService';
import type { ClientBrand, SiteVariantTab } from '../Model/ClienteleTypes';

export const ClienteleListWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<ClientBrand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<ClientBrand | null>(null);

  // Queries & Mutations
  const { data: brandsRes, isLoading, isFetching, isError, refetch } = useGetAdminClienteleQuery(undefined);
  const [toggleActive] = useToggleActiveClientBrandMutation();
  const [toggleFeatured] = useToggleFeaturedClientBrandMutation();
  const [deleteBrand, deleteState] = useDeleteClientBrandMutation();
  const [reorderBrands, reorderState] = useReorderClienteleMutation();

  const allBrands = useMemo(() => brandsRes?.data || [], [brandsRes?.data]);

  // Tab counts dynamically across all websites
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allBrands.filter((b) => b.siteVariant === 'Enterprise').length,
      Restaurant: allBrands.filter((b) => b.siteVariant === 'Restaurant').length,
      Retail: allBrands.filter((b) => b.siteVariant === 'Retail').length,
    }),
    [allBrands]
  );

  // Brands filtered by selected tab and sorted by sortOrder
  const brands = useMemo(
    () =>
      allBrands
        .filter((b) => b.siteVariant === activeTab)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allBrands, activeTab]
  );

  // Handlers
  const handleToggleActive = async (brand: ClientBrand) => {
    try {
      await toggleActive(brand.brandId || brand.id).unwrap();
      toast.success(
        brand.isActive
          ? 'Brand hidden from website marquee.'
          : 'Brand published live to website marquee.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle brand status.');
    }
  };

  const handleToggleFeatured = async (brand: ClientBrand) => {
    try {
      await toggleFeatured(brand.brandId || brand.id).unwrap();
      toast.success(
        brand.isFeatured
          ? 'Brand removed from featured list.'
          : 'Brand marked as featured partner.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle featured state.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBrand) return;
    try {
      await deleteBrand(deletingBrand.brandId || deletingBrand.id).unwrap();
      toast.success('Brand partner removed successfully.');
      setDeletingBrand(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete brand.');
    }
  };

  const handleMoveBrand = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const reordered = [...brands];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((b) => b.brandId || b.id);
    try {
      await reorderBrands({ orderedIds }).unwrap();
      toast.success('Brand display order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update order.');
    }
  };

  return (
    <>
      <ClienteleList
        brands={brands}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenEdit={(brand) => setEditingBrand(brand)}
        onOpenDelete={(brand) => setDeletingBrand(brand)}
        onToggleActive={handleToggleActive}
        onToggleFeatured={handleToggleFeatured}
        onMove={handleMoveBrand}
        isReordering={reorderState.isLoading}
      />

      {/* Add Brand Modal */}
      <ATMModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add New ${activeTab} Brand Partner`}
        description="Configure brand name, industry category, logo image URL, scale units, and preview."
        size="2xl"
        containerClassName="lg:pl-[270px]"
        className="max-w-[760px]"
      >
        <AddClienteleWrapper
          siteVariant={activeTab}
          defaultSortOrder={brands.length + 1}
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      </ATMModal>

      {/* Edit Brand Modal */}
      <ATMModal
        isOpen={!!editingBrand}
        onClose={() => setEditingBrand(null)}
        title={`Edit ${editingBrand?.siteVariant || ''} Brand Partner`}
        description="Modify brand name, category, logo image URL, units count, or featured badge."
        size="2xl"
        containerClassName="lg:pl-[270px]"
        className="max-w-[760px]"
      >
        {editingBrand && (
          <EditClienteleWrapper
            brand={editingBrand}
            onSuccess={() => setEditingBrand(null)}
            onCancel={() => setEditingBrand(null)}
          />
        )}
      </ATMModal>

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingBrand}
        title="Delete Brand Partner"
        description={
          <span>
            Are you sure you want to delete the brand{' '}
            <strong className="text-slate-900 dark:text-white">
              &quot;{deletingBrand?.name || deletingBrand?.title}&quot;
            </strong>{' '}
            from the {deletingBrand?.siteVariant} website marquee? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete Brand"
        cancelLabel="Keep Brand"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBrand(null)}
      />
    </>
  );
};

export default ClienteleListWrapper;
