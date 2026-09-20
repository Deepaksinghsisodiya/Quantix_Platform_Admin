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
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import { CheckCircle2, Clock, AlertTriangle, Loader2, XCircle } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Compliance Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Data subject requests and their status against the response window
          </p>
        </div>
        {/* 2026-09-04 (decision E): real export — the register as it stands, no window. */}
        <ReportExportMenu report="compliance" disabled={isLoading || isError} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load compliance data.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void requestsQuery.refetch(); void dashboardQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending Requests</p>
          <p className="text-2xl font-bold text-amber-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmt(dashboard?.pendingRequests)}
          </p>
          <p className="text-xs text-gray-400">Awaiting a decision</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmt(dashboard?.inProgressRequests)}
          </p>
          <p className="text-xs text-gray-400">Approved, not yet executed</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Overdue Requests</p>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmt(dashboard?.overdueRequests)}
          </p>
          <p className="text-xs text-gray-400">
            {dashboard ? `Open for more than ${dashboard.responseWindowDays} days` : 'Open past the response window'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : fmt(dashboard?.completedRequests)}
          </p>
          <p className="text-xs text-gray-400">{dashboard ? `${fmt(dashboard.rejectedRequests)} rejected` : 'Executed'}</p>
        </div>
      </div>

      <ATMCard title="By Request Type">
        {isLoading ? (
          <p className="py-4 text-center text-sm text-gray-400">Loading…</p>
        ) : totalByType === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No requests recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(dashboard?.byType ?? []).map((t) => (
              <div key={t.key} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">{COMPLIANCE_TYPE_LABEL[t.key as ComplianceRequestType] ?? t.key}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {t.count.toLocaleString()} <span className="text-xs font-normal text-gray-400">· {Math.round((t.count / totalByType) * 100)}%</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </ATMCard>

      <ATMCard
        title="Data Subject Requests"
        action={<ATMBadge variant="info" size="sm">{requests.filter((r) => r.status === 'Pending' || r.status === 'InProgress').length} open</ATMBadge>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Merchant</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">Type</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Request</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">Status</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Received</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Due</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              )}
              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No data subject requests.
                  </td>
                </tr>
              )}
              {!isLoading && requests.map((req) => (
                <tr key={req.requestId}>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{req.merchantName || req.merchantId.slice(0, 8)}</td>
                  <td className="py-3 text-center">
                    {req.merchantType
                      ? <ATMBadge variant={req.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{req.merchantType}</ATMBadge>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{COMPLIANCE_TYPE_LABEL[req.requestType]}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {statusIcon(req.status)}
                      <span className="text-xs">{COMPLIANCE_STATUS_LABEL[req.status]}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{formatDate(req.createdAt, 'short')}</td>
                  <td className={cn('py-3', req.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-500')}>
                    {formatDate(req.dueAt, 'short')}{req.isOverdue ? ' · overdue' : ''}
                  </td>
                  <td className="py-3 text-gray-500">{req.completedAt ? formatDate(req.completedAt, 'short') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>
    </div>
  );
}

export default ComplianceReportPage;
