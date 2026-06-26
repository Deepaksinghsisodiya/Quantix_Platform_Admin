import React from 'react';
import { Link } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { DollarSign, FileText, Wallet, ArrowRight, CreditCard, Clock } from 'lucide-react';

interface FinanceManagerDashboardProps {
  summary: any;
  revenue: any;
  commission: any;
  isFetching: boolean;
  refetch: () => void;
}

export const FinanceManagerDashboard: React.FC<FinanceManagerDashboardProps> = ({
  summary,
  revenue,
  commission,
  isFetching,
  refetch,
}) => {
  const currency = summary?.revenueCurrency || 'USD';

  return (
    <div className="space-y-6 p-6">
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
          label="MRR (30 days)"
          value={revenue?.mrr ? formatCurrency(revenue.mrr, currency) : '—'}
          icon={DollarSign}
          variant="emerald"
          description="Monthly recurring revenue"
        />
        <ATMStatsCard
          label="Commission Collected"
          value={commission?.totalCollected ? formatCurrency(commission.totalCollected, currency) : '—'}
          icon={CreditCard}
          variant="indigo"
          description="Total commission volume"
        />
        <ATMStatsCard
          label="Active Wallets"
          value={(summary?.activeMerchants ?? 0).toLocaleString()}
          icon={Wallet}
          variant="accent"
          description="Enterprise merchant wallets"
        />
        <ATMStatsCard
          label="Pending Invoices"
          value="—"
          icon={FileText}
          variant="slate"
          description="Requires verification"
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
