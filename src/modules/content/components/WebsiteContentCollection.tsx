import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, EyeOff, AlertTriangle, ImageOff, Clock } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextField, ATMBadge } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { MediaPicker } from './MediaPicker';
import { absoluteMediaUrl } from '../services/mediaApi';

/**
 * 2026-09-05 (content Phase 3). ONE list-and-edit screen, configured per content type.
 *
 * Testimonials, announcements, clientele and galleries are the same screen: a list of blocks with
 * a picture, a heading, a position, a published state and an optional visibility window, plus a
 * handful of fields specific to the type. Written four times, those four copies would drift, which
 * is the same reasoning that put the shared columns on one base entity server-side.
 *
 * A page supplies a descriptor: what to call things, which hooks to use, how to read the id and
 * subtitle off a row, and the extra fields to render in the editor.
 */

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'datetime' | 'checkbox';

export interface FieldDescriptor {
  key: string;
  label: string;
  type: FieldType;
  /** For 'select'. The empty-value option is added automatically when not required. */
  options?: ReadonlyArray<{ value: string; label: string }>;
  required?: boolean;
  helperText?: string;
  /** Render this field only when the predicate passes, e.g. event dates only for Kind=Event. */
  showWhen?: (draft: Record<string, any>) => boolean;
}

export interface CollectionDescriptor<TRow> {
  title: string;
  subtitle: string;
  /** Singular noun for buttons and confirmations, e.g. "testimonial". */
  noun: string;
  idOf: (row: TRow) => string;
  /** Secondary line under the heading in the list, e.g. "Jane Doe, Acme". */
  subtitleOf: (row: TRow) => string;
  /** Extra badges for a row, e.g. the announcement kind. */
  badgesOf?: (row: TRow) => string[];
  /** Fields beyond the shared set. */
  fields: readonly FieldDescriptor[];
  /** Defaults for a new record, for the type-specific fields. */
  emptyExtra: Record<string, any>;
  /** Pull the type-specific values off an existing row for editing. */
  extraOf: (row: TRow) => Record<string, any>;
  /** Folder the media picker uploads into. */
  mediaFolder: string;
  /** Set when the type requires an image, e.g. a client logo. */
  imageRequired?: boolean;
}

interface Props<TRow> {
  descriptor: CollectionDescriptor<TRow>;
  rows: readonly TRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSave: (payload: Record<string, any>, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
  /** Rendered under the list, e.g. the gallery's item manager. */
  children?: React.ReactNode;
}

const SHARED_EMPTY = {
  title: '',
  body: '',
  mediaAssetId: '',
  linkUrl: '',
  pageSlug: '',
  sortOrder: 0,
  isActive: true,
  publishFrom: '',
  publishUntil: '',
};

/** An API timestamp trimmed to what a datetime-local input accepts. */
const toLocalInput = (value: string | null | undefined) => (value ? String(value).slice(0, 16) : '');

export function WebsiteContentCollection<TRow extends Record<string, any>>({
  descriptor,
  rows,
  isLoading,
  isError,
  onRetry,
  onSave,
  onDelete,
  isSaving,
  children,
}: Props<TRow>) {
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TRow | null>(null);

  const openCreate = () => {
    setEditingId(undefined);
    setDraft({ ...SHARED_EMPTY, ...descriptor.emptyExtra, sortOrder: rows.length });
  };

  const openEdit = (row: TRow) => {
    setEditingId(descriptor.idOf(row));
    setDraft({
      title: row.title ?? '',
      body: row.body ?? '',
      mediaAssetId: row.mediaAssetId ?? '',
      linkUrl: row.linkUrl ?? '',
      pageSlug: row.pageSlug ?? '',
      sortOrder: row.sortOrder ?? 0,
      isActive: row.isActive ?? true,
      publishFrom: toLocalInput(row.publishFrom),
      publishUntil: toLocalInput(row.publishUntil),
      ...descriptor.extraOf(row),
    });
  };

  const set = (key: string, value: any) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async () => {
    if (!draft) return;
    if (!String(draft.title).trim()) {
      toast.error('A title is required.');
      return;
    }
    if (descriptor.imageRequired && !draft.mediaAssetId) {
      toast.error('Choose an image from the media library.');
      return;
    }
    for (const f of descriptor.fields) {
      if (!f.required) continue;
      if (f.showWhen && !f.showWhen(draft)) continue;
      if (draft[f.key] === '' || draft[f.key] === undefined || draft[f.key] === null) {
        toast.error(`${f.label} is required.`);
        return;
      }
    }

    // Empty strings become nulls: the API treats "" and null differently for optional fields,
    // and an empty date string is not a date at all.
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(draft)) {
      payload[k] = v === '' ? null : v;
    }
    try {
      await onSave(payload, editingId);
      setDraft(null);
    } catch (err: any) {
      toast.error(err?.data?.message || `Could not save this ${descriptor.noun}.`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(descriptor.idOf(deleteTarget));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || `Could not delete this ${descriptor.noun}.`);
    }
  };

