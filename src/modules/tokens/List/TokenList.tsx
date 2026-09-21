/**
 * Token History table — 2026-08-29 rebuild. Tier column/filter replaced with the real
 * Plan (deployment mode); Valid From/To replaced with Activated/Expires (a token's window
 * only materialises when the merchant applies it — Rule 7).
 */
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye, Ban, CheckCircle2, AlertTriangle, Key, Coins, Mail, Layers } from 'lucide-react';
import clsx from 'clsx';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMAvatar } from '@/shared/ui/ATMAvatar';
import { ATMTextField } from '@/shared/ui/ATMTextField';
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
  fetchError?: string | null;
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
  sortBy?: string;
  sortDesc?: boolean;
  onSort: (field: string) => void;
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
  fetchError,
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
  sortBy,
  sortDesc,
  onSort,
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
        sortable: true,
        renderCell: (_val, row) => (
          <span className="inline-flex items-center gap-2.5 min-w-0">
            <span className={clsx(
              'h-1.5 w-1.5 rounded-full shrink-0',
              row.status === 'Active' ? 'bg-emerald-500'
                : row.status === 'Expired' ? 'bg-slate-300 dark:bg-slate-600'
                  : row.status === 'Revoked' ? 'bg-rose-500'
                    : row.status === 'Superseded' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600',
            )} />
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100" title={row.tokenId}>
              {row.tokenId.slice(0, 8)}...
            </span>
          </span>
        ),
      },
      {
        key: 'merchantName',
        header: 'Merchant',
        sortable: true,
        renderCell: (_val, row) => (
          <div className="flex items-center gap-3 min-w-0 py-1">
            <div className="shrink-0 ring-2 ring-white dark:ring-slate-800 rounded-xl shadow-sm">
              <ATMAvatar name={row.merchantName} size="sm" className="rounded-xl" />
            </div>
            <div className="min-w-0">
              <p className="truncate max-w-[190px] text-[13px] font-black text-slate-900 dark:text-slate-100 tracking-tight" title={row.merchantName}>
                {row.merchantName}
              </p>
              <p className="truncate max-w-[190px] mt-0.5 font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest" title={row.merchantCode}>
                {row.merchantCode}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        renderCell: (_val, row) => (
          <div className="flex items-center gap-2">
            <ATMBadge color="primary" label={row.planName || (PLAN_TYPE_LABEL[row.plan] ?? row.plan)} />
          </div>
        ),
      },
      {
        key: 'sequence',
        header: 'Seq',
        renderCell: (_val, row) => (
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">#{row.sequence}</span>
        ),
      },
      {
        key: 'validityDays',
        header: 'Validity',
        renderCell: (_val, row) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{row.validityDays}d</span>
        ),
      },
      {
        key: 'expiresAt',
        header: 'Activated → Expires',
        renderCell: (_val, row) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {row.activatedAt
              ? `${formatDate(row.activatedAt, 'short')} → ${row.expiresAt ? formatDate(row.expiresAt, 'short') : '—'}`
              : 'Not applied yet'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Generated',
        sortable: true,
        renderCell: (_val, row) => (
          <span className="block">
            <span className="block text-xs text-slate-600 dark:text-slate-400 font-medium">
              {formatDate(row.createdAt, 'short')}
            </span>
            {row.generatedBy && (
              <span className="block mt-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate max-w-[120px]" title={row.generatedBy}>
                {row.generatedBy}
              </span>
            )}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
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
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title="Token History"
        subtitle="Every recharge token ever generated, across all Standalone merchants."
        icon={Key}
        iconColor="indigo"
        action={{
          label: 'Generate Token',
          onClick: () => navigate('/tokens/generate'),
          icon: Plus,
        }}
        secondaryAction={{
          label: 'Batch Generate',
          onClick: () => navigate('/tokens/bulk'),
          icon: Layers,
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ATMStatsCard
          label="Active Tokens"
          value={metrics ? metrics.activeTokens : (isLoading ? <ATMSkeleton width="84px" height="26px" /> : 0)}
          icon={CheckCircle2}
          variant="emerald"
        />
        <ATMStatsCard
          label="Total Generated"
          value={metrics ? metrics.totalGenerated : (isLoading ? <ATMSkeleton width="84px" height="26px" /> : 0)}
          icon={Coins}
          variant="accent"
        />
        <ATMStatsCard
          label="Token Revenue"
          value={metrics ? `${metrics.revenueFromTokens.toFixed(2)} ${metrics.revenueCurrency}` : (isLoading ? <ATMSkeleton width="84px" height="26px" /> : 0)}
          icon={AlertTriangle}
          variant="purple"
        />
        <ATMStatsCard
          label="Expired / Revoked"
          value={metrics ? metrics.expiredTokens + metrics.revokedTokens : (isLoading ? <ATMSkeleton width="84px" height="26px" /> : 0)}
          icon={Ban}
          variant="rose"
        />
      </div>

      {fetchError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{fetchError}</p>
        </div>
      )}

      <ATMCard padding="none" className="overflow-hidden rounded-2xl">
        <ATMTable
          columns={columns}
          data={tokens}
          isLoading={isLoading}
          isFetching={isFetching}
          rowActions={rowActions}
          onRowClick={(row) => navigate(`/tokens/${row.tokenId}`)}
          density="compact"
          searchValue={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search by token ID or merchant..."
          sortBy={sortBy}
          sortDesc={sortDesc}
          onSort={onSort}
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
          filterConfig={{
            fields: [
              {
                key: 'merchant',
                label: 'Merchant',
                type: 'select',
                options: [{ label: 'All Merchants', value: '' }, ...merchantOptions],
              },
              { key: 'plan', label: 'Plan', type: 'select', options: PLAN_OPTIONS },
              { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
              { key: 'range', label: 'Range', type: 'select', options: RANGE_OPTIONS, defaultValue: '30d' },
              { key: 'from', label: 'From date', type: 'date', placeholder: 'From date' },
              { key: 'to', label: 'To date', type: 'date', placeholder: 'To date' },
            ],
            values: {
              merchant: merchantFilter,
              plan: planFilter,
              status: statusFilter,
              range,
              from: dateFrom,
              to: dateTo,
            },
            onChange: (key, val) => {
              switch (key) {
                case 'merchant':
                  onMerchantFilterChange((val as string) || '');
                  break;
                case 'plan':
                  onPlanFilterChange((val as string) || '');
                  break;
                case 'status':
                  onStatusFilterChange((val as string) || '');
                  break;
                case 'range':
                  onRangeChange(((val as string) === 'all' || !val ? '30d' : (val as string)) );
                  break;
                case 'from':
                  onDateFromChange((val as string) === 'all' ? '' : ((val as string) || ''));
                  break;
                case 'to':
                  onDateToChange((val as string) === 'all' ? '' : ((val as string) || ''));
                  break;
              }
            },
            onReset: () => {
              onMerchantFilterChange('');
              onPlanFilterChange('');
              onStatusFilterChange('');
              onDateFromChange('');
              onDateToChange('');
              onRangeChange('30d');
            },
          }}
          pagination={{
            page,
            pageSize,
            totalCount,
            onPageChange,
            onPageSizeChange,
          }}
        />
      </ATMCard>

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
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--zen-border)]">
            <ATMButton
              type="button"
              variant="outline"
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
          <p className="text-[11px] text-slate-400 font-medium">
            Standalone Local-Only terminals apply tokens offline and never report back —
            recording the date here keeps Token Validity and expiry reminders accurate.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--zen-border)]">
            <ATMButton type="button" variant="outline" size="sm" onClick={() => onMarkTargetChange(null)}>
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
