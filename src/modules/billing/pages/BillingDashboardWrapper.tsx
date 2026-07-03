import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { retryPayment, sendPaymentReminder } from '@/lib/api/billing';
import { useBillingDashboard, useInvoices } from '../services/useBilling';
import { BillingDashboardView } from './BillingDashboardView';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types shared between Wrapper and View
// ---------------------------------------------------------------------------

export interface RevenueByType {
  name: string;
  value: number;
  color: string;
  percent: number;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
}

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  merchantName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface RecentTransaction {
  id: string;
  merchantName: string;
  type: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

export interface KpiData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: { value: number; direction: 'up' | 'down' };
  color: string;
  accent: string;
}

export interface EscalationStep { day: number; action: string; count: number }

const REVENUE_TYPE_COLORS: Record<string, string> = {
  Subscription: '#8b5cf6',
  Subscriptions: '#8b5cf6',
  TokenPurchase: '#22c55e',
  'Token Sales': '#22c55e',
  Commission: '#f59e0b',
  Usage: '#06b6d4',
  AddOn: '#ec4899',
};

export const MOCK_REVENUE_BY_MERCHANT_TYPE = {
  enterprise: { subscription: 188100, usageOverage: 17100, commission: 51300, total: 256500, merchantCount: 834 },
  standalone: { tokenSales: 85500, total: 85500, merchantCount: 413 },
};

export const MOCK_BILLING_CYCLES = {
  enterprise: { monthlyCycles: 712, annualCycles: 122, anniversaryBilling: 584, fixedDateBilling: 250, gracePeriodDays: 7, proRataEnabled: true, nextBatchRun: '2026-04-01T00:00:00Z' },
  standalone: { description: 'No recurring cycle — billed per token purchase (on-demand)', totalTokenInvoicesThisMonth: 1043 },
};

export const MOCK_ESCALATION: EscalationStep[] = [
  { day: 1, action: 'Payment reminder email sent', count: 12 },
  { day: 7, action: 'Second reminder + API rate throttled', count: 8 },
  { day: 14, action: 'Final notice + feature restrictions', count: 4 },
  { day: 30, action: 'Account suspended', count: 1 },
];

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

