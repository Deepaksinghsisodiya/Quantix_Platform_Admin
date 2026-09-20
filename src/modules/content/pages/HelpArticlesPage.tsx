import { useNavigate } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMButton } from '@/shared/ui';
import { Plus, BookOpen, Eye, ThumbsUp, ThumbsDown, Pencil, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  // 2026-09-05 (Phase 2): `views` removed. It was hardcoded 0 for every article because no view
  // count exists on the server, so the eye icon reported a number nobody measures.
  helpful: number;
  notHelpful: number;
}

// 2026-09-05 (Phase 2): the hardcoded four are gone. Categories are derived from the articles
// themselves, so an article filed under anything else is no longer invisible and unreachable.

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
  // 2026-09-05: no default category. It used to open on "Getting Started" and filter to an exact
  // match, so on a deployment without that exact category the page looked empty.
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const articlesQuery = useHelpArticles({ page: 1, pageSize: 100 });

  const articles = useMemo<HelpArticleRow[]>(() => {
    const items = articlesQuery.data?.data ?? [];
    return items.map((a: any) => ({
      id: a.articleId ?? a.id,
      slug: a.slug ?? '',
      title: a.title,
      category: a.categoryName ?? a.category ?? '',
      status: mapStatus(a.status),
      // Was `a.updatedAt.slice(0,10)`, which threw outright when the API omitted the field.
      lastUpdated: a.updatedAt ? String(a.updatedAt).slice(0, 10) : '--',
      helpful: a.helpfulCount ?? 0,
      notHelpful: a.notHelpfulCount ?? 0,
    }));
  }, [articlesQuery.data]);

  const isLoading = articlesQuery.isLoading;
  const isError = articlesQuery.isError;

  const filteredArticles = useMemo(
    () => (selectedCategory ? articles.filter((a) => a.category === selectedCategory) : articles),
    [articles, selectedCategory],
  );

  // Categories are whatever the articles actually use.
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Help Centre Articles
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage help and documentation articles for the knowledge base.
          </p>
        </div>
        <ATMButton variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/content/help/new')}>
          New Article
        </ATMButton>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load articles.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void articlesQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Category sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Categories</h3>
            </div>
            <div className="p-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    selectedCategory === cat
                      ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{cat}</span>
                  </div>
                  <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Article list */}
        <div className="lg:col-span-3">
          <div className="space-y-3">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}
            {!isLoading && filteredArticles.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <BookOpen className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">No articles in this category</p>
              </div>
            )}
            {!isLoading && filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.title}</h4>
                    <ATMBadge variant={STATUS_VARIANT[article.status]} size="sm">{article.status}</ATMBadge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {article.lastUpdated}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Helpful">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{article.helpful}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500 dark:text-red-400" title="Not helpful">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{article.notHelpful}</span>
                  </div>
                  <ATMButton variant="ghost" size="sm" onClick={() => navigate(`/content/help/${article.slug}/edit`)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </ATMButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpArticlesPage;
