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
    const willBeActive = !announcement.isActive;
    try {
      await toggleActive(announcement.id).unwrap();
      if (willBeActive) {
        toast.success(`Published: "${announcement.title}" is now Live!`, {
          description: `Now visible on ${announcement.siteVariant} website top notification bar.`,
        });
      } else {
        toast.info(`Unpublished: "${announcement.title}" is now Hidden (Draft)`, {
          description: `Removed from public ${announcement.siteVariant} website navbar.`,
        });
      }
    } catch (err: any) {
      toast.error('Failed to change announcement status', {
        description: err?.data?.message || err?.message || 'Server error. Please try again.',
      });
    }
  };

  const handleTogglePinned = async (announcement: Announcement) => {
    const willBePinned = !announcement.isPinned;
    try {
      await togglePinned(announcement.id).unwrap();
      if (willBePinned) {
        toast.success(`Pinned: "${announcement.title}"`, {
          description: 'This announcement now has priority in the rotation cycle.',
        });
      } else {
        toast.info(`Unpinned: "${announcement.title}"`, {
          description: 'Returned to standard rotational display order.',
        });
      }
    } catch (err: any) {
      toast.error('Failed to update pin state', {
        description: err?.data?.message || err?.message || 'Server error. Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnnouncement) return;
    const title = deletingAnnouncement.title;
    const site = deletingAnnouncement.siteVariant;
    try {
      await deleteAnnouncement(deletingAnnouncement.id).unwrap();
      toast.success('Announcement deleted successfully', {
        description: `"${title}" has been permanently removed from ${site} website.`,
      });
      setDeletingAnnouncement(null);
    } catch (err: any) {
      toast.error('Failed to delete announcement', {
        description: err?.data?.message || err?.message || 'Server error. Please try again.',
      });
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
      toast.success('Display order updated', {
        description: `"${moved.title}" moved ${direction}. New sequence saved.`,
      });
    } catch (err: any) {
      toast.error('Failed to update order', {
        description: err?.data?.message || err?.message || 'Server error.',
      });
    }
  };

  return (
    <>
      <AnnouncementList
        announcements={announcements}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading && allAnnouncements.length === 0}
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
