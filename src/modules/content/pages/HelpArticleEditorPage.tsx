import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BookOpen,
  Save,
  Type,
  Layers,
  Tag,
  CheckCircle2,
  FileQuestion,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { TemplatePicker } from '../components/TemplatePicker';
import type { ArticleTemplate } from '../services/templatesApi';
import {
  ATMButton,
  ATMCard,
  ATMTextField,
  ATMSkeleton,
  ATMTextArea,
  ATMSelectField,
  ATMCheckbox,
  ATMBadge,
} from '@/shared/ui';
import {
  useGetHelpArticleQuery,
  useCreateHelpArticleMutation,
  useUpdateHelpArticleMutation,
  useGetHelpCategoriesQuery,
} from '../services/contentApi';

interface Draft {
  articleId: string;
  title: string;
  slug: string;
  body: string;
  categoryId: string;
  tags: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY: Draft = {
  articleId: '',
  title: '',
  slug: '',
  body: '',
  categoryId: '',
  tags: '',
  sortOrder: 0,
  isActive: true,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function HelpArticleEditorPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEdit = Boolean(slug);

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  const articleQuery = useGetHelpArticleQuery(slug ?? '', { skip: !isEdit });
  const categoriesQuery = useGetHelpCategoriesQuery();
  const [createArticle, createState] = useCreateHelpArticleMutation();
  const [updateArticle, updateState] = useUpdateHelpArticleMutation();

  const categories = categoriesQuery.data?.data ?? [];

  useEffect(() => {
    const a: any = articleQuery.data?.data;
    if (!a) return;
    setDraft({
      articleId: a.articleId ?? '',
      title: a.title ?? '',
      slug: a.slug ?? '',
      body: a.body ?? '',
      categoryId: a.categoryId ?? '',
      tags: a.tags ?? '',
      sortOrder: a.sortOrder ?? 0,
      isActive: a.isActive ?? true,
    });
    setSlugTouched(true);
  }, [articleQuery.data]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onTitleChange = (value: string) => {
    setDraft((d) => ({ ...d, title: value, slug: slugTouched ? d.slug : slugify(value) }));
  };

  const applyTemplate = (t: ArticleTemplate) => {
    setDraft((d) => {
      const title = d.title.trim() ? d.title : (t.titlePattern ?? '');
      return {
        ...d,
        title,
        slug: d.slug || (slugTouched ? d.slug : slugify(title)),
        body: t.body,
        tags: d.tags.trim() ? d.tags : (t.tags ?? ''),
      };
    });
    toast.success(`Started from "${t.name}".`);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error('Article title is required.');
      return;
    }
    if (!draft.slug.trim()) {
      toast.error('A slug is required. It forms the article address on the help centre.');
      return;
    }
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim(),
      body: draft.body,
      categoryId: draft.categoryId || undefined,
      tags: draft.tags || undefined,
      sortOrder: draft.sortOrder,
      isActive: draft.isActive,
    };
    try {
      if (isEdit && draft.articleId) {
        await updateArticle({ articleId: draft.articleId, ...payload }).unwrap();
        toast.success('Help article updated successfully.');
      } else {
        await createArticle(payload).unwrap();
        toast.success('New help article published.');
      }
      navigate('/content/help');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save the article.');
    }
  };

  const isSaving = createState.isLoading || updateState.isLoading;

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Header */}
      <ATMPageHeader
        icon={BookOpen}
        iconColor="theme"
        title={isEdit ? `Edit Article: ${draft.title || 'Untitled'}` : 'New Knowledge Base Article'}
        subtitle="Write troubleshooting guides, FAQs, and step-by-step documentation for customer support."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/help' },
          { label: isEdit ? 'Edit Guide' : 'New Guide' },
        ]}
        onBack={() => navigate('/content/help')}
        extraActions={
          <div className="flex items-center gap-2">
            <ATMBadge variant={draft.isActive ? 'success' : 'default'} size="sm" dot>
              {draft.isActive ? 'Live on Portal' : 'Hidden / Draft'}
            </ATMBadge>
            <ATMButton
              variant="primary"
              size="md"
              leftIcon={<Save className="h-4 w-4" />}
              loading={isSaving}
              onClick={() => { void save(); }}
            >
              {isEdit ? 'Save Changes' : 'Publish Article'}
            </ATMButton>
          </div>
        }
      />

      {isEdit && articleQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <ATMSkeleton height="120px" className="rounded-2xl" />
            <ATMSkeleton height="320px" className="rounded-2xl" />
          </div>
          <div className="space-y-4">
            <ATMSkeleton height="280px" className="rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Type className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Article Title & Help Route
              </h4>

              <div className="space-y-4">
                <ATMTextField
                  name="title"
                  label="Article Title"
                  required
                  value={draft.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="e.g. How to pair Bluetooth Barcode Scanners with Quantix POS"
                  className="[&_input]:text-base [&_input]:font-semibold"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ATMTextField
                    name="slug"
                    label="URL Slug"
                    required
                    value={draft.slug}
                    onChange={(e) => { setSlugTouched(true); update('slug', e.target.value); }}
                    placeholder="bluetooth-scanner-pairing"
                    className="[&_input]:font-mono text-xs"
                    helperText="Unique URL address on the knowledge base."
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Live URL Preview</label>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs font-mono text-primary-600 dark:text-primary-400 truncate">
                      https://quantix.io/help/{draft.slug || 'article-slug'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body Editor */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  Documentation Body (Markdown)
                </h4>
                <TemplatePicker kind="HelpArticle" hasContent={!!draft.body.trim()} onApply={applyTemplate} />
              </div>

              <ATMTextArea
                name="body"
                rows={18}
                value={draft.body}
                onChange={(e) => update('body', e.target.value)}
                placeholder="Write structured help documentation using Markdown (headings, lists, troubleshooting tips)..."
                className="[&_textarea]:font-mono text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Sidebar Column (1/3) */}
          <div className="space-y-6">
            {/* Taxonomy & Hierarchy */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Layers className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Category & Order
              </h4>

              <div className="space-y-4">
                <ATMSelectField
                  name="categoryId"
                  label="Documentation Category"
                  value={draft.categoryId}
                  onChange={(v) => update('categoryId', String(v ?? ''))}
                  options={[
                    { value: '', label: 'Uncategorized' },
                    ...categories.map((c) => ({ value: c.contentId, label: c.title })),
                  ]}
                  helperText="Assign to help section (e.g. Hardware Setup, Billing, KDS)."
                />

                <ATMTextField
                  name="sortOrder"
                  label="Display Sort Priority"
                  type="number"
                  value={String(draft.sortOrder)}
                  onChange={(e) => update('sortOrder', parseInt(e.target.value, 10) || 0)}
                  helperText="Lower numbers appear first in the sidebar menu."
                />

                <ATMTextField
                  name="tags"
                  label="Search Keywords & Tags"
                  value={draft.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  placeholder="bluetooth, scanner, hardware, error"
                  helperText="Comma-separated keywords for customer search bar."
                />
              </div>
            </div>

            {/* Visibility & Portal Publishing */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Visibility Settings
              </h4>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <ATMCheckbox
                  name="isActive"
                  label="Publish live on Knowledge Base"
                  checked={draft.isActive}
                  onChange={(checked) => update('isActive', checked)}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6">
                  When enabled, this guide will be immediately indexable and visible to merchants.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpArticleEditorPage;
