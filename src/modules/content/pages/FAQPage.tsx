import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, ChevronDown, ChevronUp, Trash2, Pencil, AlertTriangle, GripVertical, EyeOff, HelpCircle } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextField, ATMBadge, ATMTextArea, ATMSelectField } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { FAQ } from '@/lib/types';
import {
  useGetFaqsQuery,
  useGetFaqCategoriesQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
} from '../services/contentApi';

/**
 * FAQ — 2026-09-05 (content Phase 2), rebuilt on the API.
 *
 * What this replaces: a page that made ZERO network calls. It rendered twelve FAQ objects
 * written into the source file, with invented answers about SLA times, a dedicated Slack channel
 * and volume discount tiers. Add and delete mutated a `useState` array, so an edit survived
 * until the next refresh and never reached anyone. Its drag handle carried the comment
 * "visual only", and Edit opened a toast saying "coming soon".
 *
 * The Content Manager dashboard, meanwhile, showed the REAL server count next to a link to this
 * page. With forty FAQs in the database the tile said forty and the page showed the same twelve
 * invented ones.
 *
 * Page title matches the sidebar label verbatim.
 */

const ALL = '__all__';

interface DraftFaq {
  question: string;
  answer: string;
  category: string;
  merchantType: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_DRAFT: DraftFaq = {
  question: '',
  answer: '',
  category: '',
  merchantType: '',
  sortOrder: 0,
  isActive: true,
};

function FAQPage() {
  const [category, setCategory] = useState<string>(ALL);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<DraftFaq>(EMPTY_DRAFT);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  // Staff see inactive FAQs so they can switch one back on; the public endpoint hides them.
  const faqsQuery = useGetFaqsQuery({});
  const categoriesQuery = useGetFaqCategoriesQuery();
  const [createFaq, createState] = useCreateFaqMutation();
  const [updateFaq, updateState] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();
  const [reorderFaqs] = useReorderFaqsMutation();

  const faqs = faqsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];

  const visible = useMemo(
    () => (category === ALL ? faqs : faqs.filter((f) => f.category === category)),
    [faqs, category],
  );

  const openCreate = () => {
    setDraft({ ...EMPTY_DRAFT, sortOrder: faqs.length, category: category === ALL ? '' : category });
    setCreating(true);
  };

  const openEdit = (faq: FAQ) => {
    setDraft({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? '',
      merchantType: faq.merchantType ?? '',
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
    setEditing(faq);
  };

  const save = async () => {
    if (!draft.question.trim() || !draft.answer.trim()) {
      toast.error('A question and an answer are both required.');
      return;
    }
    const payload = {
      question: draft.question.trim(),
      answer: draft.answer,
      category: draft.category.trim() || undefined,
      merchantType: draft.merchantType || null,
      sortOrder: draft.sortOrder,
    };
    try {
      if (editing) {
        await updateFaq({ faqId: editing.faqId, ...payload, isActive: draft.isActive }).unwrap();
        toast.success('FAQ updated.');
        setEditing(null);
      } else {
        await createFaq(payload).unwrap();
        toast.success('FAQ added.');
        setCreating(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save the FAQ.');
    }
  };

  const togglePublished = async (faq: FAQ) => {
    try {
      await updateFaq({ faqId: faq.faqId, isActive: !faq.isActive }).unwrap();
      toast.success(faq.isActive ? 'Hidden from the website.' : 'Published to the website.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not change the published state.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaq(deleteTarget.faqId).unwrap();
      toast.success('FAQ deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not delete the FAQ.');
    }
  };

  // Drag to reorder. The whole visible list is sent in its new order, so the server never has to
  // guess what moved.
  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = visible.map((f) => f.faqId);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [moved] = ids.splice(from, 1);
    if (moved === undefined) return;
    ids.splice(to, 0, moved);
    setDragId(null);
    try {
      await reorderFaqs(ids).unwrap();
      toast.success('Order saved.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save the new order.');
    }
  };

  const isError = faqsQuery.isError;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title="FAQ"
        subtitle="Questions and answers published on the website help centre."
        icon={HelpCircle}
        iconColor="theme"
        action={{ label: 'Add FAQ', onClick: openCreate, icon: Plus }}
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not load the FAQs.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void faqsQuery.refetch(); }}>Retry</ATMButton>
        </div>
      )}

