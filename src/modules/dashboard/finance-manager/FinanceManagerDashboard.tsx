import React from 'react';
import { Link } from 'react-router-dom';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { BillingDashboard } from '@/modules/billing/services/billingApi';
import type { CommissionDashboardDto } from '@/lib/api/dashboard';
import { DollarSign, FileText, Wallet, ArrowRight, CreditCard, Clock, AlertTriangle, Percent, Hourglass } from 'lucide-react';

interface FinanceManagerDashboardProps {
  billing: BillingDashboard | undefined;
  commission: CommissionDashboardDto | undefined;
  /** Enterprise wallets, from the paged envelope's total; undefined while unknown. */
  walletCount: number | undefined;
  isFetching: boolean;
}

/** "+12.5% vs last month" or, with no prior-month baseline, an honest "no prior month". */
function changeNote(percent: number | null | undefined, fallback: string): string {
  if (percent === null || percent === undefined) return fallback;
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}% vs last month`;
}

/**
 * 2026-09-04: every tile is now a real figure in the deployment currency. The previous
 * version showed "Pending Invoices —", counted active merchants as "Active Wallets", and
 * fell back to a hardcoded 'USD'.
 */
export const FinanceManagerDashboard: React.FC<FinanceManagerDashboardProps> = ({
  billing,
  commission,
  walletCount,
  isFetching,
}) => {
  // Every amount on this desk is in the platform's single deployment currency, which the
  // billing dashboard carries; nothing is rendered as money until it is known.
  const currency = billing?.currencyCode;
  const money = (amount: number | undefined) =>
    amount === undefined || !currency ? '—' : formatCurrency(amount, currency);

  return (
    <div className="space-y-6 w-full">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Finance Manager</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Wallets, invoices, commission logs, tax configurations, and billing cadences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <Clock className="h-4 w-4 animate-spin text-accent-500" />}
          <ATMBadge label="Live" color="primary" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard
          label="Invoiced This Month"
          value={money(billing?.totalInvoiced)}
          icon={FileText}
          variant="indigo"
          description={changeNote(billing?.totalInvoicedChangePercent, 'No prior month to compare')}
        />
        <ATMStatsCard
          label="Collected This Month"
          value={money(billing?.collected)}
          icon={DollarSign}
          variant="emerald"
          description={changeNote(billing?.collectedChangePercent, 'No prior month to compare')}
        />
        <ATMStatsCard
          label="Outstanding"
          value={money(billing?.outstanding)}
          icon={Hourglass}
          variant="amber"
          description={`${(billing?.outstandingCount ?? 0).toLocaleString()} invoices awaiting payment`}
        />
        <ATMStatsCard
          label="Overdue"
          value={money(billing?.overdue)}
          icon={AlertTriangle}
          variant="rose"
          description={`${(billing?.overdueCount ?? 0).toLocaleString()} invoices past due`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ATMStatsCard
          label="Commission This Month"
          value={money(commission?.totalEarnedThisMonth)}
          icon={Percent}
          variant="accent"
          description={`${money(commission?.totalEarned)} earned to date`}
        />
        <ATMStatsCard
          label="Pending Settlement"
          value={money(commission?.pendingSettlement)}
          icon={CreditCard}
          variant="slate"
          description="Collected commission not yet settled"
        />
        <ATMStatsCard
          label="Merchant Wallets"
          value={walletCount === undefined ? '—' : walletCount.toLocaleString()}
          icon={Wallet}
          variant="purple"
          description="Enterprise token wallets"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Link to="/billing/wallets" className="group">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">Recharge a Merchant Wallet</span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/billing/invoices" className="group">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">Generate / Send Invoice</span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/commission/collections" className="group">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">Run Commission Settlement Cycle</span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default FinanceManagerDashboard;
