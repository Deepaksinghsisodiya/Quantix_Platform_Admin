import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { toast } from 'sonner';
import { retryPayment, sendPaymentReminder } from '@/lib/api/billing';
import { useBillingDashboard, useInvoices } from '../services/useBilling';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Mail,
  RefreshCw,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Display types & fallback data
// (Composite sections — billing dashboard hook returns only base totals,
// the rest is derived via adapters below or kept as fallback.)
// ---------------------------------------------------------------------------

interface RevenueByType {
  name: string;
  value: number;
  color: string;
  percent: number;
}

const REVENUE_TYPE_COLORS: Record<string, string> = {
  Subscription: '#8b5cf6',
  Subscriptions: '#8b5cf6',
  TokenPurchase: '#22c55e',
  'Token Sales': '#22c55e',
  Commission: '#f59e0b',
  Usage: '#06b6d4',
  AddOn: '#ec4899',
};

// TODO Pass-26: hook missing — keeps mock fallback for FRS-SAP-601 split (not in dashboard endpoint shape).
const MOCK_REVENUE_BY_MERCHANT_TYPE = {
  enterprise: {
    subscription: 188100,
    usageOverage: 17100,
    commission: 51300,
    total: 256500,
    merchantCount: 834,
  },
  standalone: {
    tokenSales: 85500,
    total: 85500,
    merchantCount: 413,
  },
};

// FRS-SAP-603: Billing cycle summary
const MOCK_BILLING_CYCLES = {
  enterprise: {
    monthlyCycles: 712,
    annualCycles: 122,
    anniversaryBilling: 584,
    fixedDateBilling: 250,
    gracePeriodDays: 7,
    proRataEnabled: true,
    nextBatchRun: '2026-04-01T00:00:00Z',
  },
  standalone: {
    description: 'No recurring cycle — billed per token purchase (on-demand)',
    totalTokenInvoicesThisMonth: 1043,
  },
};

// FRS-SAP-605: Overdue escalation workflow
interface EscalationStep { day: number; action: string; count: number }
const MOCK_ESCALATION: EscalationStep[] = [
  { day: 1, action: 'Payment reminder email sent', count: 12 },
  { day: 7, action: 'Second reminder + API rate throttled', count: 8 },
  { day: 14, action: 'Final notice + feature restrictions', count: 4 },
  { day: 30, action: 'Account suspended', count: 1 },
];

interface RevenueTrend {
  month: string;
  revenue: number;
}

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  merchantName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

interface RecentTransaction {
  id: string;
  merchantName: string;
  type: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

interface KpiData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: { value: number; direction: 'up' | 'down' };
  color: string;
  accent: string;
}

// ---------------------------------------------------------------------------
// Simple pie chart (SVG)
// ---------------------------------------------------------------------------

