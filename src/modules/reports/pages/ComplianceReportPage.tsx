/**
 * ComplianceReportPage — FRS-SAP-706
 *
 * Data subject requests (exports, deletions, consent withdrawals): where the register stands,
 * how many are open past the response window, and the list.
 *
 * 2026-09-08: rebuilt on the API's real dashboard shape. The previous version read a
 * `consentRate` and a per-region merchant map that the API never sent (both rendered as "—"
 * forever), mapped every request type to one of three labels via fields that did not exist, and
 * called the list at a route that 404'd. This is a single-country deployment; there is no
 * regulation or region axis to report on.
 */

import React, { useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMStatsCard, ATMPageSkeleton, ATMSkeleton } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { useComplianceDashboard, useComplianceRequests } from '@/lib/hooks/useCompliance';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';
import {
  COMPLIANCE_STATUS_LABEL,
  COMPLIANCE_TYPE_LABEL,
  type ComplianceRequestType,
  type ComplianceStatus,
} from '@/lib/types/compliance';
import { ReportExportMenu } from '../components/ReportExportMenu';
import {
  ReportError,
  ReportEmpty,
} from '../components/ReportToolbar';
import type { ComplianceRequest } from '@/lib/types/compliance';

function ComplianceReportPage() {
  const requestsQuery = useComplianceRequests({ page: 1, pageSize: 50 });
  const dashboardQuery = useComplianceDashboard();

  const requests = requestsQuery.data?.data ?? [];
  const dashboard = dashboardQuery.data?.data;

  const isLoading = requestsQuery.isLoading || dashboardQuery.isLoading;
  const isError = requestsQuery.isError || dashboardQuery.isError;

  const totalByType = useMemo(() => (dashboard?.byType ?? []).reduce((s, t) => s + t.count, 0), [dashboard]);
  const fmt = (n: number | undefined) => (n === undefined ? '—' : n.toLocaleString());

  const statusIcon = (status: ComplianceStatus) => {
    if (status === 'Completed') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === 'InProgress') return <Clock className="h-4 w-4 text-blue-500" />;
    if (status === 'Rejected') return <XCircle className="h-4 w-4 text-gray-400" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  };

  const columns: ATMTableColumn<ComplianceRequest>[] = [
    {
      key: 'merchantName',
      header: 'Merchant',
      renderCell: (_v, req) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {req.merchantName || req.merchantId.slice(0, 8)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {req.merchantId}
          </span>
        </div>
      ),
    },
    {
      key: 'merchantType',
      header: 'Type',
      renderCell: (_v, req) =>
        req.merchantType ? (
          <ATMBadge variant={req.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
            {req.merchantType}
          </ATMBadge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
      width: '110px',
    },
    {
      key: 'requestType',
      header: 'Request',
      renderCell: (_v, req) => (
        <span className="text-slate-700 dark:text-slate-300">
          {COMPLIANCE_TYPE_LABEL[req.requestType as ComplianceRequestType] ?? req.requestType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, req) => (
        <div className="flex items-center gap-1.5">
          {statusIcon(req.status)}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {COMPLIANCE_STATUS_LABEL[req.status]}
          </span>
        </div>
      ),
      width: '130px',
    },
    {
      key: 'createdAt',
      header: 'Received',
      renderCell: (_v, req) => <span className="text-slate-500 dark:text-slate-400">{formatDate(req.createdAt, 'short')}</span>,
      width: '110px',
    },
    {
      key: 'dueAt',
      header: 'Due',
      renderCell: (_v, req) => (
        <span className={cn(req.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')}>
          {formatDate(req.dueAt, 'short')}
        </span>
      ),
      width: '110px',
    },
    {
      key: 'completedAt',
      header: 'Completed',
      renderCell: (_v, req) => (
        <span className="text-slate-500 dark:text-slate-400">
          {req.completedAt ? formatDate(req.completedAt, 'short') : '—'}
        </span>
      ),
      width: '110px',
    },
  ];

  const openCount =
    isLoading ? null : requests.filter((r) => r.status === 'Pending' || r.status === 'InProgress').length;

  return (
    <div className="space-y-6">
      <ATMPageHeader
        icon={ShieldCheck}
        iconColor="violet"
        title="Compliance Report"
        subtitle="Data subject requests and their status against the response window"
        extraActions={<ReportExportMenu report="compliance" disabled={isLoading || isError} />}
      />

      {isError && (
        <ReportError
          message="Failed to load compliance data."
          onRetry={() => {
            void requestsQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      )}

      {isLoading ? (
        <ATMPageSkeleton variant="stats" cards={4} />
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard
          label="Pending Requests"
          value={fmt(dashboard?.pendingRequests)}
          icon={Clock}
          variant="amber"
          description="Awaiting a decision"
        />
        <ATMStatsCard
          label="In Progress"
          value={fmt(dashboard?.inProgressRequests)}
          icon={CheckCircle2}
          variant="indigo"
          description="Approved, not yet executed"
        />
        <ATMStatsCard
          label="Overdue Requests"
          value={fmt(dashboard?.overdueRequests)}
          icon={AlertTriangle}
          variant="rose"
          description={dashboard ? `Open for more than ${dashboard.responseWindowDays} days` : 'Open past the response window'}
        />
        <ATMStatsCard
          label="Completed"
          value={fmt(dashboard?.completedRequests)}
          icon={XCircle}
          variant="emerald"
          description={dashboard ? `${fmt(dashboard.rejectedRequests)} rejected` : 'Executed'}
        />
      </div>
      )}

      <ATMCard title="By Request Type">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 py-1">
            <ATMSkeleton height="96px" className="rounded-xl" />
            <ATMSkeleton height="96px" className="rounded-xl" />
            <ATMSkeleton height="96px" className="rounded-xl" />
          </div>
        ) : totalByType === 0 ? (
          <ReportEmpty text="No requests recorded yet." className="h-24" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(dashboard?.byType ?? []).map((t) => {
              const pct = Math.round((t.count / totalByType) * 100);
              return (
                <div
                  key={t.key}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {COMPLIANCE_TYPE_LABEL[t.key as ComplianceRequestType] ?? t.key}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {t.count.toLocaleString()}
                    </p>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ATMCard>

      <ATMCard
        title="Data Subject Requests"
        action={
          openCount !== null ? (
            <ATMBadge variant="info" size="sm">
              {openCount} open
            </ATMBadge>
          ) : undefined
        }
        padding="none"
        className="overflow-hidden"
      >
        {isLoading ? (
          <div className="p-6">
            <ATMSkeleton variant="table-row" count={5} />
          </div>
        ) : (
          <ATMTable
            columns={columns}
            data={[...requests]}
            emptyMessage="No data subject requests."
          />
        )}
      </ATMCard>
    </div>
  );
}

export default ComplianceReportPage;