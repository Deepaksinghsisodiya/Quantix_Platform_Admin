import React, { useMemo, useState } from 'react';
import { ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { ChartSkeleton } from '../../dashboard/components/charts/ChartSkeleton';
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
import { DollarSign, TrendingUp, BarChart3, Users } from 'lucide-react';
import { useRevenueAnalytics, useRevenueSeries, reportWindow } from '@/lib/hooks/useReports';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import type { RevenueGroupBy } from '../services/reportsApi';
import { ReportExportMenu } from '../components/ReportExportMenu';
import {
  ReportWindowTabs,
  ReportSegmented,
  ReportError,
  ReportEmpty,
  ReportKpis,
  WINDOW_DAYS,
  WINDOW_LABEL,
  type ReportWindowChoice,
} from '../components/ReportToolbar';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';

/* ---------------------------------------------------------------------------
 * FRS-SAP-702 — Revenue Reports
 *
 * 2026-08-31 (de-fictioned). This page previously made ZERO API calls. Everything
 * on it was a hardcoded literal (see the removed narrative block). It now renders
 * GET /reports/revenue-analytics and GET /reports/revenue. Panels the API cannot
 * serve are stated as gaps rather than filled with invention.
 * ------------------------------------------------------------------------- */

const STREAM_COLORS = ['#0f62fe', '#10b981', '#f59e0b', '#ec4899'];

const CHART_GRID = 'var(--zen-border)';
const CHART_TICK = '#94a3b8';

function RevenueReportPage() {
  const [windowChoice, setWindowChoice] = useState<ReportWindowChoice>('12m');
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

  const groupings: { value: RevenueGroupBy; label: string }[] = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--zen-card, #fff)',
    border: '1px solid var(--zen-border)',
    borderRadius: '0.75rem',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={DollarSign}
        iconColor="theme"
        title="Revenue Report"
        subtitle={`Revenue by stream and over time — ${WINDOW_LABEL[windowChoice].toLowerCase()}`}
        extraActions={
          <ReportExportMenu report="revenue" window={range} groupBy={groupBy} disabled={isLoading || isError} />
        }
      />

      {isError && (
        <ReportError
          message={errorMessage}
          onRetry={() => {
            void analyticsQuery.refetch();
            void seriesQuery.refetch();
          }}
        />
      )}

      {/* Filters — window + series grain */}
      <div className="flex flex-wrap items-center gap-3">
        <ReportWindowTabs value={windowChoice} onChange={setWindowChoice} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Group by
          </span>
          <ReportSegmented options={groupings} value={groupBy} onChange={setGroupBy} />
        </div>
      </div>

      {/* Headline numbers */}
      {isLoading ? (
        <ReportKpis>
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
        </ReportKpis>
      ) : analytics ? (
        <ReportKpis>
          <ATMStatsCard
            label="Total Revenue"
            value={formatCurrencyOrDash(analytics.totalRevenue, currency)}
            icon={DollarSign}
            variant="accent"
            description="All streams, this window"
          />
          <ATMStatsCard
            label="MRR"
            value={formatCurrencyOrDash(analytics.mrr, currency)}
            icon={TrendingUp}
            variant="emerald"
            description="Monthly recurring revenue"
          />
          <ATMStatsCard
            label="ARR"
            value={formatCurrencyOrDash(analytics.arr, currency)}
            icon={BarChart3}
            variant="purple"
            description="Annualised recurring revenue"
          />
          <ATMStatsCard
            label="Token Sales"
            value={formatCurrencyOrDash(analytics.tokenSalesRevenue, currency)}
            icon={Users}
            variant="indigo"
            description="Token purchase revenue"
          />
        </ReportKpis>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Revenue by Stream" loading={isLoading} skeleton={<div className="flex h-[280px] items-center justify-center animate-pulse"><div className="h-48 w-48 rounded-full bg-surface-100 dark:bg-surface-850" /></div>}>
          {isLoading ? (
            <ATMSkeleton variant="rect" height="280px" />
          ) : breakdown.length === 0 ? (
            <ReportEmpty text="No revenue recorded in this window." className="h-[280px]" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2} strokeWidth={0}>
                  {breakdown.map((entry, i) => (
                    <Cell key={entry.name} fill={STREAM_COLORS[i % STREAM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrencyOrDash(Number(v ?? 0), currency)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        <ATMCard title="Average Revenue Per Merchant" loading={isLoading} skeleton={<div className="flex h-[280px] flex-col justify-center gap-5"><ATMSkeleton height="120px" className="rounded-xl" /><ATMSkeleton height="100px" className="rounded-xl" /></div>}>
          {isLoading ? (
            <ATMSkeleton variant="rect" height="280px" />
          ) : !analytics ? (
            <ReportEmpty text="No revenue data for this window." className="h-[280px]" />
          ) : (
            <div className="flex h-[280px] flex-col justify-center gap-5">
              {/* 2026-08-31: the API reports ARPU for the two merchant models only. The
                  old per-plan-tier table was invented — and keyed on tiers the platform
                  no longer has. */}
              <ArpuRow
                label="Enterprise"
                value={formatCurrencyOrDash(analytics.enterpriseARPU, currency)}
                tone="text-primary-600 dark:text-primary-400"
                hint="Active Enterprise merchants"
              />
              <ArpuRow
                label="Standalone"
                value={formatCurrencyOrDash(analytics.standaloneARPU, currency)}
                tone="text-emerald-600 dark:text-emerald-400"
                hint="Active Standalone merchants"
              />
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                ARPU is revenue in this window divided by the count of active merchants of
                that model. A per-plan breakdown is not reported by the API.
              </p>
            </div>
          )}
        </ATMCard>
      </div>

      <ATMCard
        title="Revenue Trend"
        loading={isLoading}
        skeleton={<ChartSkeleton height="320px" />}
        action={<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">by {groupBy}</span>}
      >
        {isLoading ? (
          <ATMSkeleton variant="rect" height="320px" />
        ) : trend.length === 0 ? (
          <ReportEmpty text="No revenue events in this window." className="h-[320px]" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f62fe" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} />
              <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} width={70} />
              <Tooltip formatter={(v) => formatCurrencyOrDash(Number(v ?? 0), currency)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Revenue"
                stroke="#0f62fe"
                fill="url(#revGrad)"
                strokeWidth={2.5}
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

function ArpuRow({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-3">
        <span className={tone}>{label}</span>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

export default RevenueReportPage;