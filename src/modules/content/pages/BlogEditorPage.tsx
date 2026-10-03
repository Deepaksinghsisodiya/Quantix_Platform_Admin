import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Globe,
  Calendar,
  AlertTriangle,
  FileEdit,
  Type,
  Image as ImageIcon,
  Tag,
  Share2,
  Clock,
  Layers,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  ATMBadge,
  ATMButton,
  ATMCard,
  ATMTextField,
  ATMTextArea,
  ATMSelectField,
  ATMPageSkeleton,
} from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { MediaPicker } from '../components/MediaPicker';
import { TemplatePicker } from '../components/TemplatePicker';
import type { ArticleTemplate } from '../services/templatesApi';
import { useGetBlogCategoriesQuery, useGetBlogAuthorsQuery } from '../services/contentApi';
import { absoluteMediaUrl } from '../services/mediaApi';
import {
  useBlogPost,
  useCreateBlogPost,
  useUpdateBlogPost,
  useApproveReview,
} from '@/lib/hooks/useContent';

/* -------------------------------------------------------------------------- */
/*  Local form draft type                                                      */
/* -------------------------------------------------------------------------- */

interface BlogPostDraft {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  authorId: string;
  excerpt: string;
  tags: string;
  featuredImage: string;
  featuredImageAssetId: string;
  status: 'Draft' | 'Review' | 'Published';
  scheduleDate: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
}

const EMPTY_POST: BlogPostDraft = {
  title: '',
  slug: '',
  content: '',
  categoryId: '',
  authorId: '',
  excerpt: '',
  tags: '',
  featuredImageAssetId: '',
  status: 'Draft',
  scheduleDate: '',
  metaTitle: '',
  metaDescription: '',
  featuredImage: '',
  ogImage: '',
  canonicalUrl: '',
};

