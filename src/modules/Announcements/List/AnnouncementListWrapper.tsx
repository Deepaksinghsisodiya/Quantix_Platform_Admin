import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { AnnouncementList } from './AnnouncementList';
import {
  useGetAdminAnnouncementsQuery,
  useToggleActiveAnnouncementMutation,
  useTogglePinnedAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useReorderAnnouncementsMutation,
} from '../Service/AnnouncementService';
import type { Announcement, SiteVariantTab } from '../Model/AnnouncementTypes';

export const AnnouncementListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  // Queries & Mutations
  const { data: announcementsRes, isLoading, isFetching, isError, refetch } = useGetAdminAnnouncementsQuery(undefined);
  const [toggleActive] = useToggleActiveAnnouncementMutation();
  const [togglePinned] = useTogglePinnedAnnouncementMutation();
  const [deleteAnnouncement, deleteState] = useDeleteAnnouncementMutation();
  const [reorderAnnouncements, reorderState] = useReorderAnnouncementsMutation();

  const allAnnouncements = useMemo(() => announcementsRes?.data || [], [announcementsRes?.data]);

  // Tab counts dynamically across all websites
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allAnnouncements.filter((a) => a.siteVariant === 'Enterprise').length,
      Restaurant: allAnnouncements.filter((a) => a.siteVariant === 'Restaurant').length,
      Retail: allAnnouncements.filter((a) => a.siteVariant === 'Retail').length,
    }),
    [allAnnouncements]
  );

  // Announcements filtered by selected tab and sorted by pinned first, then sortOrder
  const announcements = useMemo(
    () =>
      allAnnouncements
        .filter((a) => a.siteVariant === activeTab)
        .slice()
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return a.sortOrder - b.sortOrder;
        }),
    [allAnnouncements, activeTab]
  );

  // Handlers
  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await toggleActive(announcement.id).unwrap();
      toast.success(
        announcement.isActive
          ? 'Announcement unpublished (hidden from website navbar).'
          : 'Announcement published live to website navbar.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle announcement status.');
    }
  };

  const handleTogglePinned = async (announcement: Announcement) => {
    try {
      await togglePinned(announcement.id).unwrap();
      toast.success(
        announcement.isPinned
          ? 'Announcement unpinned.'
          : 'Announcement pinned to top of rotation cycle.'
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle pin state.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnnouncement) return;
    try {
      await deleteAnnouncement(deletingAnnouncement.id).unwrap();
      toast.success('Announcement deleted successfully.');
      setDeletingAnnouncement(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete announcement.');
    }
  };

  const handleMoveAnnouncement = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= announcements.length) return;

    const reordered = [...announcements];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((a) => a.id);
    try {
      await reorderAnnouncements({ orderedIds }).unwrap();
      toast.success('Announcement display order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update order.');
    }
  };

  return (
    <>
      <AnnouncementList
        announcements={announcements}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/announcements/new?siteVariant=${activeTab}`)}
        onOpenEdit={(announcement) => navigate(`/content/announcements/${announcement.id}/edit`)}
        onOpenDelete={(announcement) => setDeletingAnnouncement(announcement)}
        onToggleActive={handleToggleActive}
        onTogglePinned={handleTogglePinned}
        onMove={handleMoveAnnouncement}
        isReordering={reorderState.isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingAnnouncement}
        title="Delete Announcement Banner"
        description={
          <span>
            Are you sure you want to delete the announcement{' '}
            <strong className="text-slate-900 dark:text-white">
              &quot;{deletingAnnouncement?.title}&quot;
            </strong>{' '}
            from the {deletingAnnouncement?.siteVariant} website? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete Announcement"
        cancelLabel="Keep Announcement"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingAnnouncement(null)}
      />
    </>
  );
};

export default AnnouncementListWrapper;