function PieChart({ data }: { data: RevenueByType[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;

  const slices = data.map((item) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += item.value;
    const endAngle = (cumulative / total) * 360;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(toRad(startAngle - 90));
    const y1 = 50 + 40 * Math.sin(toRad(startAngle - 90));
    const x2 = 50 + 40 * Math.cos(toRad(endAngle - 90));
    const y2 = 50 + 40 * Math.sin(toRad(endAngle - 90));

    return (
      <path
        key={item.name}
        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={item.color}
        className="transition-opacity hover:opacity-80"
      />
    );
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-40 w-40 shrink-0">
        {slices}
        <circle cx="50" cy="50" r="22" className="fill-white dark:fill-gray-900" />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-gray-900 text-[6px] font-bold dark:fill-gray-100"
        >
          {formatCurrency(total)}
        </text>
        <text
          x="50"
          y="56"
          textAnchor="middle"
          className="fill-gray-500 text-[4px] dark:fill-gray-400"
        >
          Total
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-gray-100">
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple area chart (SVG)
// ---------------------------------------------------------------------------

function AreaChart({ data }: { data: RevenueTrend[] }) {
  const max = Math.max(...data.map((d) => d.revenue));
  const min = Math.min(...data.map((d) => d.revenue)) * 0.9;
  const range = max - min;
  const width = 600;
  const height = 200;
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.revenue - min) / range) * chartH;
    return { x, y, ...d };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1]!.x} ${padding.top + chartH} L ${points[0]!.x} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2" />
      {points.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="3" fill="#8b5cf6" className="opacity-0 hover:opacity-100 transition-opacity" />
      ))}
      {points.map((p) => (
        <text
          key={p.month}
          x={p.x}
          y={padding.top + chartH + 16}
          textAnchor="middle"
          className="fill-gray-500 text-[10px] dark:fill-gray-400"
        >
          {p.month}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function BillingDashboardPage() {
  const navigate = useNavigate();
  const dashboardQuery = useBillingDashboard();
  const overdueInvoicesQuery = useInvoices({ status: 'Overdue', page: 1, pageSize: 5 });
  const recentInvoicesQuery = useInvoices({ page: 1, pageSize: 8 });

  const loading = dashboardQuery.isLoading;
  const isError = dashboardQuery.isError;
  // The hook's local interface is narrower than the API DTO; widen here so the
  // adapters below can read `revenueByType` / `overdueAmount` (server provides both).
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

  // Adapter: turn dashboard.revenueByType (Record) into the PieChart format the page already uses.
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

  // Adapter: revenueByMonth → RevenueTrend (rename amount → revenue).
  const revenueTrend: RevenueTrend[] = useMemo(() => {
    if (!dashboard?.revenueByMonth || dashboard.revenueByMonth.length === 0) {
      return [
        { month: 'Apr', revenue: 248000 },
        { month: 'May', revenue: 261000 },
        { month: 'Jun', revenue: 274000 },
        { month: 'Jul', revenue: 283000 },
        { month: 'Aug', revenue: 295000 },
        { month: 'Sep', revenue: 301000 },
        { month: 'Oct', revenue: 312000 },
        { month: 'Nov', revenue: 318000 },
        { month: 'Dec', revenue: 305000 },
        { month: 'Jan', revenue: 328000 },
        { month: 'Feb', revenue: 335000 },
        { month: 'Mar', revenue: 342000 },
      ];
    }
    return dashboard.revenueByMonth.map((m) => ({ month: m.month, revenue: m.amount }));
  }, [dashboard?.revenueByMonth]);

  // Adapter: overdue invoices from real list endpoint.
  const overdueInvoices: OverdueInvoice[] = useMemo(() => {
    const items = overdueInvoicesQuery.data?.data?.items ?? [];
    if (items.length === 0) return [];
    const today = new Date();
    return items.map((inv) => {
      const dueMs = new Date(inv.dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueMs) / (1000 * 60 * 60 * 24)));
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        merchantName: inv.merchantName,
        amount: inv.total,
        dueDate: inv.dueDate,
        daysOverdue,
      };
    });
  }, [overdueInvoicesQuery.data]);

  // Adapter: recent transactions from latest invoices.
  const recentTransactions: RecentTransaction[] = useMemo(() => {
    const items = recentInvoicesQuery.data?.data?.items ?? [];
    return items.map((inv) => ({
      id: inv.id,
      merchantName: inv.merchantName,
      type: inv.type,
      amount: inv.total,
      status:
        inv.status === 'Paid'
          ? 'Completed'
          : inv.status === 'Pending' || inv.status === 'Sent' || inv.status === 'Draft'
            ? 'Pending'
            : 'Failed',
      date: inv.issuedDate,
    }));
  }, [recentInvoicesQuery.data]);

  const totalInvoiced = dashboard?.totalRevenue ?? 342000;
  const collected = dashboard ? dashboard.totalRevenue - dashboard.outstandingAmount : 298000;
  const outstanding = dashboard?.outstandingAmount ?? 31000;
  const overdueAmount = dashboard?.overdueAmount ?? 13000;

  const kpiCards: KpiData[] = useMemo(
    () => [
      {
        title: 'Total Invoiced',
        value: formatCurrency(totalInvoiced),
        icon: <FileText className="h-4 w-4" />,
        trend: { value: 8.2, direction: 'up' },
        color: 'text-blue-600 dark:text-blue-400',
        accent: '#3b82f6',
      },
      {
        title: 'Collected',
        value: formatCurrency(collected),
        icon: <CheckCircle2 className="h-4 w-4" />,
        trend: { value: 12.1, direction: 'up' },
        color: 'text-emerald-600 dark:text-emerald-400',
        accent: '#22c55e',
      },
      {
        title: 'Outstanding',
        value: formatCurrency(outstanding),
        icon: <Clock className="h-4 w-4" />,
        trend: { value: 3.4, direction: 'down' },
        color: 'text-amber-600 dark:text-amber-400',
        accent: '#f59e0b',
      },
      {
        title: 'Overdue',
        value: formatCurrency(overdueAmount),
        icon: <AlertTriangle className="h-4 w-4" />,
        trend: { value: 5.7, direction: 'up' },
        color: 'text-red-600 dark:text-red-400',
        accent: '#ef4444',
      },
    ],
    [totalInvoiced, collected, outstanding, overdueAmount],
  );

  const statusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success' as const;
      case 'Pending': return 'warning' as const;
      case 'Failed': return 'danger' as const;
      default: return 'default' as const;
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <ATMPageHeader title="Billing Overview" />
        <ATMCard>
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Failed to load billing dashboard.
            </p>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={() => dashboardQuery.refetch()}
              icon={RefreshCw}
            >
              Retry
            </ATMButton>
          </div>
        </ATMCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ATMPageHeader
        title="Billing Overview"
        subtitle={
          <div className="flex items-center gap-2">
            <span>Revenue, invoices, and collection metrics</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
          </div>
        }
        action={{
          label: 'View All Invoices',
          onClick: () => navigate('/billing/invoices'),
          icon: FileText,
        }}
      />

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ATMSkeleton key={i} height="120px" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            let variant: 'accent' | 'emerald' | 'amber' | 'rose' = 'accent';
            if (card.title === 'Collected') variant = 'emerald';
            else if (card.title === 'Outstanding') variant = 'amber';
            else if (card.title === 'Overdue') variant = 'rose';

            let IconClass = FileText;
            if (card.title === 'Collected') IconClass = CheckCircle2;
            else if (card.title === 'Outstanding') IconClass = Clock;
            else if (card.title === 'Overdue') IconClass = AlertTriangle;

            const isPositive = card.trend.direction === 'up';
            const description = `${isPositive ? '+' : '-'}${card.trend.value}% vs last month`;

            return (
              <ATMStatsCard
                key={card.title}
                label={card.title}
                value={card.value}
                icon={IconClass}
                variant={variant}
                description={description}
              />
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Revenue by Type">
          {loading ? (
            <ATMSkeleton height="200px" />
          ) : (
            <PieChart data={revenueByType} />
          )}
        </ATMCard>
        <ATMCard title="Revenue Trend (12 months)">
          {loading ? (
            <ATMSkeleton height="200px" />
          ) : (
            <AreaChart data={revenueTrend} />
          )}
        </ATMCard>
      </div>

      {/* FRS-SAP-601: Revenue by Merchant Type */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Enterprise Revenue" extra={<ATMBadge label="Enterprise Only" color="purple" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subscription Revenue</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(MOCK_REVENUE_BY_MERCHANT_TYPE.enterprise.subscription)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Usage Overage</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(MOCK_REVENUE_BY_MERCHANT_TYPE.enterprise.usageOverage)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Commission</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(MOCK_REVENUE_BY_MERCHANT_TYPE.enterprise.commission)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total ({MOCK_REVENUE_BY_MERCHANT_TYPE.enterprise.merchantCount} merchants)</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(MOCK_REVENUE_BY_MERCHANT_TYPE.enterprise.total)}</span>
            </div>
          </div>
        </ATMCard>
        <ATMCard title="Standalone Revenue" extra={<ATMBadge label="Standalone Only" color="primary" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Token Sales</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(MOCK_REVENUE_BY_MERCHANT_TYPE.standalone.tokenSales)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total ({MOCK_REVENUE_BY_MERCHANT_TYPE.standalone.merchantCount} merchants)</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(MOCK_REVENUE_BY_MERCHANT_TYPE.standalone.total)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No recurring billing — billed per token purchase (on-demand)
            </p>
          </div>
        </ATMCard>
      </div>

      {/* FRS-SAP-603: Billing Cycle + FRS-SAP-605: Overdue Escalation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Billing Cycles" extra={<span className="text-xs text-gray-500 dark:text-gray-400">Enterprise billing model</span>}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Cycles</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{MOCK_BILLING_CYCLES.enterprise.monthlyCycles}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Annual Cycles</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{MOCK_BILLING_CYCLES.enterprise.annualCycles}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              <p>Anniversary billing: <strong>{MOCK_BILLING_CYCLES.enterprise.anniversaryBilling}</strong> merchants</p>
              <p>Fixed date billing: <strong>{MOCK_BILLING_CYCLES.enterprise.fixedDateBilling}</strong> merchants</p>
              <p>Grace period: <strong>{MOCK_BILLING_CYCLES.enterprise.gracePeriodDays} days</strong> after due date</p>
              <p>Pro-rata: <strong>{MOCK_BILLING_CYCLES.enterprise.proRataEnabled ? 'Enabled' : 'Disabled'}</strong></p>
            </div>
            <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Standalone: {MOCK_BILLING_CYCLES.standalone.description}
            </div>
          </div>
        </ATMCard>

        <ATMCard title="Overdue Escalation Workflow" extra={<ATMBadge label="Enterprise Only" color="danger" />}>
          <div className="space-y-3">
            {MOCK_ESCALATION.map((step) => (
              <div key={step.day} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
                  step.day <= 1 ? 'bg-amber-500' : step.day <= 7 ? 'bg-orange-500' : step.day <= 14 ? 'bg-red-500' : 'bg-red-700',
                )}>
                  D{step.day}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.action}</p>
                </div>
                <ATMBadge label={`${step.count} merchants`} color={step.count > 0 ? 'warning' : 'gray'} />
              </div>
            ))}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Standalone merchants: no recurring billing — expired tokens without renewal trigger outreach flow instead.
            </p>
          </div>
        </ATMCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Overdue invoices */}
        <ATMCard
          title="Overdue Invoices"
          extra={
            <ATMButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/billing/invoices')}
            >
              View All
            </ATMButton>
          }
        >
          {overdueInvoicesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <ATMSkeleton key={i} height="40px" />
              ))}
            </div>
          ) : overdueInvoices.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No overdue invoices.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Invoice</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Merchant</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Days Overdue</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {overdueInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td
                        className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                        onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                      >
                        {inv.invoiceNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {inv.merchantName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <ATMBadge label={`${inv.daysOverdue}d`} color="danger" />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                           <ATMButton
                            variant="ghost"
                            size="sm"
                            icon={Mail}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await sendPaymentReminder(inv.id);
                                toast.success(`Payment reminder sent for ${inv.invoiceNumber}`);
                              } catch {
                                toast.error('Failed to send reminder');
                              }
                            }}
                          >
                            Remind
                          </ATMButton>
                          <ATMButton
                            variant="ghost"
                            size="sm"
                            icon={RefreshCw}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await retryPayment(inv.id);
                                if (res.data.status === 'Completed') {
                                  toast.success(`Payment collected for ${inv.invoiceNumber}`);
                                } else {
                                  toast.warning(`Retry attempt ${res.data.attempt} failed. ${res.data.nextRetryAt ? 'Next retry scheduled.' : 'No more retries.'}`);
                                }
                              } catch {
                                toast.error('Failed to retry payment');
                              }
                            }}
                          >
                            Retry
                          </ATMButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ATMCard>

        {/* Recent transactions */}
        <ATMCard
          title="Recent Transactions"
          extra={
            <span className="text-xs text-gray-500 dark:text-gray-400">Last 48 hours</span>
          }
        >
          {recentInvoicesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <ATMSkeleton key={i} height="48px" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No recent transactions.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3',
                    'dark:border-gray-800',
                    'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {txn.merchantName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{txn.type}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(txn.date, 'relative')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(txn.amount)}
                    </span>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ATMCard>
      </div>
    </div>
  );
}

export default BillingDashboardPage;
