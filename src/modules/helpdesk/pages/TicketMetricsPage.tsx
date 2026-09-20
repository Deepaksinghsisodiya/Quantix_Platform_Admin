import React, { useState } from 'react';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { Clock, MessageSquare, Smile, AlertTriangle, CheckCircle2, Archive, Inbox } from 'lucide-react';
import { useTicketMetrics } from '@/lib/hooks/useHelpdesk';
import { cn } from '@/lib/utils/cn';
import type { MerchantType } from '@/lib/types/common';

/**
 * 2026-09-04: rebuilt on the API's TicketMetricsDto. The page used to read `totalOpen`,
 * `byCategory`, `byAgent`, `slaCompliancePercent` (none of which the API sends), printed a
 * hardcoded "1.2h" first response and "4.6/5" CSAT, and offered an Export button wired to
 * nothing. The API's own gaps are stated rather than filled: first-response time is not
 * tracked, so it is not shown. (2026-09-04: no per-agent axis exists any more — tickets are
 * not assigned to platform users.)
 */
function TicketMetricsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [merchantType, setMerchantType] = useState<MerchantType | ''>('');

  const metricsQuery = useTicketMetrics({
    fromDate: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    toDate: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
    merchantType: merchantType || undefined,
  });

  const metrics = metricsQuery.data?.data;
  const isLoading = metricsQuery.isLoading;
  const isError = metricsQuery.isError;

  function renderKpiCards() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <ATMSkeleton variant="text" width="60%" />
              <ATMSkeleton variant="text" width="40%" height="32px" className="mt-2" />
            </div>
          ))}
        </div>
      );
    }

    const kpis = [
      { label: 'Total Tickets', value: (metrics?.totalTickets ?? 0).toLocaleString(), icon: <MessageSquare className="h-5 w-5 text-blue-500" />, color: 'text-gray-900 dark:text-gray-100' },
      { label: 'Open', value: (metrics?.openTickets ?? 0).toLocaleString(), icon: <Inbox className="h-5 w-5 text-indigo-500" />, color: 'text-indigo-600 dark:text-indigo-400' },
      { label: 'Resolved', value: (metrics?.resolvedTickets ?? 0).toLocaleString(), icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Closed', value: (metrics?.closedTickets ?? 0).toLocaleString(), icon: <Archive className="h-5 w-5 text-gray-500" />, color: 'text-gray-700 dark:text-gray-300' },
      { label: 'Avg Resolution Time', value: `${(metrics?.avgResolutionHours ?? 0).toFixed(1)}h`, icon: <Clock className="h-5 w-5 text-amber-500" />, color: 'text-amber-600 dark:text-amber-400' },
      { label: 'CSAT Score', value: metrics && metrics.csatScore > 0 ? `${metrics.csatScore.toFixed(1)}/5` : 'No ratings yet', icon: <Smile className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
    ];

    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <p className={cn('text-2xl font-bold tabular-nums', kpi.color)}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ticket Metrics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tickets created in the selected window (the last 30 days when no dates are set)
        </p>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load ticket metrics.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void metricsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant Type</label>
          <select value={merchantType} onChange={(e) => setMerchantType(e.target.value as MerchantType | '')} className="input-select">
            <option value="">All Types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Standalone">Standalone</option>
          </select>
        </div>
      </div>

      {renderKpiCards()}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        First-response time is not tracked by the platform yet, so it is not shown. Tickets are not assigned to
        platform users, so there is no per-agent breakdown.
      </p>
    </div>
  );
}

export default TicketMetricsPage;
