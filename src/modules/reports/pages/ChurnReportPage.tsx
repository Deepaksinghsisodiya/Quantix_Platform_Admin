import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { UserMinus, TrendingDown, AlertTriangle, Building2, ShieldAlert } from 'lucide-react';
import { useChurnReport, useMerchantHealth, reportWindow } from '@/lib/hooks/useReports';
import type { MerchantHealthRow } from '../services/reportsApi';
import { ReportExportMenu } from '../components/ReportExportMenu';

/* ---------------------------------------------------------------------------
 * FRS-SAP-704 — Churn Reports
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls. It rendered:
 *   • a 12-month churn-rate trend invented month by month,
 *   • a churn-reason pie (Price 35% / Features 25% / Service 20% / Competitor 15%)
 *     — the platform captures no churn reasons at all, so every slice was made up,
 *   • an eight-row "At-Risk Merchants" table of invented companies with invented
 *     risk reasons, including "Competitor inquiry detected", a signal the platform
 *     has no way to observe,
 *   • an Export button wired to a no-op.
 *
 * It now renders GET /reports/churn (real cancellation counts and rates) and
 * GET /reports/merchant-health (real per-merchant risk classification and health
 * score). Churn REASONS stay empty until the deboarding flow records them —
 * the panel says that rather than inventing a distribution.
 * ------------------------------------------------------------------------- */

type WindowChoice = '30d' | '90d' | '12m';
const WINDOW_DAYS: Record<WindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
const WINDOW_LABEL: Record<WindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

const RISK_COLOR: Record<string, string> = {
  Critical: 'danger',
  High: 'danger',
  Medium: 'warning',
  Low: 'primary',
  Normal: 'primary',
};

function ChurnReportPage() {
  const [windowChoice, setWindowChoice] = useState<WindowChoice>('12m');
  const range = useMemo(() => reportWindow(WINDOW_DAYS[windowChoice]), [windowChoice]);

  const churnQuery = useChurnReport(range);
  const healthQuery = useMerchantHealth(1, 50);

  const churn = churnQuery.data?.data;
  const healthRows = healthQuery.data?.data ?? [];

  // "At risk" = anything the health scorer did not classify as Normal, worst first.
  const atRisk = useMemo(
    () =>
      [...healthRows]
        .filter((m) => m.riskClassification !== 'Normal')
        .sort((a, b) => a.healthScore - b.healthScore),
    [healthRows],
  );

  const isLoading = churnQuery.isLoading;
  const isError = churnQuery.isError;
  const errorMessage =
    (churnQuery.error as any)?.data?.message ||
    (churnQuery.error as any)?.message ||
    'Failed to load the churn report.';

  const windows: WindowChoice[] = ['30d', '90d', '12m'];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Churn Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Deboarding, token lapses, and at-risk merchants — {WINDOW_LABEL[windowChoice].toLowerCase()}
          </p>
        </div>
        <ReportExportMenu report="churn" window={range} disabled={isLoading || isError} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void churnQuery.refetch(); }}>
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
      ) : churn ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            icon={Building2}
            label="Enterprise deboarded"
            value={churn.enterpriseCancellations.toLocaleString()}
            tone="red"
          />
          <Tile
            icon={TrendingDown}
            label="Enterprise churn rate"
            value={`${churn.enterpriseChurnRate}%`}
          />
          <Tile
            icon={UserMinus}
            label="Standalone lapses"
            value={churn.standaloneLapses.toLocaleString()}
            tone="red"
          />
          <Tile icon={TrendingDown} label="Standalone lapse rate" value={`${churn.standaloneLapseRate}%`} />
        </div>
      ) : null}

      <ATMCard title="Churn Reasons">
        {(churn?.topReasons.length ?? 0) === 0 ? (
          // 2026-08-31: this used to be a five-slice pie with invented percentages.
          // The deboarding workflow records a free-text reason on the merchant record
          // but nothing aggregates it into categories yet, so the API returns none.
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <ShieldAlert className="h-7 w-7 text-gray-300 dark:text-gray-700" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              No churn reasons are categorised yet.
            </p>
            <p className="max-w-md text-xs text-gray-400 dark:text-gray-500">
              Deboarding captures a free-text reason per merchant; the platform does not yet
              roll those up into reason categories, so there is nothing to chart here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <Th>Reason</Th>
                  <Th>Merchant type</Th>
                  <Th align="right">Count</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {churn!.topReasons.map((r) => (
                  <tr key={`${r.merchantType}-${r.reason}`}>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{r.reason}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{r.merchantType}</td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      <ATMCard
        title="At-Risk Merchants"
        action={
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {churn ? `${churn.atRiskMerchants} flagged by wallet grace state` : ''}
          </span>
        }
      >
        {healthQuery.isLoading ? (
          <ATMSkeleton variant="rect" height="220px" />
        ) : healthQuery.isError ? (
          <div className="flex items-center gap-2 py-6 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {(healthQuery.error as any)?.data?.message || 'Failed to load merchant health.'}
            </span>
          </div>
        ) : atRisk.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No merchant is currently classified as at risk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <Th>Merchant</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Grace phase</Th>
                  <Th align="right">Health</Th>
                  <Th align="right">Risk</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {atRisk.map((m: MerchantHealthRow) => (
                  <tr key={m.merchantId}>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{m.companyName}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{m.merchantType}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{m.merchantStatus}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{m.gracePeriodPhase}</td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                      {m.healthScore}
                    </td>
                    <td className="py-3 text-right">
                      <ATMBadge
                        label={m.riskClassification}
                        color={RISK_COLOR[m.riskClassification] ?? 'primary'}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* 2026-08-31: the monthly "Churn Rate Trend" chart is gone. The API reports
          churn for the selected window as a whole, not as a month-by-month series;
          the old chart plotted twelve invented data points. Change the window above
          to compare periods. */}
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
  tone?: 'default' | 'red';
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
          tone === 'red' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-50',
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

export default ChurnReportPage;
