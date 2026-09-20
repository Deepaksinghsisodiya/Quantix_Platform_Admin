import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
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
  FileText,
  Mail,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type {
  RevenueByType,
  RevenueTrend,
  OverdueInvoice,
  RecentTransaction,
  KpiData,
  EscalationStep,
} from './BillingDashboardWrapper';
import {
} from './BillingDashboardWrapper';

// ---------------------------------------------------------------------------
// Chart helpers (pure presentational — no data logic)
// ---------------------------------------------------------------------------

function PieChart({ data, currency }: { data: RevenueByType[]; currency: string | undefined }) {
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
      <path key={item.name} d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={item.color} className="transition-opacity hover:opacity-80" />
    );
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-40 w-40 shrink-0">
        {slices}
        <circle cx="50" cy="50" r="22" className="fill-white dark:fill-gray-900" />
        <text x="50" y="48" textAnchor="middle" className="fill-gray-900 text-[6px] font-bold dark:fill-gray-100">{formatCurrencyOrDash(total, currency)}</text>
        <text x="50" y="56" textAnchor="middle" className="fill-gray-500 text-[4px] dark:fill-gray-400">Total</text>
      </svg>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-gray-100">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <text key={p.month} x={p.x} y={padding.top + chartH + 16} textAnchor="middle" className="fill-gray-500 text-[10px] dark:fill-gray-400">{p.month}</text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// View Props
// ---------------------------------------------------------------------------

interface BillingDashboardViewProps {
  /** 2026-09-05: the deployment currency from the dashboard payload; undefined while loading. */
  currency: string | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  kpiCards: KpiData[];
  revenueByType: RevenueByType[];
  revenueTrend: RevenueTrend[];
  overdueInvoices: OverdueInvoice[];
  recentTransactions: RecentTransaction[];
  escalation: EscalationStep[];
  onRetryPayment: (invoiceId: string) => void;
  onSendReminder: (invoiceId: string) => void;
  onNavigate: (path: string) => void;
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'success' as const;
    case 'Pending': return 'warning' as const;
    case 'Failed': return 'danger' as const;
    default: return 'default' as const;
  }
};

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export const BillingDashboardView: React.FC<BillingDashboardViewProps> = ({
  currency,
  isLoading,
  isError,
  refetch,
  kpiCards,
  revenueByType,
  revenueTrend,
  overdueInvoices,
  recentTransactions,
  escalation,
  onRetryPayment,
  onSendReminder,
  onNavigate,
}) => {
  if (isError) {
    return (
      <div className="space-y-6">
        <ATMPageHeader title="Billing Overview" />
        <ATMCard>
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Failed to load billing dashboard.</p>
            <ATMButton variant="primary" size="sm" onClick={refetch} icon={RefreshCw}>Retry</ATMButton>
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
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
          </div>
        }
        action={{ label: 'View All Invoices', onClick: () => onNavigate('/billing/invoices'), icon: FileText }}
      />

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (<ATMSkeleton key={i} height="120px" />))}
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

            // 2026-08-30: the delta is optional — shown only when the server computed a
            // real month-over-month change (the previous +8.2% / +12.1% / -3.4% / +5.7%
            // were hardcoded). Otherwise fall back to the tile's factual sub-label.
            const description = card.trend
              ? `${card.trend.direction === 'up' ? '+' : '-'}${card.trend.value}% vs last month`
              : card.subLabel;

            return (
              <ATMStatsCard key={card.title} label={card.title} value={card.value} icon={IconClass} variant={variant} description={description} />
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Revenue by Type">
          {isLoading ? <ATMSkeleton height="200px" /> : <PieChart data={revenueByType} currency={currency} />}
        </ATMCard>
        <ATMCard title="Revenue Trend (12 months)">
          {isLoading ? <ATMSkeleton height="200px" /> : <AreaChart data={revenueTrend} />}
        </ATMCard>
      </div>

      {/* 2026-08-13: "Revenue by Merchant Type" and "Billing Cycles" panels REMOVED —
          both rendered invented figures (revenue splits, merchant counts, anniversary /
          annual cycles, pro-rata) with no backing data and describing a billing model this
          platform does not use. Real revenue lives in the KPIs + chart above; the real
          cadence configuration lives on Settings → Billing Cycle. */}

      <div className="grid grid-cols-1 gap-6">
        <ATMCard title="Overdue Escalation Workflow" extra={<ATMBadge label="Enterprise Only" color="danger" />}>
          <div className="space-y-3">
            {escalation.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No invoices are in escalation.</p>
            ) : escalation.map((step) => (
              <div key={step.stage} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
                  step.dayThreshold <= 1 ? 'bg-amber-500' : step.dayThreshold <= 7 ? 'bg-orange-500' : step.dayThreshold <= 14 ? 'bg-red-500' : 'bg-red-700',
                )}>D{step.dayThreshold}</div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.action}</p></div>
                <ATMBadge
                  label={`${step.invoiceCount} invoice${step.invoiceCount === 1 ? '' : 's'}`}
                  color={step.invoiceCount > 0 ? 'warning' : 'gray'}
                />
              </div>
            ))}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Standalone merchants: no recurring billing — expired tokens without renewal trigger outreach flow instead.
            </p>
          </div>
        </ATMCard>
      </div>

      {/* Bottom Row: Overdue + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Overdue Invoices" extra={<ATMButton variant="ghost" size="sm" onClick={() => onNavigate('/billing/invoices')}>View All</ATMButton>}>
          {overdueInvoices.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No overdue invoices.</div>
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
                    <tr key={inv.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer" onClick={() => onNavigate(`/billing/invoices/${inv.id}`)}>{inv.invoiceNumber}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{inv.merchantName}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrencyOrDash(inv.amount, currency)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right"><ATMBadge label={`${inv.daysOverdue}d`} color="danger" /></td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <ATMButton variant="ghost" size="sm" icon={Mail} onClick={(e) => { e.stopPropagation(); onSendReminder(inv.id); }}>Remind</ATMButton>
                          <ATMButton variant="ghost" size="sm" icon={RefreshCw} onClick={(e) => { e.stopPropagation(); onRetryPayment(inv.id); }}>Retry</ATMButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ATMCard>

        <ATMCard title="Recent Transactions" extra={<span className="text-xs text-gray-500 dark:text-gray-400">Last 48 hours</span>}>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No recent transactions.</div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className={cn('flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3', 'dark:border-gray-800', 'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30')}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{txn.merchantName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{txn.type}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(txn.date, 'relative')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrencyOrDash(txn.amount, currency)}</span>
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
};
