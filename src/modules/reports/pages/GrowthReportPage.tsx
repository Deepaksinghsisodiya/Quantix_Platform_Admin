import React, { useMemo, useState } from 'react';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
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
import { TrendingUp, Users, UserMinus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useGrowthReport, reportWindow } from '@/lib/hooks/useReports';
import { ReportExportMenu } from '../components/ReportExportMenu';

/* ---------------------------------------------------------------------------
 * FRS-SAP-701 — Growth Reports
 *
 * 2026-08-31 (de-fictioned). What this page used to do:
 *   • Called useGrowthReport({ granularity, merchantType }) — query-string names the
 *     API does not accept — then mapped the response as if it were an ARRAY of
 *     monthly rows. GET /reports/growth returns a single summary object, so the
 *     array was always empty and every chart and total rendered from nothing.
 *   • Split signups by merchant type with `Math.round(newMerchants * 0.63)` — an
 *     invented 63/37 ratio — even though the wire carries real enterpriseSignups
 *     and standaloneSignups fields.
 *   • Rendered a hardcoded Source Attribution table (Organic 45% / Paid Ads 25% /
 *     Referral 20% / Direct Sales 10%, 693 fabricated merchants) while the wire
 *     carries the real attribution breakdown.
 *   • Offered Export via POST /api/v1/reports/export, a route that does not exist.
 *
 * Everything below renders the real payload. Where the API has no data for a
 * panel, the panel says so instead of inventing a shape.
 * ------------------------------------------------------------------------- */

type WindowChoice = '30d' | '90d' | '12m';
type TypeFilter = 'All' | 'Enterprise' | 'Standalone';

const WINDOW_DAYS: Record<WindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
const WINDOW_LABEL: Record<WindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

function GrowthReportPage() {
  const [windowChoice, setWindowChoice] = useState<WindowChoice>('12m');
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

  const windows: WindowChoice[] = ['30d', '90d', '12m'];
  const types: TypeFilter[] = ['All', 'Enterprise', 'Standalone'];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Growth Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Merchant acquisition, churn, and net growth over {WINDOW_LABEL[windowChoice].toLowerCase()}
          </p>
        </div>
        <ReportExportMenu
          report="growth"
          window={range}
          merchantType={typeFilter === 'All' ? undefined : typeFilter}
          disabled={isLoading || isError}
        />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void growthQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Window + type filter — both are real query parameters on /reports/growth */}
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
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type:</span>
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                typeFilter === t
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary — every figure straight off the wire */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={Users} label="Signups" value={report.signups} />
          <StatTile icon={CheckCircle2} label="Activated" value={report.activations} tone="emerald" />
          <StatTile icon={UserMinus} label="Deboarded" value={report.cancellations} tone="red" />
          <StatTile
            icon={TrendingUp}
            label="Net Growth"
            value={report.netGrowth}
            tone={report.netGrowth >= 0 ? 'emerald' : 'red'}
            signed
          />
        </div>
      ) : null}

      {/* Signups by merchant type — the wire's own split, not an assumed ratio */}
      <ATMCard title="Signups by Merchant Type">
        {isLoading ? (
          <ATMSkeleton variant="rect" height="90px" />
        ) : !report ? (
          <EmptyLine text="No growth data for this window." />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-blue-600 dark:text-blue-400">Enterprise</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Signups in window</span>
                <span className="font-bold">{report.enterpriseSignups.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Standalone</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Signups in window</span>
                <span className="font-bold">{report.standaloneSignups.toLocaleString()}</span>
              </div>
            </div>
            {/* Deboarding is reported for the window as a whole; the API does not split
                it by merchant type, so this card does not pretend to. Use the Type
                filter above to scope the whole report to one merchant type. */}
          </div>
        )}
      </ATMCard>

      {/* Cohorts — real signup-month cohorts with real retention */}
      <ATMCard
        title="Signup Cohorts"
        action={<span className="text-xs text-gray-500 dark:text-gray-400">{WINDOW_LABEL[windowChoice]}</span>}
      >
        {isLoading ? (
          <ATMSkeleton variant="rect" height="320px" />
        ) : cohortChart.length === 0 ? (
          <EmptyLine text="No merchants signed up in this window." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cohortChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="signups" name="Signed up" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stillActive" name="Still active" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <Th>Cohort</Th>
                    <Th align="right">Signed up</Th>
                    <Th align="right">Still active</Th>
                    <Th align="right">Retention</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(report?.cohorts ?? []).map((c) => (
                    <tr key={c.cohortLabel}>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{c.cohortLabel}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">{c.merchantCount}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">{c.stillActive}</td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                        {c.retentionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ATMCard>

      {/* Source attribution — the API's real breakdown, not a marketing-mix mock */}
      <ATMCard title="Source Attribution">
        {isLoading ? (
          <ATMSkeleton variant="rect" height="120px" />
        ) : (report?.sourceAttribution?.length ?? 0) === 0 ? (
          <EmptyLine text="No signup sources recorded in this window." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <Th>Source</Th>
                  <Th align="right">Merchants</Th>
                  <Th align="right">Share</Th>
                  <Th>Distribution</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(report?.sourceAttribution ?? []).map((row) => (
                  <tr key={row.source}>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.source}</td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.percentage}%</td>
                    <td className="py-3">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, Math.max(0, row.percentage))}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>
    </div>
  );
}

/* ── small presentational helpers ────────────────────────────────────────── */

function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'default',
  signed = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: 'default' | 'emerald' | 'red';
  signed?: boolean;
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'red'
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-900 dark:text-gray-50';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={cn('mt-1 text-2xl font-bold', toneClass)}>
        {signed && value > 0 ? '+' : ''}
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={cn(
        'pb-2 text-xs font-medium text-gray-500 dark:text-gray-400',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {text}
    </div>
  );
}

export default GrowthReportPage;
