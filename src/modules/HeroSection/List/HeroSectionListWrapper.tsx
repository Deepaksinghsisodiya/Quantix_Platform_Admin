import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { ATMModal } from '@/shared/ui';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { HeroSectionList } from './HeroSectionList';
import { AddHeroSectionWrapper } from '../Add/AddHeroSectionWrapper';
import { EditHeroSectionWrapper } from '../Edit/EditHeroSectionWrapper';
import {
  useGetAdminHeroSlidesQuery,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useReorderHeroSlidesMutation,
} from '../Service/HeroSectionService';
import type { HeroSlide, SiteVariantTab } from '../Model/HeroSectionTypes';

export const HeroSectionListWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deletingSlide, setDeletingSlide] = useState<HeroSlide | null>(null);

  // Queries & Mutations
  const { data: slidesRes, isLoading, isError, refetch } = useGetAdminHeroSlidesQuery(undefined);
  const [updateSlide] = useUpdateHeroSlideMutation();
  const [deleteSlide, deleteState] = useDeleteHeroSlideMutation();
  const [reorderSlides, reorderState] = useReorderHeroSlidesMutation();

  const allSlides = useMemo(() => slidesRes?.data || [], [slidesRes?.data]);

  // Tab counts calculated dynamically across all websites
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allSlides.filter((s) => s.siteVariant === 'Enterprise').length,
      Restaurant: allSlides.filter((s) => s.siteVariant === 'Restaurant').length,
      Retail: allSlides.filter((s) => s.siteVariant === 'Retail').length,
    }),
    [allSlides]
  );

  // Slides filtered by selected tab and sorted by sortOrder
  const slides = useMemo(
    () =>
      allSlides
        .filter((s) => s.siteVariant === activeTab)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allSlides, activeTab]
  );

  // Handlers
  const handleTogglePublished = async (slide: HeroSlide) => {
    try {
      await updateSlide({
        id: slide.heroSlideId,
        siteVariant: slide.siteVariant,
        badge: slide.badge,
        heading: slide.heading,
        subheading: slide.subheading,
        primaryCtaLabel: slide.primaryCtaLabel,
        primaryCtaUrl: slide.primaryCtaUrl,
        secondaryCtaLabel: slide.secondaryCtaLabel,
        secondaryCtaUrl: slide.secondaryCtaUrl,
        featureHighlights: slide.featureHighlights,
        mediaAssetId: slide.mediaAssetId,
        imageUrl: slide.imageUrl,
        sortOrder: slide.sortOrder,
        isActive: !slide.isActive,
      }).unwrap();
      toast.success(
        slide.isActive
          ? 'Slide unpublished (hidden from website).'
          : 'Slide published to website successfully.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update slide status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSlide) return;
    try {
      await deleteSlide(deletingSlide.heroSlideId).unwrap();
      toast.success('Hero slide deleted successfully.');
      setDeletingSlide(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete hero slide.');
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const reordered = [...slides];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((s) => s.heroSlideId);

    try {
      await reorderSlides({ orderedIds }).unwrap();
      toast.success('Slide order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update slide order.');
    }
  };

  return (
    <>
      <HeroSectionList
        slides={slides}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenEdit={(slide) => setEditingSlide(slide)}
        onOpenDelete={(slide) => setDeletingSlide(slide)}
        onTogglePublished={handleTogglePublished}
        onMoveSlide={handleMoveSlide}
        isReordering={reorderState.isLoading}
      />

      {/* Add Slide Modal */}
      <ATMModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add Hero Slide — ${activeTab} Website`}
        subtitle="Create a new hero slide banner with dynamic headlines, CTA buttons, and showcase visuals."
        size="4xl"
      >
        <AddHeroSectionWrapper
          siteVariant={activeTab}
          defaultSortOrder={slides.length + 1}
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      </ATMModal>

      {/* Edit Slide Modal */}
      <ATMModal
        isOpen={!!editingSlide}
        onClose={() => setEditingSlide(null)}
        title={`Edit Hero Slide — ${editingSlide?.siteVariant || activeTab}`}
        subtitle={`Slide ID: ${editingSlide?.heroSlideId}`}
        size="4xl"
      >
        {editingSlide && (
          <EditHeroSectionWrapper
            slide={editingSlide}
            onSuccess={() => setEditingSlide(null)}
            onCancel={() => setEditingSlide(null)}
          />
        )}
      </ATMModal>

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingSlide}
        title="Delete Hero Slide"
        description={
          <span>
            Are you sure you want to delete the hero slide{' '}
            <strong className="text-slate-900 dark:text-white">
              &quot;{deletingSlide?.heading}&quot;
            </strong>{' '}
            from the {deletingSlide?.siteVariant} website? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete Slide"
        cancelLabel="Keep Slide"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSlide(null)}
      />
    </>
  );
};

export default HeroSectionListWrapper;
