/**
 * Token History table — 2026-08-29 rebuild. Tier column/filter replaced with the real
 * Plan (deployment mode); Valid From/To replaced with Activated/Expires (a token's window
 * only materialises when the merchant applies it — Rule 7).
 */
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Eye, Ban, CheckCircle2, AlertTriangle, Key, Coins, Mail } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { formatDate } from '@/lib/utils/formatDate';
import { TokenStatusBadge } from '../components/TokenStatusBadge';
import { PLAN_TYPE_LABEL } from '@/lib/types/platform-enums';
import type { TokenListItem } from '@/lib/types';
import type { TokenMetricsDashboardDto } from '@/lib/api/dashboard';

const PLAN_OPTIONS = [
  { label: 'All Plans', value: '' },
  { label: 'Standalone POS', value: 'StandalonePos' },
  { label: 'Standalone Cloud', value: 'StandaloneCloud' },
];

// V4 status model (user-locked): Active displays as "Issued"; Consumed dropped;
// Superseded = provably dead, flagged for review.
const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Issued', value: 'Active' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Revoked', value: 'Revoked' },
  { label: 'Superseded (review)', value: 'Superseded' },
];

// 2026-08-30 (user directive): the list defaults to a short window — history grows too
// heavy to load in full every time. The window is applied server-side; picking custom
// dates switches to "Custom dates" automatically.
const RANGE_OPTIONS = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This month', value: 'month' },
  { label: 'All time', value: 'all' },
  { label: 'Custom dates', value: 'custom' },
];

