import React, { useState, useMemo, useCallback } from 'react';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import {
  useGetSelfProfileQuery,
  useGetSelfTokensQuery,
  useGetSelfInvoicesQuery,
  useGetSelfWalletQuery,
  useGetSelfWalletTransactionsQuery,
  useGetSelfSubscriptionQuery,
  useGetSelfDownloadsQuery,
  useGetSelfTicketsQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { ATMPageSkeleton } from '@/shared/ui';
import MerchantDashboard from './MerchantDashboard';

export type DateRangeKey = '7d' | '30d' | '90d' | '12m';

export const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '12m', label: '12 months' },
];

export function dateRangeToISO(range: DateRangeKey): { fromDate: string; toDate: string } {
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

/**
 * MerchantDashboardWrapper — 2026-09-21. Data layer for the merchant dashboard, styled after
 * the staff AdminDashboardWrapper: one date-range state feeds every windowed figure, and a
 * shared auto-refresh loop keeps the merchant's own numbers current.
 *
 * Everything comes from /api/v1/merchant-self/* (scoped server-side by the merchant_id JWT
 * claim). The Enterprise-only routes (wallet, wallet transactions, subscription) answer
 * 400 MERCHANT_TYPE_MISMATCH for Standalone merchants and are skipped, not rendered as an
 * error the merchant can do nothing about.
 */
export const MerchantDashboardWrapper: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeKey>('12m');

  const { fromDate, toDate } = useMemo(() => dateRangeToISO(dateRange), [dateRange]);

  const profileQuery = useGetSelfProfileQuery();
  const merchant = (profileQuery.data?.data ?? null) as MerchantSelfProfile | null;
  const isEnterprise = merchant?.merchantType === 'Enterprise';

  const tokensQuery = useGetSelfTokensQuery(undefined);
  const invoicesQuery = useGetSelfInvoicesQuery({ page: 1, pageSize: 20 });
  const downloadsQuery = useGetSelfDownloadsQuery();
  const ticketsQuery = useGetSelfTicketsQuery({ page: 1, pageSize: 10 });

  const walletQuery = useGetSelfWalletQuery(undefined, { skip: !isEnterprise });
  const walletTxnQuery = useGetSelfWalletTransactionsQuery(
    { fromDate, toDate, page: 1, pageSize: 200 },
    { skip: !isEnterprise },
  );
  const subscriptionQuery = useGetSelfSubscriptionQuery(undefined, { skip: !isEnterprise });

  const refreshCallback = useCallback(() => {
    void profileQuery.refetch();
    void tokensQuery.refetch();
    void invoicesQuery.refetch();
    void downloadsQuery.refetch();
    void ticketsQuery.refetch();
    if (isEnterprise) {
      void walletQuery.refetch();
      void walletTxnQuery.refetch();
      void subscriptionQuery.refetch();
    }
  }, [
    profileQuery,
    tokensQuery,
    invoicesQuery,
    downloadsQuery,
    ticketsQuery,
    walletQuery,
    walletTxnQuery,
    subscriptionQuery,
    isEnterprise,
  ]);

  const { paused, secondsUntilRefresh, toggle: toggleRefresh, refreshNow } = useAutoRefresh(
    refreshCallback,
    60_000,
  );

  const isLoadingHeader = profileQuery.isLoading || tokensQuery.isLoading || invoicesQuery.isLoading;

  const hasError =
    profileQuery.isError ||
    tokensQuery.isError ||
    invoicesQuery.isError ||
    downloadsQuery.isError ||
    ticketsQuery.isError ||
    (isEnterprise &&
      (walletQuery.isError || walletTxnQuery.isError || subscriptionQuery.isError));

  if (profileQuery.isLoading) {
    return <ATMPageSkeleton variant="dashboard" cards={6} />;
  }

  return (
    <MerchantDashboard
      profileQuery={profileQuery}
      tokensQuery={tokensQuery}
      walletQuery={walletQuery}
      walletTxnQuery={walletTxnQuery}
      invoicesQuery={invoicesQuery}
      subscriptionQuery={subscriptionQuery}
      downloadsQuery={downloadsQuery}
      ticketsQuery={ticketsQuery}
      isEnterprise={isEnterprise}
      dateRange={dateRange}
      setDateRange={setDateRange}
      paused={paused}
      secondsUntilRefresh={secondsUntilRefresh}
      toggleRefresh={toggleRefresh}
      refreshNow={refreshNow}
      isLoadingHeader={isLoadingHeader}
      hasError={hasError}
    />
  );
};

export default MerchantDashboardWrapper;