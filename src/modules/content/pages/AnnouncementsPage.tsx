import React from 'react';
import { toast } from 'sonner';

import { WebsiteContentCollection, type CollectionDescriptor } from '../components/WebsiteContentCollection';
import {
  useGetAnnouncementsQuery,
  useSaveAnnouncementMutation,
  useDeleteAnnouncementMutation,
  type Announcement,
} from '../services/websiteContentApi';

/**
 * Announcements — 2026-09-05 (content Phase 3).
 *
 * News, events and notices. Nothing of this kind existed anywhere before: no entity, no endpoint
 * and no page. The nearest thing was the maintenance banner, which is an operations message served
 * from platform settings, not editorial content.
 *
 * Page title matches the sidebar label verbatim.
 */

const formatWhen = (value: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

const descriptor: CollectionDescriptor<Announcement> = {
  title: 'Announcements',
  subtitle: 'News, events and notices published on the website.',
  noun: 'announcement',
  idOf: (a) => a.announcementId,
  subtitleOf: (a) => {
    if (a.kind === 'Event') {
      const when = formatWhen(a.eventStartsAt);
      return [when, a.location].filter(Boolean).join(' · ') || 'Event';
    }
    return a.body ? a.body.slice(0, 120) : a.kind;
  },
  badgesOf: (a) => {
    const badges: string[] = [a.kind];
    if (a.isPinned) badges.push('Pinned');
    return badges;
  },
  mediaFolder: 'announcements',
  fields: [
    {
      key: 'kind',
      label: 'Kind',
      type: 'select',
      required: true,
      options: [
        { value: 'News', label: 'News' },
        { value: 'Event', label: 'Event' },
        { value: 'Notice', label: 'Notice' },
      ],
    },
    { key: 'body', label: 'Body', type: 'textarea' },
    // Event details appear only for an event, because a news item has no start time and the
    // server refuses an event without one.
    {
      key: 'eventStartsAt',
      label: 'Starts',
      type: 'datetime',
      required: true,
      showWhen: (d) => d.kind === 'Event',
    },
    { key: 'eventEndsAt', label: 'Ends', type: 'datetime', showWhen: (d) => d.kind === 'Event' },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      showWhen: (d) => d.kind === 'Event',
      helperText: 'A venue, or "Online".',
    },
    { key: 'isPinned', label: 'Pin to the top of the list', type: 'checkbox' },
  ],
  emptyExtra: { kind: 'News', eventStartsAt: '', eventEndsAt: '', location: '', isPinned: false },
  extraOf: (a) => ({
    kind: a.kind,
    eventStartsAt: a.eventStartsAt ? a.eventStartsAt.slice(0, 16) : '',
    eventEndsAt: a.eventEndsAt ? a.eventEndsAt.slice(0, 16) : '',
    location: a.location ?? '',
    isPinned: a.isPinned,
  }),
};

function AnnouncementsPage() {
  const query = useGetAnnouncementsQuery();
  const [save, saveState] = useSaveAnnouncementMutation();
  const [remove] = useDeleteAnnouncementMutation();

  return (
    <WebsiteContentCollection<Announcement>
      descriptor={descriptor}
      rows={query.data?.data ?? []}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => { void query.refetch(); }}
      isSaving={saveState.isLoading}
      onSave={async (payload, id) => {
        // Event fields are meaningless on news and notices; sending stale values would leave an
        // old date attached to something that is no longer an event.
        const body =
          payload.kind === 'Event'
            ? payload
            : { ...payload, eventStartsAt: null, eventEndsAt: null, location: null };
        await save({ id, ...body }).unwrap();
        toast.success(id ? 'Announcement saved.' : 'Announcement added.');
      }}
      onDelete={async (id) => {
        await remove(id).unwrap();
        toast.success('Announcement deleted.');
      }}
    />
  );
}

export default AnnouncementsPage;
