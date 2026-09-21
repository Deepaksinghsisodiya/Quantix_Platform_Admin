import React, { useMemo, useState, useCallback } from 'react';
import { ATMButton, ATMModal, ATMTextField, ATMCard, ATMBadge } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Globe,
  GlobeLock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import { ContentStatusBadge } from '../components/ContentStatusBadge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import type { BlogPost, ContentStatus } from '@/lib/types/content';
import {
  useBlogPosts,
  useDeleteBlogPost,
  useUpdateBlogPost,
  useUnpublishBlogPost,
  useApproveReview,
} from '@/lib/hooks/useContent';

/* -------------------------------------------------------------------------- */
/*  Row adapter                                                                */
/* -------------------------------------------------------------------------- */

/**
 * 2026-09-05 (content Phase 2): `views` removed and `category` is now the real one.
 *
 * The Views column rendered a hardcoded 0 for every post, forever — no view count exists on the
 * server, so the column reported a number the platform does not measure. The Category column
 * showed `tags[0]`, which is a tag, not a category; with the API sending tags as a
 * comma-separated string (or null), that also crashed this page on the first real post.
 */
type BlogPostRow = BlogPost & { categoryName: string; authorName: string };

/* -------------------------------------------------------------------------- */
/*  Filter pills                                                               */
/* -------------------------------------------------------------------------- */

type StatusFilter = 'All' | ContentStatus;

const STATUS_FILTERS: StatusFilter[] = ['All', 'Draft', 'Review', 'Published', 'Scheduled'];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function BlogListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null);

  const postsQuery = useBlogPosts({
    page: 1,
    pageSize: 100,
    status: statusFilter === 'All' ? undefined : statusFilter,
    search: search.trim() || undefined,
    // 2026-09-05 (Phase 0): this is the authoring list — it must see drafts. The API grants
    // that only to a caller who passes the ContentManager policy, which this portal session
    // does; a public caller sending the same flag still gets published posts only.
    publishedOnly: false,
  });
  const deleteMut = useDeleteBlogPost();
  const unpublishMut = useUnpublishBlogPost();
  const approveMut = useApproveReview();

  const posts = useMemo<BlogPostRow[]>(() => {
    const items = postsQuery.data?.data ?? [];
    return items.map((p: any) => ({
      ...p,
      categoryName: (p as any).categoryName ?? '',
      authorName: (p as any).authorName ?? (p as any).author ?? '',
    }));
  }, [postsQuery.data]);

  const isLoading = postsQuery.isLoading;
  const isError = postsQuery.isError;

  // Client-side narrowing for tag-search; server handles status+text already
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [posts, search]);

  const columns = useMemo<ATMTableColumn<BlogPostRow>[]>(
    () => [
      {
        key: 'title',
        header: 'Title',
        renderCell: (val, row) => (
          <button
            type="button"
            onClick={() => navigate(`/content/blog/${row.id}/edit`)}
            className="text-left font-medium text-slate-900 hover:text-primary-600 transition-colors dark:text-slate-100 dark:hover:text-primary-400"
          >
            {row.title}
          </button>
        ),
      },
      {
        key: 'author',
        header: 'Author',
        renderCell: (val, row) => (
          <span className="text-sm text-slate-600 dark:text-slate-400">{row.author}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val, row) => <ContentStatusBadge status={row.status} />,
      },
      {
        key: 'publishDate',
        header: 'Published',
        renderCell: (val, row) => {
          return row.publishDate ? (
            <span className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
              {formatDate(row.publishDate, 'short')}
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">--</span>
          );
        },
      },
      {
        key: 'categoryName',
        header: 'Category',
        renderCell: (val, row) =>
          row.categoryName ? (
            <ATMBadge color="muted" size="md">{row.categoryName}</ATMBadge>
          ) : (
            <span className="text-xs text-slate-400">--</span>
          ),
      },
    ],
    [navigate],
  );

  const rowActions = useCallback(
    (row: BlogPostRow): RowAction<BlogPostRow>[] => [
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (r) => navigate(`/content/blog/${r.id}/edit`),
      },
      {
        label: row.status === 'Published' ? 'Unpublish' : 'Publish',
        icon: row.status === 'Published' ? GlobeLock : Globe,
        onClick: (r) => {
          if (r.status === 'Published') {
            unpublishMut.mutate(r.id, {
              onSuccess: () => toast.success('Post unpublished'),
              onError: () => toast.error('Failed to unpublish post'),
            });
          } else {
            approveMut.mutate(r.id, {
              onSuccess: () => toast.success('Post published'),
              onError: () => toast.error('Failed to publish post'),
            });
          }
        },
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: (r) => setDeleteTarget(r),
      },
    ],
    [navigate, unpublishMut, approveMut],
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Post deleted');
        setDeleteTarget(null);
      },
      onError: () => toast.error('Failed to delete post'),
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={FileText}
        iconColor="theme"
        title="Blog"
        subtitle="Manage blog posts for the Quantix knowledge hub."
        extraActions={
          <ATMButton
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/content/blog/new')}
          >
            New Post
          </ATMButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 dark:bg-slate-900/60">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="w-64">
          <ATMTextField
            placeholder="Search posts..."
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              search ? (
                <button type="button" onClick={() => setSearch('')} className="cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load blog posts.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void postsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Table */}
      <ATMCard padding="none" className="overflow-hidden">
        <ATMTable
          columns={columns}
          data={filteredPosts}
          isLoading={isLoading}
          rowActions={rowActions}
          emptyMessage="No blog posts. Create your first post to get started."
          density="compact"
        />
      </ATMCard>

      {/* Delete confirmation modal */}
      <ATMModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {deleteTarget?.title}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <ATMButton variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </ATMButton>
            <ATMButton variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}

export default BlogListPage;