interface TokenListProps {
  tokens: TokenListItem[];
  isLoading: boolean;
  isFetching: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  merchantOptions: { label: string; value: string }[];
  merchantFilter: string;
  onMerchantFilterChange: (val: string) => void;
  planFilter: string;
  onPlanFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  range: string;
  onRangeChange: (val: string) => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  revokeTarget: { id: string; merchantName: string } | null;
  onRevokeTargetChange: (val: { id: string; merchantName: string } | null) => void;
  revokeReason: string;
  onRevokeReasonChange: (val: string) => void;
  onRevoke: () => void;
  isRevoking: boolean;
  markTarget: { id: string; merchantName: string } | null;
  onMarkTargetChange: (val: { id: string; merchantName: string } | null) => void;
  markDate: string;
  onMarkDateChange: (val: string) => void;
  onMarkApplied: () => void;
  isMarking: boolean;
  onResend: (tokenId: string, merchantName: string) => void;
  onExportCsv: () => void;
  metrics?: TokenMetricsDashboardDto;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  isLoading,
  isFetching,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  merchantOptions,
  merchantFilter,
  onMerchantFilterChange,
  planFilter,
  onPlanFilterChange,
  statusFilter,
  onStatusFilterChange,
  range,
  onRangeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  revokeTarget,
  onRevokeTargetChange,
  revokeReason,
  onRevokeReasonChange,
  onRevoke,
  isRevoking,
  markTarget,
  onMarkTargetChange,
  markDate,
  onMarkDateChange,
  onMarkApplied,
  isMarking,
  onResend,
  onExportCsv,
  metrics,
}) => {
  const navigate = useNavigate();

  const columns: ATMTableColumn<TokenListItem>[] = useMemo(
    () => [
      {
        key: 'tokenId',
        header: 'Token ID',
        renderCell: (_val, row) => (
          <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100" title={row.tokenId}>
            {row.tokenId.slice(0, 8)}...
          </span>
        ),
      },
      {
        key: 'merchantName',
        header: 'Merchant',
        renderCell: (_val, row) => (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {row.merchantName}
          </span>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        renderCell: (_val, row) => (
          <span title={PLAN_TYPE_LABEL[row.plan] ?? row.plan}>
            <ATMBadge color="primary" label={row.planName || (PLAN_TYPE_LABEL[row.plan] ?? row.plan)} />
          </span>
        ),
      },
      {
        key: 'sequence',
        header: 'Seq',
        renderCell: (_val, row) => (
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">#{row.sequence}</span>
        ),
      },
      {
        key: 'validityDays',
        header: 'Validity',
        renderCell: (_val, row) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{row.validityDays}d</span>
        ),
      },
      {
        key: 'expiresAt',
        header: 'Activated → Expires',
        renderCell: (_val, row) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {row.activatedAt
              ? `${formatDate(row.activatedAt, 'short')} → ${row.expiresAt ? formatDate(row.expiresAt, 'short') : '—'}`
              : 'Not applied yet'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Generated',
        renderCell: (_val, row) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {formatDate(row.createdAt, 'short')}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (_val, row) => <TokenStatusBadge status={row.status} />,
      },
    ],
    [],
  );

  const rowActions = useCallback(
    (row: TokenListItem): RowAction<TokenListItem>[] => {
      const actions: RowAction<TokenListItem>[] = [
        {
          label: 'View',
          icon: Eye,
          onClick: (r) => navigate(`/tokens/${r.tokenId}`),
        },
      ];
      // Superseded = the review queue — revoke is its standard resolution.
      if (row.status === 'Superseded') {
        actions.push({
          label: 'Revoke (resolve)',
          icon: Ban,
          variant: 'danger',
          onClick: (r) => onRevokeTargetChange({ id: r.tokenId, merchantName: r.merchantName }),
        });
      }
      if (row.status === 'Active') {
        actions.push({
          label: 'Resend',
          icon: Mail,
          onClick: (r) => onResend(r.tokenId, r.merchantName),
        });
        // Local-Only POS never reports activation — the operator records it here.
        if (!row.activatedAt) {
          actions.push({
            label: 'Mark as Applied',
            icon: CheckCircle2,
            onClick: (r) => onMarkTargetChange({ id: r.tokenId, merchantName: r.merchantName }),
          });
        }
        actions.push({
          label: 'Revoke',
          icon: Ban,
          variant: 'danger',
          onClick: (r) => onRevokeTargetChange({ id: r.tokenId, merchantName: r.merchantName }),
        });
      }
      return actions;
    },
    [navigate, onRevokeTargetChange, onResend, onMarkTargetChange],
  );

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <ATMPageHeader
          title="Token History"
          subtitle="Every recharge token ever generated, across all Standalone merchants."
          icon={Key}
          action={{
            label: 'Generate Token',
            onClick: () => navigate('/tokens/generate'),
            icon: Plus,
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 animate-in fade-in zoom-in duration-300">
          <ATMStatsCard
            label="Active Tokens"
            value={metrics ? metrics.activeTokens : (isLoading ? '...' : 0)}
            icon={CheckCircle2}
            variant="emerald"
          />
          <ATMStatsCard
            label="Total Generated"
            value={metrics ? metrics.totalGenerated : (isLoading ? '...' : 0)}
            icon={Coins}
            variant="accent"
          />
          <ATMStatsCard
            label="Token Revenue"
            value={metrics ? `${metrics.revenueFromTokens.toFixed(2)} ${metrics.revenueCurrency}` : (isLoading ? '...' : 0)}
            icon={AlertTriangle}
            variant="purple"
          />
          <ATMStatsCard
            label="Expired / Revoked"
            value={metrics ? metrics.expiredTokens + metrics.revokedTokens : (isLoading ? '...' : 0)}
            icon={Ban}
            variant="rose"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/10 dark:bg-gray-900/10">
        <ATMCard title="Search & Filters" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <ATMTextField
              name="search"
              placeholder="Search by token ID or merchant..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              prefix={<Search size={16} />}
            />
            <ATMSelectField
              name="merchantFilter"
              placeholder="All Merchants"
              options={[{ label: 'All Merchants', value: '' }, ...merchantOptions]}
              value={merchantFilter || null}
              onChange={(val) => onMerchantFilterChange((val as string) || '')}
            />
            <ATMSelectField
              name="planFilter"
              placeholder="All Plans"
              options={PLAN_OPTIONS}
              value={planFilter || null}
              onChange={(val) => onPlanFilterChange((val as string) || '')}
            />
            <ATMSelectField
              name="statusFilter"
              placeholder="All Statuses"
              options={STATUS_OPTIONS}
              value={statusFilter || null}
              onChange={(val) => onStatusFilterChange((val as string) || '')}
            />
            <ATMSelectField
              name="rangeFilter"
              options={RANGE_OPTIONS}
              value={range}
              onChange={(val) => onRangeChange((val as string) || '30d')}
            />
            <ATMTextField
              name="dateFrom"
              type="date"
              placeholder="From date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
            <ATMTextField
              name="dateTo"
              type="date"
              placeholder="To date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </ATMCard>

        <ATMCard padding="none" className="shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl">
          <ATMTable
            columns={columns}
            data={tokens}
            isLoading={isLoading}
            isFetching={isFetching}
            rowActions={rowActions}
            density="compact"
            emptyMessage={
              range === 'all'
                ? 'No tokens found. Generate your first token to get started.'
                : 'No tokens generated in this date range — switch the range to "All time" to see older history.'
            }
            extraHeaderActions={
              <ATMButton
                type="button"
                variant="outline"
                size="sm"
                icon={Download}
                onClick={onExportCsv}
                className="hover:scale-[1.01] transition-transform"
              >
                Export CSV
              </ATMButton>
            }
            pagination={{
              page,
              pageSize,
              totalCount,
              onPageChange,
              onPageSizeChange,
            }}
          />
        </ATMCard>
      </div>

      <ATMModal
        isOpen={revokeTarget !== null}
        onClose={() => {
          onRevokeTargetChange(null);
          onRevokeReasonChange('');
        }}
        title="Revoke Token"
        subtitle={`This will permanently revoke the token for ${revokeTarget?.merchantName ?? 'this merchant'}. This action cannot be undone.`}
        size="md"
      >
        <div className="space-y-4">
          <ATMTextField
            name="revokeReason"
            label="Reason for revocation"
            placeholder="e.g. Merchant requested cancellation"
            value={revokeReason}
            onChange={(e) => onRevokeReasonChange(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <ATMButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onRevokeTargetChange(null);
                onRevokeReasonChange('');
              }}
            >
              Cancel
            </ATMButton>
            <ATMButton
              type="button"
              variant="danger"
              size="sm"
              onClick={onRevoke}
              isLoading={isRevoking}
              disabled={!revokeReason.trim()}
            >
              Revoke Token
            </ATMButton>
          </div>
        </div>
      </ATMModal>

      {/* Mark as Applied — Local-Only POS never reports activation; operator records it. */}
      <ATMModal
        isOpen={markTarget !== null}
        onClose={() => onMarkTargetChange(null)}
        title="Mark Token as Applied"
        subtitle={`Record that ${markTarget?.merchantName ?? 'the merchant'} applied this token on their POS. This starts the validity window and cannot be undone.`}
        size="md"
      >
        <div className="space-y-4">
          <ATMTextField
            name="markDate"
            type="date"
            label="Applied on (leave empty for today)"
            value={markDate}
            onChange={(e) => onMarkDateChange(e.target.value)}
          />
          <p className="text-[11px] text-gray-400 font-medium">
            Standalone Local-Only terminals apply tokens offline and never report back —
            recording the date here keeps Token Validity and expiry reminders accurate.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <ATMButton type="button" variant="secondary" size="sm" onClick={() => onMarkTargetChange(null)}>
              Cancel
            </ATMButton>
            <ATMButton
              type="button"
              variant="primary"
              size="sm"
              onClick={onMarkApplied}
              isLoading={isMarking}
            >
              Mark as Applied
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
};

export default TokenList;
