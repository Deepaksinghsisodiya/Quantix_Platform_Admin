import React, { useMemo, useState } from 'react';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
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
import { Key, Clock, RefreshCw, DollarSign, AlertTriangle } from 'lucide-react';
import { useTokenGenerationReport, useRevenueAnalytics, reportWindow } from '@/lib/hooks/useReports';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { ReportExportMenu } from '../components/ReportExportMenu';

/* ---------------------------------------------------------------------------
 * FRS-SAP-709 — Token Report
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls. Everything was a
 * hardcoded literal, and all of it was keyed on Basic/Standard/Advance/Premium
 * token "tiers" — a concept purged from the platform in Pass 43, where token
 * entitlements became plan-derived. It showed ~10,000 invented tokens, an invented
 * status split, an invented renewal-rate trend, an invented per-tier revenue table
 * (with an "avg lifetime" the platform never computed), and an Export button wired
 * to a no-op.
 *
 * It now renders GET /reports/token-generation, which groups by PlanType — the
 * real axis — and reports real counts and real revenue.
 * ------------------------------------------------------------------------- */

type WindowChoice = '30d' | '90d' | '12m';
const WINDOW_DAYS: Record<WindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
const WINDOW_LABEL: Record<WindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

const PLAN_LABEL: Record<string, string> = {
  StandalonePos: 'Standalone POS',
  StandaloneCloud: 'Standalone Cloud',
  EnterpriseCloud: 'Enterprise Cloud',
};

function TokenReportPage() {
  const [windowChoice, setWindowChoice] = useState<WindowChoice>('12m');
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

  const windows: WindowChoice[] = ['30d', '90d', '12m'];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Token Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Issuance, activation, and token revenue — {WINDOW_LABEL[windowChoice].toLowerCase()}
          </p>
        </div>
        <ReportExportMenu report="tokens" window={range} disabled={isLoading || isError} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void tokenQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile icon={Key} label="Generated" value={report.totalGenerated.toLocaleString()} />
          <Tile icon={Key} label="Active" value={report.activeTokens.toLocaleString()} tone="emerald" />
          <Tile icon={Clock} label="Expired" value={report.expiredTokens.toLocaleString()} />
          <Tile
            icon={DollarSign}
            label="Token revenue"
            value={typeof tokenRevenue === 'number' ? formatCurrencyOrDash(tokenRevenue, currency) : '—'}
          />
        </div>
      ) : null}

      {/* Renewal rate — a single window figure, not the invented monthly curve */}
      <ATMCard title="Renewal Rate">
        {isLoading ? (
          <ATMSkeleton variant="rect" height="90px" />
        ) : !report ? (
          <Empty text="No token data for this window." />
        ) : (
          <div className="flex items-center gap-4 py-2">
            <RefreshCw className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{report.renewalRate}%</p>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Share of tokens consumed in this window that were followed by another token
                for the same merchant. The API reports one figure per window — there is no
                monthly renewal series behind it.
              </p>
            </div>
          </div>
        )}
      </ATMCard>

      {/* Issuance over time — real periods from the API */}
      <ATMCard title="Issuance Over Time">
        {isLoading ? (
          <ATMSkeleton variant="rect" height="300px" />
        ) : periodChart.length === 0 ? (
          <Empty text="No tokens were issued in this window." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="generated" name="Issued" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="activated" name="Applied" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      {/* By plan — the real grouping axis (tiers do not exist) */}
      <ATMCard title="Tokens by Plan">
        {isLoading ? (
          <ATMSkeleton variant="rect" height="180px" />
        ) : (report?.byPlan.length ?? 0) === 0 ? (
          <Empty text="No tokens were issued in this window." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <Th>Plan</Th>
                  <Th align="right">Issued</Th>
                  <Th align="right">Active</Th>
                  <Th align="right">Expired</Th>
                  <Th align="right">Revenue</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(report?.byPlan ?? []).map((row) => (
                  <tr key={row.plan}>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                      {PLAN_LABEL[row.plan] ?? row.plan}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.count.toLocaleString()}</td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400">
                      {row.active.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.expired.toLocaleString()}</td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrencyOrDash(row.revenue, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* 2026-08-31: the "Token Status" pie (Active/Expired/Consumed/Revoked with
          invented counts) is gone. /reports/token-generation reports issued, active
          and expired — it does not break out consumed vs revoked, and inventing that
          split is what the old chart did. Per-token status lives on the Tokens page. */}
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: 'default' | 'emerald';
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={cn(
          'mt-1 text-2xl font-bold',
          tone === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-50',
        )}
      >
        {value}
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

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {text}
    </div>
  );
}

export default TokenReportPage;
