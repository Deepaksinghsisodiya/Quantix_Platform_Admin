import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import { Clock, CheckCircle2, AlertTriangle, Loader2, XCircle, PlayCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { useComplianceDashboard, useComplianceRequests } from '@/lib/hooks/useCompliance';
import { COMPLIANCE_STATUS_LABEL, COMPLIANCE_TYPE_LABEL, type ComplianceRequestType, type ComplianceStatus } from '@/lib/types/compliance';

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

  const tiles = [
    { label: 'Pending', value: dashboard?.pendingRequests, icon: <Clock className="h-5 w-5 text-amber-500" />, color: 'text-amber-600 dark:text-amber-400', hint: 'Awaiting approval' },
    { label: 'In Progress', value: dashboard?.inProgressRequests, icon: <PlayCircle className="h-5 w-5 text-blue-500" />, color: 'text-blue-600 dark:text-blue-400', hint: 'Approved, not yet executed' },
    { label: 'Overdue', value: dashboard?.overdueRequests, icon: <AlertTriangle className="h-5 w-5 text-red-500" />, color: 'text-red-600 dark:text-red-400', hint: dashboard ? `Open for more than ${dashboard.responseWindowDays} days` : 'Open past the response window' },
    { label: 'Completed', value: dashboard?.completedRequests, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400', hint: 'Executed' },
    { label: 'Rejected', value: dashboard?.rejectedRequests, icon: <XCircle className="h-5 w-5 text-gray-400" />, color: 'text-gray-700 dark:text-gray-300', hint: 'Declined with a note' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Compliance Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Data subject requests — exports, deletions and consent withdrawals — and where each one stands.
          </p>
        </div>
        <ATMButton variant="primary" size="sm" onClick={() => navigate('/compliance/data-requests')}>
          Open Data Requests
          <ArrowRight className="ml-1 h-4 w-4" />
        </ATMButton>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">{t.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.label}</p>
              <p className={cn('text-xl font-bold tabular-nums', t.color)}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (t.value ?? 0).toLocaleString()}
              </p>
              <p className="truncate text-[11px] text-gray-400">{t.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ATMCard title="By Request Type" className="lg:col-span-1">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-gray-400">Loading…</p>
          ) : totalByType === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No requests recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {(dashboard?.byType ?? []).map((t) => {
                const pct = Math.round((t.count / totalByType) * 100);
                const label = COMPLIANCE_TYPE_LABEL[t.key as ComplianceRequestType] ?? t.key;
                return (
                  <li key={t.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{label}</span>
                      <span className="tabular-nums text-gray-500 dark:text-gray-400">{t.count} · {pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {dashboard && (
            <p className="mt-4 text-[11px] text-gray-400">
              Response window: {dashboard.responseWindowDays} days (setting <code>compliance.response_window_days</code>).
            </p>
          )}
        </ATMCard>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Open Requests</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    {['Merchant', 'Type', 'Requested by', 'Due', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></td></tr>
                  )}
                  {!isLoading && open.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No open data requests.</td></tr>
                  )}
                  {!isLoading && open.map((r) => (
                    <tr
                      key={r.requestId}
                      className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      onClick={() => navigate(`/compliance/data-requests?id=${r.requestId}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{r.merchantName || r.merchantId.slice(0, 8)}</span>
                          {r.merchantType && <ATMBadge variant={r.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{r.merchantType}</ATMBadge>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><ATMBadge variant={TYPE_VARIANT[r.requestType]} size="sm">{COMPLIANCE_TYPE_LABEL[r.requestType]}</ATMBadge></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.requestedBy}</td>
                      <td className={cn('px-4 py-3 tabular-nums', r.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400')}>
                        {formatDate(r.dueAt, 'short')}{r.isOverdue ? ' · overdue' : ''}
                      </td>
                      <td className="px-4 py-3"><ATMBadge variant={STATUS_VARIANT[r.status]} size="sm">{COMPLIANCE_STATUS_LABEL[r.status]}</ATMBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceDashboardPage;
