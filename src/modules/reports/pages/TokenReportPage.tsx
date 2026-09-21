import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { ChartSkeleton } from '../../dashboard/components/charts/ChartSkeleton';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Key, Clock, RefreshCw, DollarSign } from 'lucide-react';
import { useTokenGenerationReport, useRevenueAnalytics, reportWindow } from '@/lib/hooks/useReports';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { ReportExportMenu } from '../components/ReportExportMenu';
import {
  ReportWindowTabs,
  ReportError,
  ReportEmpty,
  ReportKpis,
  WINDOW_DAYS,
  WINDOW_LABEL,
  type ReportWindowChoice,
} from '../components/ReportToolbar';

/* ---------------------------------------------------------------------------
 * FRS-SAP-709 — Token Report
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls (see the removed
 * narrative). It now renders GET /reports/token-generation, which groups by
 * PlanType — the real axis — and reports real counts and real revenue.
 * ------------------------------------------------------------------------- */

const PLAN_BADGE: Record<string, string> = {
  StandalonePos: 'standalone',
  StandaloneCloud: 'standalone',
  EnterpriseCloud: 'enterprise',
};

const CHART_GRID = 'var(--zen-border)';
const CHART_TICK = '#94a3b8';

function TokenReportPage() {
  const [windowChoice, setWindowChoice] = useState<ReportWindowChoice>('12m');
  const range = useMemo(() => reportWindow(WINDOW_DAYS[windowChoice]), [windowChoice]);

  const tokenQuery = useTokenGenerationReport(range);
  const revenueQuery = useRevenueAnalytics(range);

  const report = tokenQuery.data?.data;
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();

  const periodChart = useMemo(
    () =>
      (report?.byPeriod ?? []).map((p) => ({
        label: p.periodLabel,
        generated: p.generated,
        activated: p.activated,
      })),
    [report],
  );

  const tokenRevenue = revenueQuery.data?.data?.tokenSalesRevenue;

  const isLoading = tokenQuery.isLoading;
  const isError = tokenQuery.isError;
  const errorMessage =
    (tokenQuery.error as any)?.data?.message ||
    (tokenQuery.error as any)?.message ||
    'Failed to load the token report.';

  const planColumns: ATMTableColumn<{
    plan: string;
    count: number;
    active: number;
    expired: number;
    revenue: number;
  }>[] = [
    {
      key: 'plan',
      header: 'Plan',
      renderCell: (_v, row) => (
        <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          {row.plan || 'Unassigned'}
          <ATMBadge variant={PLAN_BADGE[row.plan] as 'enterprise' | 'standalone'} size="sm">
            {row.plan.includes('Enterprise') ? 'Enterprise' : 'Standalone'}
          </ATMBadge>
        </span>
      ),
    },
    {
      key: 'count',
      header: 'Issued',
      align: 'right',
      renderCell: (_v, row) => <span className="text-slate-600 dark:text-slate-300">{row.count.toLocaleString()}</span>,
    },
    {
      key: 'active',
      header: 'Active',
      align: 'right',
      renderCell: (_v, row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.active.toLocaleString()}</span>
      ),
    },
    {
      key: 'expired',
      header: 'Expired',
      align: 'right',
      renderCell: (_v, row) => <span className="text-slate-600 dark:text-slate-300">{row.expired.toLocaleString()}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      renderCell: (_v, row) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrencyOrDash(row.revenue, currency)}
        </span>
      ),
    },
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
        icon={Key}
        iconColor="indigo"
        title="Token Report"
        subtitle={`Issuance, activation, and token revenue — ${WINDOW_LABEL[windowChoice].toLowerCase()}`}
        extraActions={
          <ReportExportMenu report="tokens" window={range} disabled={isLoading || isError} />
        }
      />

      {isError && (
        <ReportError
          message={errorMessage}
          onRetry={() => {
            void tokenQuery.refetch();
          }}
        />
      )}

      <ReportWindowTabs value={windowChoice} onChange={setWindowChoice} />

      {isLoading ? (
        <ReportKpis>
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
        </ReportKpis>
      ) : report ? (
        <ReportKpis>
          <ATMStatsCard
            label="Generated"
            value={report.totalGenerated.toLocaleString()}
            icon={Key}
            variant="accent"
            description="Tokens issued, this window"
          />
          <ATMStatsCard
            label="Active"
            value={report.activeTokens.toLocaleString()}
            icon={Key}
            variant="emerald"
            description="Currently activated"
          />
          <ATMStatsCard
            label="Expired"
            value={report.expiredTokens.toLocaleString()}
            icon={Clock}
            variant="slate"
            description="Reached end of validity"
          />
          <ATMStatsCard
            label="Token Revenue"
            value={typeof tokenRevenue === 'number' ? formatCurrencyOrDash(tokenRevenue, currency) : '—'}
            icon={DollarSign}
            variant="amber"
            description="Token purchase revenue"
          />
        </ReportKpis>
      ) : null}

      {/* Renewal rate — a single window figure, not the invented monthly curve */}
      <ATMCard title="Renewal Rate" loading={isLoading}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="90px" />
        ) : !report ? (
          <ReportEmpty text="No token data for this window." className="h-24" />
        ) : (
          <div className="flex items-center gap-4 py-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {report.renewalRate}
                <span className="text-lg text-slate-400">%</span>
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Share of tokens consumed in this window that were followed by another token
                for the same merchant. The API reports one figure per window — there is no
                monthly renewal series behind it.
              </p>
            </div>
          </div>
        )}
      </ATMCard>

      {/* Issuance over time — real periods from the API */}
      <ATMCard title="Issuance Over Time" loading={isLoading} skeleton={<ChartSkeleton height="300px" />}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="300px" />
        ) : periodChart.length === 0 ? (
          <ReportEmpty text="No tokens were issued in this window." className="h-[300px]" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} />
              <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="generated" name="Issued" fill="#0f62fe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="activated" name="Applied" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      {/* By plan — the real grouping axis (tiers do not exist) */}
      <ATMCard title="Tokens by Plan" padding="none" className="overflow-hidden" loading={isLoading}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="180px" />
        ) : (report?.byPlan.length ?? 0) === 0 ? (
          <ReportEmpty text="No tokens were issued in this window." className="h-40" />
        ) : (
          <ATMTable columns={planColumns} data={[...(report?.byPlan ?? [])]} emptyMessage="No data." />
        )}
      </ATMCard>

      {/* 2026-08-31: the "Token Status" pie (Active/Expired/Consumed/Revoked with
          invented counts) is gone. /reports/token-generation reports issued, active
          and expired — it does not break out consumed vs revoked, and inventing that
          split is what the old chart did. Per-token status lives on the Tokens page. */}
    </div>
  );
}

export default TokenReportPage;