export const BillingDashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  const dashboardQuery = useBillingDashboard();
  const overdueInvoicesQuery = useInvoices({ status: 'Overdue', page: 1, pageSize: 5 });
  const recentInvoicesQuery = useInvoices({ page: 1, pageSize: 8 });

  interface ExtendedBillingDashboard {
    readonly totalRevenue: number;
    readonly monthlyRevenue: number;
    readonly outstandingAmount: number;
    readonly overdueAmount?: number;
    readonly overdueInvoices?: number;
    readonly activeSubscriptions?: number;
    readonly revenueByMonth?: readonly { readonly month: string; readonly amount: number }[];
    readonly revenueByType?: Record<string, number>;
  }
  const dashboard = dashboardQuery.data?.data as ExtendedBillingDashboard | undefined;

  const revenueByType: RevenueByType[] = useMemo(() => {
    if (!dashboard?.revenueByType) {
      return [
        { name: 'Subscriptions', value: 188100, color: '#8b5cf6', percent: 55 },
        { name: 'Token Sales', value: 85500, color: '#22c55e', percent: 25 },
        { name: 'Commission', value: 51300, color: '#f59e0b', percent: 15 },
        { name: 'Usage', value: 17100, color: '#06b6d4', percent: 5 },
      ];
    }
    const entries = Object.entries(dashboard.revenueByType as Record<string, number>);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    return entries.map(([name, value]) => ({
      name,
      value,
      color: REVENUE_TYPE_COLORS[name] ?? '#94a3b8',
      percent: Math.round((value / total) * 100),
    }));
  }, [dashboard?.revenueByType]);

  const revenueTrend: RevenueTrend[] = useMemo(() => {
    if (!dashboard?.revenueByMonth || dashboard.revenueByMonth.length === 0) {
      return [
        { month: 'Apr', revenue: 248000 }, { month: 'May', revenue: 261000 },
        { month: 'Jun', revenue: 274000 }, { month: 'Jul', revenue: 283000 },
        { month: 'Aug', revenue: 295000 }, { month: 'Sep', revenue: 301000 },
        { month: 'Oct', revenue: 312000 }, { month: 'Nov', revenue: 318000 },
        { month: 'Dec', revenue: 305000 }, { month: 'Jan', revenue: 328000 },
        { month: 'Feb', revenue: 335000 }, { month: 'Mar', revenue: 342000 },
      ];
    }
    return dashboard.revenueByMonth.map((m) => ({ month: m.month, revenue: m.amount }));
  }, [dashboard?.revenueByMonth]);

  const overdueInvoices: OverdueInvoice[] = useMemo(() => {
    const items = overdueInvoicesQuery.data?.data?.items ?? [];
    if (items.length === 0) return [];
    const today = new Date();
    return items.map((inv) => {
      const dueMs = new Date(inv.dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueMs) / (1000 * 60 * 60 * 24)));
      return { id: inv.id, invoiceNumber: inv.invoiceNumber, merchantName: inv.merchantName, amount: inv.total, dueDate: inv.dueDate, daysOverdue };
    });
  }, [overdueInvoicesQuery.data]);

  const recentTransactions: RecentTransaction[] = useMemo(() => {
    const items = recentInvoicesQuery.data?.data?.items ?? [];
    return items.map((inv) => ({
      id: inv.id,
      merchantName: inv.merchantName,
      type: inv.type,
      amount: inv.total,
      status: inv.status === 'Paid' ? 'Completed' : inv.status === 'Pending' || inv.status === 'Sent' || inv.status === 'Draft' ? 'Pending' : 'Failed',
      date: inv.issuedDate,
    }));
  }, [recentInvoicesQuery.data]);

  const totalInvoiced = dashboard?.totalRevenue ?? 342000;
  const collected = dashboard ? dashboard.totalRevenue - dashboard.outstandingAmount : 298000;
  const outstanding = dashboard?.outstandingAmount ?? 31000;
  const overdueAmount = dashboard?.overdueAmount ?? 13000;

  const kpiCards: KpiData[] = useMemo(() => [
    { title: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: <FileText className="h-4 w-4" />, trend: { value: 8.2, direction: 'up' }, color: 'text-blue-600 dark:text-blue-400', accent: '#3b82f6' },
    { title: 'Collected', value: formatCurrency(collected), icon: <CheckCircle2 className="h-4 w-4" />, trend: { value: 12.1, direction: 'up' }, color: 'text-emerald-600 dark:text-emerald-400', accent: '#22c55e' },
    { title: 'Outstanding', value: formatCurrency(outstanding), icon: <Clock className="h-4 w-4" />, trend: { value: 3.4, direction: 'down' }, color: 'text-amber-600 dark:text-amber-400', accent: '#f59e0b' },
    { title: 'Overdue', value: formatCurrency(overdueAmount), icon: <AlertTriangle className="h-4 w-4" />, trend: { value: 5.7, direction: 'up' }, color: 'text-red-600 dark:text-red-400', accent: '#ef4444' },
  ], [totalInvoiced, collected, outstanding, overdueAmount]);

  const handleRetryPayment = async (invoiceId: string) => {
    try {
      await retryPayment(invoiceId);
      toast.success('Payment retry initiated.');
    } catch {
      toast.error('Failed to retry payment.');
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      await sendPaymentReminder(invoiceId);
      toast.success('Payment reminder sent.');
    } catch {
      toast.error('Failed to send reminder.');
    }
  };

  return (
    <BillingDashboardView
      isLoading={dashboardQuery.isLoading}
      isError={dashboardQuery.isError}
      refetch={dashboardQuery.refetch}
      kpiCards={kpiCards}
      revenueByType={revenueByType}
      revenueTrend={revenueTrend}
      overdueInvoices={overdueInvoices}
      recentTransactions={recentTransactions}
      onRetryPayment={handleRetryPayment}
      onSendReminder={handleSendReminder}
      onNavigate={navigate}
    />
  );
};
