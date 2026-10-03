import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Search,
  X,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  FileQuestion,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { ATMBadge, ATMButton, ATMCard, ATMSkeleton, ATMTextField } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';

import { cn } from '@/lib/utils/cn';
import { useHelpArticles } from '@/lib/hooks/useContent';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type ArticleStatus = 'Published' | 'Draft' | 'Review';

interface HelpArticleRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: ArticleStatus;
  lastUpdated: string;
  helpful: number;
  notHelpful: number;
}

const STATUS_VARIANT: Record<ArticleStatus, 'success' | 'default' | 'warning'> = {
  Published: 'success',
  Draft: 'default',
  Review: 'warning',
};

function mapStatus(status: string): ArticleStatus {
  if (status === 'Published') return 'Published';
  if (status === 'Review') return 'Review';
  return 'Draft';
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function HelpArticlesPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | ArticleStatus>('All');

  const articlesQuery = useHelpArticles({ page: 1, pageSize: 100 });

  const articles = useMemo<HelpArticleRow[]>(() => {
    const items = articlesQuery.data?.data ?? [];
    return items.map((a: any) => ({
      id: a.articleId ?? a.id,
      slug: a.slug ?? '',
      title: a.title,
      category: a.categoryName ?? a.category ?? 'General',
      status: mapStatus(a.status),
      lastUpdated: a.updatedAt ? String(a.updatedAt).slice(0, 10) : '--',
      helpful: a.helpfulCount ?? 0,
      notHelpful: a.notHelpfulCount ?? 0,
    }));
  }, [articlesQuery.data]);

  const isLoading = articlesQuery.isLoading;
  const isError = articlesQuery.isError;

  // Categories extracted from real data
  const CATEGORIES = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort(),
    [articles],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) {
      counts[a.category] = (counts[a.category] ?? 0) + 1;
    }
    return counts;
  }, [articles]);

  // Telemetry counts
  const publishedCount = useMemo(() => articles.filter((a) => a.status === 'Published').length, [articles]);
  const draftCount = useMemo(() => articles.filter((a) => a.status === 'Draft').length, [articles]);
  const reviewCount = useMemo(() => articles.filter((a) => a.status === 'Review').length, [articles]);
  const totalHelpful = useMemo(() => articles.reduce((sum, a) => sum + a.helpful, 0), [articles]);

  // Filtered dataset
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCategory = !selectedCategory || a.category === selectedCategory;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (a.title || '').toLowerCase().includes(q) ||
        (a.slug || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [articles, selectedCategory, statusFilter, search]);

  const columns = useMemo<ATMTableColumn<HelpArticleRow>[]>(
    () => [
      {
        key: 'title',
        header: 'Article Name & Slug',
        renderCell: (val, row) => (
          <div className="flex items-start gap-3 max-w-lg">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/60 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate(`/content/help/${row.slug || row.id}/edit`)}
                className="text-left font-semibold text-slate-900 hover:text-primary-600 transition-colors dark:text-slate-100 dark:hover:text-primary-400 truncate block text-sm"
              >
                {row.title}
              </button>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                /help/{row.slug}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        renderCell: (val, row) => (
          <ATMBadge variant="outline" size="sm" className="font-medium bg-slate-50 dark:bg-slate-800/60">
            {row.category}
          </ATMBadge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val, row) => (
          <ATMBadge variant={STATUS_VARIANT[row.status]} size="sm" dot>
            {row.status}
          </ATMBadge>
        ),
      },
      {
        key: 'helpful',
        header: 'User Feedback',
        renderCell: (val, row) => (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title="Helpful votes">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="tabular-nums">{row.helpful}</span>
            </div>
            <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium" title="Not helpful votes">
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="tabular-nums">{row.notHelpful}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'lastUpdated',
        header: 'Last Updated',
        renderCell: (val, row) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="tabular-nums">{row.lastUpdated}</span>
          </div>
        ),
      },
    ],
    [navigate],
  );

  const rowActions = useMemo(
    () => (row: HelpArticleRow): RowAction<HelpArticleRow>[] => [
      {
        label: 'Edit Article',
        icon: Pencil,
        onClick: (r) => navigate(`/content/help/${r.slug || r.id}/edit`),
      },
    ],
    [navigate],
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Header */}
      <ATMPageHeader
        icon={BookOpen}
        iconColor="theme"
        title="Help Centre Articles"
        subtitle="Customer support documentation, knowledge base guides, and user onboarding manuals."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/help' },
          { label: 'Help Articles' },
        ]}
        action={{
          label: 'New Article',
          onClick: () => navigate('/content/help/new'),
          icon: Plus,
        }}
      />

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ATMStatsCard
          label="Total Articles"
          value={articles.length}
          description="All help resources"
          icon={BookOpen}
          variant="accent"
        />
        <ATMStatsCard
          label="Published Live"
          value={publishedCount}
          description="Available in knowledge base"
          icon={Sparkles}
          variant="emerald"
        />
        <ATMStatsCard
          label="In Review / Draft"
          value={draftCount + reviewCount}
          description="Under editorial check"
          icon={Clock}
          variant="amber"
        />
        <ATMStatsCard
          label="Helpful Votes"
          value={totalHelpful}
          description="Positive reader feedback"
          icon={ThumbsUp}
          variant="indigo"
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        {/* Status Filter Pills */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50">
          {(['All', 'Published', 'Review', 'Draft'] as const).map((s) => (
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
            </button>
          ))}
        </div>

        {/* Search & View Mode Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-full sm:w-72">
            <ATMTextField
              placeholder="Search by title, category, slug..."
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
            <span>Failed to load help articles. Check network or server status.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void articlesQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Category Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-800/80 dark:bg-slate-900/90 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Categories</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {CATEGORIES.length}
              </span>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                  selectedCategory === ''
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
                )}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  <span>All Categories</span>
                </div>
                <span className="tabular-nums opacity-75 font-mono">{articles.length}</span>
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                    selectedCategory === cat
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{cat}</span>
                  </div>
                  <span className="tabular-nums opacity-75 font-mono ml-2">
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles List / Grid Display */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <ATMSkeleton variant="text" width="40%" />
                  <ATMSkeleton variant="text" width="80%" />
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-3 border border-primary-100 dark:border-primary-900/50">
                <FileQuestion className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No articles found</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search || selectedCategory || statusFilter !== 'All'
                  ? 'No help guides match the selected category or search filters.'
                  : 'Start by writing a help guide to assist users.'}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {(search || selectedCategory || statusFilter !== 'All') && (
                  <ATMButton
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSearch(''); setSelectedCategory(''); setStatusFilter('All'); }}
                  >
                    Clear Filters
                  </ATMButton>
                )}
                <ATMButton
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => navigate('/content/help/new')}
                >
                  New Article
                </ATMButton>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-500/40 dark:border-slate-800/80 dark:bg-slate-900/90"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {article.category}
                      </span>
                      <ATMBadge variant={STATUS_VARIANT[article.status]} size="sm" dot>
                        {article.status}
                      </ATMBadge>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/content/help/${article.slug || article.id}/edit`)}
                        className="text-left font-bold text-base text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400 line-clamp-2 transition-colors"
                      >
                        {article.title}
                      </button>
                      <p className="text-xs text-slate-400 font-mono mt-1">/help/{article.slug}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title="Helpful">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{article.helpful}</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium" title="Not helpful">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{article.notHelpful}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {article.lastUpdated}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/content/help/${article.slug || article.id}/edit`)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-300 transition-colors"
                      title="Edit Article"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ATMCard padding="none" className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <ATMTable
                columns={columns}
                data={filteredArticles}
                isLoading={isLoading}
                rowActions={rowActions}
                emptyMessage="No articles match criteria."
                density="comfortable"
              />
            </ATMCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default HelpArticlesPage;
