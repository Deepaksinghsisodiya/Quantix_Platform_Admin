import React, { useCallback } from 'react';
import { useGetBillingDashboardQuery } from '@/modules/billing/services/billingApi';
import { useGetWalletsQuery } from '@/modules/wallet/services/walletApi';
import { useGetCommissionSummaryQuery } from '../services/dashboardApi';
import { ATMPageSkeleton } from '@/shared/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';
import FinanceManagerDashboard from './FinanceManagerDashboard';

/** Only the total is needed, so a single row is requested. */
const WALLET_COUNT_ONLY = { page: 1, pageSize: 1 } as const;

/**
 * 2026-09-04: the Finance desktop read the platform summary + revenue report and showed
 * "Pending Invoices —" and "Active Wallets" = active merchants. It now reads the billing
 * dashboard (invoiced / collected / outstanding / overdue, real currency), the commission
 * summary and the wallet list — the same endpoints the pages behind its links use.
 */
export const FinanceManagerDashboardWrapper: React.FC = () => {
  const billingQuery = useGetBillingDashboardQuery();
  const commissionQuery = useGetCommissionSummaryQuery();
  // 2026-09-05 (decision C): /wallet/summary answers with the paged envelope, so the desk
  // reads the real total instead of counting the rows it happened to fetch.
  const walletsQuery = useGetWalletsQuery(WALLET_COUNT_ONLY);

  const isInitialLoading = billingQuery.isLoading || commissionQuery.isLoading || walletsQuery.isLoading;
  const isError = billingQuery.isError || commissionQuery.isError || walletsQuery.isError;

  const handleRetry = useCallback(() => {
    void billingQuery.refetch();
    void commissionQuery.refetch();
    void walletsQuery.refetch();
  }, [billingQuery, commissionQuery, walletsQuery]);

  if (isInitialLoading) {
    return <ATMPageSkeleton variant="dashboard" height="120px" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 w-full">
        <div className="flex flex-col items-center max-w-md text-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Failed to Load Finance Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            The billing, commission or wallet figures could not be fetched. Please try again.
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

  const walletCount = walletsQuery.data?.totalCount;

  return (
    <FinanceManagerDashboard
      billing={billingQuery.data?.data}
      commission={commissionQuery.data?.data}
      walletCount={walletCount}
      isFetching={billingQuery.isFetching || commissionQuery.isFetching || walletsQuery.isFetching}
    />
  );
};

export default FinanceManagerDashboardWrapper;
