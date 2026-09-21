import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ChartSkeleton } from '@/modules/dashboard/components/charts/ChartSkeleton';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Mail,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import type {
  RevenueByType,
  RevenueTrend,
  OverdueInvoice,
  RecentTransaction,
  KpiData,
  EscalationStep,
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
        <circle cx="50" cy="50" r="22" className="fill-white dark:fill-[#13151a]" />
        <text x="50" y="48" textAnchor="middle" className="fill-slate-900 text-[6px] font-bold dark:fill-slate-100">{formatCurrencyOrDash(total, currency)}</text>
        <text x="50" y="56" textAnchor="middle" className="fill-slate-400 text-[4px] dark:fill-slate-500">Total</text>
      </svg>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
            <span className="ml-auto font-medium text-slate-900 dark:text-slate-100">{item.percent}%</span>
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
  const height = 220;
  const padding = { top: 16, right: 12, bottom: 30, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.revenue - min) / range) * chartH;
    return { x, y, ...d };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1]!.x} ${padding.top + chartH} L ${points[0]!.x} ${padding.top + chartH} Z`;

  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const y = padding.top + (chartH / 4) * i;
    return <line key={i} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="currentColor" strokeDasharray="3 4" />;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full group" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f62fe" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0f62fe" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g className="text-slate-200/70 dark:text-slate-800">{gridLines}</g>
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="#0f62fe" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="3" fill="#0f62fe" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      ))}
      {points.map((p) => (
        <text key={p.month} x={p.x} y={padding.top + chartH + 16} textAnchor="middle" className="fill-slate-400 text-[10px] dark:fill-slate-500">{p.month}</text>
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
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Failed to load billing dashboard.</p>
            <ATMButton variant="primary" size="sm" onClick={refetch} icon={RefreshCw}>Retry</ATMButton>
          </div>
        </ATMCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        icon={FileText}
        iconColor="theme"
        title="Billing Overview"
        subtitle={
          <div className="flex items-center gap-2">
            <span>Revenue, invoices, and collection metrics</span>
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
        <ATMCard title="Revenue by Type" loading={isLoading} skeleton={<div className="flex h-[200px] items-center justify-center animate-pulse"><div className="h-36 w-36 rounded-full bg-surface-100 dark:bg-surface-850" /></div>}>
          {isLoading ? <ATMSkeleton height="200px" /> : <PieChart data={revenueByType} currency={currency} />}
        </ATMCard>
        <ATMCard title="Revenue Trend (12 months)" loading={isLoading} skeleton={<ChartSkeleton height="200px" />}>
          {isLoading ? <ATMSkeleton height="200px" /> : <AreaChart data={revenueTrend} />}
        </ATMCard>
      </div>

      {/* 2026-08-13: "Revenue by Merchant Type" and "Billing Cycles" panels REMOVED —
          both rendered invented figures (revenue splits, merchant counts, anniversary /
          annual cycles, pro-rata) with no backing data and describing a billing model this
          platform does not use. Real revenue lives in the KPIs + chart above; the real
          cadence configuration lives on Settings → Billing Cycle. */}

      <div className="grid grid-cols-1 gap-6">
        <ATMCard title="Overdue Escalation Workflow" extra={<ATMBadge label="Enterprise Only" color="danger" />} loading={isLoading}>
          <div className="space-y-3">
            {escalation.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No invoices are in escalation.</p>
            ) : escalation.map((step) => (
              <div key={step.stage} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm',
                  step.dayThreshold <= 1 ? 'bg-gradient-to-br from-amber-500 to-amber-400' : step.dayThreshold <= 7 ? 'bg-gradient-to-br from-orange-500 to-orange-400' : step.dayThreshold <= 14 ? 'bg-gradient-to-br from-red-500 to-red-400' : 'bg-gradient-to-br from-red-700 to-red-500',
                )}>D{step.dayThreshold}</div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900 dark:text-slate-100">{step.action}</p></div>
                <ATMBadge
                  label={`${step.invoiceCount} invoice${step.invoiceCount === 1 ? '' : 's'}`}
                  color={step.invoiceCount > 0 ? 'warning' : 'gray'}
                />
              </div>
            ))}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standalone merchants: no recurring billing — expired tokens without renewal trigger outreach flow instead.
            </p>
          </div>
        </ATMCard>
      </div>

      {/* Bottom Row: Overdue + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Overdue Invoices" extra={<ATMButton variant="ghost" size="sm" onClick={() => onNavigate('/billing/invoices')}>View All</ATMButton>} loading={isLoading}>
          {overdueInvoices.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No overdue invoices.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Invoice</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Merchant</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Days Overdue</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {overdueInvoices.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer" onClick={() => onNavigate(`/billing/invoices/${inv.id}`)}>{inv.invoiceNumber}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-700 dark:text-slate-300">{inv.merchantName}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-medium text-slate-900 dark:text-slate-100">{formatCurrencyOrDash(inv.amount, currency)}</td>
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

        <ATMCard title="Recent Transactions" extra={<span className="text-xs text-slate-500 dark:text-slate-400">Last 48 hours</span>} loading={isLoading}>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No recent transactions.</div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className={cn('flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3', 'dark:border-slate-800', 'transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40')}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{txn.merchantName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{txn.type}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(txn.date, 'relative')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyOrDash(txn.amount, currency)}</span>
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
