import React, { useMemo, useState } from 'react';
import { ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { ChartSkeleton } from '../../dashboard/components/charts/ChartSkeleton';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
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
import { TrendingUp, Users, UserMinus, CheckCircle2 } from 'lucide-react';
import { useGrowthReport, reportWindow } from '@/lib/hooks/useReports';
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

/* ---------------------------------------------------------------------------
 * FRS-SAP-701 — Growth Reports
 *
 * 2026-08-31 (de-fictioned). Everything below renders the real payload — see the
 * removed narrative for the invented ratios and mock attribution that used to live
 * here. Where the API has no data for a panel, the panel says so.
 * ------------------------------------------------------------------------- */

type TypeFilter = 'All' | 'Enterprise' | 'Standalone';

const CHART_GRID = 'var(--zen-border)';
const CHART_TICK = '#94a3b8';

function GrowthReportPage() {
  const [windowChoice, setWindowChoice] = useState<ReportWindowChoice>('12m');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  const range = useMemo(() => reportWindow(WINDOW_DAYS[windowChoice]), [windowChoice]);
  const growthQuery = useGrowthReport(range, typeFilter === 'All' ? undefined : typeFilter);

  const report = growthQuery.data?.data;
  const isLoading = growthQuery.isLoading;
  const isError = growthQuery.isError;

  // Signups per cohort month is the only real time series the API exposes — it has
  // no monthly churn series, so the old "Signups vs Churns" chart had nothing to plot.
  const cohortChart = useMemo(
    () =>
      (report?.cohorts ?? []).map((c) => ({
        label: c.cohortLabel,
        signups: c.merchantCount,
        stillActive: c.stillActive,
      })),
    [report],
  );

  const errorMessage =
    (growthQuery.error as any)?.data?.message ||
    (growthQuery.error as any)?.message ||
    'Failed to load the growth report.';

  const types: { value: TypeFilter; label: string }[] = [
    { value: 'All', label: 'All' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'Standalone', label: 'Standalone' },
  ];

  const cohortColumns: ATMTableColumn<{ cohortLabel: string; merchantCount: number; stillActive: number; retentionRate: number }>[] = [
    {
      key: 'cohortLabel',
      header: 'Cohort',
      renderCell: (_v, c) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{c.cohortLabel}</span>
      ),
    },
    {
      key: 'merchantCount',
      header: 'Signed up',
      align: 'right',
      renderCell: (_v, c) => <span className="text-slate-600 dark:text-slate-300">{c.merchantCount.toLocaleString()}</span>,
    },
    {
      key: 'stillActive',
      header: 'Still active',
      align: 'right',
      renderCell: (_v, c) => <span className="text-slate-600 dark:text-slate-300">{c.stillActive.toLocaleString()}</span>,
    },
    {
      key: 'retentionRate',
      header: 'Retention',
      align: 'right',
      renderCell: (_v, c) => (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.min(100, Math.max(0, c.retentionRate))}%` }}
            />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{c.retentionRate}%</span>
        </div>
      ),
      width: '130px',
    },
  ];

  const sourceColumns: ATMTableColumn<{ source: string; count: number; percentage: number }>[] = [
    {
      key: 'source',
      header: 'Source',
      renderCell: (_v, s) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{s.source}</span>
      ),
    },
    {
      key: 'count',
      header: 'Merchants',
      align: 'right',
      renderCell: (_v, s) => <span className="text-slate-600 dark:text-slate-300">{s.count.toLocaleString()}</span>,
    },
    {
      key: 'percentage',
      header: 'Share',
      align: 'right',
      renderCell: (_v, s) => <span className="font-semibold text-slate-900 dark:text-slate-100">{s.percentage}%</span>,
      width: '80px',
    },
    {
      key: 'distribution',
      header: 'Distribution',
      width: '200px',
      renderCell: (_v, s) => (
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
            style={{ width: `${Math.min(100, Math.max(0, s.percentage))}%` }}
          />
        </div>
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
        icon={TrendingUp}
        iconColor="emerald"
        title="Growth Report"
        subtitle={`Merchant acquisition, churn, and net growth over ${WINDOW_LABEL[windowChoice].toLowerCase()}`}
        extraActions={
          <ReportExportMenu
            report="growth"
            window={range}
            merchantType={typeFilter === 'All' ? undefined : typeFilter}
            disabled={isLoading || isError}
          />
        }
      />

      {isError && (
        <ReportError
          message={errorMessage}
          onRetry={() => {
            void growthQuery.refetch();
          }}
        />
      )}

      {/* Window + type filter — both are real query parameters on /reports/growth */}
      <div className="flex flex-wrap items-center gap-3">
        <ReportWindowTabs value={windowChoice} onChange={setWindowChoice} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Type
          </span>
          <ReportSegmented options={types} value={typeFilter} onChange={setTypeFilter} />
        </div>
      </div>

      {/* Summary — every figure straight off the wire */}
      {isLoading ? (
        <ReportKpis>
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
        </ReportKpis>
      ) : report ? (
        <ReportKpis>
          <ATMStatsCard
            label="Signups"
            value={report.signups.toLocaleString()}
            icon={Users}
            variant="accent"
            description="New merchants, this window"
          />
          <ATMStatsCard
            label="Activated"
            value={report.activations.toLocaleString()}
            icon={CheckCircle2}
            variant="emerald"
            description="Onboarding completed"
          />
          <ATMStatsCard
            label="Deboarded"
            value={report.cancellations.toLocaleString()}
            icon={UserMinus}
            variant="rose"
            description="Merchants cancelled"
          />
          <ATMStatsCard
            label="Net Growth"
            value={`${report.netGrowth >= 0 ? '+' : ''}${report.netGrowth.toLocaleString()}`}
            icon={TrendingUp}
            variant={report.netGrowth >= 0 ? 'emerald' : 'rose'}
            description="Signups minus deboardings"
          />
        </ReportKpis>
      ) : null}

      {/* Signups by merchant type — the wire's own split, not an assumed ratio */}
      <ATMCard title="Signups by Merchant Type" loading={isLoading}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="90px" />
        ) : !report ? (
          <ReportEmpty text="No growth data for this window." className="h-24" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TypeStat
              label="Enterprise"
              value={report.enterpriseSignups}
              tone="text-primary-600 dark:text-primary-400"
              icon={<Users className="h-4 w-4" />}
            />
            <TypeStat
              label="Standalone"
              value={report.standaloneSignups}
              tone="text-emerald-600 dark:text-emerald-400"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            {/* Deboarding is reported for the window as a whole; the API does not split
                it by merchant type, so this card does not pretend to. Use the Type
                filter above to scope the whole report to one merchant type. */}
          </div>
        )}
      </ATMCard>

      {/* Cohorts — real signup-month cohorts with real retention */}
      <ATMCard title="Signup Cohorts" action={<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{WINDOW_LABEL[windowChoice]}</span>} loading={isLoading} skeleton={<ChartSkeleton height="320px" />}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="320px" />
        ) : cohortChart.length === 0 ? (
          <ReportEmpty text="No merchants signed up in this window." className="h-64" />
        ) : (
          <div className="space-y-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cohortChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} />
                <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="signups" name="Signed up" fill="#0f62fe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stillActive" name="Still active" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <ATMTable columns={cohortColumns} data={[...(report?.cohorts ?? [])]} emptyMessage="No cohorts." />
          </div>
        )}
      </ATMCard>

      {/* Source attribution — the API's real breakdown, not a marketing-mix mock */}
      <ATMCard title="Source Attribution" padding="none" className="overflow-hidden" loading={isLoading}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="120px" />
        ) : (report?.sourceAttribution.length ?? 0) === 0 ? (
          <ReportEmpty text="No signup sources recorded in this window." className="h-24" />
        ) : (
          <ATMTable columns={sourceColumns} data={[...(report?.sourceAttribution ?? [])]} emptyMessage="No sources." />
        )}
      </ATMCard>
    </div>
  );
}

/* ── small presentational helpers ────────────────────────────────────────── */

function TypeStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
      <span className={`flex items-center gap-2 text-sm font-bold ${tone}`}>
        {icon}
        {label}
      </span>
      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export default GrowthReportPage;