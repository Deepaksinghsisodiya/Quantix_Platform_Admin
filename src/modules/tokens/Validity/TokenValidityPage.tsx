import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  RefreshCw,
  Clock3,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { TokenTier } from '@/lib/types';

export interface MerchantValidity {
  id: string;
  merchantName: string;
  activeTokens: number;
  earliestExpiry: string;
  tier: TokenTier;
  daysRemaining: number;
  status: 'Healthy' | 'Warning' | 'Critical' | 'Expired';
  renewalPrice: number;
}

const TIER_BADGE_VARIANT: Record<TokenTier, 'gray' | 'primary' | 'purple' | 'warning'> = {
  Basic: 'gray',
  Standard: 'primary',
  Advance: 'purple',
  Premium: 'warning',
};

function DaysRemainingCell({ days }: { days: number }) {
  let colorClass: string;
  if (days <= 0) colorClass = 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20';
  else if (days <= 7) colorClass = 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20';
  else if (days <= 14) colorClass = 'text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20';
  else if (days <= 30) colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20';
  else colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20';

  return (
    <span className={cn('inline-flex rounded-md border border-current px-2.5 py-0.5 text-xs font-bold tabular-nums', colorClass)}>
      {days <= 0 ? 'Expired' : `${days}d`}
    </span>
  );
}

function getColumns(
  onRenew: (merchant: MerchantValidity) => void,
  onSendReminder: (merchant: MerchantValidity) => void,
): ATMTableColumn<MerchantValidity>[] {
  return [
    {
      key: 'merchantName',
      header: 'Merchant Name',
      renderCell: (val, row) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">{row.merchantName}</span>
      ),
    },
    {
      key: 'activeTokens',
      header: 'Active Tokens',
      renderCell: (val, row) => (
        <span className="tabular-nums text-gray-700 dark:text-gray-300 font-bold">{row.activeTokens}</span>
      ),
      width: '120px',
    },
    {
      key: 'earliestExpiry',
      header: 'Earliest Expiry',
      renderCell: (val, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {formatDate(row.earliestExpiry, 'short')}
        </span>
      ),
      width: '130px',
    },
    {
      key: 'tier',
      header: 'Tier',
      renderCell: (val, row) => {
        return <ATMBadge color={TIER_BADGE_VARIANT[row.tier] ?? 'gray'} label={row.tier} />;
      },
      width: '100px',
    },
    {
      key: 'daysRemaining',
      header: 'Days Remaining',
      renderCell: (val, row) => <DaysRemainingCell days={row.daysRemaining} />,
      width: '130px',
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (val, row) => <StatusBadge status={row.status} />,
      width: '110px',
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (val, row) => (
        <div className="flex gap-2">
          <ATMButton
            type="button"
            size="sm"
            variant="primary"
            icon={RefreshCw}
            onClick={() => onRenew(row)}
            className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-100"
          >
            Renew
          </ATMButton>
          <ATMButton
            type="button"
            size="sm"
            variant="secondary"
            icon={Mail}
            onClick={() => onSendReminder(row)}
            className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-100"
          >
            Remind
          </ATMButton>
        </div>
      ),
      width: '200px',
    },
  ];
}

export interface TokenValidityPageProps {
  merchants: MerchantValidity[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  expiring7: number;
  expiring14: number;
  expiring30: number;
  projectedRevenue: number;
  dueMerchantsCount: number;
  onRenew: (merchant: MerchantValidity) => void;
  onSendReminder: (merchant: MerchantValidity) => void;
  onBulkReminders: () => void;
  sendingReminders: boolean;
}

export const TokenValidityPage: React.FC<TokenValidityPageProps> = ({
  merchants,
  isLoading,
  isError,
  refetch,
  expiring7,
  expiring14,
  expiring30,
  projectedRevenue,
  dueMerchantsCount,
  onRenew,
  onSendReminder,
  onBulkReminders,
  sendingReminders,
}) => {
  const columns = useMemo(() => getColumns(onRenew, onSendReminder), [onRenew, onSendReminder]);

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      {/* Header and KPIs Section */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <ATMPageHeader
          title="Token Validity Dashboard"
          subtitle="Monitor token expiry and manage renewal notifications across Standalone merchants."
          icon={Clock3}
          action={{
            label: 'Send Renewal Reminders',
            onClick: onBulkReminders,
            icon: Bell,
          }}
        />

        <div className="grid gap-6 sm:grid-cols-3 mt-8">
          <ATMStatsCard
            label="Expiring in 7 days"
            value={expiring7}
            variant="rose"
            icon={AlertTriangle}
          />
          <ATMStatsCard
            label="Expiring in 14 days"
            value={expiring14}
            variant="amber"
            icon={Clock}
          />
          <ATMStatsCard
            label="Expiring in 30 days"
            value={expiring30}
            variant="indigo"
            icon={Calendar}
          />
        </div>
      </div>

      {/* Scrollable list content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/10 dark:bg-gray-900/10">
        {/* Projected revenue */}
        <ATMCard title="Projected Revenue" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Projected Renewal Revenue (30 days)</p>
                <p className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(projectedRevenue)}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              {dueMerchantsCount} merchants due for renewal
            </div>
          </div>
        </ATMCard>

        {isError && !isLoading && (
          <ATMCard padding="md" className="shadow-sm border border-gray-100 dark:border-gray-850">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Failed to load expiring tokens
                  </p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                    Please try again.
                  </p>
                </div>
              </div>
              <ATMButton type="button" variant="secondary" size="sm" onClick={refetch}>
                Retry
              </ATMButton>
            </div>
          </ATMCard>
        )}

        {/* Table */}
        <ATMCard padding="none" className="shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl">
          <ATMTable
            columns={columns}
            data={merchants}
            isLoading={isLoading}
            density="compact"
            emptyMessage="No Standalone merchants with expiring tokens found."
          />
        </ATMCard>
      </div>
    </div>
  );
};
export default TokenValidityPage;
