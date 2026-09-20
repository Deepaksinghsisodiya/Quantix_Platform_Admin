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
  ResponsiveContainer,
} from 'recharts';
import { Percent, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCommissionReport, reportWindow } from '@/lib/hooks/useReports';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { ReportExportMenu } from '../components/ReportExportMenu';

/* ---------------------------------------------------------------------------
 * FRS-SAP-708 — Commission Report
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls. It showed a 12-month
 * commission curve invented month by month, a ten-row per-merchant table of
 * invented companies (Metro Hospitality Group, Coastal Dining Co, …) with invented
 * transaction counts and invented commission, a settlement-status pie with invented
 * 65/22/13 percentages, and hardcoded 3.5% / 5.0% / 7.0% rate statistics. None of
 * it moved when the database changed.
 *
 * It now renders GET /reports/commission-detailed: real commission charges grouped
 * by merchant, by plan and by period, with the real pending/settled split derived
 * from invoice linkage.
 * ------------------------------------------------------------------------- */

type WindowChoice = '30d' | '90d' | '12m';
const WINDOW_DAYS: Record<WindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
const WINDOW_LABEL: Record<WindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

function CommissionReportPage() {
  const [windowChoice, setWindowChoice] = useState<WindowChoice>('12m');
  const range = useMemo(() => reportWindow(WINDOW_DAYS[windowChoice]), [windowChoice]);

  const query = useCommissionReport(range);
  const report = query.data?.data;
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();

  const periodChart = useMemo(
    () =>
      (report?.byPeriod ?? []).map((p) => ({
        label: p.periodLabel,
        commission: p.commissionAmount,
        charges: p.transactionCount,
      })),
    [report],
  );

  const isLoading = query.isLoading;
  const isError = query.isError;
  const errorMessage =
    (query.error as any)?.data?.message ||
    (query.error as any)?.message ||
    'Failed to load the commission report.';

  const windows: WindowChoice[] = ['30d', '90d', '12m'];
  const hasData = (report?.byMerchant.length ?? 0) > 0 || (report?.totalEarned ?? 0) > 0;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Commission Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commission charged to merchants — {WINDOW_LABEL[windowChoice].toLowerCase()}
          </p>
        </div>
        <ReportExportMenu report="commission" window={range} disabled={isLoading || isError} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void query.refetch(); }}>
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
          <Tile icon={TrendingUp} label="Total charged" value={formatCurrencyOrDash(report.totalEarned, currency)} />
          <Tile
            icon={CheckCircle2}
            label="Settled"
            value={formatCurrencyOrDash(report.settledAmount, currency)}
            tone="emerald"
          />
          <Tile
            icon={Clock}
            label="Pending invoice"
            value={formatCurrencyOrDash(report.pendingSettlement, currency)}
          />
          <Tile icon={Percent} label="Average rate" value={`${report.averageRate}%`} />
        </div>
      ) : null}

      {!isLoading && report && !hasData && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          No commission was charged in this window. Commission is pulled from merchant
          revenue collections; a deployment with no Enterprise merchants trading records none.
        </div>
      )}

      <ATMCard title="Commission Over Time">
        {isLoading ? (
          <ATMSkeleton variant="rect" height="300px" />
        ) : periodChart.length === 0 ? (
          <Empty text="No commission charges in this window." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="commission" name="Commission" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="By Merchant">
          {isLoading ? (
            <ATMSkeleton variant="rect" height="220px" />
          ) : (report?.byMerchant.length ?? 0) === 0 ? (
            <Empty text="No merchant was charged commission in this window." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <Th>Merchant</Th>
                    <Th align="right">Charges</Th>
                    <Th align="right">Rate</Th>
                    <Th align="right">Commission</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(report?.byMerchant ?? []).map((m) => (
                    <tr key={m.merchantId}>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{m.companyName}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">{m.transactionCount}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">{m.ratePercent}%</td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrencyOrDash(m.totalCommission, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ATMCard>

        <ATMCard title="By Plan">
          {isLoading ? (
            <ATMSkeleton variant="rect" height="220px" />
          ) : (report?.byPlan.length ?? 0) === 0 ? (
            <Empty text="No commission by plan in this window." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <Th>Plan</Th>
                    <Th align="right">Merchants</Th>
                    <Th align="right">Commission</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(report?.byPlan ?? []).map((p) => (
                    <tr key={p.planName}>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{p.planName}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">{p.merchantCount}</td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrencyOrDash(p.totalCommission, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ATMCard>
      </div>

      {/* 2026-08-31: the settlement-status pie is gone. The API reports two real
          buckets — pending invoice and settled — shown as tiles above; the old chart
          added a third "Approved" state that the commission model does not have. */}
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
    <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {text}
    </div>
  );
}

export default CommissionReportPage;
