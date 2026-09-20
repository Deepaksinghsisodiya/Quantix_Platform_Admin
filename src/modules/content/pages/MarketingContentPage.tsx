import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, EyeOff, AlertTriangle, ImageOff } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextField, ATMBadge } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { MediaPicker } from '../components/MediaPicker';
import { absoluteMediaUrl } from '../services/mediaApi';
import {
  CMS_CONTENT_TYPES,
  CMS_TYPE_LABEL,
  useGetCmsContentByTypeQuery,
  useCreateCmsContentMutation,
  useUpdateCmsContentMutation,
  useDeleteCmsContentMutation,
  type CmsContent,
  type CmsContentType,
} from '../services/cmsApi';

/**
 * Marketing Content — 2026-09-05 (content Phase 2), rebuilt on endpoints that exist.
 *
 * The previous page called `GET /marketing/content/homepage` (400: "homepage" is not a
 * CmsContentType) and saved with `PUT /marketing/content` (405: only POST, and PUT by id, exist).
 * It was dead in both directions, which is why hero banners, testimonials and case studies could
 * not be edited anywhere in the portal. It also rendered a hardcoded list of eight sections and
 * dropped anything the API returned that was not in that list.
 *
 * This works the way the data actually does: seven content types, many blocks per type, each with
 * a title, body, image, link, order and published flag.
 *
 * Page title matches the sidebar label verbatim.
 */

