import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ATMBadge, ATMButton, ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Clock, CheckCircle2, AlertTriangle, XCircle, PlayCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { useComplianceDashboard, useComplianceRequests } from '@/lib/hooks/useCompliance';
import {
  COMPLIANCE_STATUS_LABEL,
  COMPLIANCE_TYPE_LABEL,
  type ComplianceRequest,
  type ComplianceRequestType,
  type ComplianceStatus,
} from '@/lib/types/compliance';

/**
 * Compliance Overview — 2026-09-08, rebuilt on what the API measures.
 *
 * The previous page carried a REGION_STATUS constant of five invented regions (EU, US, Brazil,
 * Middle East, Asia Pacific) with invented merchant counts, mapped every request to "GDPR", and
 * when there were no requests at all drew a 60/25/15 GDPR/CCPA/LGPD bar as if that were data.
 * This is a single-country deployment; there is no regulation or region axis. What the API
 * knows is: how many requests are pending, in progress, completed, rejected, how many are open
 * past the response window, and the split by request type. That is what this shows.
 *
 * Page title matches the sidebar label verbatim.
 */

const STATUS_VARIANT: Record<ComplianceStatus, 'warning' | 'info' | 'success' | 'default'> = {
  Pending: 'warning',
  InProgress: 'info',
  Completed: 'success',
  Rejected: 'default',
};

const TYPE_VARIANT: Record<ComplianceRequestType, 'info' | 'danger' | 'warning'> = {
  DataExport: 'info',
  RightToDelete: 'danger',
  ConsentWithdrawal: 'warning',
};

function ComplianceDashboardPage() {
  const navigate = useNavigate();
  const dashboardQuery = useComplianceDashboard();
  const openQuery = useComplianceRequests({ page: 1, pageSize: 50 });

  const dashboard = dashboardQuery.data?.data;
  const open = useMemo(
    () => (openQuery.data?.data ?? []).filter((r) => r.status === 'Pending' || r.status === 'InProgress'),
    [openQuery.data],
  );

  const isLoading = dashboardQuery.isLoading || openQuery.isLoading;
  const isError = dashboardQuery.isError || openQuery.isError;

  const totalByType = (dashboard?.byType ?? []).reduce((s, t) => s + t.count, 0);

  const openColumns: ATMTableColumn<ComplianceRequest>[] = [
    {
      key: 'merchantName',
      header: 'Merchant',
      renderCell: (_v, r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">{r.merchantName || r.merchantId.slice(0, 8)}</span>
          {r.merchantType && <ATMBadge variant={r.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{r.merchantType}</ATMBadge>}
        </div>
      ),
    },
    {
      key: 'requestType',
      header: 'Type',
      renderCell: (_v, r) => <ATMBadge variant={TYPE_VARIANT[r.requestType]} size="sm">{COMPLIANCE_TYPE_LABEL[r.requestType]}</ATMBadge>,
    },
    {
      key: 'requestedBy',
      header: 'Requested by',
      renderCell: (_v, r) => <span className="text-slate-600 dark:text-slate-300">{r.requestedBy}</span>,
    },
    {
      key: 'dueAt',
      header: 'Due',
      renderCell: (_v, r) => (
        <span className={cn('tabular-nums', r.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300')}>
          {formatDate(r.dueAt, 'short')}{r.isOverdue ? ' · overdue' : ''}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, r) => <ATMBadge variant={STATUS_VARIANT[r.status]} size="sm">{COMPLIANCE_STATUS_LABEL[r.status]}</ATMBadge>,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={ShieldCheck}
        iconColor="theme"
        title="Compliance Overview"
        subtitle="Data subject requests — exports, deletions and consent withdrawals — and where each one stands."
        extraActions={
          <ATMButton variant="primary" size="sm" onClick={() => navigate('/compliance/data-requests')}>
            Open Data Requests
            <ArrowRight className="ml-1 h-4 w-4" />
          </ATMButton>
        }
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load compliance data.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void dashboardQuery.refetch(); void openQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)
        ) : (
          <>
            <ATMStatsCard
              label="Pending"
              value={(dashboard?.pendingRequests ?? 0).toLocaleString()}
              icon={Clock}
              variant="amber"
              description="Awaiting approval"
            />
            <ATMStatsCard
              label="In Progress"
              value={(dashboard?.inProgressRequests ?? 0).toLocaleString()}
              icon={PlayCircle}
              variant="accent"
              description="Approved, not yet executed"
            />
            <ATMStatsCard
              label="Overdue"
              value={(dashboard?.overdueRequests ?? 0).toLocaleString()}
              icon={AlertTriangle}
              variant="rose"
              description={dashboard ? `Open for more than ${dashboard.responseWindowDays} days` : 'Open past the response window'}
            />
            <ATMStatsCard
              label="Completed"
              value={(dashboard?.completedRequests ?? 0).toLocaleString()}
              icon={CheckCircle2}
              variant="emerald"
              description="Executed"
            />
            <ATMStatsCard
              label="Rejected"
              value={(dashboard?.rejectedRequests ?? 0).toLocaleString()}
              icon={XCircle}
              variant="slate"
              description="Declined with a note"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ATMCard title="By Request Type" className="lg:col-span-1" loading={isLoading}>
          {isLoading ? (
            <ATMSkeleton variant="rect" height="180px" />
          ) : totalByType === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-10 text-center text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              No requests recorded yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {(dashboard?.byType ?? []).map((t) => {
                const pct = Math.round((t.count / totalByType) * 100);
                const label = COMPLIANCE_TYPE_LABEL[t.key as ComplianceRequestType] ?? t.key;
                return (
                  <li key={t.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">{label}</span>
                      <span className="tabular-nums text-slate-500 dark:text-slate-400">{t.count} · {pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {dashboard && (
            <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
              Response window: {dashboard.responseWindowDays} days (setting <code>compliance.response_window_days</code>).
            </p>
          )}
        </ATMCard>

        <ATMCard title="Open Requests" padding="none" className="lg:col-span-2 overflow-hidden" loading={isLoading}>
          {isLoading ? (
            <ATMSkeleton variant="rect" height="240px" />
          ) : open.length === 0 ? (
            <div className="m-4 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-10 text-center text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              No open data requests.
            </div>
          ) : (
            <ATMTable
              columns={openColumns}
              data={open}
              emptyMessage="No open data requests."
              onRowClick={(r) => navigate(`/compliance/data-requests?id=${r.requestId}`)}
            />
          )}
        </ATMCard>
      </div>
    </div>
  );
}

export default ComplianceDashboardPage;