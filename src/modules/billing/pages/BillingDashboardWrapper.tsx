import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { retryPayment, sendPaymentReminder } from '@/lib/api/billing';
import { useBillingDashboard, useInvoices } from '../services/useBilling';
import { useGetEscalationSummaryQuery } from '../services/billingApi';
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
  /** 2026-08-30: OPTIONAL — the four hardcoded deltas (+8.2% / +12.1% / -3.4% / +5.7%)
   *  were invented. A delta is shown only when the server computed a real month-over-month
   *  change; balance tiles (Outstanding / Overdue) have no prior-period snapshot, so they
   *  carry no badge at all rather than a fabricated one. */
  trend?: { value: number; direction: 'up' | 'down' };
  /** Sub-label shown when there is no delta (e.g. "3 invoices"). */
  subLabel?: string;
  color: string;
  accent: string;
}

export interface EscalationStep {
  stage: string;
  dayThreshold: number;
  action: string;
  invoiceCount: number;
  totalAmount: number;
}

const REVENUE_TYPE_COLORS: Record<string, string> = {
  Subscription: '#0f62fe',
  Subscriptions: '#0f62fe',
  TokenPurchase: '#10b981',
  'Token Sales': '#10b981',
  Commission: '#f59e0b',
  Usage: '#06b6d4',
  AddOn: '#ec4899',
};

// 2026-08-13: MOCK_REVENUE_BY_MERCHANT_TYPE / MOCK_BILLING_CYCLES / MOCK_ESCALATION
// REMOVED. The first two invented revenue figures and merchant counts, and described a
// billing model this platform does not have (anniversary / annual cycles / pro-rata — our
// model is daily subscription with an operator-configured cadence on Settings → Billing
// Cycle). Escalation is real (Invoice.EscalationStage) and now loads live counts from
// GET /billing/invoices/escalation-summary.

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

export const BillingDashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  const dashboardQuery = useBillingDashboard();
  const overdueInvoicesQuery = useInvoices({ status: 'Overdue', page: 1, pageSize: 5 });
  const recentInvoicesQuery = useInvoices({ page: 1, pageSize: 8 });

  // 2026-08-13: real escalation counts (was a hardcoded array of invented merchant counts).
  const escalationQuery = useGetEscalationSummaryQuery();
  const escalation: EscalationStep[] = (escalationQuery.data?.data ?? []) as EscalationStep[];

  // 2026-08-30: mirrors the real BillingDashboardDto. The previous shape guessed field
  // names the server never sent (outstandingAmount / overdueAmount / totalRevenue against
  // a zeros stub), which is exactly how "Collected" became 0 − undefined = $NaN.
  // 2026-09-04: that mirror now lives on billingApi's `BillingDashboard` itself (shared
  // with the Finance desktop), so the local re-declaration and cast are gone.
  const dashboard = dashboardQuery.data?.data;
  const currency = dashboard?.currencyCode || undefined;

  // 2026-08-30: mock revenue mix (188100/85500/51300/17100) removed — an empty month now
  // renders the chart's own empty state instead of inventing a revenue split.
  const revenueByType: RevenueByType[] = useMemo(() => {
    const rows = dashboard?.revenueByType ?? [];
    const total = rows.reduce((s, r) => s + r.amount, 0) || 1;
    return rows.map((r) => ({
      name: r.name,
      value: r.amount,
      color: REVENUE_TYPE_COLORS[r.name] ?? '#94a3b8',
      percent: Math.round((r.amount / total) * 100),
    }));
  }, [dashboard?.revenueByType]);

  // 2026-08-30: the 12-month mock series (248000 … 342000) removed; the server returns a
  // real rolling 12 months of invoiced revenue (zero-filled for months with no invoices).
  const revenueTrend: RevenueTrend[] = useMemo(
    () => (dashboard?.revenueByMonth ?? []).map((m) => ({ month: m.month, revenue: m.amount })),
    [dashboard?.revenueByMonth],
  );

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

  // 2026-08-30: every mock fallback removed (342000 / 298000 / 31000 / 13000 — the last
  // two are what the operator actually saw on screen). Money renders only from the
  // server payload; while it loads the tiles show an em-dash, never an invented number.
  const money = (v: number | undefined) => formatCurrencyOrDash(v, currency);
  const delta = (pct: number | null | undefined): KpiData['trend'] =>
    pct == null ? undefined : { value: Math.abs(pct), direction: pct >= 0 ? 'up' : 'down' };

  const kpiCards: KpiData[] = useMemo(() => [
    {
      title: 'Total Invoiced',
      value: money(dashboard?.totalInvoiced),
      icon: <FileText className="h-4 w-4" />,
      trend: delta(dashboard?.totalInvoicedChangePercent),
      subLabel: 'This month',
      color: 'text-blue-600 dark:text-blue-400',
      accent: '#3b82f6',
    },
    {
      title: 'Collected',
      value: money(dashboard?.collected),
      icon: <CheckCircle2 className="h-4 w-4" />,
      trend: delta(dashboard?.collectedChangePercent),
      subLabel: 'This month',
      color: 'text-emerald-600 dark:text-emerald-400',
      accent: '#22c55e',
    },
    {
      // Balances carry no month-over-month delta — there is no historical snapshot to
      // compare against, so the tile states the invoice count instead of a fake trend.
      title: 'Outstanding',
      value: money(dashboard?.outstanding),
      icon: <Clock className="h-4 w-4" />,
      subLabel: dashboard ? `${dashboard.outstandingCount} unpaid invoice${dashboard.outstandingCount === 1 ? '' : 's'}` : undefined,
      color: 'text-amber-600 dark:text-amber-400',
      accent: '#f59e0b',
    },
    {
      title: 'Overdue',
      value: money(dashboard?.overdue),
      icon: <AlertTriangle className="h-4 w-4" />,
      subLabel: dashboard ? `${dashboard.overdueCount} overdue invoice${dashboard.overdueCount === 1 ? '' : 's'}` : undefined,
      color: 'text-red-600 dark:text-red-400',
      accent: '#ef4444',
    },
  ], [dashboard, currency]); // eslint-disable-line react-hooks/exhaustive-deps

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
      currency={currency}
      isLoading={dashboardQuery.isLoading}
      isError={dashboardQuery.isError}
      refetch={dashboardQuery.refetch}
      kpiCards={kpiCards}
      revenueByType={revenueByType}
      revenueTrend={revenueTrend}
      overdueInvoices={overdueInvoices}
      recentTransactions={recentTransactions}
      escalation={escalation}
      onRetryPayment={handleRetryPayment}
      onSendReminder={handleSendReminder}
      onNavigate={navigate}
    />
  );
};
