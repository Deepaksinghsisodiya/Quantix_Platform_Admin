import React, { useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import { Clock, CheckCircle2, Globe, Eye, Play, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDataRequests, useComplianceDashboard } from '@/lib/hooks/useCompliance';

/* -------------------------------------------------------------------------- */
/*  View-model adapter                                                         */
/* -------------------------------------------------------------------------- */

interface ComplianceRequest {
  id: string;
  merchant: string;
  merchantType: 'Enterprise' | 'Standalone';
  type: 'Export' | 'Deletion' | 'Consent Update';
  regulation: 'GDPR' | 'CCPA' | 'LGPD';
  submitted: string;
  deadline: string;
  status: 'Pending' | 'InProgress' | 'Completed';
}

interface RegionStatus {
  region: string;
  regulation: string;
  activeMerchants: number;
  compliant: number;
  pendingRequests: number;
}

const REGION_STATUS: RegionStatus[] = [
  { region: 'Europe (EU)', regulation: 'GDPR', activeMerchants: 45, compliant: 43, pendingRequests: 2 },
  { region: 'United States', regulation: 'CCPA', activeMerchants: 32, compliant: 31, pendingRequests: 1 },
  { region: 'Brazil', regulation: 'LGPD', activeMerchants: 12, compliant: 12, pendingRequests: 0 },
  { region: 'Middle East', regulation: 'PDPL', activeMerchants: 28, compliant: 28, pendingRequests: 0 },
  { region: 'Asia Pacific', regulation: 'PDPA', activeMerchants: 18, compliant: 18, pendingRequests: 0 },
];

const TYPE_VARIANT: Record<string, 'info' | 'danger' | 'warning'> = {
  Export: 'info',
  Deletion: 'danger',
  'Consent Update': 'warning',
};

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  Pending: 'warning',
  InProgress: 'info',
  Completed: 'success',
};

function mapRequestType(type: string): ComplianceRequest['type'] {
  if (type === 'Export') return 'Export';
  if (type === 'Deletion') return 'Deletion';
  return 'Consent Update';
}

function mapRequestStatus(status: string): ComplianceRequest['status'] {
  if (status === 'Pending') return 'Pending';
  if (status === 'InProgress') return 'InProgress';
  return 'Completed';
}

function mapRegulation(reg: string): ComplianceRequest['regulation'] {
  if (reg === 'GDPR' || reg === 'CCPA' || reg === 'LGPD') return reg;
  return 'GDPR';
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function ComplianceDashboardPage() {
  const requestsQuery = useDataRequests({ status: 'Pending', page: 1, pageSize: 50 });
  const dashboardQuery = useComplianceDashboard();

  const requests = useMemo<ComplianceRequest[]>(() => {
    const items = requestsQuery.data?.data?.items ?? [];
    return items.map((r) => ({
      id: r.id,
      merchant: r.merchantName,
      merchantType: r.merchantType,
      type: mapRequestType(r.type),
      regulation: mapRegulation(r.regulation),
      submitted: r.requestedAt.slice(0, 10),
      deadline: r.deadline.slice(0, 10),
      status: mapRequestStatus(r.status),
    }));
  }, [requestsQuery.data]);

  const isLoading = requestsQuery.isLoading || dashboardQuery.isLoading;
  const isError = requestsQuery.isError || dashboardQuery.isError;

  // KPI values
  const dashboardData = dashboardQuery.data?.data;
  const pending = dashboardData?.pendingRequests ?? requests.filter((r) => r.status === 'Pending').length;
  const completedThisMonth = dashboardData?.completedRequests ?? 0;
  const regulationBreakdown = useMemo(() => {
    const byReg = dashboardData?.byRegulation ?? {};
    const total = Object.values(byReg).reduce((s, n) => s + n, 0);
    if (total === 0) {
      return [
        { name: 'GDPR', pct: 60, color: 'bg-blue-500' },
        { name: 'CCPA', pct: 25, color: 'bg-indigo-500' },
        { name: 'LGPD', pct: 15, color: 'bg-violet-500' },
      ];
    }
    const palette: Record<string, string> = {
      GDPR: 'bg-blue-500',
      CCPA: 'bg-indigo-500',
      LGPD: 'bg-violet-500',
      PDPL: 'bg-purple-500',
      PDPA: 'bg-pink-500',
    };
    return Object.entries(byReg).map(([name, count]) => ({
      name,
      pct: Math.round((count / total) * 100),
      color: palette[name] ?? 'bg-gray-500',
    }));
  }, [dashboardData]);

  const kpis = [
    { label: 'Pending Requests', value: pending, icon: <Clock className="h-5 w-5 text-amber-500" />, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Completed This Month', value: completedThisMonth, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Compliance Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor data protection compliance across all regions and regulations.
        </p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <p className={cn('text-xl font-bold tabular-nums', kpi.color)}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : kpi.value}
              </p>
            </div>
          </div>
        ))}

        {/* By Regulation */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">By Regulation</p>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {regulationBreakdown.map((r) => (
              <div key={r.name} className={cn('h-full', r.color)} style={{ width: `${r.pct}%` }} />
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {regulationBreakdown.map((r) => (
              <span key={r.name} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className={cn('h-2 w-2 rounded-full', r.color)} />
                {r.name} {r.pct}%
              </span>
            ))}
          </div>
        </div>

        {/* By Region */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-gray-400" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">By Region</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{REGION_STATUS.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Regions</p>
        </div>
      </div>

      {/* Pending requests table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Pending Requests
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Merchant</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Regulation</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Submitted</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Deadline</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                    </td>
                  </tr>
                )}
                {!isLoading && requests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No pending data requests.
                    </td>
                  </tr>
                )}
                {!isLoading && requests.map((req) => (
                  <tr key={req.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{req.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{req.merchant}</span>
                        <ATMBadge variant={req.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{req.merchantType}</ATMBadge>
                      </div>
                    </td>
                    <td className="px-4 py-3"><ATMBadge variant={TYPE_VARIANT[req.type]} size="sm">{req.type}</ATMBadge></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{req.regulation}</td>
                    <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-400">{req.submitted}</td>
                    <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-400">{req.deadline}</td>
                    <td className="px-4 py-3"><ATMBadge variant={STATUS_VARIANT[req.status]} size="sm">{req.status}</ATMBadge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <ATMButton variant="ghost" size="sm"><Play className="h-3.5 w-3.5" /></ATMButton>
                        <ATMButton variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></ATMButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Region compliance grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Region Compliance Status
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGION_STATUS.map((region) => {
            const compliancePct = region.activeMerchants > 0 ? Math.round((region.compliant / region.activeMerchants) * 100) : 100;
            return (
              <ATMCard key={region.region} padding="md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{region.region}</h4>
                  <ATMBadge variant="outline" size="sm">{region.regulation}</ATMBadge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Active Merchants</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{region.activeMerchants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Compliance</span>
                    <span className={cn('font-bold tabular-nums', compliancePct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                      {compliancePct}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Pending</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{region.pendingRequests}</span>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={cn('h-full rounded-full', compliancePct === 100 ? 'bg-emerald-500' : 'bg-amber-500')}
                    style={{ width: `${compliancePct}%` }}
                  />
                </div>
              </ATMCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ComplianceDashboardPage;
