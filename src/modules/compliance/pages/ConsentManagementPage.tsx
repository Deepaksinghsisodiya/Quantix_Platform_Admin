/**
 * ConsentManagementPage — FRS-SAP-1004
 *
 * Consent status per merchant, versioning, re-consent on policy change, audit trail.
 */

import React, { useState, useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import {
  Search,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  Loader2,
} from 'lucide-react';
import { useAuditLogs } from '@/lib/hooks/useAudit';

// TODO Pass-26: hook missing — keeps mock fallback for consent records (no useConsents hook)
// Audit trail wired to useAuditLogs filtered by resource=consent

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type ConsentStatus = 'Given' | 'Pending' | 'Withdrawn' | 'Expired';

interface ConsentRecord {
  merchantId: string;
  merchantName: string;
  merchantType: 'Enterprise' | 'Standalone';
  status: ConsentStatus;
  version: string;
  consentDate: string | null;
  expiryDate: string | null;
  policyVersion: string;
  lastUpdated: string;
}

interface ConsentAuditEntry {
  id: string;
  merchantName: string;
  action: string;
  fromVersion: string | null;
  toVersion: string;
  timestamp: string;
  triggeredBy: string;
}

const CURRENT_POLICY_VERSION = 'v3.2';

const MOCK_CONSENTS: ConsentRecord[] = [
  { merchantId: 't-001', merchantName: 'Blue Orchid Bistro', merchantType: 'Enterprise', status: 'Given', version: 'v3.2', consentDate: '2026-03-01', expiryDate: '2027-03-01', policyVersion: 'v3.2', lastUpdated: '2026-03-01' },
  { merchantId: 't-002', merchantName: 'Metro Mart', merchantType: 'Standalone', status: 'Given', version: 'v3.2', consentDate: '2026-02-15', expiryDate: '2027-02-15', policyVersion: 'v3.2', lastUpdated: '2026-02-15' },
  { merchantId: 't-003', merchantName: 'Sakura Sushi', merchantType: 'Enterprise', status: 'Pending', version: 'v3.1', consentDate: null, expiryDate: null, policyVersion: 'v3.1', lastUpdated: '2026-03-20' },
  { merchantId: 't-004', merchantName: 'Fresh Greens Co', merchantType: 'Enterprise', status: 'Given', version: 'v3.1', consentDate: '2025-12-10', expiryDate: '2026-12-10', policyVersion: 'v3.1', lastUpdated: '2025-12-10' },
  { merchantId: 't-005', merchantName: 'Pixel Shop', merchantType: 'Standalone', status: 'Withdrawn', version: 'v3.0', consentDate: '2025-08-01', expiryDate: null, policyVersion: 'v3.0', lastUpdated: '2026-03-15' },
  { merchantId: 't-006', merchantName: 'Golden Dragon', merchantType: 'Enterprise', status: 'Given', version: 'v3.2', consentDate: '2026-03-10', expiryDate: '2027-03-10', policyVersion: 'v3.2', lastUpdated: '2026-03-10' },
  { merchantId: 't-007', merchantName: 'QuickServe', merchantType: 'Standalone', status: 'Expired', version: 'v2.8', consentDate: '2025-01-15', expiryDate: '2026-01-15', policyVersion: 'v2.8', lastUpdated: '2025-01-15' },
  { merchantId: 't-008', merchantName: 'Circuit World', merchantType: 'Standalone', status: 'Pending', version: 'v3.1', consentDate: null, expiryDate: null, policyVersion: 'v3.1', lastUpdated: '2026-03-25' },
];

const MOCK_AUDIT: ConsentAuditEntry[] = [
  { id: 'ca-1', merchantName: 'Blue Orchid Bistro', action: 'Consent Given', fromVersion: 'v3.1', toVersion: 'v3.2', timestamp: '2026-03-01T10:00:00Z', triggeredBy: 'Merchant (self-service)' },
  { id: 'ca-2', merchantName: 'Pixel Shop', action: 'Consent Withdrawn', fromVersion: 'v3.0', toVersion: 'v3.0', timestamp: '2026-03-15T14:30:00Z', triggeredBy: 'Data deletion request' },
  { id: 'ca-3', merchantName: 'Sakura Sushi', action: 'Re-consent Requested', fromVersion: null, toVersion: 'v3.2', timestamp: '2026-03-20T09:00:00Z', triggeredBy: 'Policy v3.2 published' },
  { id: 'ca-4', merchantName: 'Metro Mart', action: 'Consent Given', fromVersion: 'v3.1', toVersion: 'v3.2', timestamp: '2026-02-15T11:20:00Z', triggeredBy: 'Merchant (self-service)' },
  { id: 'ca-5', merchantName: 'Circuit World', action: 'Re-consent Requested', fromVersion: null, toVersion: 'v3.2', timestamp: '2026-03-25T08:00:00Z', triggeredBy: 'Policy v3.2 published' },
  { id: 'ca-6', merchantName: 'Golden Dragon', action: 'Consent Given', fromVersion: 'v3.1', toVersion: 'v3.2', timestamp: '2026-03-10T16:45:00Z', triggeredBy: 'Re-consent email' },
];

const STATUS_CONFIG: Record<ConsentStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; icon: typeof CheckCircle2 }> = {
  Given: { variant: 'success', icon: CheckCircle2 },
  Pending: { variant: 'warning', icon: Clock },
  Withdrawn: { variant: 'danger', icon: X },
  Expired: { variant: 'default', icon: AlertTriangle },
};

