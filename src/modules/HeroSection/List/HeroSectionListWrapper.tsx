import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { HeroSectionList } from './HeroSectionList';
import {
  useGetAdminHeroSlidesQuery,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useReorderHeroSlidesMutation,
  useToggleActiveHeroSlideMutation,
} from '../Service/HeroSectionService';
import type { HeroSlide, SiteVariantTab } from '../Model/HeroSectionTypes';

export const HeroSectionListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [deletingSlide, setDeletingSlide] = useState<HeroSlide | null>(null);

  // Queries & Mutations
  const { data: slidesRes, isLoading, isFetching, isError, refetch } = useGetAdminHeroSlidesQuery(undefined);
  const [updateSlide] = useUpdateHeroSlideMutation();
  const [toggleActiveSlide] = useToggleActiveHeroSlideMutation();
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
      await toggleActiveSlide(slide.heroSlideId).unwrap();
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
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/hero-banners/new?siteVariant=${activeTab}`)}
        onOpenEdit={(slide) => navigate(`/content/hero-banners/${slide.heroSlideId}/edit`)}
        onOpenDelete={(slide) => setDeletingSlide(slide)}
        onTogglePublished={handleTogglePublished}
        onMoveSlide={handleMoveSlide}
        isReordering={reorderState.isLoading}
      />

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
