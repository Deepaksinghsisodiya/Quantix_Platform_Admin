/**
 * ComplianceReportPage — FRS-SAP-706
 *
 * Data privacy across both types; deletion/export requests;
 * consent status; regulatory compliance by region.
 */

import React, { useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import {
  Shield,
  Download,
  FileText,
  Globe,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useDataRequests, useComplianceDashboard } from '@/lib/hooks/useCompliance';

// ---------------------------------------------------------------------------
// Static / fallback data — no hook for region-compliance / retention-policy
// ---------------------------------------------------------------------------

// TODO Pass-26: hook missing — keeps mock fallback for region compliance and retention policy
const MOCK_REGION_COMPLIANCE = [
  { region: 'European Union', regulation: 'GDPR', status: 'Compliant', merchantCount: 412, lastAudit: '2026-02-15' },
  { region: 'United States', regulation: 'CCPA/CPRA', status: 'Compliant', merchantCount: 534, lastAudit: '2026-02-20' },
  { region: 'United Kingdom', regulation: 'UK GDPR', status: 'Compliant', merchantCount: 89, lastAudit: '2026-02-15' },
  { region: 'Middle East', regulation: 'PDPL (Saudi)', status: 'Under Review', merchantCount: 124, lastAudit: '2026-01-30' },
  { region: 'Asia Pacific', regulation: 'PDPA (Singapore)', status: 'Compliant', merchantCount: 88, lastAudit: '2026-03-01' },
];

const MOCK_RETENTION_POLICY = {
  activeDataRetention: 'Unlimited (while active)',
  cancelledWindDown: '30 days',
  cancelledDataRetention: '90 days',
  deletionMethod: 'Irreversible, compliance-approved only',
  encryptionAtRest: 'AES-256',
  encryptionInTransit: 'TLS 1.3',
  backupRetention: '30 days',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ComplianceReportPage() {
  const requestsQuery = useDataRequests({ page: 1, pageSize: 20 });
  const dashboardQuery = useComplianceDashboard();

  const dataRequests = useMemo(() => {
    const items = requestsQuery.data?.data?.items ?? [];
    return items.map((r) => ({
      id: r.id,
      merchantName: r.merchantName,
      type: r.merchantType,
      requestType:
        r.type === 'Export' ? 'Data Export' :
        r.type === 'Deletion' ? 'Data Deletion' :
        'Consent Update',
      status:
        r.status === 'Completed' ? 'Completed' :
        r.status === 'InProgress' ? 'In Progress' :
        'Pending Review',
      requestedAt: r.requestedAt.slice(0, 10),
      completedAt: r.completedAt ? r.completedAt.slice(0, 10) : null,
    }));
  }, [requestsQuery.data]);

  const isLoading = requestsQuery.isLoading || dashboardQuery.isLoading;
  const isError = requestsQuery.isError || dashboardQuery.isError;

  const dashboardData = dashboardQuery.data?.data;
  const consentRate = dashboardData?.consentRate ?? 0;
  const totalMerchants = Object.values(dashboardData?.byRegion ?? {}).reduce((s, n) => s + n, 0) || 1247;
  const consentGiven = Math.round(totalMerchants * consentRate);
  const consentPending = dashboardData?.pendingRequests ?? 32;
  const consentWithdrawn = dashboardData?.overdueRequests ?? 17;

  const statusIcon = (status: string) => {
    if (status === 'Completed') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === 'In Progress') return <Clock className="h-4 w-4 text-blue-500" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Compliance Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Data privacy, deletion/export requests, consent status, and regulatory compliance
          </p>
        </div>
        <div className="flex gap-2">
          <ATMButton variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>Export PDF</ATMButton>
          <ATMButton variant="secondary" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>Export CSV</ATMButton>
        </div>
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

      {/* Consent Overview KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Consent Given</p>
          <p className="text-2xl font-bold text-emerald-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : consentGiven}
          </p>
          <p className="text-xs text-gray-400">{Math.round(consentRate * 100)}% of merchants</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Consent Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : consentPending}
          </p>
          <p className="text-xs text-gray-400">Awaiting response</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Consent Withdrawn</p>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : consentWithdrawn}
          </p>
          <p className="text-xs text-gray-400">Active deletion queue</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Compliance Audit</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2026-03-01</p>
          <p className="text-xs text-gray-400">Full platform review</p>
        </div>
      </div>

      {/* Data Requests */}
      <ATMCard title="Data Subject Requests" action={<ATMBadge variant="info" size="sm">{dataRequests.filter((r) => r.status !== 'Completed').length} active</ATMBadge>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Merchant</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">Type</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Request</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">Status</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Requested</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              )}
              {!isLoading && dataRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No data subject requests.
                  </td>
                </tr>
              )}
              {!isLoading && dataRequests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{req.merchantName}</td>
                  <td className="py-3 text-center"><ATMBadge variant={req.type === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{req.type}</ATMBadge></td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{req.requestType}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {statusIcon(req.status)}
                      <span className="text-xs">{req.status}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{req.requestedAt}</td>
                  <td className="py-3 text-gray-500">{req.completedAt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>

      {/* Regional Compliance */}
      <ATMCard title="Regulatory Compliance by Region" action={<div className="flex items-center gap-1 text-xs text-gray-500"><Globe className="h-3.5 w-3.5" />Multi-region</div>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Region</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Regulation</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">Status</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500">Merchants</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Last Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_REGION_COMPLIANCE.map((row) => (
                <tr key={row.region}>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.region}</td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{row.regulation}</td>
                  <td className="py-3 text-center">
                    <ATMBadge variant={row.status === 'Compliant' ? 'success' : 'warning'} size="sm" dot>{row.status}</ATMBadge>
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.merchantCount}</td>
                  <td className="py-3 text-gray-500">{row.lastAudit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>

      {/* Data Retention Policy */}
      <ATMCard title="Data Retention & Security Policy" action={<div className="flex items-center gap-1 text-xs text-gray-500"><Shield className="h-3.5 w-3.5" />Platform-wide</div>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(MOCK_RETENTION_POLICY).map(([key, value]) => {
            const labels: Record<string, string> = {
              activeDataRetention: 'Active Data Retention',
              cancelledWindDown: 'Cancellation Wind-Down',
              cancelledDataRetention: 'Post-Cancel Retention',
              deletionMethod: 'Deletion Method',
              encryptionAtRest: 'Encryption at Rest',
              encryptionInTransit: 'Encryption in Transit',
              backupRetention: 'Backup Retention',
            };
            return (
              <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">{labels[key] ?? key}</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
              </div>
            );
          })}
        </div>
      </ATMCard>
    </div>
  );
}

export default ComplianceReportPage;
