import React, { useCallback, useMemo } from 'react';
import { useGetTicketsQuery } from '@/modules/helpdesk/services/helpdeskApi';
import { OPEN_TICKET_STATUSES } from '@/lib/types/helpdesk';
import { ATMPageSkeleton } from '@/shared/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';
import OperatorDashboard, { type OperatorQueueStats } from './OperatorDashboard';

/**
 * The list endpoint filters on ONE status at a time and has no "open" aggregate, so the desk
 * reads the latest page of tickets and counts client-side. The desk says how many tickets
 * the counts cover whenever the queue is larger than this sample (the API's page cap).
 */
const SAMPLE_SIZE = 200;

/**
 * 2026-09-04: the Operator desktop used to show the words "Inbox" / "Alert" / "Done" where
 * numbers belonged. It now counts the real queue.
 */
export const OperatorDashboardWrapper: React.FC = () => {
  const ticketsQuery = useGetTicketsQuery({ page: 1, pageSize: SAMPLE_SIZE });

  const stats = useMemo<OperatorQueueStats>(() => {
    const rows = ticketsQuery.data?.data ?? [];
    const total = ticketsQuery.data?.totalCount ?? rows.length;
    const now = Date.now();
    const open = rows.filter((t) => OPEN_TICKET_STATUSES.has(t.status));
    return {
      open: open.length,
      escalated: open.filter((t) => t.isEscalated).length,
      pastSla: open.filter((t) => !!t.slaDeadline && Date.parse(t.slaDeadline) < now).length,
      resolved: rows.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
      sampled: rows.length,
      total,
    };
  }, [ticketsQuery.data]);

  const handleRetry = useCallback(() => {
    void ticketsQuery.refetch();
  }, [ticketsQuery]);

  if (ticketsQuery.isLoading) {
    return <ATMPageSkeleton variant="stats" />;
  }

  if (ticketsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 w-full">
        <div className="flex flex-col items-center max-w-md text-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Failed to Load Operator Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            The support queue could not be fetched. Please try again.
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

  return <OperatorDashboard stats={stats} isFetching={ticketsQuery.isFetching} />;
};

export default OperatorDashboardWrapper;
