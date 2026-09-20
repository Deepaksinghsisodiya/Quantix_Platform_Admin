import React, { useMemo, useState } from 'react';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { useRevenueAnalytics, useRevenueSeries, reportWindow } from '@/lib/hooks/useReports';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import type { RevenueGroupBy } from '../services/reportsApi';
import { ReportExportMenu } from '../components/ReportExportMenu';

/* ---------------------------------------------------------------------------
 * FRS-SAP-702 — Revenue Reports
 *
 * 2026-08-31 (de-fictioned). This page previously made ZERO API calls. Everything
 * on it was a hardcoded literal:
 *   • a $4.48M revenue breakdown (Subscriptions/Token Sales/Commission/Usage),
 *   • a 12-month trend series invented month by month,
 *   • an ARPU table keyed on Basic/Standard/Advance/Premium "tiers" — a concept
 *     purged from the platform in Pass 43 — with invented merchant counts,
 *   • a "Top Revenue Contributors" table of ten invented companies
 *     (Metro Hospitality Group, Coastal Dining Co, …) with invented revenue,
 *   • an Export button wired to a no-op handler.
 * An operator reading this page saw a healthy multi-million-dollar platform
 * regardless of what the database actually held.
 *
 * It now renders GET /reports/revenue-analytics and GET /reports/revenue. Panels
 * the API cannot serve are stated as gaps rather than filled with invention.
 * ------------------------------------------------------------------------- */

type WindowChoice = '30d' | '90d' | '12m';
const WINDOW_DAYS: Record<WindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
const WINDOW_LABEL: Record<WindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

const STREAM_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

function RevenueReportPage() {
  const [windowChoice, setWindowChoice] = useState<WindowChoice>('12m');
  const [groupBy, setGroupBy] = useState<RevenueGroupBy>('month');

  const range = useMemo(() => reportWindow(WINDOW_DAYS[windowChoice]), [windowChoice]);
  const analyticsQuery = useRevenueAnalytics(range);
  const seriesQuery = useRevenueSeries(range, groupBy);

  const analytics = analyticsQuery.data?.data;
  const series = seriesQuery.data?.data;
  // 2026-09-05: the report's own currency, else the deployment's — never a 'USD' guess.
  const { currency: deploymentCurrency } = useDeploymentCurrency();
  const currency = series?.currencyCode || deploymentCurrency;

  const isLoading = analyticsQuery.isLoading || seriesQuery.isLoading;
  const isError = analyticsQuery.isError || seriesQuery.isError;
  const errorMessage =
    (analyticsQuery.error as any)?.data?.message ||
    (seriesQuery.error as any)?.data?.message ||
    'Failed to load the revenue report.';

  // Breakdown by stream — only streams that actually carry money are charted, so an
  // empty slice never implies a stream exists but earned nothing this window.
  const breakdown = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'Subscription recharges', value: analytics.subscriptionRevenue },
      { name: 'Token sales', value: analytics.tokenSalesRevenue },
      { name: 'Commission', value: analytics.commissionRevenue },
      { name: 'Usage deductions', value: analytics.usageRevenue },
    ].filter((s) => s.value > 0);
  }, [analytics]);

  const trend = useMemo(
    () => (series?.lines ?? []).map((l) => ({ label: l.label, amount: l.amount, merchants: l.merchantCount })),
    [series],
  );

  const windows: WindowChoice[] = ['30d', '90d', '12m'];
  const groupings: RevenueGroupBy[] = ['day', 'week', 'month'];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Revenue Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Revenue by stream and over time — {WINDOW_LABEL[windowChoice].toLowerCase()}
          </p>
        </div>
        <ReportExportMenu report="revenue" window={range} groupBy={groupBy} disabled={isLoading || isError} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <ATMButton
            variant="ghost"
            size="sm"
            onClick={() => {
              void analyticsQuery.refetch();
              void seriesQuery.refetch();
            }}
          >
            Retry
          </ATMButton>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
          {windows.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindowChoice(w)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                windowChoice === w
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {WINDOW_LABEL[w]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Group by:</span>
          {groupings.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupBy(g)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
                groupBy === g
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile icon={DollarSign} label="Total Revenue" value={formatCurrencyOrDash(analytics.totalRevenue, currency)} />
          <Tile icon={TrendingUp} label="MRR" value={formatCurrencyOrDash(analytics.mrr, currency)} />
          <Tile icon={BarChart3} label="ARR" value={formatCurrencyOrDash(analytics.arr, currency)} />
          <Tile
            icon={Users}
            label="Token sales"
            value={formatCurrencyOrDash(analytics.tokenSalesRevenue, currency)}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Revenue by Stream">
          {isLoading ? (
            <ATMSkeleton variant="rect" height="280px" />
          ) : breakdown.length === 0 ? (
            <Empty text="No revenue recorded in this window." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {breakdown.map((entry, i) => (
                    <Cell key={entry.name} fill={STREAM_COLORS[i % STREAM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrencyOrDash(Number(v ?? 0), currency)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        <ATMCard title="Average Revenue Per Merchant">
          {isLoading ? (
            <ATMSkeleton variant="rect" height="280px" />
          ) : !analytics ? (
            <Empty text="No revenue data for this window." />
          ) : (
            <div className="space-y-4 py-2">
              {/* 2026-08-31: the API reports ARPU for the two merchant models only. The
                  old per-plan-tier table was invented — and keyed on tiers the platform
                  no longer has. */}
              <ArpuRow
                label="Enterprise"
                value={formatCurrencyOrDash(analytics.enterpriseARPU, currency)}
                tone="text-blue-600 dark:text-blue-400"
              />
              <ArpuRow
                label="Standalone"
                value={formatCurrencyOrDash(analytics.standaloneARPU, currency)}
                tone="text-emerald-600 dark:text-emerald-400"
              />
              <p className="pt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                ARPU is revenue in this window divided by the count of active merchants of
                that model. A per-plan breakdown is not reported by the API.
              </p>
            </div>
          )}
        </ATMCard>
      </div>

      <ATMCard
        title="Revenue Trend"
        action={<span className="text-xs text-gray-500 dark:text-gray-400">by {groupBy}</span>}
      >
        {isLoading ? (
          <ATMSkeleton variant="rect" height="320px" />
        ) : trend.length === 0 ? (
          <Empty text="No revenue events in this window." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(v) => formatCurrencyOrDash(Number(v ?? 0), currency)}
                contentStyle={{
                  backgroundColor: 'var(--color-surface, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Revenue"
                stroke="#6366f1"
                fill="url(#revGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      {/* 2026-08-31: "Top Revenue Contributors" REMOVED. It listed ten invented
          companies with invented revenue figures. The Platform API exposes no
          revenue-per-merchant endpoint, so there is nothing truthful to put here;
          commission per merchant is available on the Commission report. */}
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
    </div>
  );
}

function ArpuRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
      <span className={cn('text-sm font-semibold', tone)}>{label}</span>
      <span className="text-lg font-bold text-gray-900 dark:text-gray-50">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {text}
    </div>
  );
}

export default RevenueReportPage;
