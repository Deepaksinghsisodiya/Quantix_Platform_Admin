import React, { useMemo, useState } from 'react';
import { ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Activity, Server, Database, RefreshCw, Key, Monitor, AlertTriangle } from 'lucide-react';
import { useUsageStats, useMerchantBehavior, reportWindow } from '@/lib/hooks/useReports';
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
 * FRS-SAP-703 — Usage Report
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls (see the removed
 * narrative). It now renders GET /reports/usage-stats — the rollup of
 * MerchantUsageMetrics that Enterprise merchants report through the Bridge, plus
 * Standalone token activations — and GET /reports/behavior for the engagement
 * rates. Where the platform records no telemetry, the panel says zero-and-why.
 * ------------------------------------------------------------------------- */

function UsageReportPage() {
  const [windowChoice, setWindowChoice] = useState<ReportWindowChoice>('30d');
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

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Activity}
        iconColor="blue"
        title="Usage Report"
        subtitle={`Platform activity and engagement — ${WINDOW_LABEL[windowChoice].toLowerCase()}`}
        extraActions={
          <ReportExportMenu report="usage" window={range} disabled={isLoading || isError} />
        }
      />

      {isError && (
        <ReportError
          message={errorMessage}
          onRetry={() => {
            void usageQuery.refetch();
          }}
        />
      )}

      <ReportWindowTabs value={windowChoice} onChange={setWindowChoice} />

      {/* Enterprise telemetry — reported by merchant instances through the Bridge */}
      <ATMCard title="Enterprise Telemetry">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
          </div>
        ) : !usage ? (
          <ReportEmpty text="No usage data for this window." className="h-40" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ATMStatsCard
                label="Transactions"
                value={usage.enterpriseTotalTransactions.toLocaleString()}
                icon={Activity}
                variant="accent"
              />
              <ATMStatsCard
                label="API Calls"
                value={usage.enterpriseTotalApiCalls.toLocaleString()}
                icon={Server}
                variant="indigo"
              />
              <ATMStatsCard
                label="Peak Storage"
                value={`${usage.enterpriseTotalStorageMb.toLocaleString()} MB`}
                icon={Database}
                variant="amber"
              />
              <ATMStatsCard
                label="Days With A Sync"
                value={usage.enterpriseSyncEventCount.toLocaleString()}
                icon={RefreshCw}
                variant="slate"
              />
            </div>
            {!hasEnterpriseTelemetry && (
              <p className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                No Enterprise merchant has reported usage metrics in this window. These counters
                fill in once merchant instances sync through the Bridge — they are not estimates.
              </p>
            )}
          </div>
        )}
      </ATMCard>

      {/* Standalone activity — token activations are the only Standalone signal the
          Platform observes; a local-only POS reports nothing else back. */}
      <ATMCard title="Standalone Activity">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
          </div>
        ) : !usage ? (
          <ReportEmpty text="No usage data for this window." className="h-40" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ATMStatsCard
                label="Token Activations"
                value={usage.standaloneTokenActivations.toLocaleString()}
                icon={Key}
                variant="emerald"
              />
              <ATMStatsCard
                label="Distinct Terminals Seen"
                value={usage.standaloneEstimatedTerminals.toLocaleString()}
                icon={Monitor}
                variant="purple"
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Standalone terminals run locally and report only when a token is applied, so
              activations are the platform's sole usage signal for them.
            </p>
          </>
        )}
      </ATMCard>

      {/* Engagement — nullable rates: an empty denominator shows as "—", not 0% */}
      <ATMCard title="Engagement" loading={behaviorQuery.isLoading}>
        {behaviorQuery.isLoading ? (
          <ATMSkeleton variant="rect" height="140px" />
        ) : behaviorQuery.isError ? (
          <div className="flex items-center gap-2 py-6 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{(behaviorQuery.error as any)?.data?.message || 'Failed to load engagement rates.'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 py-1 sm:grid-cols-3">
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
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span
          className={cn(
            'text-xl font-black',
            hasValue ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-600',
          )}
        >
          {hasValue ? `${value}%` : '—'}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        {hasValue ? hint : `${hint} Nothing to measure in this window.`}
      </p>
    </div>
  );
}

export default UsageReportPage;