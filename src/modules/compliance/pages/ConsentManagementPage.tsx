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

import { ATMBadge, ATMCard } from '@/shared/ui';
import { useAuditLogs } from '@/lib/hooks/useAudit';
import { useGetAllConsentsQuery } from '../services/complianceApi';
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

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        {/* Title matches the sidebar label. */}
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Consent Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Data-processing consents recorded for merchants, and the audit trail of every
          grant and withdrawal.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Consent records', value: (consentsQuery.data?.data ?? []).length, accent: 'text-gray-900 dark:text-white' },
          { label: 'Granted', value: grantedCount, accent: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Withdrawn', value: revokedCount, accent: 'text-red-600 dark:text-red-400' },
        ].map((t) => (
          <ATMCard key={t.label} className="glass-card">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.label}</p>
            <p className={`mt-1 text-2xl font-black ${t.accent}`}>{t.value}</p>
          </ATMCard>
        ))}
      </div>

      {/* Consent records */}
      <ATMCard className="glass-card">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Consent Records</h2>
          </div>
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--zen-border)] bg-white dark:bg-zinc-950 text-xs font-medium outline-none"
              placeholder="Search by consent type or merchant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {consentsQuery.isLoading ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-400">Loading…</p>
        ) : consents.length === 0 ? (
          <div className="py-10 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-gray-200 dark:text-gray-700" />
            <p className="mt-3 text-sm font-bold text-gray-500 dark:text-gray-400">
              No consent records yet.
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Records appear here as merchants grant or withdraw data-processing consent.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Merchant', 'Consent Type', 'Status', 'Granted', 'Withdrawn'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                {consents.map((c) => (
                  <tr key={c.consentId} className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/40">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-600 dark:text-gray-300">{c.merchantId.slice(0, 8)}…</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white">{c.consentType}</td>
                    <td className="px-3 py-2.5">
                      <ATMBadge
                        size="sm"
                        variant={c.isGranted ? 'success' : 'danger'}
                      >
                        {c.isGranted ? 'Granted' : 'Withdrawn'}
                      </ATMBadge>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-gray-500">{c.grantedAt ? formatDate(c.grantedAt, 'short') : '—'}</td>
                    <td className="px-3 py-2.5 text-[11px] text-gray-500">{c.revokedAt ? formatDate(c.revokedAt, 'short') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* Audit trail — real audit log, no mock fallback */}
      <ATMCard className="glass-card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Consent Audit Trail</h2>
        {auditQuery.isLoading ? (
          <p className="py-6 text-center text-sm font-semibold text-gray-400">Loading…</p>
        ) : auditEntries.length === 0 ? (
          <p className="py-6 text-center text-sm font-semibold text-gray-400">
            No consent activity recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {auditEntries.map((entry) => (
              <div key={entry.logId} className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2.5">
                {entry.action?.toLowerCase().includes('revoke') || entry.action?.toLowerCase().includes('withdraw') ? (
                  <XIcon className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{entry.action}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{entry.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{entry.userName}</p>
                  <p className="text-[10px] text-gray-400">{entry.createdAt ? formatDate(entry.createdAt, 'short') : ''}</p>
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