      {/* Categories come from the API. The old page hardcoded four, so a FAQ filed under
          anything else was unreachable. */}
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-[#13151a]">
        <button
          type="button"
          onClick={() => setCategory(ALL)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            category === ALL
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
          )}
        >
          All ({faqs.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              category === c
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
            )}
          >
            {c} ({faqs.filter((f) => f.category === c).length})
          </button>
        ))}
      </div>

      <ATMCard>
        {faqsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="56px" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            {faqs.length === 0 ? 'No FAQs yet. Add the first one.' : 'No FAQs in this category.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((faq) => (
              <div
                key={faq.faqId}
                draggable
                onDragStart={() => setDragId(faq.faqId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { void handleDrop(faq.faqId); }}
                className={cn(
                  'py-3 transition-colors',
                  dragId === faq.faqId && 'opacity-50',
                  !faq.isActive && 'bg-slate-50/60 dark:bg-[#13151a]/40',
                )}
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="mt-1 h-4 w-4 cursor-grab text-slate-300 dark:text-slate-600" />
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => setExpandedId(expandedId === faq.faqId ? null : faq.faqId)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{faq.question}</span>
                      {faq.category && <ATMBadge color="default" label={faq.category} />}
                      {faq.merchantType && <ATMBadge color="primary" label={faq.merchantType} />}
                      {!faq.isActive && (
                        <ATMBadge color="warning" icon={<EyeOff className="h-3 w-3" />} label="Hidden" />
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { void togglePublished(faq); }}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      aria-label={faq.isActive ? 'Hide from the website' : 'Publish to the website'}
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(faq)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      aria-label={`Edit ${faq.question}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(faq)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      aria-label={`Delete ${faq.question}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === faq.faqId ? null : faq.faqId)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Toggle answer"
                    >
                      {expandedId === faq.faqId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {expandedId === faq.faqId && (
                  <p className="ml-7 mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ATMCard>

      <ATMModal
        isOpen={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? 'Edit FAQ' : 'Add FAQ'}
        size="lg"
      >
        <div className="space-y-4">
          <ATMTextField
            name="question"
            label="Question"
            value={draft.question}
            onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
          />
          <ATMTextArea
            name="answer"
            label="Answer"
            rows={6}
            value={draft.answer}
            onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ATMTextField
              name="category"
              label="Category"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              helperText="Groups the accordion. Leave blank for none."
            />
            <ATMSelectField
              name="merchantType"
              label="Applies to"
              value={draft.merchantType}
              onChange={(v) => setDraft((d) => ({ ...d, merchantType: String(v ?? '') }))}
              options={[
                { value: '', label: 'Every merchant' },
                { value: 'Enterprise', label: 'Enterprise only' },
                { value: 'Standalone', label: 'Standalone only' },
              ]}
            />
            <ATMTextField
              name="sortOrder"
              label="Order"
              type="number"
              value={String(draft.sortOrder)}
              onChange={(e) => setDraft((d) => ({ ...d, sortOrder: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <ATMButton variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</ATMButton>
            <ATMButton
              variant="primary"
              onClick={() => { void save(); }}
              isLoading={createState.isLoading || updateState.isLoading}
            >
              {editing ? 'Save' : 'Add FAQ'}
            </ATMButton>
          </div>
        </div>
      </ATMModal>

      <ATMModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete this FAQ?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            &ldquo;{deleteTarget?.question}&rdquo; will be removed from the website help centre.
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

export default FAQPage;
