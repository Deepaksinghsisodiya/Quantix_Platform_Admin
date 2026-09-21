import React, { useState } from 'react';
import { ATMButton, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Clock, MessageSquare, Smile, AlertTriangle, CheckCircle2, Archive, Inbox } from 'lucide-react';
import { useTicketMetrics } from '@/lib/hooks/useHelpdesk';
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ATMSkeleton key={i} variant="card" height="118px" />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ATMStatsCard
          label="Total Tickets"
          value={(metrics?.totalTickets ?? 0).toLocaleString()}
          icon={MessageSquare}
          variant="accent"
          description="All tickets in the window"
        />
        <ATMStatsCard
          label="Open"
          value={(metrics?.openTickets ?? 0).toLocaleString()}
          icon={Inbox}
          variant="accent"
          description="Still being worked"
        />
        <ATMStatsCard
          label="Resolved"
          value={(metrics?.resolvedTickets ?? 0).toLocaleString()}
          icon={CheckCircle2}
          variant="emerald"
          description="Marked resolved in the window"
        />
        <ATMStatsCard
          label="Closed"
          value={(metrics?.closedTickets ?? 0).toLocaleString()}
          icon={Archive}
          variant="slate"
          description="Closed out in the window"
        />
        <ATMStatsCard
          label="Avg Resolution Time"
          value={`${(metrics?.avgResolutionHours ?? 0).toFixed(1)}h`}
          icon={Clock}
          variant="amber"
          description="Mean time to resolve"
        />
        <ATMStatsCard
          label="CSAT Score"
          value={metrics && metrics.csatScore > 0 ? `${metrics.csatScore.toFixed(1)}/5` : 'No ratings yet'}
          icon={Smile}
          variant="emerald"
          description="Customer satisfaction score"
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={MessageSquare}
        iconColor="theme"
        title="Ticket Metrics"
        subtitle="Tickets created in the selected window (the last 30 days when no dates are set)"
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/40">
          <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load ticket metrics.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void metricsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-base h-10" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-base h-10" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Merchant Type</label>
          <select
            value={merchantType}
            onChange={(e) => setMerchantType(e.target.value as MerchantType | '')}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          >
            <option value="">All Types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Standalone">Standalone</option>
          </select>
        </div>
      </div>

      {renderKpiCards()}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        First-response time is not tracked by the platform yet, so it is not shown. Tickets are not assigned to
        platform users, so there is no per-agent breakdown.
      </p>
    </div>
  );
}

export default TicketMetricsPage;