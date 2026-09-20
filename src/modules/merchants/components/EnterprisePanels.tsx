/**
 * EnterprisePanels — Enterprise-merchant detail cards.
 *
 * FRS-SAP-402 (2026-08-05): de-mocked. Platform Bridge health, Usage rollup,
 * Commission Summary, Subscription, and Wallet now render the real
 * GET /merchants/{id}/detail payload.
 */

import React from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import {
  Activity,
  CreditCard,
  DollarSign,
  Link2,
  RefreshCw,
  Wallet,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import type {
  DetailBridgeHealth,
  DetailCommissionSummary,
  DetailSubscription,
  DetailUsageSummary,
  DetailWallet,
} from '../types/merchantDetail.types';

// ---------------------------------------------------------------------------
// Stat row helper
// ---------------------------------------------------------------------------

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">{text}</p>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EnterprisePanelsProps {
  bridgeHealth?: DetailBridgeHealth | null;
  usageSummary?: DetailUsageSummary | null;
  commissionSummary?: DetailCommissionSummary | null;
  subscription?: DetailSubscription | null;
  wallet?: DetailWallet | null;
  isLoading?: boolean;
}

function EnterprisePanels({
  bridgeHealth,
  usageSummary,
  commissionSummary,
  subscription,
  wallet,
  isLoading,
}: EnterprisePanelsProps) {
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Platform Bridge */}
      <ATMCard title="Platform Bridge" padding="md">
        {bridgeHealth ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                bridgeHealth.isConnected
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-red-100 dark:bg-red-900/30',
              )}>
                <Link2 className={cn(
                  'h-5 w-5',
                  bridgeHealth.isConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {bridgeHealth.isConnected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {bridgeHealth.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {bridgeHealth.syncStatus ?? 'No sync status reported'}
                </p>
              </div>
            </div>
            <StatRow
              label="Last Sync"
              value={bridgeHealth.lastSyncAt ? formatDate(bridgeHealth.lastSyncAt, 'short') : 'Never'}
            />
            <StatRow label="Pending Sync Items" value={bridgeHealth.pendingSyncItems} />
          </div>
        ) : (
          <EmptyHint text="No bridge telemetry reported yet." />
        )}
      </ATMCard>

      {/* Usage (30-day rollup) */}
      <ATMCard title="Usage — Last 30 Days" padding="md">
        {usageSummary ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {usageSummary.last30DaysTransactions.toLocaleString()} transactions
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {usageSummary.lastReportedAt
                    ? `Last reported ${formatDate(usageSummary.lastReportedAt, 'short')}`
                    : 'No usage reported yet'}
                </p>
              </div>
            </div>
            <StatRow label="API Calls" value={usageSummary.last30DaysApiCalls.toLocaleString()} />
            <StatRow label="Active Terminals" value={usageSummary.latestActiveTerminals} />
            <StatRow label="Active Users" value={usageSummary.latestActiveUsers} />
            <StatRow label="Active Locations" value={usageSummary.latestActiveLocations} />
          </div>
        ) : (
          <EmptyHint text="No usage metrics reported yet." />
        )}
      </ATMCard>

      {/* Commission Summary */}
      <ATMCard title="Commission Summary" padding="md">
        {commissionSummary ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrencyOrDash(commissionSummary.totalCommissionEarned, currency)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total earned</p>
              </div>
            </div>
            <StatRow label="Commission Rate" value={`${commissionSummary.currentRatePercent}%`} />
            <StatRow label="Pending" value={formatCurrencyOrDash(commissionSummary.pendingCommission, currency)} />
            <StatRow
              label="Last Settlement"
              value={
                commissionSummary.lastSettlementDate
                  ? `${formatCurrencyOrDash(commissionSummary.lastSettlementAmount, currency)} · ${formatDate(commissionSummary.lastSettlementDate, 'short')}`
                  : '—'
              }
            />
          </div>
        ) : (
          <EmptyHint text="No commission activity yet." />
        )}
      </ATMCard>

      {/* Subscription */}
      <ATMCard title="Subscription" padding="md">
        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {subscription.planDisplayName ?? 'Subscribed'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {subscription.dailySubscriptionPrice != null
                    ? `${formatCurrencyOrDash(Number(subscription.dailySubscriptionPrice), currency)}/day`
                    : 'Rate on file'}
                </p>
              </div>
            </div>
            {subscription.status != null && <StatRow label="Status" value={String(subscription.status)} />}
            {subscription.startDate != null && (
              <StatRow label="Since" value={formatDate(String(subscription.startDate), 'short')} />
            )}
          </div>
        ) : (
          <EmptyHint text="No active subscription." />
        )}
      </ATMCard>

      {/* Wallet */}
      <ATMCard title="Wallet" padding="md">
        {wallet ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Wallet className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {wallet.currencyBalance != null
                    ? formatCurrencyOrDash(Number(wallet.currencyBalance), currency)
                    : wallet.tokenBalance != null
                      ? `${Number(wallet.tokenBalance).toLocaleString()} tokens`
                      : '—'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Available balance</p>
              </div>
            </div>
            {wallet.tokenBalance != null && wallet.currencyBalance != null && (
              <StatRow label="Token Balance" value={Number(wallet.tokenBalance).toLocaleString()} />
            )}
          </div>
        ) : (
          <EmptyHint text="No wallet provisioned." />
        )}
      </ATMCard>
    </div>
  );
}

export default EnterprisePanels;
