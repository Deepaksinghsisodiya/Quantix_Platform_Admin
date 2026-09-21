import { useNavigate } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton, ATMEmptyState } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Plus, BookOpen, Eye, ThumbsUp, ThumbsDown, Pencil, AlertTriangle } from 'lucide-react';
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
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={BookOpen}
        iconColor="theme"
        title="Help Centre Articles"
        subtitle="Manage help and documentation articles for the knowledge base."
        extraActions={
          <ATMButton variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/content/help/new')}>
            New Article
          </ATMButton>
        }
      />

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
          <ATMCard padding="none" className="overflow-hidden">
            <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Categories</h3>
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
                      ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-500/10 dark:text-primary-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{cat}</span>
                  </div>
                  <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </ATMCard>
        </div>

        {/* Article list */}
        <div className="lg:col-span-3">
          <div className="space-y-3">
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="68px" />)}
              </div>
            )}
            {!isLoading && filteredArticles.length === 0 && (
              <ATMCard>
                <ATMEmptyState icon={BookOpen} title="No articles in this category" />
              </ATMCard>
            )}
            {!isLoading && filteredArticles.map((article) => (
              <ATMCard key={article.id} padding="none" className="transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{article.title}</h4>
                      <ATMBadge variant={STATUS_VARIANT[article.status]} size="sm">{article.status}</ATMBadge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last updated: {article.lastUpdated}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
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
              </ATMCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpArticlesPage;
