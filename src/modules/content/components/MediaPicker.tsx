import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Search, ImageOff, Check } from 'lucide-react';

import { ATMButton, ATMModal, ATMTextField, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import {
  useGetMediaAssetsQuery,
  useGetMediaFoldersQuery,
  uploadMediaAsset,
  absoluteMediaUrl,
  mediaApi,
  type MediaAsset,
} from '../services/mediaApi';
import { useAppDispatch } from '@/app/hooks';

/**
 * 2026-09-05 (content Phase 1). The ONE way any screen picks an image.
 *
 * Built as a shared primitive on purpose: Phase 3 adds testimonials, announcements, clientele
 * and galleries, and each of those needs exactly this. Writing a fifth bespoke image field is
 * how the portal ended up with two finished upload components that nothing imported.
 */
export interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  /** Pre-select this folder and upload into it, e.g. "blog". */
  defaultFolder?: string;
  /** Hide video, for fields that can only hold a still image. */
  imagesOnly?: boolean;
  title?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  open,
  onClose,
  onSelect,
  defaultFolder = 'general',
  imagesOnly = true,
  title = 'Choose an image',
}) => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page: 1,
      pageSize: 60,
      search: search.trim() || undefined,
      folder: folder || undefined,
      videosOnly: imagesOnly ? false : undefined,
    }),
    [search, folder, imagesOnly],
  );

  const listQuery = useGetMediaAssetsQuery(params, { skip: !open });
  const foldersQuery = useGetMediaFoldersQuery(undefined, { skip: !open });

  const assets = listQuery.data?.data ?? [];
  const folders = foldersQuery.data?.data ?? [];

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMediaAsset(file, { folder: folder || defaultFolder });
      dispatch(mediaApi.util.invalidateTags(['Media']));
      setSelected(asset.assetId);
      toast.success(`${asset.fileName} uploaded.`);
    } catch (err: any) {
      // The API explains exactly why (wrong type, too large, bad folder). Show that, never a
      // generic "upload failed" that leaves the operator guessing.
      toast.error(err?.data?.message || err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const confirm = () => {
    const asset = assets.find((a) => a.assetId === selected);
    if (!asset) {
      toast.error('Select an image first.');
      return;
    }
    onSelect(asset);
    onClose();
  };

  return (
    <ATMModal isOpen={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name, alt text or caption"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-700">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              className="hidden"
              accept={imagesOnly ? 'image/png,image/jpeg,image/gif,image/webp' : undefined}
              disabled={uploading}
              onChange={(e) => { void handleUpload(e.target.files?.[0] ?? null); e.target.value = ''; }}
            />
          </label>
        </div>

        {listQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="110px" />)}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ImageOff className="h-7 w-7" />
            <p>{search || folder ? 'Nothing matches that filter.' : 'The library is empty. Upload the first image.'}</p>
          </div>
        ) : (
          <div className="grid max-h-[380px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
            {assets.map((a) => (
              <button
                key={a.assetId}
                type="button"
                onClick={() => setSelected(a.assetId)}
                className={cn(
                  'group relative overflow-hidden rounded-lg border-2 bg-gray-50 text-left transition-colors dark:bg-gray-900',
                  selected === a.assetId
                    ? 'border-accent-500'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                {a.isVideo ? (
                  <video src={absoluteMediaUrl(a.url)} className="h-24 w-full object-cover" muted />
                ) : (
                  <img
                    src={absoluteMediaUrl(a.url)}
                    alt={a.altText ?? a.fileName}
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                )}
                {selected === a.assetId && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-600 p-1 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <span className="block truncate px-2 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  {a.fileName}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <ATMButton variant="ghost" onClick={onClose}>Cancel</ATMButton>
          <ATMButton variant="primary" onClick={confirm} disabled={!selected}>Use this image</ATMButton>
        </div>
      </div>
    </ATMModal>
  );
};
