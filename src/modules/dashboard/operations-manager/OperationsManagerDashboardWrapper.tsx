import React, { useCallback } from 'react';
import { useGetDashboardSummaryQuery, useGetMerchantGrowthQuery } from '../services/dashboardApi';
import { useGetSignupQueueQuery } from '@/modules/merchants/services/merchantApi';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import OperationsManagerDashboard from './OperationsManagerDashboard';

export const OperationsManagerDashboardWrapper: React.FC = () => {
  const summaryQuery = useGetDashboardSummaryQuery(undefined);
  const growthQuery = useGetMerchantGrowthQuery({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    toDate: new Date().toISOString(),
  });
  
  const queueQuery = useGetSignupQueueQuery({ page: 1, pageSize: 100 });

  const isInitialLoading = summaryQuery.isLoading || growthQuery.isLoading || queueQuery.isLoading;
  const isError = summaryQuery.isError || growthQuery.isError || queueQuery.isError;

  const handleRetry = useCallback(() => {
    void summaryQuery.refetch();
    void growthQuery.refetch();
    void queueQuery.refetch();
  }, [summaryQuery, growthQuery, queueQuery]);

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 animate-fade-in w-full">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ATMSkeleton height="160px" className="rounded-2xl" />
          <ATMSkeleton height="160px" className="rounded-2xl" />
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
            Failed to Load Operations Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            There was an issue fetching dashboard data. Please try again.
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

  return (
    <OperationsManagerDashboard
      summary={summaryQuery.data?.data}
      growth={growthQuery.data?.data}
      queue={(queueQuery.data?.data as any) ?? []}
      isFetching={summaryQuery.isFetching || growthQuery.isFetching || queueQuery.isFetching}
      refetch={handleRetry}
    />
  );
};

export default OperationsManagerDashboardWrapper;
