import React, { useMemo } from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { ChartSkeleton } from '@/modules/dashboard/components/charts/ChartSkeleton';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { useCommissionDashboard } from '@/lib/hooks/useCommission';
import {
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  Trophy,
  RefreshCw,
  Percent,
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

// ---------------------------------------------------------------------------
// Simple bar chart (SVG) — primary brand colors
// ---------------------------------------------------------------------------

function BarChart({ data }: { data: CommissionTrend[] }) {
  const max = Math.max(...data.map((d) => d.commission));
  const width = 600;
  const height = 200;
  const barWidth = (width - 40) / data.length - 4;
  const chartH = height - 32;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="commissionBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f62fe" />
          <stop offset="100%" stopColor="#6f8aff" />
        </linearGradient>
      </defs>
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
              rx={4}
              fill="url(#commissionBarGrad)"
              className="opacity-90 transition-opacity hover:opacity-100"
            />
            <text
              x={x + barWidth / 2}
              y={chartH + 18}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] dark:fill-slate-500"
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
  const angle = Math.min(100, Math.max(0, value)) / 100 * 180;
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
          className="text-slate-200 dark:text-slate-800"
        />
        <path
          d={`M 15 50 A 35 35 0 ${angle > 90 ? 1 : 0} 1 ${x} ${50 - (50 - y)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-primary-500 dark:text-primary-400"
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-slate-900 text-[14px] font-bold dark:fill-slate-100"
        >
          {value.toFixed(2)}%
        </text>
      </svg>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function CommissionDashboardPage() {
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

  const averageRate = summary?.averageRate ?? 0;
  const totalCommission = topMerchants.reduce((s, m) => s + m.commission, 0);

  const columns: ATMTableColumn<TopMerchant>[] = useMemo(
    () => [
      {
        key: 'rank',
        header: '#',
        width: '56px',
        renderCell: (_v, row) => (
          <span className="text-slate-400 dark:text-slate-500 font-semibold">
            {topMerchants.findIndex((m) => m.id === row.id) + 1}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'Merchant',
        renderCell: (_v, row) => {
          const isTop = topMerchants[0]?.id === row.id;
          return (
            <span className="inline-flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
              {row.name}
              {isTop && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
            </span>
          );
        },
      },
      {
        key: 'commission',
        header: 'Commission',
        align: 'right',
        renderCell: (_v, row) => (
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {formatCurrencyOrDash(row.commission, currency)}
          </span>
        ),
      },
      {
        key: 'transactions',
        header: 'Transactions',
        align: 'right',
        renderCell: (_v, row) => (
          <span className="text-slate-700 dark:text-slate-300">{row.transactions.toLocaleString()}</span>
        ),
      },
      {
        key: 'rate',
        header: 'Rate',
        align: 'right',
        renderCell: (_v, row) => (
          <span className="text-slate-700 dark:text-slate-300">{row.rate.toFixed(2)}%</span>
        ),
      },
      {
        key: 'share',
        header: 'Share',
        width: '200px',
        renderCell: (_v, row) => {
          const share = totalCommission > 0 ? (row.commission / totalCommission) * 100 : 0;
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                  style={{ width: `${Math.min(share, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {share.toFixed(1)}%
              </span>
            </div>
          );
        },
      },
    ],
    [currency, topMerchants, totalCommission],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        icon={Percent}
        iconColor="theme"
        title="Commission Overview"
        subtitle="Transaction commission tracking and settlement"
        action={{ label: 'Refresh', onClick: () => refetch(), icon: RefreshCw }}
      />

      {/* Error banner */}
      {isError && !loading && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Failed to load commission dashboard
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
          <ATMStatsCard
            label="Total Commission (This Month)"
            value={formatCurrencyOrDash(summary?.totalCommission ?? 0, currency)}
            icon={DollarSign}
            variant="indigo"
            description={`${summary?.totalTransactions ?? 0} transactions this period`}
          />
          <ATMStatsCard
            label="Total Transactions"
            value={(summary?.totalTransactions ?? 0).toLocaleString()}
            icon={Clock}
            variant="amber"
            description="Across all merchants"
          />
          <ATMStatsCard
            label="Average Rate"
            value={`${averageRate.toFixed(2)}%`}
            icon={TrendingUp}
            variant="emerald"
            description="Weighted commission rate"
          />
          <ATMStatsCard
            label="Top Merchant"
            value={
              <span className="block max-w-full truncate normal-case">{topMerchants[0]?.name ?? '—'}</span>
            }
            icon={Trophy}
            variant="purple"
            description={`${formatCurrencyOrDash(topMerchants[0]?.commission ?? 0, currency)} this period`}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ATMCard title="Commission Trend (12 months)" loading={loading} skeleton={<ChartSkeleton height="200px" />}>
            {loading ? (
              <ATMSkeleton variant="rect" height="200px" />
            ) : (
              <BarChart data={commissionTrend} />
            )}
          </ATMCard>
        </div>
        <ATMCard title="Commission as % of Revenue" extra={<ATMBadge label="Real Rate" color="primary" />} loading={loading} skeleton={<div className="flex flex-col items-center justify-center py-4 animate-pulse"><div className="h-36 w-36 rounded-full bg-surface-100 dark:bg-surface-850" /><div className="mt-4 h-3 w-40 rounded-md bg-surface-100 dark:bg-surface-850" /></div>}>
          {loading ? (
            <ATMSkeleton variant="rect" height="200px" />
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <GaugeIndicator value={averageRate} label="Commission / Total Revenue" />
              <div className="mt-4 space-y-1 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total top-10 commission: {formatCurrencyOrDash(totalCommission, currency)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Avg effective rate: {averageRate.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </ATMCard>
      </div>

      {/* Top Merchants */}
      <ATMCard title="Top 10 Merchants by Commission" padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-5">
            <ATMSkeleton variant="table-row" count={10} />
          </div>
        ) : (
          <ATMTable
            columns={columns}
            data={topMerchants}
            emptyMessage="No merchant commission data yet."
          />
        )}
      </ATMCard>
    </div>
  );
}

export default CommissionDashboardPage;