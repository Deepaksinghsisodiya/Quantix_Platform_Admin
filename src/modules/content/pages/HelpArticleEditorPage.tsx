import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, Save } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { TemplatePicker } from '../components/TemplatePicker';
import type { ArticleTemplate } from '../services/templatesApi';
import { ATMButton, ATMCard, ATMTextField, ATMSkeleton, ATMTextArea, ATMSelectField, ATMCheckbox } from '@/shared/ui';
import {
  useGetHelpArticleQuery,
  useCreateHelpArticleMutation,
  useUpdateHelpArticleMutation,
  useGetHelpCategoriesQuery,
} from '../services/contentApi';

/**
 * Help Article editor — 2026-09-05 (content Phase 2).
 *
 * This page did not exist. The Help Articles list had a "New Article" button and a per-row edit
 * pencil, and both opened a toast reading "coming soon", so help articles were readable in the
 * portal and editable nowhere. The API has had create, update and delete the whole time.
 *
 * Reached by slug when editing, because that is what the API's single-article endpoint takes.
 */

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

  // 2026-09-08 (content Phase 4): a template fills the body and, where still blank, the title
  // and tags. Anything the writer has already typed is left alone.
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
      toast.error('A title is required.');
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
        toast.success('Article saved.');
      } else {
        await createArticle(payload).unwrap();
        toast.success('Article created.');
      }
      navigate('/content/help');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save the article.');
    }
  };

  if (isEdit && articleQuery.isLoading) {
    return (
      <div className="w-full space-y-5">
        <div className="space-y-2">
          <ATMSkeleton width="30%" height="14px" className="rounded" />
          <ATMSkeleton height="44px" className="rounded-lg" />
        </div>
        <div className="space-y-2">
          <ATMSkeleton width="25%" height="14px" className="rounded" />
          <ATMSkeleton height="360px" className="rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={BookOpen}
        iconColor="theme"
        title={isEdit ? 'Edit Help Article' : 'New Help Article'}
        subtitle="Published on the website help centre."
        onBack={() => navigate('/content/help')}
        extraActions={
          <ATMButton
            variant="primary"
            size="md"
            icon={Save}
            loading={createState.isLoading || updateState.isLoading}
            onClick={() => { void save(); }}
          >
            {isEdit ? 'Save changes' : 'Create article'}
          </ATMButton>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ATMCard padding="md">
            <div className="space-y-4">
              <ATMTextField
                name="title"
                label="Title"
                value={draft.title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              <ATMTextField
                name="slug"
                label="Slug"
                value={draft.slug}
                onChange={(e) => { setSlugTouched(true); update('slug', e.target.value); }}
                helperText="The article's address on the help centre."
              />
              <div className="space-y-2">
                <div className="flex items-center justify-end">
                  <TemplatePicker kind="HelpArticle" hasContent={!!draft.body.trim()} onApply={applyTemplate} />
                </div>
                <ATMTextArea
                  name="body"
                  label="Body (Markdown)"
                  rows={18}
                  value={draft.body}
                  onChange={(e) => update('body', e.target.value)}
                  placeholder="Write the article in Markdown..."
                  className="[&_textarea]:font-mono"
                />
              </div>
            </div>
          </ATMCard>
        </div>

        <div className="space-y-4">
          <ATMCard padding="md">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Placement</h3>
            <div className="space-y-3">
              {/* Categories come from the API. The list page hardcoded four, which made every
                  article filed elsewhere invisible and unreachable. */}
              <ATMSelectField
                name="categoryId"
                label="Category"
                value={draft.categoryId}
                onChange={(v) => update('categoryId', String(v ?? ''))}
                options={[
                  { value: '', label: 'No category' },
                  ...categories.map((c) => ({ value: c.contentId, label: c.title })),
                ]}
              />
              <ATMTextField
                name="tags"
                label="Tags"
                value={draft.tags}
                onChange={(e) => update('tags', e.target.value)}
                helperText="Comma-separated. Used by help-centre search."
              />
              <ATMTextField
                name="sortOrder"
                label="Order"
                type="number"
                value={String(draft.sortOrder)}
                onChange={(e) => update('sortOrder', parseInt(e.target.value, 10) || 0)}
              />
              <ATMCheckbox
                name="isActive"
                label="Published on the help centre"
                checked={draft.isActive}
                onChange={(checked) => update('isActive', checked)}
              />
            </div>
          </ATMCard>
        </div>
      </div>
    </div>
  );
}

export default HelpArticleEditorPage;
