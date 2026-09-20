import React, { useCallback } from 'react';
import { useGetBlogPostsQuery, useGetHelpArticlesQuery, useGetFaqsQuery } from '@/modules/content/services/contentApi';
import { useGetLeadsQuery } from '@/modules/helpdesk/services/helpdeskApi';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ContentManagerDashboard, { type ContentCounts } from './ContentManagerDashboard';

/**
 * 2026-09-05 (decision C): blog posts, help articles, FAQs and leads all answer with the
 * API's paged envelope now, so the desk reads real totals. It used to fetch up to 200 rows
 * of each and count them, showing "200+" at the cap.
 */
const COUNT_ONLY = { page: 1, pageSize: 1 } as const;

/**
 * 2026-09-04: the Content desktop was links only. It now shows how much content exists and
 * how many leads are waiting, from the same list endpoints the pages behind the links use.
 */
export const ContentManagerDashboardWrapper: React.FC = () => {
  const blogQuery = useGetBlogPostsQuery(COUNT_ONLY);
  const helpQuery = useGetHelpArticlesQuery(COUNT_ONLY);
  const faqQuery = useGetFaqsQuery({});
  const leadsQuery = useGetLeadsQuery({ ...COUNT_ONLY, status: 'New' });

  const queries = [blogQuery, helpQuery, faqQuery, leadsQuery];
  const isInitialLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const isFetching = queries.some((q) => q.isFetching);

  const handleRetry = useCallback(() => {
    void blogQuery.refetch();
    void helpQuery.refetch();
    void faqQuery.refetch();
    void leadsQuery.refetch();
  }, [blogQuery, helpQuery, faqQuery, leadsQuery]);

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 animate-fade-in w-full">
        <div className="flex justify-between items-baseline pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            <ATMSkeleton width="200px" height="24px" />
            <ATMSkeleton width="300px" height="14px" />
          </div>
          <ATMSkeleton width="80px" height="24px" className="rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <ATMSkeleton key={i} height="120px" className="rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 w-full">
        <div className="flex flex-col items-center max-w-md text-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Failed to Load Content Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            The content and lead counts could not be fetched. Please try again.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const counts: ContentCounts = {
    blogPosts: blogQuery.data?.totalCount ?? 0,
    helpArticles: helpQuery.data?.totalCount ?? 0,
    faqs: faqQuery.data?.totalCount ?? 0,
    newLeads: leadsQuery.data?.totalCount ?? 0,
  };

  return <ContentManagerDashboard counts={counts} isFetching={isFetching} />;
};

export default ContentManagerDashboardWrapper;
