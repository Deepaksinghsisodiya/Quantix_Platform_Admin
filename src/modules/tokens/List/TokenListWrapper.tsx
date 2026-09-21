/**
 * Token History — 2026-08-29 rebuild.
 *
 * The previous wrapper fed the list from /tokens/expiring?daysWindow=3650 (which silently
 * omits never-activated and revoked tokens), passed search/tier/date filters the query
 * ignored, and read metrics from a client-computed byTier duplicate. Now the list uses the
 * real GET /api/v1/tokens (all tokens + merchant identity); filters and paging are applied
 * client-side, transparently; metrics come from the real dashboard endpoint.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import type { TokenListItem } from '@/lib/types';
import type { PlanType } from '@/lib/types/platform-enums';
import { useGetTokenMetricsQuery } from '@/modules/dashboard/services/dashboardApi';
import { useSendTokenMutation, useMarkTokenAppliedMutation } from '../services/tokenApi';
import { useAllTokens, useRevokeToken } from '../services/useTokens';
import { TokenList } from './TokenList';

/** Quick-range presets for the generated-at window (2026-08-30, user directive:
 *  default to a short list — history grows too heavy to load in full every time). */
export type TokenQuickRange = '30d' | '90d' | 'month' | 'all' | 'custom';

export const TokenListWrapper: React.FC = () => {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [range, setRange] = useState<TokenQuickRange>('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDesc, setSortDesc] = useState(true);

  const [revokeTarget, setRevokeTarget] = useState<{ id: string; merchantName: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const revokeMutation = useRevokeToken();
  const [sendToken] = useSendTokenMutation();

  // "Mark as used": Local-Only POS never reports activation — the operator records it.
  const [markTarget, setMarkTarget] = useState<{ id: string; merchantName: string } | null>(null);
  const [markDate, setMarkDate] = useState('');
  const [markApplied, markAppliedState] = useMarkTokenAppliedMutation();

  // The generated-at window is applied SERVER-side so the payload stays light as
  // history grows. Date-only strings keep the query arg stable across renders
  // (an ISO timestamp from Date.now() would change every render and refetch forever).
  const window = useMemo<{ from?: string; to?: string }>(() => {
    const dayIso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString().slice(0, 10);
    switch (range) {
      case '30d':
        return { from: dayIso(30 * 86_400_000) };
      case '90d':
        return { from: dayIso(90 * 86_400_000) };
      case 'month': {
        const now = new Date();
        return { from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01` };
      }
      case 'custom':
        return {
          from: dateFrom || undefined,
          to: dateTo ? `${dateTo}T23:59:59.999` : undefined,
        };
      case 'all':
      default:
        return {};
    }
  }, [range, dateFrom, dateTo]);

  const { data, isLoading, isFetching, isError } = useAllTokens(window);
  const metricsQuery = useGetTokenMetricsQuery();
  const metrics = metricsQuery.data?.data;

  const allTokens = useMemo(() => data?.data ?? [], [data]);

  // Distinct merchants present in the history — drives the merchant filter dropdown.
  const merchantOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of allTokens) {
      if (!seen.has(t.merchantId)) seen.set(t.merchantId, t.merchantName);
    }
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allTokens]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTokens.filter((t) => {
      if (q && !(
        t.tokenId.toLowerCase().includes(q) ||
        t.merchantName.toLowerCase().includes(q) ||
        t.merchantCode.toLowerCase().includes(q)
      )) return false;
      if (merchantFilter && t.merchantId !== merchantFilter) return false;
      if (planFilter && t.plan !== (planFilter as PlanType)) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      // Date window is applied server-side (see `window` above) — no client re-filter.
      return true;
    });
  }, [allTokens, search, merchantFilter, planFilter, statusFilter]);

  // Client-side sort (Mirrors the Merchants list UX: clickable headers). Newest first by default.
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, string | number>)[sortBy];
      const bv = (b as unknown as Record<string, string | number>)[sortBy];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return sortDesc ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortBy, sortDesc]);

  const handleSort = useCallback((field: string) => {
    if (field === sortBy) {
      setSortDesc((d) => !d);
    } else {
      setSortBy(field);
      setSortDesc(field === 'createdAt');
    }
  }, [sortBy]);

  const paged = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  // Clamp the page when filters shrink the result set below the current page
  // (otherwise the table renders empty even though data exists further back).
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, page, pageSize]);

  const handleRevoke = useCallback(() => {
    if (!revokeTarget) return;
    revokeMutation.mutate(
      { tokenId: revokeTarget.id, reason: revokeReason },
      {
        onSuccess: () => {
          toast.success('Token revoked');
          setRevokeTarget(null);
          setRevokeReason('');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to revoke token');
        },
      },
    );
  }, [revokeTarget, revokeReason, revokeMutation]);

  const handleMarkApplied = useCallback(async () => {
    if (!markTarget) return;
    try {
      await markApplied({
        tokenId: markTarget.id,
        appliedAt: markDate ? new Date(`${markDate}T12:00:00Z`).toISOString() : null,
      }).unwrap();
      toast.success(`Token recorded as applied for ${markTarget.merchantName} — validity window started`);
      setMarkTarget(null);
      setMarkDate('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to mark the token as applied');
    }
  }, [markTarget, markDate, markApplied]);

  const handleResend = useCallback(async (tokenId: string, merchantName: string) => {
    try {
      await sendToken(tokenId).unwrap();
      toast.success(`Token emailed to ${merchantName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to email the token');
    }
  }, [sendToken]);

  const handleExportCsv = useCallback(async () => {
    if (filtered.length === 0) {
      toast.warning('No tokens to export');
      return;
    }
    try {
      const headers = ['TokenId', 'Merchant', 'MerchantCode', 'Plan', 'Sequence', 'ValidityDays', 'Activated', 'Expires', 'Status', 'GeneratedBy', 'CreatedAt'];
      const rows = filtered.map((t) => [
        t.tokenId,
        t.merchantName,
        t.merchantCode,
        t.plan,
        String(t.sequence),
        String(t.validityDays),
        t.activatedAt ?? '',
        t.expiresAt ?? '',
        t.status,
        t.generatedBy,
        t.createdAt,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `token_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  }, [filtered]);

  return (
    <TokenList
      tokens={paged as TokenListItem[]}
      isLoading={isLoading}
      isFetching={isFetching}
      fetchError={isError ? 'Failed to load token history — refresh and try again.' : null}
      totalCount={filtered.length}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      search={search}
      onSearchChange={(val) => { setSearch(val); setPage(1); }}
      merchantOptions={merchantOptions}
      merchantFilter={merchantFilter}
      onMerchantFilterChange={(val) => { setMerchantFilter(val); setPage(1); }}
      planFilter={planFilter}
      onPlanFilterChange={(val) => { setPlanFilter(val); setPage(1); }}
      statusFilter={statusFilter}
      onStatusFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
      range={range}
      onRangeChange={(val) => {
        setRange((val as TokenQuickRange) || '30d');
        if (val !== 'custom') { setDateFrom(''); setDateTo(''); }
        setPage(1);
      }}
      dateFrom={dateFrom}
      onDateFromChange={(val) => { setDateFrom(val); setRange('custom'); setPage(1); }}
      dateTo={dateTo}
      onDateToChange={(val) => { setDateTo(val); setRange('custom'); setPage(1); }}
      sortBy={sortBy}
      sortDesc={sortDesc}
      onSort={handleSort}
      markTarget={markTarget}
      onMarkTargetChange={(t) => { setMarkTarget(t); setMarkDate(''); }}
      markDate={markDate}
      onMarkDateChange={setMarkDate}
      onMarkApplied={handleMarkApplied}
      isMarking={markAppliedState.isLoading}
      revokeTarget={revokeTarget}
      onRevokeTargetChange={setRevokeTarget}
      revokeReason={revokeReason}
      onRevokeReasonChange={setRevokeReason}
      onRevoke={handleRevoke}
      isRevoking={revokeMutation.isPending}
      onResend={handleResend}
      onExportCsv={handleExportCsv}
      metrics={metrics}
    />
  );
};

export default TokenListWrapper;
