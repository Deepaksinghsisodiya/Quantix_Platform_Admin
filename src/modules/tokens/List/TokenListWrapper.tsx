import React, { useState, useMemo, useCallback } from 'react';
import { useTokenHistory, useRevokeToken, useTokenMetrics } from '../services/useTokens';
import type { TokenTier, TokenStatus, TokenFilter, RechargeToken } from '../types/token.types';
import { toast } from 'sonner';
import { TokenList } from './TokenList';

export const TokenListWrapper: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* Revoke modal state */
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; merchantName: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const revokeMutation = useRevokeToken();

  // Fetch metrics for top stats cards
  const { data: metricsData } = useTokenMetrics();
  const metrics = metricsData?.data;

  const filterParams: Partial<TokenFilter> & { page: number; pageSize: number } = useMemo(
    () => ({
      search: search || undefined,
      tier: (tierFilter as TokenTier) || undefined,
      status: (statusFilter as TokenStatus) || undefined,
      generatedFrom: dateFrom || undefined,
      generatedTo: dateTo || undefined,
      page,
      pageSize,
    }),
    [search, tierFilter, statusFilter, dateFrom, dateTo, page, pageSize]
  );

  const { data, isLoading, isFetching } = useTokenHistory(filterParams);
  const tokens = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;

  const handleRevoke = useCallback(() => {
    if (!revokeTarget) return;
    revokeMutation.mutate(
      { tokenId: revokeTarget.id, reason: revokeReason },
      {
        onSuccess: () => {
          toast.success('Token revoked successfully');
          setRevokeTarget(null);
          setRevokeReason('');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to revoke token');
        },
      }
    );
  }, [revokeTarget, revokeReason, revokeMutation]);

  const handleExportCsv = useCallback(() => {
    if (tokens.length === 0) return;
    try {
      const headers = ['Token ID', 'Merchant', 'Tier', 'Valid From', 'Valid To', 'Generated At', 'Status'];
      const rows = tokens.map((t) => [
        t.id,
        t.merchantName,
        t.tier,
        t.validFrom,
        t.validTo,
        t.generatedAt,
        t.status,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `token_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    }
  }, [tokens]);

  return (
    <TokenList
      tokens={tokens as RechargeToken[]}
      isLoading={isLoading}
      isFetching={isFetching}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      search={search}
      onSearchChange={(val) => {
        setSearch(val);
        setPage(1);
      }}
      tierFilter={tierFilter}
      onTierFilterChange={(val) => {
        setTierFilter(val);
        setPage(1);
      }}
      statusFilter={statusFilter}
      onStatusFilterChange={(val) => {
        setStatusFilter(val);
        setPage(1);
      }}
      dateFrom={dateFrom}
      onDateFromChange={(val) => {
        setDateFrom(val);
        setPage(1);
      }}
      dateTo={dateTo}
      onDateToChange={(val) => {
        setDateTo(val);
        setPage(1);
      }}
      revokeTarget={revokeTarget}
      onRevokeTargetChange={setRevokeTarget}
      revokeReason={revokeReason}
      onRevokeReasonChange={setRevokeReason}
      onRevoke={handleRevoke}
      isRevoking={revokeMutation.isPending}
      onExportCsv={handleExportCsv}
      metrics={metrics}
    />
  );
};

export default TokenListWrapper;