interface Draft {
  contentId: string;
  contentType: CmsContentType;
  title: string;
  body: string;
  linkUrl: string;
  imageAssetId: string;
  imageUrl: string;
  pageSlug: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyDraft = (type: CmsContentType): Draft => ({
  contentId: '',
  contentType: type,
  title: '',
  body: '',
  linkUrl: '',
  imageAssetId: '',
  imageUrl: '',
  pageSlug: '',
  sortOrder: 0,
  isActive: true,
});

function MarketingContentPage() {
  const [type, setType] = useState<CmsContentType>('HeroBanner');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsContent | null>(null);

  // Staff see inactive blocks; the public endpoint hides them (Phase 0).
  const listQuery = useGetCmsContentByTypeQuery(type);
  const [createContent, createState] = useCreateCmsContentMutation();
  const [updateContent, updateState] = useUpdateCmsContentMutation();
  const [deleteContent] = useDeleteCmsContentMutation();

  const blocks = useMemo(
    () => [...(listQuery.data?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [listQuery.data],
  );

  const openEdit = (b: CmsContent) =>
    setDraft({
      contentId: b.contentId,
      contentType: b.contentType,
      title: b.title,
      body: b.body ?? '',
      linkUrl: b.linkUrl ?? '',
      imageAssetId: b.imageAssetId ?? '',
      imageUrl: b.imageUrl ?? '',
      pageSlug: b.pageSlug ?? '',
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error('A title is required.');
      return;
    }
    const payload = {
      title: draft.title.trim(),
      body: draft.body || null,
      linkUrl: draft.linkUrl || null,
      imageAssetId: draft.imageAssetId || null,
      imageUrl: draft.imageUrl || null,
      pageSlug: draft.pageSlug || null,
      sortOrder: draft.sortOrder,
      isActive: draft.isActive,
    };
    try {
      if (draft.contentId) {
        await updateContent({ contentId: draft.contentId, ...payload }).unwrap();
        toast.success('Saved.');
      } else {
        await createContent({ contentType: draft.contentType, locale: 'en', ...payload }).unwrap();
        toast.success('Block added.');
      }
      setDraft(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save this block.');
    }
  };

  const togglePublished = async (b: CmsContent) => {
    try {
      await updateContent({
        contentId: b.contentId,
        title: b.title,
        body: b.body,
        linkUrl: b.linkUrl,
        imageUrl: b.imageUrl,
        imageAssetId: b.imageAssetId,
        pageSlug: b.pageSlug,
        sortOrder: b.sortOrder,
        isActive: !b.isActive,
      }).unwrap();
      toast.success(b.isActive ? 'Hidden from the website.' : 'Published to the website.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not change the published state.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContent(deleteTarget.contentId).unwrap();
      toast.success('Block deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not delete this block.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title="Marketing Content"
        subtitle="Blocks the public website renders: banners, feature highlights, case studies and more. Testimonials have their own page."
        action={{ label: `Add ${CMS_TYPE_LABEL[type]}`, onClick: () => setDraft(emptyDraft(type)), icon: Plus }}
      />

      {listQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not load this content type.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void listQuery.refetch(); }}>Retry</ATMButton>
        </div>
      )}

      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
        {CMS_CONTENT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              type === t
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
            )}
          >
            {CMS_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <ATMCard>
        {listQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="72px" />)}
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ImageOff className="h-7 w-7" />
            <p>No {CMS_TYPE_LABEL[type].toLowerCase()} blocks yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {blocks.map((b) => (
              <div key={b.contentId} className={cn('flex items-start gap-3 py-3', !b.isActive && 'opacity-60')}>
                {b.imageAssetId ? (
                  <img
                    src={absoluteMediaUrl(`/api/v1/media/${b.imageAssetId}/file`)}
                    alt=""
                    className="h-12 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                    <ImageOff className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{b.title}</span>
                    <ATMBadge color="default" label={`#${b.sortOrder}`} />
                    {b.pageSlug && <ATMBadge color="primary" label={b.pageSlug} />}
                    {!b.isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                        <EyeOff className="h-3 w-3" /> Hidden
                      </span>
                    )}
                  </div>
                  {b.body && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{b.body}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { void togglePublished(b); }}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={b.isActive ? 'Hide' : 'Publish'}>
                    <EyeOff className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => openEdit(b)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={`Edit ${b.title}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(b)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    aria-label={`Delete ${b.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ATMCard>

      <ATMModal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.contentId ? `Edit ${CMS_TYPE_LABEL[draft.contentType]}` : `Add ${CMS_TYPE_LABEL[type]}`}
        size="lg"
      >
        {draft && (
          <div className="space-y-4">
            <ATMTextField
              name="title"
              label="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Body</label>
              <textarea
                rows={5}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Image</label>
              {draft.imageAssetId ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  <img src={absoluteMediaUrl(`/api/v1/media/${draft.imageAssetId}/file`)} alt=""
                    className="h-14 w-20 rounded object-cover" />
                  <div className="flex flex-1 flex-col gap-1">
                    <button type="button" onClick={() => setPickerOpen(true)}
                      className="text-left text-xs font-semibold text-accent-600 hover:underline">Change image</button>
                    <button type="button" onClick={() => setDraft({ ...draft, imageAssetId: '' })}
                      className="text-left text-xs text-gray-500 hover:underline">Remove</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setPickerOpen(true)}
                  className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 hover:border-accent-400 hover:text-accent-600 dark:border-gray-600">
                  Choose from the media library
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ATMTextField name="linkUrl" label="Link URL" value={draft.linkUrl}
                onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value })} />
              <ATMTextField name="pageSlug" label="Page" value={draft.pageSlug}
                onChange={(e) => setDraft({ ...draft, pageSlug: e.target.value })}
                helperText="Which page renders it. Blank for all." />
              <ATMTextField name="sortOrder" label="Order" type="number" value={String(draft.sortOrder)}
                onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })} />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300" />
              Published to the website
            </label>

            <div className="flex justify-end gap-2">
              <ATMButton variant="ghost" onClick={() => setDraft(null)}>Cancel</ATMButton>
              <ATMButton variant="primary" onClick={() => { void save(); }}
                isLoading={createState.isLoading || updateState.isLoading}>Save</ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => draft && setDraft({ ...draft, imageAssetId: asset.assetId })}
        defaultFolder="marketing"
        imagesOnly
        title="Choose an image"
      />

      <ATMModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete this block?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &ldquo;{deleteTarget?.title}&rdquo; will stop appearing on the website.
          </p>
          <div className="flex justify-end gap-2">
            <ATMButton variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</ATMButton>
            <ATMButton variant="danger" onClick={() => { void confirmDelete(); }}>Delete</ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}

export default MarketingContentPage;