  const now = useMemo(() => new Date(), []);
  const windowState = (row: TRow): string | null => {
    const from = row.publishFrom ? new Date(row.publishFrom) : null;
    const until = row.publishUntil ? new Date(row.publishUntil) : null;
    if (from && from > now) return 'Scheduled';
    if (until && until < now) return 'Expired';
    return null;
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title={descriptor.title}
        subtitle={descriptor.subtitle}
        action={{ label: `Add ${descriptor.noun}`, onClick: openCreate, icon: Plus }}
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not load this list.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={onRetry}>Retry</ATMButton>
        </div>
      )}

      <ATMCard>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="68px" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ImageOff className="h-7 w-7" />
            <p>Nothing here yet. Add the first {descriptor.noun}.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => {
              const id = descriptor.idOf(row);
              const state = windowState(row);
              return (
                <div key={id} className={cn('flex items-start gap-3 py-3', !row.isActive && 'opacity-60')}>
                  {row.mediaAssetId ? (
                    <img
                      src={absoluteMediaUrl(`/api/v1/media/${row.mediaAssetId}/file`)}
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
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.title}</span>
                      <ATMBadge color="default" label={`#${row.sortOrder}`} />
                      {(descriptor.badgesOf?.(row) ?? []).map((b) => (
                        <ATMBadge key={b} color="primary" label={b} />
                      ))}
                      {!row.isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                      {/* A block outside its window is invisible to the public even while
                          active, so the list says which, rather than looking broken. */}
                      {state && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                          <Clock className="h-3 w-3" /> {state}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{descriptor.subtitleOf(row)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(row)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label={`Edit ${row.title}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(row)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      aria-label={`Delete ${row.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ATMCard>

      {children}

      <ATMModal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title={editingId ? `Edit ${descriptor.noun}` : `Add ${descriptor.noun}`}
        size="lg"
      >
        {draft && (
          <div className="space-y-4">
            <ATMTextField name="title" label="Title" value={draft.title}
              onChange={(e) => set('title', e.target.value)} />

            {descriptor.fields.map((f) => {
              if (f.showWhen && !f.showWhen(draft)) return null;
              const value = draft[f.key] ?? '';
              if (f.type === 'textarea') {
                return (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{f.label}</label>
                    <textarea rows={4} value={value} onChange={(e) => set(f.key, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                    {f.helperText && <span className="text-[11px] text-gray-400">{f.helperText}</span>}
                  </div>
                );
              }
              if (f.type === 'select') {
                return (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{f.label}</label>
                    <select value={value} onChange={(e) => set(f.key, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                      {!f.required && <option value="">Not set</option>}
                      {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {f.helperText && <span className="text-[11px] text-gray-400">{f.helperText}</span>}
                  </div>
                );
              }
              if (f.type === 'checkbox') {
                return (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={!!draft[f.key]}
                      onChange={(e) => set(f.key, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300" />
                    {f.label}
                  </label>
                );
              }
              return (
                <ATMTextField
                  key={f.key}
                  name={f.key}
                  label={f.label}
                  type={f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                  value={String(value)}
                  onChange={(e) => set(f.key, f.type === 'number' ? (parseInt(e.target.value, 10) || 0) : e.target.value)}
                  helperText={f.helperText}
                />
              );
            })}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Image{descriptor.imageRequired ? '' : ' (optional)'}
              </label>
              {draft.mediaAssetId ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  <img src={absoluteMediaUrl(`/api/v1/media/${draft.mediaAssetId}/file`)} alt=""
                    className="h-14 w-20 rounded object-cover" />
                  <div className="flex flex-1 flex-col gap-1">
                    <button type="button" onClick={() => setPickerOpen(true)}
                      className="text-left text-xs font-semibold text-accent-600 hover:underline">Change image</button>
                    <button type="button" onClick={() => set('mediaAssetId', '')}
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
                onChange={(e) => set('linkUrl', e.target.value)} />
              <ATMTextField name="pageSlug" label="Page" value={draft.pageSlug}
                onChange={(e) => set('pageSlug', e.target.value)}
                helperText="Blank for every page." />
              <ATMTextField name="sortOrder" label="Order" type="number" value={String(draft.sortOrder)}
                onChange={(e) => set('sortOrder', parseInt(e.target.value, 10) || 0)} />
            </div>

            {/* The visibility window. Leaving both blank means "visible while published", which
                is the normal case; a dated promotion switches itself off without anyone
                remembering to. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ATMTextField name="publishFrom" label="Show from (optional)" type="datetime-local"
                value={draft.publishFrom} onChange={(e) => set('publishFrom', e.target.value)} />
              <ATMTextField name="publishUntil" label="Show until (optional)" type="datetime-local"
                value={draft.publishUntil} onChange={(e) => set('publishUntil', e.target.value)} />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={!!draft.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300" />
              Published to the website
            </label>

            <div className="flex justify-end gap-2">
              <ATMButton variant="ghost" onClick={() => setDraft(null)}>Cancel</ATMButton>
              <ATMButton variant="primary" onClick={() => { void save(); }} isLoading={isSaving}>Save</ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => set('mediaAssetId', asset.assetId)}
        defaultFolder={descriptor.mediaFolder}
        imagesOnly
        title="Choose an image"
      />

      <ATMModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        title={`Delete this ${descriptor.noun}?`} size="sm">
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
