import React, { useMemo, useState } from 'react';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { Activity, Server, Database, RefreshCw, Key, Monitor, AlertTriangle } from 'lucide-react';
import { useUsageStats, useMerchantBehavior, reportWindow } from '@/lib/hooks/useReports';
import { ReportExportMenu } from '../components/ReportExportMenu';

/* ---------------------------------------------------------------------------
 * FRS-SAP-703 — Usage Report
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls. The whole thing was a
 * hardcoded 12-month series claiming ~245,000 syncs and ~1.56M API calls a month,
 * plus an Export button wired to a no-op. (An earlier pass had already deleted the
 * random-noise activity heatmap and the invented "top users" table for the same
 * reason.) The numbers moved with nothing; they were the same on an empty database.
 *
 * It now renders GET /reports/usage-stats — the rollup of MerchantUsageMetrics that
 * Enterprise merchants report through the Bridge, plus Standalone token activations
 * — and GET /reports/behavior for the engagement rates. Where the platform records
 * no telemetry, the panel says zero-and-why instead of showing invented volume.
 * ------------------------------------------------------------------------- */

type WindowChoice = '30d' | '90d' | '12m';
const WINDOW_DAYS: Record<WindowChoice, number> = { '30d': 30, '90d': 90, '12m': 365 };
const WINDOW_LABEL: Record<WindowChoice, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

function UsageReportPage() {
  const [windowChoice, setWindowChoice] = useState<WindowChoice>('30d');
  const range = useMemo(() => reportWindow(WINDOW_DAYS[windowChoice]), [windowChoice]);

  const usageQuery = useUsageStats(range);
  const behaviorQuery = useMerchantBehavior(range);

  const usage = usageQuery.data?.data;
  const behavior = behaviorQuery.data?.data;

  const isLoading = usageQuery.isLoading;
  const isError = usageQuery.isError;
  const errorMessage =
    (usageQuery.error as any)?.data?.message ||
    (usageQuery.error as any)?.message ||
    'Failed to load the usage report.';

  const hasEnterpriseTelemetry =
    !!usage &&
    (usage.enterpriseTotalTransactions > 0 ||
      usage.enterpriseTotalApiCalls > 0 ||
      usage.enterpriseSyncEventCount > 0);

  const windows: WindowChoice[] = ['30d', '90d', '12m'];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Usage Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform activity and engagement — {WINDOW_LABEL[windowChoice].toLowerCase()}
          </p>
        </div>
        <ReportExportMenu report="usage" window={range} disabled={isLoading || isError} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void usageQuery.refetch(); }}>
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

      {/* Enterprise telemetry — reported by merchant instances through the Bridge */}
      <ATMCard title="Enterprise Telemetry">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="96px" />)}
          </div>
        ) : !usage ? (
          <Empty text="No usage data for this window." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Tile icon={Activity} label="Transactions" value={usage.enterpriseTotalTransactions.toLocaleString()} />
              <Tile icon={Server} label="API calls" value={usage.enterpriseTotalApiCalls.toLocaleString()} />
              <Tile
                icon={Database}
                label="Peak storage"
                value={`${usage.enterpriseTotalStorageMb.toLocaleString()} MB`}
              />
              <Tile icon={RefreshCw} label="Days with a sync" value={usage.enterpriseSyncEventCount.toLocaleString()} />
            </div>
            {!hasEnterpriseTelemetry && (
              <p className="mt-4 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-[11px] font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                No Enterprise merchant has reported usage metrics in this window. These counters
                fill in once merchant instances sync through the Bridge — they are not estimates.
              </p>
            )}
          </>
        )}
      </ATMCard>

      {/* Standalone activity — token activations are the only Standalone signal the
          Platform observes; a local-only POS reports nothing else back. */}
      <ATMCard title="Standalone Activity">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => <ATMSkeleton key={i} variant="card" height="96px" />)}
          </div>
        ) : !usage ? (
          <Empty text="No usage data for this window." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Tile icon={Key} label="Token activations" value={usage.standaloneTokenActivations.toLocaleString()} />
              <Tile
                icon={Monitor}
                label="Distinct terminals seen"
                value={usage.standaloneEstimatedTerminals.toLocaleString()}
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Standalone terminals run locally and report only when a token is applied, so
              activations are the platform's sole usage signal for them.
            </p>
          </>
        )}
      </ATMCard>

      {/* Engagement — nullable rates: an empty denominator shows as "—", not 0% */}
      <ATMCard title="Engagement">
        {behaviorQuery.isLoading ? (
          <ATMSkeleton variant="rect" height="140px" />
        ) : behaviorQuery.isError ? (
          <div className="flex items-center gap-2 py-6 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{(behaviorQuery.error as any)?.data?.message || 'Failed to load engagement rates.'}</span>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <RateRow
              label="Onboarding steps completed"
              value={behavior?.enterpriseOnboardingCompletionRate}
              hint="Share of onboarding steps created in this window that reached Completed."
            />
            <RateRow
              label="Feature adoption"
              value={behavior?.enterpriseFeatureAdoptionRate}
              hint="Share of Enterprise merchants' granted feature rows that are switched on."
            />
            <RateRow
              label="Token renewal"
              value={behavior?.standaloneRenewalRate}
              hint="Share of consumed tokens followed by another token for the same merchant."
            />
          </div>
        )}
      </ATMCard>
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

/** A rate the server may report as null — undefined is shown as "—", never as 0%. */
function RateRow({
  label,
  value,
  hint,
}: {
  label: string;
  value?: number | null;
  hint: string;
}) {
  const hasValue = typeof value === 'number';
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span
          className={cn(
            'text-lg font-bold',
            hasValue ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-600',
          )}
        >
          {hasValue ? `${value}%` : '—'}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
        {hasValue ? hint : `${hint} Nothing to measure in this window.`}
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {text}
    </div>
  );
}

export default UsageReportPage;
