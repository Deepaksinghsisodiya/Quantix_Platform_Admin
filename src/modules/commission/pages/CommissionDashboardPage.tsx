import React, { useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { useCommissionDashboard, useCommissionExemptions } from '@/lib/hooks/useCommission';
import {
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Local UI shapes (adapted from CommissionSummary)
// ---------------------------------------------------------------------------

interface CommissionTrend {
  month: string;
  commission: number;
}

interface TopMerchant {
  id: string;
  name: string;
  commission: number;
  transactions: number;
  rate: number;
}

// TODO Pass-26: hook missing — no monthly trend endpoint; keeps mock fallback
const MOCK_COMMISSION_TREND: CommissionTrend[] = [
  { month: 'Apr', commission: 28400 },
  { month: 'May', commission: 30200 },
  { month: 'Jun', commission: 31800 },
  { month: 'Jul', commission: 33500 },
  { month: 'Aug', commission: 35100 },
  { month: 'Sep', commission: 34200 },
  { month: 'Oct', commission: 37400 },
  { month: 'Nov', commission: 38900 },
  { month: 'Dec', commission: 36100 },
  { month: 'Jan', commission: 39800 },
  { month: 'Feb', commission: 41200 },
  { month: 'Mar', commission: 42000 },
];

// ---------------------------------------------------------------------------
// KPI data
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
// Simple bar chart (SVG)
// ---------------------------------------------------------------------------

function BarChart({ data }: { data: CommissionTrend[] }) {
  const max = Math.max(...data.map((d) => d.commission));
  const width = 600;
  const height = 200;
  const barWidth = (width - 40) / data.length - 4;
  const chartH = height - 30;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const barH = (d.commission / max) * (chartH - 10);
        const x = 20 + i * ((width - 40) / data.length) + 2;
        const y = chartH - barH;
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={3}
              className="fill-indigo-500 transition-opacity hover:fill-indigo-400"
            />
            <text
              x={x + barWidth / 2}
              y={chartH + 16}
              textAnchor="middle"
              className="fill-gray-500 text-[10px] dark:fill-gray-400"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Gauge indicator
// ---------------------------------------------------------------------------

function GaugeIndicator({ value, label }: { value: number; label: string }) {
  const angle = (value / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const x = 50 + 35 * Math.cos(Math.PI - rad);
  const y = 50 - 35 * Math.sin(Math.PI - rad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 60" className="h-32 w-48">
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-gray-200 dark:text-gray-700"
        />
        <path
          d={`M 15 50 A 35 35 0 ${angle > 90 ? 1 : 0} 1 ${x} ${50 - (50 - y)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-indigo-500"
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-gray-900 text-[14px] font-bold dark:fill-gray-100"
        >
          {value}%
        </text>
      </svg>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function CommissionDashboardPage() {
  const { data, isLoading: loading, isError, refetch } = useCommissionDashboard();
  const { data: exemptionsData } = useCommissionExemptions();
  const summary = data?.data;

  /** Adapter: byMerchant -> top-10 merchants ranked by commissionAmount. */
  const topMerchants: TopMerchant[] = useMemo(() => {
    const list = summary?.byMerchant ?? [];
    return [...list]
      .sort((a, b) => b.commissionAmount - a.commissionAmount)
      .slice(0, 10)
      .map((t) => ({
        id: t.merchantId,
        name: t.merchantName,
        commission: t.commissionAmount,
        transactions: t.transactionCount,
        rate: t.effectiveRate,
      }));
  }, [summary]);

  const topMerchantName = topMerchants[0]?.name ?? '--';
  const topMerchantCommission = topMerchants[0]?.commission ?? 0;

  const kpiCards: KpiData[] = useMemo(
    () => [
      {
        title: 'Total Commission (This Month)',
        value: formatCurrency(summary?.totalCommission ?? 0),
        icon: <DollarSign className="h-4 w-4" />,
        trend: { value: 5.3, direction: 'up' },
        color: 'text-indigo-600 dark:text-indigo-400',
        accent: '#6366f1',
      },
      {
        title: 'Total Transactions',
        value: (summary?.totalTransactions ?? 0).toLocaleString(),
        icon: <Clock className="h-4 w-4" />,
        trend: { value: 2.1, direction: 'down' },
        color: 'text-amber-600 dark:text-amber-400',
        accent: '#f59e0b',
      },
      {
        title: 'Average Rate',
        value: `${(summary?.averageRate ?? 0).toFixed(2)}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        trend: { value: 0.1, direction: 'up' },
        color: 'text-emerald-600 dark:text-emerald-400',
        accent: '#22c55e',
      },
      {
        title: 'Top Merchant',
        value: topMerchantName,
        icon: <Trophy className="h-4 w-4" />,
        trend: { value: 12.4, direction: 'up' },
        color: 'text-violet-600 dark:text-violet-400',
        accent: '#8b5cf6',
      },
    ],
    [summary, topMerchantName],
  );

  const totalCommission = topMerchants.reduce((s, m) => s + m.commission, 0);
  const exemptions = exemptionsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Commission Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Transaction commission tracking and settlement
        </p>
      </div>

      {/* Error banner */}
      {isError && !loading && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Failed to load commission dashboard
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please try again.
              </p>
            </div>
          </div>
          <ATMButton variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ATMSkeleton key={i} variant="card" height="120px" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            const isPositive = card.trend.direction === 'up';
            return (
              <div
                key={card.title}
                className={cn(
                  'relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5',
                  'dark:border-gray-700 dark:bg-gray-900',
                  'transition-shadow duration-200 hover:shadow-md dark:hover:shadow-gray-800/40',
                )}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                  style={{ backgroundColor: card.accent }}
                />
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className={cn('flex items-center gap-2 text-xs font-medium uppercase tracking-wider', card.color)}>
                      {card.icon}
                      {card.title}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                      {card.value}
                    </p>
                    {card.title === 'Top Merchant' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(topMerchantCommission)} this period
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                      isPositive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {card.trend.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ATMCard title="Commission Trend (12 months)">
            {loading ? (
              <ATMSkeleton variant="rect" height="200px" />
            ) : (
              <BarChart data={MOCK_COMMISSION_TREND} />
            )}
          </ATMCard>
        </div>
        <ATMCard title="Commission as % of Revenue">
          {loading ? (
            <ATMSkeleton variant="rect" height="200px" />
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <GaugeIndicator value={15} label="Commission / Total Revenue" />
              <div className="mt-4 space-y-2 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total commission: {formatCurrency(totalCommission)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  vs Revenue: {formatCurrency(totalCommission / 0.15)}
                </p>
              </div>
            </div>
          )}
        </ATMCard>
      </div>

      {/* Top Merchants */}
      <ATMCard title="Top 10 Merchants by Commission">
        {loading ? (
          <ATMSkeleton variant="table-row" count={10} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Merchant</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Commission</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Transactions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topMerchants.map((merchant, idx) => {
                  const share = (merchant.commission / totalCommission) * 100;
                  return (
                    <tr key={merchant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {merchant.name}
                        {idx === 0 && <Trophy className="ml-1.5 inline h-3.5 w-3.5 text-amber-500" />}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(merchant.commission)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                        {merchant.transactions.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                        {merchant.rate}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-indigo-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {share.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>
      {/* FRS-SAP-1501: Commission by Plan + FRS-SAP-1508: Exemptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Commission by Plan">
          <div className="space-y-3">
            {[
              { plan: 'Starter', rate: 3.0, merchants: 312, commission: 9800 },
              { plan: 'Professional', rate: 2.5, merchants: 428, commission: 18200 },
              { plan: 'Business', rate: 2.0, merchants: 356, commission: 11400 },
              { plan: 'Enterprise', rate: 1.5, merchants: 151, commission: 2600 },
            ].map((row) => (
              <div key={row.plan} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.plan}</span>
                  <span className="ml-2 text-xs text-gray-500">({row.merchants} merchants · {row.rate}%)</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(row.commission)}</span>
              </div>
            ))}
          </div>
        </ATMCard>

        <ATMCard title="Commission Exemptions" action={<ATMBadge variant="info" size="sm">{exemptions.length} active</ATMBadge>}>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Merchants exempt from commission charges (zero commission recorded for audit).
          </p>
          <div className="space-y-2">
            {exemptions.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                No active exemptions.
              </p>
            ) : (
              exemptions.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ex.merchantName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ex.reason}</p>
                  </div>
                  <span className="text-xs text-gray-400">{ex.endDate ? `Until ${ex.endDate}` : 'No end date'}</span>
                </div>
              ))
            )}
          </div>
        </ATMCard>
      </div>
    </div>
  );
}

export default CommissionDashboardPage;
