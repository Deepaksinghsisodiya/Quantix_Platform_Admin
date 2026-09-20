import React, { useMemo } from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { useCommissionDashboard } from '@/lib/hooks/useCommission';
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

// 2026-08-13: MOCK_COMMISSION_TREND removed. The stale TODO above it claimed "no monthly
// trend endpoint" — CommissionDashboardDto.Trend has always carried real per-period
// commission, the page just never read it.

// ---------------------------------------------------------------------------
// KPI data
// ---------------------------------------------------------------------------

interface KpiData {
  title: string;
  value: string;
  icon: React.ReactNode;
  /** 2026-08-13: optional — fabricated deltas removed; only set when real. */
  trend?: { value: number; direction: 'up' | 'down' };
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
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();
  const { data, isLoading: loading, isError, refetch } = useCommissionDashboard();
  const summary = data?.data;
  // Real trend from the dashboard endpoint (PeriodStart + CommissionAmount).
  const commissionTrend: CommissionTrend[] = useMemo(
    () => ((summary as any)?.trend ?? []).map((x: any) => ({
      month: new Date(x.periodStart).toLocaleDateString(undefined, { month: 'short' }),
      commission: x.commissionAmount ?? 0,
    })),
    [summary],
  );

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
        value: formatCurrencyOrDash(summary?.totalCommission ?? 0, currency),
        icon: <DollarSign className="h-4 w-4" />,
        color: 'text-indigo-600 dark:text-indigo-400',
        accent: '#6366f1',
      },
      {
        title: 'Total Transactions',
        value: (summary?.totalTransactions ?? 0).toLocaleString(),
        icon: <Clock className="h-4 w-4" />,
        color: 'text-amber-600 dark:text-amber-400',
        accent: '#f59e0b',
      },
      {
        title: 'Average Rate',
        value: `${(summary?.averageRate ?? 0).toFixed(2)}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        accent: '#22c55e',
      },
      {
        title: 'Top Merchant',
        value: topMerchantName,
        icon: <Trophy className="h-4 w-4" />,
        color: 'text-violet-600 dark:text-violet-400',
        accent: '#8b5cf6',
      },
    ],
    [summary, topMerchantName],
  );

  const totalCommission = topMerchants.reduce((s, m) => s + m.commission, 0);

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
            const isPositive = card.trend?.direction === 'up';
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
                        {formatCurrencyOrDash(topMerchantCommission, currency)} this period
                      </p>
                    )}
                  </div>
                  {/* 2026-08-13: only rendered when a REAL delta exists — the previous
                      hardcoded percentages (+5.3%, -2.1%, …) were fabricated. */}
                  {card.trend && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                      )}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {card.trend.value}%
                    </span>
                  )}
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
              <BarChart data={commissionTrend} />
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
                  Total commission: {formatCurrencyOrDash(totalCommission, currency)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  vs Revenue: {formatCurrencyOrDash(totalCommission / 0.15, currency)}
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
                        {formatCurrencyOrDash(merchant.commission, currency)}
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
      {/* 2026-09-08: two panels REMOVED. "Commission by Plan" was a hardcoded array
          (Starter 312 merchants / 9,800 ... Enterprise 151 / 2,600) that never read the API;
          "Commission Exemptions" called GET /commission/exemptions, a route that has never
          existed (404 on every open). Commission by rate is the real breakdown, above. */}
    </div>
  );
}

export default CommissionDashboardPage;