function postToDraft(post: any): BlogPostDraft {
  const tags: string = typeof post.tags === 'string' ? post.tags : (post.tags ?? []).join(', ');
  return {
    title: post.title ?? '',
    slug: post.slug ?? '',
    content: post.body ?? '',
    categoryId: post.categoryId ?? '',
    authorId: post.authorId ?? '',
    tags,
    status: post.status ?? 'Draft',
    scheduleDate: post.scheduledAt ? String(post.scheduledAt).slice(0, 16) : '',
    metaTitle: post.seoTitle ?? '',
    metaDescription: post.seoDescription ?? '',
    excerpt: post.excerpt ?? '',
    featuredImage: post.featuredImageUrl ?? '',
    featuredImageAssetId: post.featuredImageAssetId ?? '',
    ogImage: post.ogImageUrl ?? '',
    canonicalUrl: post.canonicalUrl ?? '',
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [post, setPost] = useState<BlogPostDraft>(EMPTY_POST);
  const [pickerOpen, setPickerOpen] = useState(false);

  const blogCategories = useGetBlogCategoriesQuery().data?.data ?? [];
  const blogAuthors = useGetBlogAuthorsQuery().data?.data ?? [];

  const postQuery = useBlogPost(isEditMode ? id : undefined);
  const createMut = useCreateBlogPost();
  const updateMut = useUpdateBlogPost();
  const approveMut = useApproveReview();

  // Hydrate form when post is loaded
  useEffect(() => {
    const fetched = postQuery.data?.data;
    if (isEditMode && fetched) {
      setPost(postToDraft(fetched));
    }
  }, [isEditMode, postQuery.data]);

  const update = <K extends keyof BlogPostDraft>(key: K, value: BlogPostDraft[K]) => {
    setPost((prev) => ({ ...prev, [key]: value }));
  };

  const applyTemplate = (t: ArticleTemplate) => {
    setPost((prev) => {
      const title = prev.title.trim() ? prev.title : (t.titlePattern ?? '');
      const slug = prev.slug || (title ? title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() : '');
      return {
        ...prev,
        title,
        slug,
        content: t.body,
        excerpt: prev.excerpt.trim() ? prev.excerpt : (t.excerpt ?? ''),
        tags: prev.tags.trim() ? prev.tags : (t.tags ?? ''),
      };
    });
    toast.success(`Template "${t.name}" applied.`);
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    update('title', title);
    if (!isEditMode || post.slug === '') {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      update('slug', slug);
    }
  };

  const buildPayload = (status: 'Draft' | 'Review' | 'Published') => ({
    title: post.title,
    slug: post.slug,
    body: post.content,
    excerpt: post.excerpt || undefined,
    status: status === 'Review' ? 'Draft' : status,
    tags: post.tags || undefined,
    categoryId: post.categoryId || undefined,
    authorId: post.authorId || undefined,
    featuredImageUrl: post.featuredImage || undefined,
    featuredImageAssetId: post.featuredImageAssetId || undefined,
    seoTitle: post.metaTitle || undefined,
    seoDescription: post.metaDescription || undefined,
    ogImageUrl: post.ogImage || undefined,
    canonicalUrl: post.canonicalUrl || undefined,
    scheduledAt: status === 'Published' ? undefined : (post.scheduleDate || undefined),
  });

  const isLoading = isEditMode && postQuery.isLoading;
  const isError = isEditMode && postQuery.isError;
  const saving = createMut.isPending || updateMut.isPending || approveMut.isPending;

  const handleSaveDraft = () => {
    if (!post.title.trim()) {
      toast.error('Article title is required.');
      return;
    }
    if (isEditMode && id) {
      updateMut.mutate(
        { id, ...buildPayload('Draft') },
        {
          onSuccess: () => toast.success('Draft saved successfully.'),
          onError: (err: any) => toast.error(err?.data?.message || 'Failed to save draft.'),
        },
      );
    } else {
      createMut.mutate(buildPayload('Draft'), {
        onSuccess: (resp) => {
          toast.success('New article draft created.');
          if (resp?.data?.id) {
            navigate(`/content/blog/${resp.data.id}/edit`);
          }
        },
        onError: (err: any) => toast.error(err?.data?.message || 'Failed to save draft.'),
      });
    }
  };

  const handlePublish = () => {
    if (!post.title.trim()) {
      toast.error('Article title is required.');
      return;
    }
    if (!post.slug.trim()) {
      toast.error('Article slug is required for publication.');
      return;
    }
    if (isEditMode && id) {
      updateMut.mutate(
        { id, ...buildPayload('Published') },
        {
          onSuccess: () => {
            update('status', 'Published');
            approveMut.mutate(id, {
              onSuccess: () => toast.success('Article published live to blog!'),
              onError: () => toast.error('Saved, but failed to publish live.'),
            });
          },
          onError: (err: any) => toast.error(err?.data?.message || 'Failed to publish post.'),
        },
      );
    } else {
      createMut.mutate(buildPayload('Published'), {
        onSuccess: (resp) => {
          update('status', 'Published');
          toast.success('Article published live to blog!');
          if (resp?.data?.id) {
            navigate(`/content/blog/${resp.data.id}/edit`);
          }
        },
        onError: (err: any) => toast.error(err?.data?.message || 'Failed to publish post.'),
      });
    }
  };

  const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'success'> = {
    Draft: 'default',
    Review: 'warning',
    Published: 'success',
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Header */}
      <ATMPageHeader
        icon={FileEdit}
        iconColor="theme"
        title={isEditMode ? `Edit: ${post.title || 'Untitled Article'}` : 'New Blog Article'}
        subtitle="Author, configure SEO, attach media, and publish live content to the Quantix marketing portal."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/blog' },
          { label: isEditMode ? 'Edit Article' : 'New Article' },
        ]}
        onBack={() => navigate('/content/blog')}
        extraActions={
          <div className="flex flex-wrap items-center gap-2">
            <ATMBadge variant={STATUS_VARIANT[post.status] || 'default'} size="sm" dot>
              {post.status}
            </ATMBadge>
            <TemplatePicker kind="Blog" hasContent={!!post.content.trim()} onApply={applyTemplate} />
            <ATMButton
              variant="secondary"
              size="md"
              leftIcon={<Save className="h-4 w-4" />}
              loading={saving}
              onClick={handleSaveDraft}
            >
              Save Draft
            </ATMButton>
            <ATMButton
              variant="primary"
              size="md"
              leftIcon={<Globe className="h-4 w-4" />}
              onClick={handlePublish}
              loading={saving}
            >
              Publish Live
            </ATMButton>
          </div>
        }
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Failed to load post data from API.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void postQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {isLoading ? (
        <ATMPageSkeleton variant="detail" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Article Identity */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Type className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Article Identity & Slug
              </h4>

              <div className="space-y-4">
                <ATMTextField
                  name="title"
                  label="Article Title"
                  required
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Next-Generation Cloud POS Architecture for Retail Chains"
                  className="[&_input]:text-base [&_input]:font-semibold"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ATMTextField
                    name="slug"
                    label="URL Slug"
                    required
                    value={post.slug}
                    onChange={(e) => update('slug', e.target.value)}
                    placeholder="cloud-pos-architecture"
                    helperText="Unique path appended to /blog/ on public website."
                    className="[&_input]:font-mono text-xs"
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Live URL Preview</label>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs font-mono text-primary-600 dark:text-primary-400 truncate">
                      https://quantix.io/blog/{post.slug || 'untitled-post'}
                    </div>
                  </div>
                </div>

                <ATMTextArea
                  name="excerpt"
                  label="Excerpt / Quick Abstract"
                  rows={2}
                  value={post.excerpt}
                  onChange={(e) => update('excerpt', e.target.value)}
                  placeholder="Short introductory summary displayed on homepage cards and search results..."
                  helperText="Recommended 1-2 sentences (approx 140-180 characters)."
                />
              </div>
            </div>

            {/* Section 2: Article Body Editor */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  Article Content (Markdown)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {post.content ? `${post.content.split(/\s+/).filter(Boolean).length} words` : '0 words'}
                </span>
              </h4>

              <ATMTextArea
                name="content"
                rows={18}
                value={post.content}
                onChange={(e) => update('content', e.target.value)}
                placeholder="Write full article in Markdown format (supports headings, code blocks, lists, quotes)..."
                className="[&_textarea]:font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Section 3: Search Engine Optimization */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Search Engine Optimization (SEO) & Social Meta
              </h4>

              <div className="space-y-4">
                <ATMTextField
                  name="metaTitle"
                  label="Meta Title"
                  value={post.metaTitle}
                  onChange={(e) => update('metaTitle', e.target.value)}
                  placeholder="Optimized page title for Google search results (max 60 chars)"
                  maxLength={60}
                  helperText={`${post.metaTitle.length}/60 characters`}
                />

                <ATMTextArea
                  name="metaDescription"
                  label="Meta Description"
                  rows={3}
                  value={post.metaDescription}
                  onChange={(e) => update('metaDescription', e.target.value)}
                  placeholder="Concise summary for search engine snippet display (max 160 chars)"
                  maxLength={160}
                  helperText={`${post.metaDescription.length}/160 characters`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ATMTextField
                    name="canonicalUrl"
                    label="Canonical URL (Optional)"
                    value={post.canonicalUrl}
                    onChange={(e) => update('canonicalUrl', e.target.value)}
                    placeholder="https://quantix.io/blog/my-post"
                    helperText="Leave empty to use the default post URL."
                  />
                  <ATMTextField
                    name="ogImage"
                    label="Open Graph Social Image URL"
                    value={post.ogImage}
                    onChange={(e) => update('ogImage', e.target.value)}
                    placeholder="1200×630px social banner"
                    helperText="Image displayed when article is shared on Twitter/LinkedIn."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column (1/3) */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <ImageIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Featured Cover Image
              </h4>

              <div className="space-y-3">
                {post.featuredImageAssetId ? (
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950/10">
                    <img
                      src={absoluteMediaUrl(`/api/v1/media/${post.featuredImageAssetId}/file`)}
                      alt="Featured cover"
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => update('featuredImageAssetId', '')}
                        className="text-xs font-semibold text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : post.featuredImage ? (
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950/10">
                    <img
                      src={post.featuredImage}
                      alt="Featured cover"
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Pick from Library
                      </button>
                      <button
                        type="button"
                        onClick={() => update('featuredImage', '')}
                        className="text-xs font-semibold text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center transition-colors hover:border-primary-500 hover:bg-primary-50/20"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Select Media Asset</p>
                      <p className="text-[11px] text-slate-400">Choose high-res banner from vault</p>
                    </div>
                  </button>
                )}

                <ATMTextField
                  name="featuredImage"
                  label="Or External Image URL"
                  value={post.featuredImage}
                  onChange={(e) => update('featuredImage', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />
              </div>
            </div>

            {/* Publishing & Schedule */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Publishing Workflow
              </h4>

              <div className="space-y-4">
                <ATMSelectField
                  name="status"
                  label="Publication Stage"
                  value={post.status}
                  onChange={(v) => update('status', v as BlogPostDraft['status'])}
                  options={[
                    { value: 'Draft', label: 'Draft (Internal only)' },
                    { value: 'Review', label: 'Under Editorial Review' },
                    { value: 'Published', label: 'Published Live to Public' },
                  ]}
                />

                <ATMTextField
                  name="scheduleDate"
                  label="Schedule Auto-Publish"
                  type="datetime-local"
                  value={post.scheduleDate}
                  onChange={(e) => update('scheduleDate', e.target.value)}
                  leftIcon={<Clock className="h-4 w-4 text-slate-400" />}
                  helperText="Leave blank for immediate publication."
                />
              </div>
            </div>

            {/* Category, Author & Tags */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Tag className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Taxonomy & Authorship
              </h4>

              <div className="space-y-4">
                <ATMSelectField
                  name="categoryId"
                  label="Category Topic"
                  value={post.categoryId}
                  onChange={(v) => update('categoryId', String(v ?? ''))}
                  options={[
                    { value: '', label: 'Uncategorized / General' },
                    ...blogCategories.map((c) => ({ value: c.categoryId, label: c.name })),
                  ]}
                />

                <ATMSelectField
                  name="authorId"
                  label="Author Byline"
                  value={post.authorId}
                  onChange={(v) => update('authorId', String(v ?? ''))}
                  options={[
                    { value: '', label: 'Editorial Team' },
                    ...blogAuthors.map((a) => ({ value: a.authorId, label: a.name })),
                  ]}
                />

                <ATMTextField
                  name="tags"
                  label="Article Tags"
                  value={post.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  placeholder="pos, cloud, omnichannel, hospitality"
                  helperText="Comma-separated keywords for filtering."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => update('featuredImageAssetId', asset.assetId)}
        defaultFolder="blog"
        imagesOnly
        title="Select Featured Article Banner"
      />
    </div>
  );
}

export default BlogEditorPage;