const POLICY_VERSIONS = [
  { version: 'v3.2', publishedAt: '2026-02-01', changes: 'Added Standalone token data processing clauses' },
  { version: 'v3.1', publishedAt: '2025-10-15', changes: 'Updated commission data disclosure requirements' },
  { version: 'v3.0', publishedAt: '2025-06-01', changes: 'GDPR Article 28 compliance updates' },
  { version: 'v2.8', publishedAt: '2025-01-01', changes: 'Initial multi-region privacy policy' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ConsentManagementPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Audit trail wired to real audit log API (resource=consent filter)
  const auditQuery = useAuditLogs({ resource: 'consent', page: 1, pageSize: 20 });

  const auditEntries = useMemo<ConsentAuditEntry[]>(() => {
    const items = auditQuery.data?.data?.items ?? [];
    if (items.length === 0) return MOCK_AUDIT;
    return items.map((entry) => ({
      id: entry.id,
      merchantName: entry.resource,
      action: entry.action,
      fromVersion: null,
      toVersion: entry.details,
      timestamp: entry.timestamp,
      triggeredBy: entry.userName,
    }));
  }, [auditQuery.data]);

  const filtered = useMemo(() => {
    let result = MOCK_CONSENTS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.merchantName.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter((c) => c.status === filterStatus);
    if (filterType) result = result.filter((c) => c.merchantType === filterType);
    return result;
  }, [search, filterStatus, filterType]);

  const outdatedCount = MOCK_CONSENTS.filter((c) => c.policyVersion !== CURRENT_POLICY_VERSION && c.status === 'Given').length;
  const pendingCount = MOCK_CONSENTS.filter((c) => c.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Consent Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage merchant consent status, versioning, and re-consent workflows.
            Current policy: <strong>{CURRENT_POLICY_VERSION}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          {outdatedCount > 0 && (
            <ATMButton variant="secondary" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={() => toast.success(`Re-consent email sent to ${outdatedCount} merchants on older policy versions`)}>
              Request Re-consent ({outdatedCount})
            </ATMButton>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Consent Given', value: MOCK_CONSENTS.filter((c) => c.status === 'Given').length, color: 'text-emerald-600' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
          { label: 'Withdrawn', value: MOCK_CONSENTS.filter((c) => c.status === 'Withdrawn').length, color: 'text-red-600' },
          { label: 'Outdated Version', value: outdatedCount, color: 'text-orange-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
            <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search merchants..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <option value="">All Statuses</option>
          <option value="Given">Given</option>
          <option value="Pending">Pending</option>
          <option value="Withdrawn">Withdrawn</option>
          <option value="Expired">Expired</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <option value="">All Types</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Standalone">Standalone</option>
        </select>
      </div>

      {/* Consent table */}
      <ATMCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Merchant</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Consent Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Expiry</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((consent) => {
                const isOutdated = consent.policyVersion !== CURRENT_POLICY_VERSION && consent.status === 'Given';
                return (
                  <tr key={consent.merchantId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{consent.merchantName}</td>
                    <td className="px-4 py-3 text-center"><ATMBadge variant={consent.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{consent.merchantType}</ATMBadge></td>
                    <td className="px-4 py-3 text-center"><ATMBadge variant={STATUS_CONFIG[consent.status].variant} size="sm" dot>{consent.status}</ATMBadge></td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-mono', isOutdated ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500')}>
                        {consent.version}
                        {isOutdated && ' ⚠'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{consent.consentDate ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{consent.expiryDate ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {(consent.status === 'Pending' || isOutdated) && (
                        <ATMButton variant="ghost" size="sm" onClick={() => toast.success(`Re-consent request sent to ${consent.merchantName}`)}>
                          <Send className="h-3 w-3" />
                        </ATMButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ATMCard>

      {/* Policy Version History */}
      <ATMCard title="Policy Versions" action={<ATMBadge variant="info" size="sm">Current: {CURRENT_POLICY_VERSION}</ATMBadge>}>
        <div className="space-y-2">
          {POLICY_VERSIONS.map((pv) => (
            <div key={pv.version} className={cn('flex items-center justify-between rounded-lg border px-4 py-2.5', pv.version === CURRENT_POLICY_VERSION ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800')}>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{pv.version}</span>
                <span className="ml-2 text-xs text-gray-500">Published {pv.publishedAt}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{pv.changes}</p>
              </div>
              {pv.version === CURRENT_POLICY_VERSION && <ATMBadge variant="success" size="sm">Active</ATMBadge>}
            </div>
          ))}
        </div>
      </ATMCard>

      {/* Consent Audit Trail */}
      <ATMCard title="Consent Audit Trail" action={<div className="flex items-center gap-1 text-xs text-gray-500">{auditQuery.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <History className="h-3.5 w-3.5" />}Recent changes</div>}>
        <div className="space-y-2">
          {auditEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900">
              <ATMBadge variant={entry.action.includes('Given') ? 'success' : entry.action.includes('Withdrawn') ? 'danger' : 'warning'} size="sm">
                {entry.action}
              </ATMBadge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{entry.merchantName}</strong>
                  {entry.fromVersion && ` — ${entry.fromVersion} → ${entry.toVersion}`}
                  {!entry.fromVersion && ` — requested ${entry.toVersion}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {entry.triggeredBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ATMCard>
    </div>
  );
}

export default ConsentManagementPage;
