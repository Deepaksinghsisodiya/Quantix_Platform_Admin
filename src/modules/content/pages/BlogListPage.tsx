import React, { useMemo, useState, useCallback } from 'react';
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
  Clock,
  Layers,
  Calendar,
  User,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton, ATMCard, ATMBadge, ATMSkeleton, ATMTextField } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';

import { ContentStatusBadge } from '../components/ContentStatusBadge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import type { BlogPost, ContentStatus } from '@/lib/types/content';
import {
  useBlogPosts,
  useDeleteBlogPost,
  useUnpublishBlogPost,
  useApproveReview,
} from '@/lib/hooks/useContent';

/* -------------------------------------------------------------------------- */
/*  Row adapter                                                                */
/* -------------------------------------------------------------------------- */

type BlogPostRow = BlogPost & { categoryName: string; authorName: string };

type StatusFilter = 'All' | ContentStatus;

const STATUS_FILTERS: StatusFilter[] = ['All', 'Draft', 'Review', 'Published', 'Scheduled'];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function BlogListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null);

  const postsQuery = useBlogPosts({
    page: 1,
    pageSize: 100,
    status: statusFilter === 'All' ? undefined : statusFilter,
    search: search.trim() || undefined,
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
        (p.title || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t) => (t || '').toLowerCase().includes(q)),
    );
  }, [posts, search]);

  // Telemetry counts
  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'Published').length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => p.status === 'Draft').length, [posts]);
  const reviewCount = useMemo(() => posts.filter((p) => p.status === 'Review').length, [posts]);
  const scheduledCount = useMemo(() => posts.filter((p) => p.status === 'Scheduled').length, [posts]);

  const statusCounts = useMemo<Record<StatusFilter, number>>(() => ({
    All: posts.length,
    Draft: draftCount,
    Review: reviewCount,
    Published: publishedCount,
    Scheduled: scheduledCount,
  }), [posts.length, draftCount, reviewCount, publishedCount, scheduledCount]);

  const handleTogglePublish = (row: BlogPostRow) => {
    if (row.status === 'Published') {
      unpublishMut.mutate(row.id, {
        onSuccess: () => toast.success(`"${row.title}" unpublished successfully.`),
        onError: () => toast.error('Failed to unpublish post.'),
      });
    } else {
      approveMut.mutate(row.id, {
        onSuccess: () => toast.success(`"${row.title}" published live!`),
        onError: () => toast.error('Failed to publish post.'),
      });
    }
  };

  const columns = useMemo<ATMTableColumn<BlogPostRow>[]>(
    () => [
      {
        key: 'title',
        header: 'Article Title',
        renderCell: (val, row) => (
          <div className="flex items-start gap-3 max-w-md">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/20 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs overflow-hidden">
              {row.featuredImage ? (
                <img src={row.featuredImage} alt="" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate(`/content/blog/${row.id}/edit`)}
                className="text-left font-semibold text-slate-900 hover:text-primary-600 transition-colors dark:text-slate-100 dark:hover:text-primary-400 truncate block"
              >
                {row.title}
              </button>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{row.slug ? `/${row.slug}` : 'No slug'}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'author',
        header: 'Author',
        renderCell: (val, row) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {row.author ? row.author.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.author || 'Anonymous'}</span>
          </div>
        ),
      },
      {
        key: 'categoryName',
        header: 'Category',
        renderCell: (val, row) =>
          row.categoryName ? (
            <ATMBadge variant="outline" size="sm" className="font-medium bg-slate-50 dark:bg-slate-800/60">
              {row.categoryName}
            </ATMBadge>
          ) : (
            <span className="text-xs text-slate-400">General</span>
          ),
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val, row) => <ContentStatusBadge status={row.status} />,
      },
      {
        key: 'publishDate',
        header: 'Published Date',
        renderCell: (val, row) => {
          return row.publishDate ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="tabular-nums">{formatDate(row.publishDate, 'short')}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">Not published</span>
          );
        },
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
        label: row.status === 'Published' ? 'Unpublish' : 'Publish Live',
        icon: row.status === 'Published' ? GlobeLock : Globe,
        onClick: (r) => handleTogglePublish(r),
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
        toast.success(`"${deleteTarget.title}" deleted.`);
        setDeleteTarget(null);
      },
      onError: () => toast.error('Failed to delete post.'),
    });
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        icon={FileText}
        iconColor="theme"
        title="Blog Articles & News"
        subtitle="Author, publish, review and manage content for the Quantix public knowledge & marketing hub."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/blog' },
          { label: 'Blog Posts' },
        ]}
        action={{
          label: 'New Article',
          onClick: () => navigate('/content/blog/new'),
          icon: Plus,
        }}
      />

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ATMStatsCard
          label="Total Articles"
          value={posts.length}
          description="All articles authored"
          icon={FileText}
          variant="accent"
        />
        <ATMStatsCard
          label="Published Live"
          value={publishedCount}
          description="Visible to public readers"
          icon={Globe}
          variant="emerald"
        />
        <ATMStatsCard
          label="In Review"
          value={reviewCount}
          description="Pending editorial review"
          icon={Clock}
          variant="amber"
        />
        <ATMStatsCard
          label="Drafts & Scheduled"
          value={draftCount + scheduledCount}
          description="Work in progress / planned"
          icon={Layers}
          variant="indigo"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        {/* Status Filter Pills */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5',
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              <span>{s}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-bold',
                  statusFilter === s
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                {statusCounts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search & View Mode Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-full sm:w-72">
            <ATMTextField
              placeholder="Search posts by title, tag, or author..."
              size="sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              rightIcon={
                search ? (
                  <button type="button" onClick={() => setSearch('')} className="cursor-pointer text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          <ATMViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Failed to load blog posts. Check network connection or API service.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void postsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Content Rendering: Grid vs List */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <ATMSkeleton variant="rect" height="140px" className="rounded-xl" />
                <ATMSkeleton variant="text" width="60%" />
                <ATMSkeleton variant="text" width="90%" />
                <ATMSkeleton variant="text" width="40%" />
              </div>
            ))}
          </div>
        ) : (
          <ATMCard padding="none" className="overflow-hidden rounded-2xl">
            <ATMTable
              columns={columns}
              data={[]}
              isLoading={true}
              emptyMessage="Loading posts..."
            />
          </ATMCard>
        )
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-3 border border-primary-100 dark:border-primary-900/50">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No blog posts found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'No articles match your active search and status filters. Try clearing filters.'
              : 'Start building your knowledge hub by authoring your first blog post.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {(search || statusFilter !== 'All') && (
              <ATMButton
                variant="secondary"
                size="sm"
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
              >
                Clear Filters
              </ATMButton>
            )}
            <ATMButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/content/blog/new')}
            >
              Create New Article
            </ATMButton>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-500/40 dark:border-slate-800/80 dark:bg-slate-900/90"
            >
              {/* Card Banner Image or Pattern */}
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
                {post.featuredImage ? (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary-900/10 via-primary-500/5 to-transparent">
                    <FileText className="h-12 w-12 text-primary-400/40" />
                  </div>
                )}
                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <ContentStatusBadge status={post.status} className="shadow-sm backdrop-blur-md" />
                </div>
                {post.categoryName && (
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                      {post.categoryName}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between space-y-4">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/content/blog/${post.id}/edit`)}
                    className="text-left font-bold text-base text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400 line-clamp-2 transition-colors duration-150"
                  >
                    {post.title}
                  </button>
                  {post.excerpt ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No summary provided</p>
                  )}
                </div>

                {/* Author & Date Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/60 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">
                      {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{post.author || 'Author'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {post.publishDate ? formatDate(post.publishDate, 'short') : 'Draft'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(post)}
                      title={post.status === 'Published' ? 'Unpublish' : 'Publish Live'}
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                        post.status === 'Published'
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                      )}
                    >
                      {post.status === 'Published' ? <Globe className="h-4 w-4" /> : <GlobeLock className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/content/blog/${post.id}/edit`)}
                      title="Edit Article"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-primary-950/40 dark:hover:text-primary-300 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(post)}
                      title="Delete Article"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ATMCard padding="none" className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <ATMTable
            columns={columns}
            data={filteredPosts}
            isLoading={isLoading}
            rowActions={rowActions}
            emptyMessage="No blog posts match your criteria."
            density="comfortable"
          />
        </ATMCard>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ATMConfirmModal
          isOpen={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Blog Article"
          description={`Are you sure you want to permanently delete "${deleteTarget.title}"? This will remove the article from the public blog archive.`}
          confirmLabel="Delete Article"
          variant="danger"
          isLoading={deleteMut.isPending}
        />
      )}
    </div>
  );
}

export default BlogListPage;
