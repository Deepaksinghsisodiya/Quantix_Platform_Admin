import React, { useState, useMemo, useCallback } from 'react';
import { useFilterStore } from '@/lib/store/filterStore';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import {
  useGetDashboardSummaryQuery,
  useGetMerchantGrowthQuery,
  useGetRevenueMetricsQuery,
  useGetSystemHealthQuery,
  useGetUsageMetricsQuery,
  useGetMerchantHealthQuery,
  useGetTokenMetricsQuery,
  useGetCommissionSummaryQuery,
} from '../services/dashboardApi';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import AdminDashboard from './AdminDashboard';

type DateRangeKey = '7d' | '30d' | '90d' | '12m';

const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '12m', label: '12 months' },
];

function dateRangeToISO(range: DateRangeKey): { fromDate: string; toDate: string } {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);
  switch (range) {
    case '7d': from.setDate(from.getDate() - 7); break;
    case '30d': from.setDate(from.getDate() - 30); break;
    case '90d': from.setDate(from.getDate() - 90); break;
    case '12m': from.setFullYear(from.getFullYear() - 1); break;
  }
  return { fromDate: from.toISOString(), toDate: to };
}

export const AdminDashboardWrapper: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeKey>('12m');
  const { merchantTypeFilter, setMerchantType } = useFilterStore();

  const { fromDate, toDate } = useMemo(() => dateRangeToISO(dateRange), [dateRange]);

  // Fetch queries using RTK Query
  const summaryQuery = useGetDashboardSummaryQuery(merchantTypeFilter);
  const growthQuery = useGetMerchantGrowthQuery({ fromDate, toDate, merchantType: merchantTypeFilter });
  const revenueQuery = useGetRevenueMetricsQuery({ fromDate, toDate, groupBy: 'month', merchantType: merchantTypeFilter });
  const systemHealthQuery = useGetSystemHealthQuery();
  const usageQuery = useGetUsageMetricsQuery({ fromDate, toDate, merchantType: merchantTypeFilter });
  const merchantHealthQuery = useGetMerchantHealthQuery({ page: 1, pageSize: 60, merchantType: merchantTypeFilter });
  const tokenMetricsQuery = useGetTokenMetricsQuery();
  const commissionQuery = useGetCommissionSummaryQuery();

  const refreshCallback = useCallback(async () => {
    void summaryQuery.refetch();
    void growthQuery.refetch();
    void revenueQuery.refetch();
    void systemHealthQuery.refetch();
    void usageQuery.refetch();
    void merchantHealthQuery.refetch();
    void tokenMetricsQuery.refetch();
    void commissionQuery.refetch();
  }, [
    summaryQuery,
    growthQuery,
    revenueQuery,
    systemHealthQuery,
    usageQuery,
    merchantHealthQuery,
    tokenMetricsQuery,
    commissionQuery,
  ]);

  const { paused, secondsUntilRefresh, toggle: toggleRefresh, refreshNow } = useAutoRefresh(
    refreshCallback,
    60_000,
  );

  const isLoadingHeader = summaryQuery.isLoading || revenueQuery.isLoading;

  const hasError =
    summaryQuery.isError ||
    growthQuery.isError ||
    revenueQuery.isError ||
    systemHealthQuery.isError ||
    usageQuery.isError ||
    merchantHealthQuery.isError ||
    tokenMetricsQuery.isError ||
    commissionQuery.isError;

  const isInitialLoading =
    summaryQuery.isLoading &&
    growthQuery.isLoading &&
    revenueQuery.isLoading;

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 animate-fade-in w-full">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            <ATMSkeleton width="180px" height="24px" />
            <ATMSkeleton width="280px" height="14px" />
          </div>
          <div className="flex gap-2">
            <ATMSkeleton width="100px" height="36px" className="rounded-xl" />
            <ATMSkeleton width="120px" height="36px" className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ATMSkeleton key={i} height="130px" className="rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ATMSkeleton height="360px" className="rounded-3xl" />
          </div>
          <div className="lg:col-span-1">
            <ATMSkeleton height="360px" className="rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      summaryQuery={summaryQuery}
      growthQuery={growthQuery}
      revenueQuery={revenueQuery}
      systemHealthQuery={systemHealthQuery}
      usageQuery={usageQuery}
      merchantHealthQuery={merchantHealthQuery}
      tokenMetricsQuery={tokenMetricsQuery}
      commissionQuery={commissionQuery}
      dateRange={dateRange}
      setDateRange={setDateRange}
      merchantTypeFilter={merchantTypeFilter}
      setMerchantType={setMerchantType}
      paused={paused}
      secondsUntilRefresh={secondsUntilRefresh}
      toggleRefresh={toggleRefresh}
      refreshNow={refreshNow}
      isLoadingHeader={isLoadingHeader}
      hasError={hasError}
    />
  );
};

export default AdminDashboardWrapper;
