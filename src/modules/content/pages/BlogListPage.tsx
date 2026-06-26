import React, { useMemo, useState, useCallback } from 'react';
import { ATMButton, ATMModal, ATMTextField } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
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

// Extend for view count (not yet in API; computed locally)
type BlogPostRow = BlogPost & { views: number; category: string };

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
  });
  const deleteMut = useDeleteBlogPost();
  const unpublishMut = useUnpublishBlogPost();
  const approveMut = useApproveReview();

  const posts = useMemo<BlogPostRow[]>(() => {
    const items = postsQuery.data?.data?.items ?? [];
    return items.map((p) => ({
      ...p,
      views: 0,
      category: p.tags[0] ?? 'General',
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
            className="text-left font-medium text-gray-900 hover:text-indigo-600 transition-colors dark:text-gray-100 dark:hover:text-indigo-400"
          >
            {row.title}
          </button>
        ),
      },
      {
        key: 'author',
        header: 'Author',
        renderCell: (val, row) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">{row.author}</span>
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
            <span className="text-sm tabular-nums text-gray-600 dark:text-gray-400">
              {formatDate(row.publishDate, 'short')}
            </span>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-555">--</span>
          );
        },
      },
      {
        key: 'category',
        header: 'Category',
        renderCell: (val, row) => (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 capitalize dark:bg-gray-800 dark:text-gray-300">
            {row.category}
          </span>
        ),
      },
      {
        key: 'views',
        header: 'Views',
        renderCell: (val, row) => (
          <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
            {row.views.toLocaleString()}
          </span>
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-55">
            Blog
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage blog posts for the Quantix knowledge hub.
          </p>
        </div>
        <ATMButton
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/content/blog/new')}
        >
          New Post
        </ATMButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                statusFilter === s
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <ATMTable
          columns={columns}
          data={filteredPosts}
          isLoading={isLoading}
          rowActions={rowActions}
          emptyMessage="No blog posts. Create your first post to get started."
          density="compact"
        />
      </div>

      {/* Delete confirmation modal */}
      <ATMModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
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
