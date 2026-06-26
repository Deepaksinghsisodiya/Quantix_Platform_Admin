/**
 * EnterprisePanels — Enterprise-specific detail cards with mock data.
 *
 * Displays Cloud API Health, Sync Status, Platform Bridge,
 * Usage Metrics, Commission Summary, Subscription, and Wallet.
 */

import React from 'react';
import {
  Activity,
  Cloud,
  CreditCard,
  DollarSign,
  Link2,
  RefreshCw,
  Wallet,
  Zap,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMProgressBar } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK = {
  cloudHealth: {
    status: 'Connected' as const,
    uptime: 99.97,
    lastCheck: '2 minutes ago',
  },
  sync: {
    lastSync: '2026-03-29T14:32:00Z',
    frequency: 'Real-time',
    pendingItems: 0,
    locationsSyncing: 3,
  },
  platformBridge: {
    connected: true,
    version: '2.4.1',
    lastHandshake: '1 minute ago',
  },
  usage: {
    transactionsToday: 1247,
    transactionsMonth: 28_450,
    apiCallsToday: 5_892,
    apiCallsMonth: 142_300,
  },
  commission: {
    thisMonth: 2_340.50,
    rate: 2.5,
    pendingPayout: 1_120.00,
  },
  subscription: {
    plan: 'Professional',
    nextBilling: '2026-04-15',
    amount: 129,
  },
  wallet: {
    balance: 4_560.25,
    limit: 10_000,
  },
};

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function EnterprisePanels() {
  const walletPercent = Math.round((MOCK.wallet.balance / MOCK.wallet.limit) * 100);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Cloud API Health */}
      <ATMCard title="Cloud API Health" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Cloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {MOCK.cloudHealth.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last check: {MOCK.cloudHealth.lastCheck}
              </p>
            </div>
          </div>
          <StatRow label="Uptime" value={`${MOCK.cloudHealth.uptime}%`} />
        </div>
      </ATMCard>

      {/* Sync Status */}
      <ATMCard title="Sync Status" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {MOCK.sync.frequency}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {MOCK.sync.locationsSyncing} locations syncing
              </p>
            </div>
          </div>
          <StatRow label="Pending Items" value={MOCK.sync.pendingItems} />
        </div>
      </ATMCard>

      {/* Platform Bridge */}
      <ATMCard title="Platform Bridge" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              MOCK.platformBridge.connected
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-red-100 dark:bg-red-900/30',
            )}>
              <Link2 className={cn(
                'h-5 w-5',
                MOCK.platformBridge.connected
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {MOCK.platformBridge.connected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                v{MOCK.platformBridge.version}
              </p>
            </div>
          </div>
          <StatRow label="Last Handshake" value={MOCK.platformBridge.lastHandshake} />
        </div>
      </ATMCard>

      {/* Usage Metrics */}
      <ATMCard title="Usage Metrics" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Today's activity</p>
            </div>
          </div>
          <StatRow label="Transactions (today)" value={MOCK.usage.transactionsToday.toLocaleString()} />
          <StatRow label="Transactions (month)" value={MOCK.usage.transactionsMonth.toLocaleString()} />
          <StatRow label="API Calls (today)" value={MOCK.usage.apiCallsToday.toLocaleString()} />
          <StatRow label="API Calls (month)" value={MOCK.usage.apiCallsMonth.toLocaleString()} />
        </div>
      </ATMCard>

      {/* Commission Summary */}
      <ATMCard title="Commission Summary" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(MOCK.commission.thisMonth)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
            </div>
          </div>
          <StatRow label="Commission Rate" value={`${MOCK.commission.rate}%`} />
          <StatRow label="Pending Payout" value={formatCurrency(MOCK.commission.pendingPayout)} />
        </div>
      </ATMCard>

      {/* Subscription */}
      <ATMCard title="Subscription" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {MOCK.subscription.plan} Plan
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(MOCK.subscription.amount)}/mo
              </p>
            </div>
          </div>
          <StatRow label="Next Billing" value={MOCK.subscription.nextBilling} />
        </div>
      </ATMCard>

      {/* Wallet */}
      <ATMCard title="Wallet" padding="md" className="sm:col-span-2 lg:col-span-1">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Wallet className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(MOCK.wallet.balance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Available balance</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Usage</span>
              <span>{walletPercent}%</span>
            </div>
            <ATMProgressBar
              value={walletPercent}
              size="sm"
              variant={walletPercent > 80 ? 'danger' : walletPercent > 50 ? 'warning' : 'default'}
            />
          </div>
          <StatRow label="Limit" value={formatCurrency(MOCK.wallet.limit)} />
        </div>
      </ATMCard>
    </div>
  );
}

export default EnterprisePanels;
