import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { UserMinus, TrendingDown, Building2, ShieldAlert, HeartPulse } from 'lucide-react';
import { useChurnReport, useMerchantHealth, reportWindow } from '@/lib/hooks/useReports';
import type { MerchantHealthRow } from '../services/reportsApi';
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
 * FRS-SAP-704 — Churn Reports
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls (see the removed
 * narrative). It now renders GET /reports/churn (real cancellation counts and
 * rates) and GET /reports/merchant-health (real per-merchant risk classification
 * and health score). Churn REASONS stay empty until the deboarding flow records
 * them — the panel says that rather than inventing a distribution.
 * ------------------------------------------------------------------------- */

const RISK_COLOR: Record<string, string> = {
  Critical: 'danger',
  High: 'danger',
  Medium: 'warning',
  Low: 'primary',
  Normal: 'primary',
};

function ChurnReportPage() {
  const [windowChoice, setWindowChoice] = useState<ReportWindowChoice>('12m');
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

  const reasonColumns: ATMTableColumn<{ reason: string; merchantType: string; count: number }>[] = [
    {
      key: 'reason',
      header: 'Reason',
      renderCell: (_v, r) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{r.reason}</span>
      ),
    },
    {
      key: 'merchantType',
      header: 'Merchant type',
      renderCell: (_v, r) => (
        <span className="text-slate-600 dark:text-slate-300">{r.merchantType}</span>
      ),
    },
    {
      key: 'count',
      header: 'Count',
      align: 'right',
      renderCell: (_v, r) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">{r.count.toLocaleString()}</span>
      ),
    },
  ];

  const atRiskColumns: ATMTableColumn<MerchantHealthRow>[] = [
    {
      key: 'companyName',
      header: 'Merchant',
      renderCell: (_v, m) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{m.companyName}</span>
      ),
    },
    {
      key: 'merchantType',
      header: 'Type',
      renderCell: (_v, m) => <span className="text-slate-600 dark:text-slate-300">{m.merchantType}</span>,
      width: '110px',
    },
    {
      key: 'merchantStatus',
      header: 'Status',
      renderCell: (_v, m) => <span className="text-slate-600 dark:text-slate-300">{m.merchantStatus}</span>,
      width: '110px',
    },
    {
      key: 'gracePeriodPhase',
      header: 'Grace phase',
      renderCell: (_v, m) => <span className="text-slate-600 dark:text-slate-300">{m.gracePeriodPhase}</span>,
      width: '130px',
    },
    {
      key: 'healthScore',
      header: 'Health',
      align: 'right',
      renderCell: (_v, m) => (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
              style={{ width: `${Math.min(100, Math.max(0, m.healthScore))}%` }}
            />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{m.healthScore}</span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'riskClassification',
      header: 'Risk',
      align: 'right',
      renderCell: (_v, m) => (
        <ATMBadge label={m.riskClassification} color={RISK_COLOR[m.riskClassification] ?? 'primary'} size="sm" />
      ),
      width: '110px',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={UserMinus}
        iconColor="rose"
        title="Churn Report"
        subtitle={`Deboarding, token lapses, and at-risk merchants — ${WINDOW_LABEL[windowChoice].toLowerCase()}`}
        extraActions={
          <ReportExportMenu report="churn" window={range} disabled={isLoading || isError} />
        }
      />

      {isError && (
        <ReportError
          message={errorMessage}
          onRetry={() => {
            void churnQuery.refetch();
          }}
        />
      )}

      <ReportWindowTabs value={windowChoice} onChange={setWindowChoice} />

      {isLoading ? (
        <ReportKpis>
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
        </ReportKpis>
      ) : churn ? (
        <ReportKpis>
          <ATMStatsCard
            label="Enterprise Deboaded"
            value={churn.enterpriseCancellations.toLocaleString()}
            icon={Building2}
            variant="rose"
            description="Enterprise merchants cancelled in window"
          />
          <ATMStatsCard
            label="Enterprise Churn Rate"
            value={`${churn.enterpriseChurnRate}%`}
            icon={TrendingDown}
            variant="amber"
            description="Share of Enterprise base this window"
          />
          <ATMStatsCard
            label="Standalone Lapses"
            value={churn.standaloneLapses.toLocaleString()}
            icon={UserMinus}
            variant="slate"
            description="Expired Standalone tokens not renewed"
          />
          <ATMStatsCard
            label="Standalone Lapse Rate"
            value={`${churn.standaloneLapseRate}%`}
            icon={HeartPulse}
            variant="indigo"
            description="Share of Standalone tokens lapsed"
          />
        </ReportKpis>
      ) : null}

      <ATMCard title="Churn Reasons">
        {(churn?.topReasons.length ?? 0) === 0 ? (
          // 2026-08-31: this used to be a five-slice pie with invented percentages.
          // The deboarding workflow records a free-text reason on the merchant record
          // but nothing aggregates it into categories yet, so the API returns none.
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <ShieldAlert className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No churn reasons are categorised yet.
            </p>
            <p className="max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Deboarding captures a free-text reason per merchant; the platform does not yet
              roll those up into reason categories, so there is nothing to chart here.
            </p>
          </div>
        ) : (
          <ATMTable columns={reasonColumns} data={[...(churn?.topReasons ?? [])]} emptyMessage="No reasons recorded." />
        )}
      </ATMCard>

      <ATMCard
        title="At-Risk Merchants"
        loading={healthQuery.isLoading}
        action={
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {churn ? `${churn.atRiskMerchants} flagged by wallet grace state` : ''}
          </span>
        }
        padding="none"
        className="overflow-hidden"
      >
        {healthQuery.isLoading ? (
          <ATMSkeleton variant="rect" height="220px" />
        ) : healthQuery.isError ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-red-600 dark:text-red-400">
            <span>{(healthQuery.error as any)?.data?.message || 'Failed to load merchant health.'}</span>
          </div>
        ) : atRisk.length === 0 ? (
          <ReportEmpty text="No merchant is currently classified as at risk." className="h-32" />
        ) : (
          <ATMTable columns={atRiskColumns} data={atRisk} emptyMessage="No at-risk merchants." />
        )}
      </ATMCard>

      {/* 2026-08-31: the monthly "Churn Rate Trend" chart is gone. The API reports
          churn for the selected window as a whole, not as a month-by-month series;
          the old chart plotted twelve invented data points. Change the window above
          to compare periods. */}
    </div>
  );
}

export default ChurnReportPage;