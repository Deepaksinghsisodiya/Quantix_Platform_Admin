import React, { useState, useEffect } from 'react';
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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
import type { BlogPost } from '@/lib/types/content';

/* -------------------------------------------------------------------------- */
/*  Local form draft type                                                      */
/* -------------------------------------------------------------------------- */

interface BlogPostDraft {
  title: string;
  slug: string;
  content: string;
  /** 2026-09-05: the real category id. Was a free string picked from a hardcoded list and
   *  never submitted. */
  categoryId: string;
  authorId: string;
  excerpt: string;
  tags: string;
  featuredImage: string;
  /** 2026-09-05 (Phase 1): id of a media-library asset, when the image is hosted here. */
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

// 2026-09-05: the hardcoded CATEGORIES array is gone; categories come from GET /blog/categories.

/**
 * 2026-09-05 (content Phase 2): reads the API's OWN field names.
 *
 * The editor and the API had never agreed on a shape. This mapper read `post.content`,
 * `post.seoMetadata.*` and `post.publishDate`, and the save built a matching payload — but the
 * API's BlogPostDto has `body`, flat `seoTitle` / `seoDescription`, and `publishedAt`. JSON
 * binding is case-insensitive, not name-inventing, so every one of those fields was dropped in
 * both directions. Only title, slug and status ever survived a save.
 *
 * The category was read from `tags[0]`, which is not a category at all, and the tag list was
 * treated as an array where the API stores a comma-separated string.
 */
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
  // 2026-09-05: categories and authors come from the API, not a literal in this file.
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

  // 2026-09-08 (content Phase 4): a template fills the body and, where the draft is still blank,
  // the title, excerpt and tags. Fields the writer has already typed are left alone.
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
    toast.success(`Started from "${t.name}".`);
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

  // 2026-09-05 (content Phase 2): mirrors BlogPostDto exactly. Category, schedule date, Open
  // Graph image and canonical URL were all editable on this screen and none of them was sent.
  const buildPayload = (status: 'Draft' | 'Review' | 'Published') => ({
    title: post.title,
    slug: post.slug,
    body: post.content,
    // Excerpt is its own field. It used to be silently aliased to the meta description, so the
    // two could never differ.
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
    // A scheduled date only means anything on a Draft: ScheduledPublishJob promotes it when the
    // time passes. Publishing now clears it, so the job cannot re-publish an edited post later.
    scheduledAt: status === 'Published' ? undefined : (post.scheduleDate || undefined),
  });

  const isLoading = isEditMode && postQuery.isLoading;
  const isError = isEditMode && postQuery.isError;
  const saving = createMut.isPending || updateMut.isPending || approveMut.isPending;

  const handleSaveDraft = () => {
    if (isEditMode && id) {
      updateMut.mutate(
        { id, ...buildPayload('Draft') },
        {
          onSuccess: () => toast.success('Draft saved'),
          onError: () => toast.error('Failed to save draft'),
        },
      );
    } else {
      createMut.mutate(buildPayload('Draft'), {
        onSuccess: (resp) => {
          toast.success('Draft saved');
          if (resp?.data?.id) {
            navigate(`/content/blog/${resp.data.id}/edit`);
          }
        },
        onError: () => toast.error('Failed to save draft'),
      });
    }
  };

  const handlePublish = () => {
    if (isEditMode && id) {
      updateMut.mutate(
        { id, ...buildPayload('Published') },
        {
          onSuccess: () => {
            update('status', 'Published');
            approveMut.mutate(id, {
              onSuccess: () => toast.success('Post published'),
              onError: () => toast.error('Saved, but failed to publish'),
            });
          },
          onError: () => toast.error('Failed to publish post'),
        },
      );
    } else {
      createMut.mutate(buildPayload('Published'), {
        onSuccess: (resp) => {
          update('status', 'Published');
          toast.success('Post published');
          if (resp?.data?.id) {
            navigate(`/content/blog/${resp.data.id}/edit`);
          }
        },
        onError: () => toast.error('Failed to publish post'),
      });
    }
  };

