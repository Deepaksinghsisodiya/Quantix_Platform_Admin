import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Search, ImageOff, Trash2, AlertTriangle, Film, Images } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextField, ATMSelectField, ATMBadge } from '@/shared/ui';
import { useAppDispatch } from '@/app/hooks';
import { formatDate } from '@/lib/utils/formatDate';
import {
  useGetMediaAssetsQuery,
  useGetMediaFoldersQuery,
  useUpdateMediaAssetMutation,
  useDeleteMediaAssetMutation,
  uploadMediaAsset,
  absoluteMediaUrl,
  mediaApi,
  type MediaAsset,
} from '../services/mediaApi';

/**
 * Media Library — 2026-09-05 (content Phase 1).
 *
 * The platform had no media store at all before this: every content image was a URL the operator
 * had to host somewhere else. Files now live on the hosting server's own disk and are managed
 * here. Page title matches the sidebar label verbatim.
 */

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaLibraryPage() {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [form, setForm] = useState({ altText: '', caption: '', folder: '' });

  const params = useMemo(
    () => ({ page: 1, pageSize: 100, search: search.trim() || undefined, folder: folder || undefined }),
    [search, folder],
  );

  const listQuery = useGetMediaAssetsQuery(params);
  const foldersQuery = useGetMediaFoldersQuery();
  const [updateAsset, updateState] = useUpdateMediaAssetMutation();
  const [deleteAsset, deleteState] = useDeleteMediaAssetMutation();

  const assets = listQuery.data?.data ?? [];
  const folders = foldersQuery.data?.data ?? [];

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMediaAsset(file, { folder: folder || 'general' });
      dispatch(mediaApi.util.invalidateTags(['Media']));
      toast.success(`${asset.fileName} uploaded.`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const openEditor = (asset: MediaAsset) => {
    setEditing(asset);
    setForm({ altText: asset.altText ?? '', caption: asset.caption ?? '', folder: asset.folder });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateAsset({
        assetId: editing.assetId,
        altText: form.altText,
        caption: form.caption,
        folder: form.folder,
      }).unwrap();
      toast.success('Saved.');
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save the changes.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res: any = await deleteAsset(deleteTarget.assetId).unwrap();
      // The API reports the file separately from the row: if the row went but the bytes did not,
      // say so rather than claiming a clean delete.
      if (res?.data?.fileRemoved === false) {
        toast.warning(res.data.warning ?? 'Removed from the library, but the file is still on disk.');
      } else {
        toast.success(`${deleteTarget.fileName} deleted.`);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      // The commonest case is "still used by a blog post", and the message names which.
      toast.error(err?.data?.message || 'Could not delete this file.');
    }
  };

  const isError = listQuery.isError;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title="Media Library"
        subtitle="Images and clips hosted by the platform for website content."
        icon={Images}
        iconColor="theme"
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not load the media library.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void listQuery.refetch(); }}>Retry</ATMButton>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ATMTextField
          name="search"
          className="flex-1"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by file name, alt text or caption"
        />
        <ATMSelectField
          name="folder"
          className="sm:w-56"
          value={folder}
          onChange={(v) => setFolder(String(v ?? ''))}
          options={[
            { value: '', label: 'All folders' },
            ...folders.map((f) => ({ value: f, label: f })),
          ]}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-700">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { void handleUpload(e.target.files?.[0] ?? null); e.target.value = ''; }}
          />
        </label>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        PNG, JPEG, GIF and WebP images up to 10 MB; MP4 and WebM clips up to 100 MB. The file type
        is checked from the file itself, not its name. SVG is not accepted because it can carry
        script and these files are served from the API&apos;s own address.
      </p>

      <ATMCard>
        {listQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="140px" />)}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ImageOff className="h-8 w-8" />
            <p>{search || folder ? 'Nothing matches that filter.' : 'No files yet. Upload the first one.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {assets.map((a) => (
              <div key={a.assetId} className="group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => openEditor(a)} className="block w-full bg-slate-50 dark:bg-[#13151a]">
                  {a.isVideo ? (
                    <div className="relative">
                      <video src={absoluteMediaUrl(a.url)} className="h-28 w-full object-cover" muted />
                      <Film className="absolute right-2 top-2 h-4 w-4 text-white drop-shadow" />
                    </div>
                  ) : (
                    <img
                      src={absoluteMediaUrl(a.url)}
                      alt={a.altText ?? a.fileName}
                      className="h-28 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="space-y-1 px-2.5 py-2">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{a.fileName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {a.width && a.height ? `${a.width}×${a.height} · ` : ''}{humanSize(a.sizeBytes)} · {a.folder}
                  </p>
                  {/* Alt text is an accessibility requirement, so its absence is surfaced rather
                      than left for someone to notice on the live site. */}
                  {!a.altText && !a.isVideo && (
                    <ATMBadge color="warning" label="No alt text" />
                  )}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-slate-400">{formatDate(a.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(a)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      aria-label={`Delete ${a.fileName}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ATMCard>

      <ATMModal isOpen={!!editing} onClose={() => setEditing(null)} title={editing?.fileName ?? ''} size="md">
        {editing && (
          <div className="space-y-4">
            {editing.isVideo ? (
              <video src={absoluteMediaUrl(editing.url)} controls className="max-h-56 w-full rounded-lg bg-black" />
            ) : (
              <img src={absoluteMediaUrl(editing.url)} alt={editing.altText ?? ''} className="max-h-56 w-full rounded-lg object-contain" />
            )}
            <ATMTextField
              name="altText"
              label="Alt text"
              value={form.altText}
              onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
              helperText="Describes the image for screen readers and when it fails to load."
            />
            <ATMTextField
              name="caption"
              label="Caption (optional)"
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            />
            <ATMTextField
              name="folder"
              label="Folder"
              value={form.folder}
              onChange={(e) => setForm((f) => ({ ...f, folder: e.target.value }))}
              helperText="Letters, digits, hyphen or underscore. Used only to group files here."
            />
            <div className="flex justify-end gap-2">
              <ATMButton variant="ghost" onClick={() => setEditing(null)}>Cancel</ATMButton>
              <ATMButton variant="primary" onClick={() => { void saveEdit(); }} isLoading={updateState.isLoading}>
                Save
              </ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      <ATMModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete this file?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {deleteTarget?.fileName} will be removed from the library and from the server&apos;s disk.
            If any published content still uses it the delete is refused and you will be told where.
          </p>
          <div className="flex justify-end gap-2">
            <ATMButton variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</ATMButton>
            <ATMButton variant="danger" onClick={() => { void confirmDelete(); }} isLoading={deleteState.isLoading}>
              Delete
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}

export default MediaLibraryPage;
