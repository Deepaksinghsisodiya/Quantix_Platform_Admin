import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  Search,
  X,
  ImageOff,
  Trash2,
  AlertTriangle,
  Film,
  Images,
  Image as ImageIcon,
  Copy,
  Check,
  Folder,
  HardDrive,
  ExternalLink,
  Edit2,
  FileCheck,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import {
  ATMButton,
  ATMCard,
  ATMModal,
  ATMSkeleton,
  ATMTextField,
  ATMSelectField,
  ATMBadge,
} from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';

import { useAppDispatch } from '@/app/hooks';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';
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

function humanSize(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaLibraryPage() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [form, setForm] = useState({ altText: '', caption: '', folder: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page: 1,
      pageSize: 100,
      search: search.trim() || undefined,
      folder: folder || undefined,
    }),
    [search, folder],
  );

  const listQuery = useGetMediaAssetsQuery(params);
  const foldersQuery = useGetMediaFoldersQuery();
  const [updateAsset, updateState] = useUpdateMediaAssetMutation();
  const [deleteAsset, deleteState] = useDeleteMediaAssetMutation();

  const assets = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const folders = useMemo(() => foldersQuery.data?.data ?? [], [foldersQuery.data]);

  // Telemetry counts
  const totalCount = assets.length;
  const imageCount = useMemo(() => assets.filter((a) => !a.isVideo).length, [assets]);
  const videoCount = useMemo(() => assets.filter((a) => a.isVideo).length, [assets]);
  const totalSizeBytes = useMemo(() => assets.reduce((acc, a) => acc + (a.sizeBytes || 0), 0), [assets]);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMediaAsset(file, { folder: folder || 'general' });
      dispatch(mediaApi.util.invalidateTags(['Media']));
      toast.success(`"${asset.fileName}" uploaded to library.`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = absoluteMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Media URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditor = (asset: MediaAsset) => {
    setEditing(asset);
    setForm({
      altText: asset.altText ?? '',
      caption: asset.caption ?? '',
      folder: asset.folder || 'general',
    });
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
      toast.success('Asset metadata updated.');
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save changes.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res: any = await deleteAsset(deleteTarget.assetId).unwrap();
      if (res?.data?.fileRemoved === false) {
        toast.warning(res.data.warning ?? 'Removed from the library, but the file is still on disk.');
      } else {
        toast.success(`"${deleteTarget.fileName}" deleted.`);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not delete this file. It may be currently linked in content.');
    }
  };

  const isError = listQuery.isError;

  const columns = useMemo<ATMTableColumn<MediaAsset>[]>(
    () => [
      {
        key: 'fileName',
        header: 'File Name & Preview',
        renderCell: (val, row) => (
          <div className="flex items-center gap-3 max-w-sm">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
              {row.isVideo ? (
                <div className="relative h-full w-full bg-slate-900 flex items-center justify-center">
                  <Film className="h-5 w-5 text-white" />
                </div>
              ) : (
                <img
                  src={absoluteMediaUrl(row.url)}
                  alt={row.altText ?? row.fileName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="min-w-0">
              <span className="block truncate font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {row.fileName}
              </span>
              <span className="block text-xs text-slate-400 dark:text-slate-500 truncate">
                {row.altText || (
                  <span className="text-amber-500 font-medium">Missing alt text</span>
                )}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'folder',
        header: 'Folder',
        renderCell: (val, row) => (
          <ATMBadge variant="outline" size="sm" className="font-medium bg-slate-50 dark:bg-slate-800/60">
            {row.folder || 'general'}
          </ATMBadge>
        ),
      },
      {
        key: 'sizeBytes',
        header: 'Dimensions & Size',
        renderCell: (val, row) => (
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-mono">{humanSize(row.sizeBytes)}</span>
            {row.width && row.height ? (
              <span className="text-slate-400 block font-mono text-[11px]">{row.width}×{row.height}px</span>
            ) : null}
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Uploaded',
        renderCell: (val, row) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {formatDate(row.createdAt, 'short')}
          </span>
        ),
      },
    ],
    [],
  );

  const rowActions = useMemo(
    () => (row: MediaAsset): RowAction<MediaAsset>[] => [
      {
        label: 'Copy URL',
        icon: Copy,
        onClick: (r) => handleCopyUrl(r.url, r.assetId),
      },
      {
        label: 'Edit Details',
        icon: Edit2,
        onClick: (r) => openEditor(r),
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: (r) => setDeleteTarget(r),
      },
    ],
    [],
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Header */}
      <ATMPageHeader
        title="Media & Assets Library"
        subtitle="Manage images, logos, banners, and video clips hosted for the Quantix public websites."
        icon={Images}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/media' },
          { label: 'Media Library' },
        ]}
      />

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ATMStatsCard
          label="Total Files"
          value={totalCount}
          description="All media assets"
          icon={Images}
          variant="accent"
        />
        <ATMStatsCard
          label="Images"
          value={imageCount}
          description="PNG, JPG, WebP, GIF"
          icon={ImageIcon}
          variant="emerald"
        />
        <ATMStatsCard
          label="Video Clips"
          value={videoCount}
          description="MP4 & WebM assets"
          icon={Film}
          variant="indigo"
        />
        <ATMStatsCard
          label="Storage Used"
          value={humanSize(totalSizeBytes)}
          description="Disk footprint"
          icon={HardDrive}
          variant="amber"
        />
      </div>

      {/* Toolbar & Upload Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full">
          {/* Search Box */}
          <div className="w-full sm:w-80">
            <ATMTextField
              name="search"
              size="sm"
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search file name, alt text or caption..."
              rightIcon={
                search ? (
                  <button type="button" onClick={() => setSearch('')} className="cursor-pointer text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Folder Filter */}
          <div className="w-full sm:w-56">
            <ATMSelectField
              name="folder"
              size="sm"
              value={folder}
              onChange={(v) => setFolder(String(v ?? ''))}
              options={[
                { value: '', label: 'All Folders' },
                ...folders.map((f) => ({ value: f, label: f })),
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {/* Upload Button */}
          <label className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-700 active:scale-95',
            uploading && 'opacity-60 pointer-events-none'
          )}>
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'Uploading File…' : 'Upload Asset'}</span>
            <input
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void handleUpload(e.target.files?.[0] ?? null);
                e.target.value = '';
              }}
            />
          </label>

          {/* View Mode Toggle */}
          <ATMViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Could not load media library. Verify connection or disk permissions.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void listQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Content Rendering */}
      {listQuery.isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                <ATMSkeleton variant="rect" height="130px" className="rounded-xl" />
                <ATMSkeleton variant="text" width="70%" />
                <ATMSkeleton variant="text" width="40%" />
              </div>
            ))}
          </div>
        ) : (
          <ATMCard padding="none" className="overflow-hidden rounded-2xl">
            <ATMTable columns={columns} data={[]} isLoading={true} emptyMessage="Loading media..." />
          </ATMCard>
        )
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-3 border border-primary-100 dark:border-primary-900/50">
            <ImageOff className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No media assets found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search || folder
              ? 'No media matches your search query or folder filter.'
              : 'Upload your first image, icon, or video to start building the media vault.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((a) => (
            <div
              key={a.assetId}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-500/40 dark:border-slate-800/80 dark:bg-slate-900/90"
            >
              {/* Media Thumbnail */}
              <div className="relative h-36 w-full bg-slate-950/5 dark:bg-slate-950/40 overflow-hidden">
                {a.isVideo ? (
                  <div className="relative h-full w-full">
                    <video
                      src={absoluteMediaUrl(a.url)}
                      className="h-full w-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Film className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={absoluteMediaUrl(a.url)}
                    alt={a.altText ?? a.fileName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(a.url, a.assetId)}
                    className="h-8 w-8 rounded-lg bg-white/90 text-slate-900 hover:bg-white flex items-center justify-center transition-transform hover:scale-110 shadow"
                    title="Copy URL"
                  >
                    {copiedId === a.assetId ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor(a)}
                    className="h-8 w-8 rounded-lg bg-white/90 text-slate-900 hover:bg-white flex items-center justify-center transition-transform hover:scale-110 shadow"
                    title="Edit Details"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(a)}
                    className="h-8 w-8 rounded-lg bg-red-600/90 text-white hover:bg-red-600 flex items-center justify-center transition-transform hover:scale-110 shadow"
                    title="Delete File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Alt text missing warning badge */}
                {!a.altText && !a.isVideo && (
                  <div className="absolute top-2 left-2">
                    <span className="rounded-md bg-amber-500/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                      No Alt
                    </span>
                  </div>
                )}
                {/* Folder badge */}
                <div className="absolute bottom-2 right-2">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-medium text-white shadow-xs">
                    {a.folder || 'general'}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 space-y-1.5">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100" title={a.fileName}>
                  {a.fileName}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{humanSize(a.sizeBytes)}</span>
                  <span>{a.width && a.height ? `${a.width}×${a.height}` : 'Vector/Clip'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ATMCard padding="none" className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <ATMTable
            columns={columns}
            data={assets}
            isLoading={listQuery.isLoading}
            rowActions={rowActions}
            emptyMessage="No media assets found."
            density="comfortable"
          />
        </ATMCard>
      )}

      {/* Edit Metadata Modal */}
      <ATMModal isOpen={!!editing} onClose={() => setEditing(null)} title={editing?.fileName ?? 'Asset Metadata'} size="md">
        {editing && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center max-h-56">
              {editing.isVideo ? (
                <video src={absoluteMediaUrl(editing.url)} controls className="max-h-52 w-full object-contain" />
              ) : (
                <img src={absoluteMediaUrl(editing.url)} alt={editing.altText ?? ''} className="max-h-52 w-full object-contain p-2" />
              )}
            </div>
            <ATMTextField
              name="altText"
              label="Alt Text (SEO & Accessibility)"
              value={form.altText}
              onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
              helperText="Screen-reader descriptive text for search engines and accessibility."
            />
            <ATMTextField
              name="caption"
              label="Caption / Subtitle (optional)"
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            />
            <ATMTextField
              name="folder"
              label="Folder Category"
              value={form.folder}
              onChange={(e) => setForm((f) => ({ ...f, folder: e.target.value }))}
              helperText="Folder name to group assets (e.g., hero, features, logos)."
            />
            <div className="flex justify-end gap-2 pt-2">
              <ATMButton variant="ghost" onClick={() => setEditing(null)}>Cancel</ATMButton>
              <ATMButton variant="primary" onClick={() => { void saveEdit(); }} isLoading={updateState.isLoading}>
                Save Metadata
              </ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ATMConfirmModal
          isOpen={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete Media Asset"
          description={`Are you sure you want to permanently delete "${deleteTarget.fileName}"? This will delete the file from disk. If active articles link to it, deletion may be rejected.`}
          confirmLabel="Delete File"
          variant="danger"
          isLoading={deleteState.isLoading}
        />
      )}
    </div>
  );
}

export default MediaLibraryPage;
