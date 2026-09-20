import React from 'react';
import { toast } from 'sonner';

import { WebsiteContentCollection, type CollectionDescriptor } from '../components/WebsiteContentCollection';
import {
  useGetClienteleQuery,
  useSaveClientMutation,
  useDeleteClientMutation,
  type ClientLogo,
} from '../services/websiteContentApi';

/**
 * Clientele — 2026-09-05 (content Phase 3).
 *
 * The "who uses us" logo strip. No entity, endpoint or page existed for this before.
 *
 * The image is required here, unlike the other content types: a client entry without a logo is an
 * empty space in a logo strip, so the API refuses it and this screen says so before saving.
 *
 * Page title matches the sidebar label verbatim.
 */

const descriptor: CollectionDescriptor<ClientLogo> = {
  title: 'Clientele',
  subtitle: 'Client and partner logos shown on the website.',
  noun: 'client',
  idOf: (c) => c.clientLogoId,
  subtitleOf: (c) => [c.industry, c.websiteUrl].filter(Boolean).join(' · ') || 'No details',
  badgesOf: (c) => (c.isFeatured ? ['Featured'] : []),
  mediaFolder: 'clients',
  imageRequired: true,
  fields: [
    { key: 'websiteUrl', label: "Client's website", type: 'text' },
    { key: 'industry', label: 'Industry', type: 'text', helperText: 'e.g. Retail, Hospitality.' },
    { key: 'isFeatured', label: 'Show as a featured client', type: 'checkbox' },
  ],
  emptyExtra: { websiteUrl: '', industry: '', isFeatured: false },
  extraOf: (c) => ({
    websiteUrl: c.websiteUrl ?? '',
    industry: c.industry ?? '',
    isFeatured: c.isFeatured,
  }),
};

function ClientelePage() {
  const query = useGetClienteleQuery();
  const [save, saveState] = useSaveClientMutation();
  const [remove] = useDeleteClientMutation();

  return (
    <WebsiteContentCollection<ClientLogo>
      descriptor={descriptor}
      rows={query.data?.data ?? []}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => { void query.refetch(); }}
      isSaving={saveState.isLoading}
      onSave={async (payload, id) => {
        await save({ id, ...payload }).unwrap();
        toast.success(id ? 'Client saved.' : 'Client added.');
      }}
      onDelete={async (id) => {
        await remove(id).unwrap();
        toast.success('Client removed.');
      }}
    />
  );
}

export default ClientelePage;
