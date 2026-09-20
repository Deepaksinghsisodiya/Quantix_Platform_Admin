import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Film, ImageOff, EyeOff } from 'lucide-react';

import { ATMButton, ATMCard, ATMModal, ATMTextField, ATMBadge } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { WebsiteContentCollection, type CollectionDescriptor } from '../components/WebsiteContentCollection';
import { MediaPicker } from '../components/MediaPicker';
import { absoluteMediaUrl } from '../services/mediaApi';
import {
  useGetGalleriesQuery,
  useGetGalleryQuery,
  useSaveGalleryMutation,
  useDeleteGalleryMutation,
  useSaveGalleryItemMutation,
  useDeleteGalleryItemMutation,
  type Gallery,
} from '../services/websiteContentApi';

/**
 * Galleries — 2026-09-05 (content Phase 3).
 *
 * Photo and video collections. Nothing existed for this: `GET help-centre/videos` was a stub
 * returning an empty array and there was no gallery concept anywhere.
 *
 * An item is either a HOSTED file from the media library, which the platform serves with range
 * support so a clip can seek, or an EXTERNAL video URL. Both, because a short product clip belongs
 * on the platform and a conference recording does not.
 *
 * Page title matches the sidebar label verbatim.
 */

const descriptor: CollectionDescriptor<Gallery> = {
  title: 'Galleries',
  subtitle: 'Photo and video collections shown on the website.',
  noun: 'gallery',
  idOf: (g) => g.galleryId,
  subtitleOf: (g) => `/${g.slug} · ${g.itemCount} item${g.itemCount === 1 ? '' : 's'}`,
  mediaFolder: 'galleries',
  fields: [
    { key: 'slug', label: 'Slug', type: 'text', required: true, helperText: "The gallery's address on the website." },
    { key: 'body', label: 'Description', type: 'textarea' },
  ],
  emptyExtra: { slug: '' },
  extraOf: (g) => ({ slug: g.slug }),
};

function GalleriesPage() {
  const query = useGetGalleriesQuery();
  const [save, saveState] = useSaveGalleryMutation();
  const [remove] = useDeleteGalleryMutation();

  const galleries = query.data?.data ?? [];
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <WebsiteContentCollection<Gallery>
      descriptor={descriptor}
      rows={galleries}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => { void query.refetch(); }}
      isSaving={saveState.isLoading}
      onSave={async (payload, id) => {
        await save({ id, ...payload }).unwrap();
        toast.success(id ? 'Gallery saved.' : 'Gallery created.');
      }}
      onDelete={async (id) => {
        await remove(id).unwrap();
        toast.success('Gallery deleted.');
      }}
    >
      {galleries.length > 0 && (
        <ATMCard title="Gallery contents">
          <div className="mb-3 flex flex-wrap gap-1">
            {galleries.map((g) => (
              <button
                key={g.galleryId}
                type="button"
                onClick={() => setOpenSlug(openSlug === g.slug ? null : g.slug)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  openSlug === g.slug
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                )}
              >
                {g.title} ({g.itemCount})
              </button>
            ))}
          </div>
          {openSlug ? (
            <GalleryItems slug={openSlug} />
          ) : (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Pick a gallery above to manage its photos and clips.
            </p>
          )}
        </ATMCard>
      )}
    </WebsiteContentCollection>
  );
}

/** The items inside one gallery. */
function GalleryItems({ slug }: { slug: string }) {
  const query = useGetGalleryQuery(slug);
  const [saveItem, saveState] = useSaveGalleryItemMutation();
  const [deleteItem] = useDeleteGalleryItemMutation();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<{ itemId?: string; mediaAssetId: string; externalVideoUrl: string; caption: string; sortOrder: number; isActive: boolean } | null>(null);

  const gallery = query.data?.data;
  const items = gallery?.items ?? [];

  const openAdd = () =>
    setDraft({ mediaAssetId: '', externalVideoUrl: '', caption: '', sortOrder: items.length, isActive: true });

  const save = async () => {
    if (!draft || !gallery) return;
    if (!draft.mediaAssetId && !draft.externalVideoUrl.trim()) {
      toast.error('Choose a file from the media library, or give an external video URL.');
      return;
    }
    try {
      await saveItem({
        galleryId: gallery.galleryId,
        itemId: draft.itemId,
        mediaAssetId: draft.mediaAssetId || null,
        externalVideoUrl: draft.externalVideoUrl.trim() || null,
        caption: draft.caption || null,
        sortOrder: draft.sortOrder,
        isActive: draft.isActive,
      }).unwrap();
      toast.success('Item saved.');
      setDraft(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save the item.');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!gallery) return;
    try {
      await deleteItem({ galleryId: gallery.galleryId, itemId }).unwrap();
      toast.success('Item removed.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not remove the item.');
    }
  };

  if (query.isLoading) return <p className="py-6 text-center text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ATMButton variant="primary" size="sm" icon={Plus} onClick={openAdd}>Add item</ATMButton>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          This gallery is empty.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((i) => (
            <div key={i.galleryItemId}
              className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', !i.isActive && 'opacity-60')}>
              {i.mediaAssetId ? (
                <img src={absoluteMediaUrl(`/api/v1/media/${i.mediaAssetId}/file`)} alt={i.caption ?? ''}
                  className="h-20 w-full object-cover" />
              ) : (
                <div className="flex h-20 w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Film className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div className="space-y-1 px-2 py-1.5">
                <p className="truncate text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  {i.caption || (i.externalVideoUrl ? 'External video' : 'Untitled')}
                </p>
                <div className="flex items-center justify-between">
                  {!i.isActive
                    ? <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-amber-600"><EyeOff className="h-2.5 w-2.5" />Hidden</span>
                    : <ATMBadge color="default" label={`#${i.sortOrder}`} />}
                  <button type="button" onClick={() => { void removeItem(i.galleryItemId); }}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    aria-label="Remove item">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ATMModal isOpen={!!draft} onClose={() => setDraft(null)} title="Add gallery item" size="md">
        {draft && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hosted photo or clip</label>
              {draft.mediaAssetId ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  <img src={absoluteMediaUrl(`/api/v1/media/${draft.mediaAssetId}/file`)} alt=""
                    className="h-14 w-20 rounded object-cover" />
                  <button type="button" onClick={() => setDraft({ ...draft, mediaAssetId: '' })}
                    className="text-xs text-gray-500 hover:underline">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => setPickerOpen(true)}
                  className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 hover:border-accent-400 dark:border-gray-600">
                  Choose from the media library
                </button>
              )}
            </div>
            <ATMTextField name="externalVideoUrl" label="or an external video URL"
              value={draft.externalVideoUrl}
              onChange={(e) => setDraft({ ...draft, externalVideoUrl: e.target.value })}
              helperText="Use this for anything too long to host here." />
            <ATMTextField name="caption" label="Caption" value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
            <ATMTextField name="sortOrder" label="Order" type="number" value={String(draft.sortOrder)}
              onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })} />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300" />
              Shown in the gallery
            </label>
            <div className="flex justify-end gap-2">
              <ATMButton variant="ghost" onClick={() => setDraft(null)}>Cancel</ATMButton>
              <ATMButton variant="primary" onClick={() => { void save(); }} isLoading={saveState.isLoading}>Save</ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => draft && setDraft({ ...draft, mediaAssetId: asset.assetId })}
        defaultFolder="galleries"
        imagesOnly={false}
        title="Choose a photo or clip"
      />
    </div>
  );
}

export default GalleriesPage;
