/**
 * Consent Management — 2026-08-13 rebuild.
 *
 * The previous screen was almost entirely fictional: a hardcoded MOCK_CONSENTS list of
 * invented merchants, a MOCK_AUDIT trail that was silently substituted whenever the REAL
 * audit query returned nothing, an invented policy-version scheme (v3.2 / re-consent
 * campaigns), and two buttons whose only effect was a toast claiming re-consent emails had
 * been sent — no request was ever made.
 *
 * This version shows the consent records the platform actually holds
 * (GET /compliance/consents) plus the real consent audit trail, and states plainly when
 * there is nothing recorded. Consent capture itself belongs to the merchant-facing
 * surfaces; this screen is the operator's read-only view of it.
 */

import React, { useMemo, useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, X as XIcon } from 'lucide-react';

import { ATMBadge, ATMCard, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { useAuditLogs } from '@/lib/hooks/useAudit';
import { useGetAllConsentsQuery } from '../services/complianceApi';
import type { ConsentRecord } from '@/lib/types/compliance';
import { formatDate } from '@/lib/utils/formatDate';

export const ConsentManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const consentsQuery = useGetAllConsentsQuery();
  // 2026-09-08: the filter is the API's entityType (was `resource`, a field it never had).
  const auditQuery = useAuditLogs({ entityType: 'Consent', page: 1, pageSize: 20 });

  const consents = useMemo(() => {
    const rows = consentsQuery.data?.data ?? [];
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (c) => c.consentType.toLowerCase().includes(q) || c.merchantId.toLowerCase().includes(q),
    );
  }, [consentsQuery.data, search]);

  const auditEntries = auditQuery.data?.data ?? [];
  const grantedCount = (consentsQuery.data?.data ?? []).filter((c) => c.isGranted).length;
  const revokedCount = (consentsQuery.data?.data ?? []).length - grantedCount;

  const consentColumns: ATMTableColumn<ConsentRecord>[] = [
    {
      key: 'merchantId',
      header: 'Merchant',
      renderCell: (_v, c) => (
        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{c.merchantId.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'consentType',
      header: 'Consent Type',
      renderCell: (_v, c) => <span className="text-xs font-bold text-slate-900 dark:text-white">{c.consentType}</span>,
    },
    {
      key: 'isGranted',
      header: 'Status',
      renderCell: (_v, c) => (
        <ATMBadge size="sm" variant={c.isGranted ? 'success' : 'danger'}>
          {c.isGranted ? 'Granted' : 'Withdrawn'}
        </ATMBadge>
      ),
    },
    {
      key: 'grantedAt',
      header: 'Granted',
      renderCell: (_v, c) => <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.grantedAt ? formatDate(c.grantedAt, 'short') : '—'}</span>,
    },
    {
      key: 'revokedAt',
      header: 'Withdrawn',
      renderCell: (_v, c) => <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.revokedAt ? formatDate(c.revokedAt, 'short') : '—'}</span>,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={ShieldCheck}
        iconColor="theme"
        title="Consent Management"
        subtitle="Data-processing consents recorded for merchants, and the audit trail of every grant and withdrawal."
      />

      {/* Summary */}
      {consentsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ATMStatsCard
            label="Consent records"
            value={(consentsQuery.data?.data ?? []).length.toLocaleString()}
            icon={ShieldCheck}
            variant="slate"
            description="Recorded across all merchants"
          />
          <ATMStatsCard
            label="Granted"
            value={grantedCount.toLocaleString()}
            icon={CheckCircle2}
            variant="emerald"
            description="Active data-processing consents"
          />
          <ATMStatsCard
            label="Withdrawn"
            value={revokedCount.toLocaleString()}
            icon={XIcon}
            variant="rose"
            description="Revoked or withdrawn consents"
          />
        </div>
      )}

      {/* Consent records */}
      <ATMCard
        title="Consent Records"
        action={
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              placeholder="Search by consent type or merchant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
        padding="none"
        className="overflow-hidden"
        loading={consentsQuery.isLoading}
      >
        {consentsQuery.isLoading ? (
          <ATMSkeleton variant="rect" height="200px" />
        ) : consents.length === 0 ? (
          <div className="m-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <ShieldCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No consent records yet.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Records appear here as merchants grant or withdraw data-processing consent.
            </p>
          </div>
        ) : (
          <ATMTable columns={consentColumns} data={consents} emptyMessage="No consent records yet." />
        )}
      </ATMCard>

      {/* Audit trail — real audit log, no mock fallback */}
      <ATMCard title="Consent Audit Trail" loading={auditQuery.isLoading}>
        {auditQuery.isLoading ? (
          <ATMSkeleton variant="rect" height="180px" />
        ) : auditEntries.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-10 text-center text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            No consent activity recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {auditEntries.map((entry) => (
              <div key={entry.logId} className="flex items-start gap-3 rounded-lg border border-slate-200/80 px-3 py-2.5 dark:border-slate-800/60">
                {entry.action?.toLowerCase().includes('revoke') || entry.action?.toLowerCase().includes('withdraw') ? (
                  <XIcon className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{entry.action}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{entry.details}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{entry.userName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{entry.createdAt ? formatDate(entry.createdAt, 'short') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ATMCard>
    </div>
  );
};

export default ConsentManagementPage;