  const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'success'> = {
    Draft: 'default',
    Review: 'warning',
    Published: 'success',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ATMButton variant="ghost" size="sm" onClick={() => navigate('/content/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </ATMButton>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {isEditMode ? 'Edit Post' : 'New Post'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ATMBadge variant={STATUS_VARIANT[post.status]} size="sm">{post.status}</ATMBadge>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TemplatePicker kind="Blog" hasContent={!!post.content.trim()} onApply={applyTemplate} />
          <ATMButton variant="secondary" size="md" leftIcon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSaveDraft}>
            Save Draft
          </ATMButton>
          <ATMButton variant="primary" size="md" leftIcon={<Eye className="h-4 w-4" />} onClick={handlePublish} loading={saving}>
            Publish
          </ATMButton>
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load post.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void postQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={post.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-xl font-bold text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />

          {/* Slug */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Slug:</span>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => update('slug', e.target.value)}
              className="flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>

          {/* Content area */}
          <textarea
            value={post.content}
            onChange={(e) => update('content', e.target.value)}
            placeholder="Write your post content in Markdown..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category & Tags */}
          <ATMCard padding="md">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Category & Tags</h3>
            <div className="space-y-3">
              {/* 2026-09-05: real categories, and the choice is now actually saved. */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
                <select
                  value={post.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">No category</option>
                  {blogCategories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                  ))}
                </select>
                {blogCategories.length === 0 && (
                  <span className="text-[11px] text-gray-400">
                    No categories exist yet. Posts can still be saved without one.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Author</label>
                <select
                  value={post.authorId}
                  onChange={(e) => update('authorId', e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">No author</option>
                  {blogAuthors.map((a) => (
                    <option key={a.authorId} value={a.authorId}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={post.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </ATMCard>

          {/* Status & Schedule */}
          <ATMCard padding="md">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Status & Schedule</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                <select
                  value={post.status}
                  onChange={(e) => update('status', e.target.value as BlogPostDraft['status'])}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Schedule Date</label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={post.scheduleDate}
                    onChange={(e) => update('scheduleDate', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </ATMCard>

          {/* SEO */}
          <ATMCard padding="md">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">SEO</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Meta Title</label>
                <input
                  type="text"
                  value={post.metaTitle}
                  onChange={(e) => update('metaTitle', e.target.value)}
                  placeholder="SEO title (max 60 chars)"
                  maxLength={60}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <span className="text-right text-xs text-gray-400">{post.metaTitle.length}/60</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Meta Description</label>
                <textarea
                  value={post.metaDescription}
                  onChange={(e) => update('metaDescription', e.target.value)}
                  placeholder="SEO description (max 160 chars)"
                  maxLength={160}
                  rows={3}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <span className="text-right text-xs text-gray-400">{post.metaDescription.length}/160</span>
              </div>
              {/* 2026-09-05 (Phase 1): was a bare text box for a URL the operator had to host
                  somewhere else. Now it picks from the platform's own media library. */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Featured Image</label>
                {post.featuredImageAssetId ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                    <img
                      src={absoluteMediaUrl(`/api/v1/media/${post.featuredImageAssetId}/file`)}
                      alt=""
                      className="h-14 w-20 rounded object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <button type="button" onClick={() => setPickerOpen(true)} className="text-left text-xs font-semibold text-accent-600 hover:underline">
                        Change image
                      </button>
                      <button type="button" onClick={() => update('featuredImageAssetId', '')} className="text-left text-xs text-gray-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 hover:border-accent-400 hover:text-accent-600 dark:border-gray-600"
                  >
                    Choose from the media library
                  </button>
                )}
                <input
                  type="text"
                  value={post.featuredImage}
                  onChange={(e) => update('featuredImage', e.target.value)}
                  placeholder="or paste an externally hosted URL"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">OG Image URL</label>
                <input type="text" value={post.ogImage} onChange={(e) => update('ogImage', e.target.value)} placeholder="Open Graph image (1200×630 recommended)" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Canonical URL</label>
                <input type="text" value={post.canonicalUrl} onChange={(e) => update('canonicalUrl', e.target.value)} placeholder="https://quantix.io/blog/my-post (leave empty for auto)" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </ATMCard>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => update('featuredImageAssetId', asset.assetId)}
        defaultFolder="blog"
        imagesOnly
        title="Choose a featured image"
      />
    </div>
  );
}

export default BlogEditorPage;
