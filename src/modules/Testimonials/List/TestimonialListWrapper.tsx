import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { TestimonialList } from './TestimonialList';
import {
  useGetAdminTestimonialsQuery,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useReorderTestimonialsMutation,
} from '../Service/TestimonialService';
import type { TestimonialItem, SiteVariantTab } from '../Model/TestimonialTypes';

function matchesTab(item: TestimonialItem, tab: SiteVariantTab): boolean {
  const slug = (item.pageSlug || '').toLowerCase();
  if (tab === 'Restaurant') return slug === 'restaurant';
  if (tab === 'Retail') return slug === 'retail';
  // Enterprise tab matches pageSlug === 'enterprise' or unset / merchantType === 'Enterprise'
  return slug === 'enterprise' || slug === '' || item.merchantType === 'Enterprise';
}

export const TestimonialListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [deletingItem, setDeletingItem] = useState<TestimonialItem | null>(null);

  // Queries & Mutations
  const { data: testimonialsRes, isLoading, isFetching, isError, refetch } = useGetAdminTestimonialsQuery(undefined);
  const [updateTestimonial] = useUpdateTestimonialMutation();
  const [deleteTestimonial, deleteState] = useDeleteTestimonialMutation();
  const [reorderTestimonials, reorderState] = useReorderTestimonialsMutation();

  const allItems = useMemo(() => testimonialsRes?.data || [], [testimonialsRes?.data]);

  // Tab counts calculated dynamically
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allItems.filter((t) => matchesTab(t, 'Enterprise')).length,
      Restaurant: allItems.filter((t) => matchesTab(t, 'Restaurant')).length,
      Retail: allItems.filter((t) => matchesTab(t, 'Retail')).length,
    }),
    [allItems]
  );

  // Items filtered by selected tab and sorted by sortOrder
  const items = useMemo(
    () =>
      allItems
        .filter((t) => matchesTab(t, activeTab))
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allItems, activeTab]
  );

  // Handlers
  const handleTogglePublished = async (item: TestimonialItem) => {
    try {
      await updateTestimonial({
        id: item.testimonialId,
        personName: item.personName,
        personRole: item.personRole,
        companyName: item.companyName,
        avatarUrl: item.avatarUrl,
        metricText: item.metricText,
        rating: item.rating,
        merchantType: item.merchantType,
        title: item.title,
        body: item.body,
        pageSlug: item.pageSlug,
        sortOrder: item.sortOrder,
        isActive: !item.isActive,
      }).unwrap();
      toast.success(
        item.isActive
          ? 'Testimonial hidden from live website.'
          : 'Testimonial published to live website successfully.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update review status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteTestimonial(deletingItem.testimonialId).unwrap();
      toast.success('Testimonial review deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete review.');
    }
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((t) => t.testimonialId);
    try {
      await reorderTestimonials({ orderedIds }).unwrap();
      toast.success('Testimonial display sequence updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to reorder testimonials.');
    }
  };

  return (
    <>
      <TestimonialList
        testimonials={items}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/testimonials/new?siteVariant=${activeTab}`)}
        onOpenEdit={(item) => navigate(`/content/testimonials/${item.testimonialId}/edit`)}
        onOpenDelete={(item) => setDeletingItem(item)}
        onTogglePublished={handleTogglePublished}
        onMoveItem={handleMoveItem}
        isReordering={reorderState.isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingItem}
        title="Delete Testimonial Review"
        description={
          <span>
            Are you sure you want to permanently delete the review from{' '}
            <strong className="text-slate-900 dark:text-white">
              &quot;{deletingItem?.personName} ({deletingItem?.companyName || 'Client'})&quot;
            </strong>? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete Review"
        cancelLabel="Keep Review"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};

export default TestimonialListWrapper;
