import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, LayoutTemplate, AlertTriangle } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMBadge, ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextArea, ATMTextField } from '@/shared/ui';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatDate } from '@/lib/utils/formatDate';
import {
  TEMPLATE_KIND_LABEL,
  useGetArticleTemplatesQuery,
  useCreateArticleTemplateMutation,
  useUpdateArticleTemplateMutation,
  useDeleteArticleTemplateMutation,
  type ArticleTemplate,
  type ArticleTemplateKind,
} from '../services/templatesApi';

/**
 * Article Templates — 2026-09-08 (content Phase 4).
 *
 * The skeleton a writer starts a blog post or help article from: the headings a release note,
 * a how-to or a case study always opens with, kept as content the Content Manager edits rather
 * than remembered by each writer. The blog and help editors offer these in a "Start from a
 * template" picker. Page title matches the sidebar label verbatim.
 */

interface Draft {
  templateId: string;
  name: string;
  description: string;
  kind: ArticleTemplateKind;
  titlePattern: string;
  body: string;
  excerpt: string;
  tags: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY: Draft = {
  templateId: '',
  name: '',
  description: '',
  kind: 'Any',
  titlePattern: '',
  body: '',
  excerpt: '',
  tags: '',
  sortOrder: 0,
  isActive: true,
};

const KINDS: readonly ArticleTemplateKind[] = ['Any', 'Blog', 'HelpArticle'];

function ArticleTemplatesPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleTemplate | null>(null);

  const listQuery = useGetArticleTemplatesQuery({ includeInactive: true });
  const [createTemplate, createState] = useCreateArticleTemplateMutation();
  const [updateTemplate, updateState] = useUpdateArticleTemplateMutation();
  const [deleteTemplate, deleteState] = useDeleteArticleTemplateMutation();

  const templates = useMemo(
    () => [...(listQuery.data?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [listQuery.data],
  );

  const openEdit = (t: ArticleTemplate) =>
    setDraft({
      templateId: t.templateId,
      name: t.name,
      description: t.description ?? '',
      kind: t.kind,
      titlePattern: t.titlePattern ?? '',
      body: t.body,
      excerpt: t.excerpt ?? '',
      tags: t.tags ?? '',
      sortOrder: t.sortOrder,
      isActive: t.isActive,
    });

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { toast.error('A template needs a name.'); return; }
    if (!draft.body.trim()) { toast.error('A template needs a body — that is the part a writer starts from.'); return; }
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      kind: draft.kind,
      titlePattern: draft.titlePattern.trim() || null,
      body: draft.body,
      excerpt: draft.excerpt.trim() || null,
      tags: draft.tags.trim() || null,
      sortOrder: draft.sortOrder,
      isActive: draft.isActive,
    };
    try {
      if (draft.templateId) {
        await updateTemplate({ templateId: draft.templateId, ...payload }).unwrap();
        toast.success('Template saved.');
      } else {
        await createTemplate(payload).unwrap();
        toast.success('Template created.');
      }
      setDraft(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The template could not be saved'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate(deleteTarget.templateId).unwrap();
      toast.success('Template deleted. Articles already written from it are unchanged.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The template could not be deleted'));
    }
  };

  const selectClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title="Article Templates"
        subtitle="Starting points for blog posts and help articles: the headings and placeholder text a writer begins from."
        action={{ label: 'New Template', onClick: () => setDraft(EMPTY), icon: Plus }}
      />

      {listQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Templates could not be loaded.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void listQuery.refetch(); }}>Retry</ATMButton>
        </div>
      )}

      {listQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <ATMSkeleton key={i} variant="rect" height="72px" />)}
        </div>
      ) : templates.length === 0 ? (
        <ATMCard padding="lg">
          <div className="py-8 text-center">
            <LayoutTemplate className="mx-auto h-9 w-9 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">No templates yet.</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Create one for each kind of article you publish often — a release note, a how-to, a case study.
            </p>
            <ATMButton variant="primary" size="sm" className="mt-4" onClick={() => setDraft(EMPTY)}>Create the first template</ATMButton>
          </div>
        </ATMCard>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                {['Name', 'Used by', 'Description', 'Status', 'Updated', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {templates.map((t) => (
                <tr key={t.templateId} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t.name}</p>
                    {t.titlePattern && <p className="text-[11px] text-gray-400">Title starts: “{t.titlePattern}”</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{TEMPLATE_KIND_LABEL[t.kind]}</td>
                  <td className="max-w-md px-4 py-3 text-gray-600 dark:text-gray-400">
                    <p className="line-clamp-2">{t.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ATMBadge variant={t.isActive ? 'success' : 'default'} size="sm">{t.isActive ? 'Available' : 'Hidden'}</ATMBadge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-gray-500 dark:text-gray-400">{formatDate(t.updatedAt ?? t.createdAt, 'short')}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <ATMButton variant="ghost" size="sm" onClick={() => openEdit(t)} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></ATMButton>
                      <ATMButton variant="ghost" size="sm" onClick={() => setDeleteTarget(t)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5 text-red-500" /></ATMButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ATMModal isOpen={!!draft} onClose={() => setDraft(null)} title={draft?.templateId ? 'Edit template' : 'New template'} size="2xl">
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ATMTextField name="name" label="Name" value={draft.name} onChange={(e) => update('name', e.target.value)} placeholder="Release note" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Used by</label>
                <select value={draft.kind} onChange={(e) => update('kind', e.target.value as ArticleTemplateKind)} className={selectClass}>
                  {KINDS.map((k) => <option key={k} value={k}>{TEMPLATE_KIND_LABEL[k]}</option>)}
                </select>
              </div>
            </div>
            <ATMTextField
              name="description"
              label="When to use it"
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="For announcing a new version: what changed, what to do, known issues."
            />
            <ATMTextField
              name="titlePattern"
              label="Starting title"
              value={draft.titlePattern}
              onChange={(e) => update('titlePattern', e.target.value)}
              helperText="Optional. Copied into the title box when the template is picked, e.g. “Release notes – version ”."
            />
            <ATMTextArea
              name="body"
              label="Body (Markdown)"
              value={draft.body}
              onChange={(e) => update('body', e.target.value)}
              rows={14}
              placeholder={'## What changed\n\n## What you need to do\n\n## Known issues'}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ATMTextField name="excerpt" label="Excerpt (blog posts)" value={draft.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
              <ATMTextField name="tags" label="Tags" value={draft.tags} onChange={(e) => update('tags', e.target.value)} helperText="Comma-separated." />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={draft.isActive} onChange={(e) => update('isActive', e.target.checked)} />
                Offered in the editors
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                Order
                <input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => update('sortOrder', Number(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <ATMButton variant="secondary" size="sm" onClick={() => setDraft(null)}>Cancel</ATMButton>
              <ATMButton variant="primary" size="sm" loading={createState.isLoading || updateState.isLoading} onClick={() => { void save(); }}>
                {draft.templateId ? 'Save' : 'Create'}
              </ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      <ATMModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete this template?" size="sm">
        {deleteTarget && (
          <div className="space-y-4 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              “{deleteTarget.name}” will no longer be offered in the editors. Articles already written from it keep their text.
            </p>
            <div className="flex justify-end gap-2">
              <ATMButton variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</ATMButton>
              <ATMButton variant="danger" size="sm" loading={deleteState.isLoading} onClick={() => { void confirmDelete(); }}>Delete</ATMButton>
            </div>
          </div>
        )}
      </ATMModal>
    </div>
  );
}

export default ArticleTemplatesPage;
