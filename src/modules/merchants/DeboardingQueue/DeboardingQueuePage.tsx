import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import type { MerchantDeboarding, DeboardingStatus } from '../types/merchant.types';

const STATUS_COLOR: Record<DeboardingStatus, BadgeColor> = {
  ConsentGiven: 'primary',
  Deactivated: 'warning',
  AwaitingSettlement: 'warning',
  AwaitingRecharge: 'warning',
  AdminEscalated: 'danger',
  BillingSettled: 'primary',
  RefundIssued: 'primary',
  Completed: 'success',
  Cancelled: 'muted',
};

type Tab = 'active' | 'escalated' | 'closed';

interface DeboardingQueuePageProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
  rows: MerchantDeboarding[];
  activeCount: number;
  escalatedCount: number;
  closedCount: number;
}

function latestActivity(d: MerchantDeboarding): string {
  const candidates = [
    d.completedAt, d.cancelledAt, d.refundIssuedAt, d.billingSettledAt,
    d.merchantRechargedAt, d.merchantRechargeAskedAt, d.finalInvoiceGeneratedAt,
    d.deactivatedAt, d.consentGivenAt
  ].filter((x): x is string => !!x);
  return candidates[0] ?? d.consentGivenAt;
}

export const DeboardingQueuePage: React.FC<DeboardingQueuePageProps> = ({
  tab,
  onTabChange,
  isLoading,
  isFetching,
  isError,
  refetch,
  rows,
  activeCount,
  escalatedCount,
  closedCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.companyName?.toLowerCase().includes(query) ||
        r.merchantId?.toLowerCase().includes(query) ||
        r.status?.toLowerCase().includes(query)
    );
  }, [rows, searchQuery]);

  const columns = useMemo<ATMTableColumn<MerchantDeboarding>[]>(
    () => [
      {
        key: 'companyName',
        header: 'Merchant',
        renderCell: (val, row) => (
          <div>
            <Link
              to={`/merchants/${row.merchantId}`}
              className="font-bold text-accent-600 hover:underline dark:text-accent-400"
            >
              {val}
            </Link>
            <div className="text-xs text-surface-400 font-mono mt-0.5">{row.merchantId.slice(0, 8)}...</div>
          </div>
        ),
      },
      {
        key: 'merchantType',
        header: 'Type',
        renderCell: (val) => (
          <ATMBadge color={val === 'Enterprise' ? 'purple' : 'primary'} size="sm" label={val} />
        ),
        width: '120px',
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val) => (
          <ATMBadge color={STATUS_COLOR[val as DeboardingStatus]} size="sm" dot label={val} />
        ),
        width: '180px',
      },
      {
        key: 'consentGivenAt',
        header: 'Consent Given',
        renderCell: (val) => (
          <span className="text-sm font-semibold text-surface-500 dark:text-surface-400">
            {formatDate(val)}
          </span>
        ),
        width: '160px',
      },
      {
        key: 'lastActivity',
        header: 'Last Activity',
        renderCell: (_, row) => (
          <span className="text-sm font-semibold text-surface-500 dark:text-surface-400">
            {formatDate(latestActivity(row))}
          </span>
        ),
        width: '160px',
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        renderCell: (_, row) => (
          <div className="text-right">
            <Link to={`/merchants/${row.merchantId}`}>
              <ATMButton variant="secondary" size="sm">
                View
              </ATMButton>
            </Link>
          </div>
        ),
        width: '100px',
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6 lg:p-8 pb-10 animate-fade-in w-full flex flex-col h-full">
      {/* Premium Unified Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Merchant Deboarding</span>
            {(isLoading || isFetching) && <Loader2 className="h-5 w-5 animate-spin text-accent-500 shrink-0" />}
          </div>
        }
        subtitle="Active workflows + escalation queue + closed history."
        icon={LogOut}
        iconColor="theme"
        extraActions={
          <div className="flex items-center gap-2">
            {escalatedCount > 0 && (
              <ATMBadge color="danger" size="sm" dot label={`${escalatedCount} escalated`} />
            )}
            <ATMButton
              variant="secondary"
              onClick={refetch}
              icon={isFetching ? Loader2 : RefreshCw}
              disabled={isLoading || isFetching}
            >
              Refresh
            </ATMButton>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-800">
        {[
          { key: 'active' as const, label: `Active (${activeCount})`, icon: <Clock className="h-3.5 w-3.5" /> },
          { key: 'escalated' as const, label: `Escalated (${escalatedCount})`, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
          { key: 'closed' as const, label: `Closed (${closedCount})`, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px focus:outline-none',
              tab === t.key
                ? 'border-accent-600 text-accent-600 dark:border-accent-500 dark:text-accent-400'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ATMTable Integration */}
      <div className="flex-1 overflow-hidden w-full bg-zen-surface rounded-2xl border border-gray-100 dark:border-gray-800">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-danger" />
            <p className="text-sm font-bold text-surface-700 dark:text-surface-200">
              Failed to load deboardings.
            </p>
          </div>
        ) : (
          <ATMTable<MerchantDeboarding>
            columns={columns}
            data={filteredRows}
            isLoading={isLoading}
            isFetching={isFetching}
            density="compact"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search deboardings by merchant name or ID..."
            emptyMessage={`No deboardings found in the ${tab} queue.`}
          />
        )}
      </div>
    </div>
  );
};

export default DeboardingQueuePage;
