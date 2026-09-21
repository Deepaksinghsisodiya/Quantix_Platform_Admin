import React, { useMemo, useState } from 'react';
import { ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
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
  ResponsiveContainer,
} from 'recharts';
import { Percent, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useCommissionReport, reportWindow } from '@/lib/hooks/useReports';
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
 * FRS-SAP-708 — Commission Report
 *
 * 2026-08-31 (de-fictioned). This page made ZERO API calls (see the removed
 * narrative). It now renders GET /reports/commission-detailed: real commission
 * charges grouped by merchant, by plan and by period, with the real
 * pending/settled split derived from invoice linkage.
 * ------------------------------------------------------------------------- */

const CHART_GRID = 'var(--zen-border)';
const CHART_TICK = '#94a3b8';

function CommissionReportPage() {
  const [windowChoice, setWindowChoice] = useState<ReportWindowChoice>('12m');
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

  const hasData = (report?.byMerchant.length ?? 0) > 0 || (report?.totalEarned ?? 0) > 0;

  const merchantColumns: ATMTableColumn<{
    merchantId: string;
    companyName: string;
    transactionCount: number;
    ratePercent: number;
    totalCommission: number;
  }>[] = [
    {
      key: 'companyName',
      header: 'Merchant',
      renderCell: (_v, m) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{m.companyName}</span>
      ),
    },
    {
      key: 'transactionCount',
      header: 'Charges',
      align: 'right',
      renderCell: (_v, m) => <span className="text-slate-600 dark:text-slate-300">{m.transactionCount.toLocaleString()}</span>,
    },
    {
      key: 'ratePercent',
      header: 'Rate',
      align: 'right',
      renderCell: (_v, m) => <span className="text-slate-600 dark:text-slate-300">{m.ratePercent}%</span>,
      width: '90px',
    },
    {
      key: 'totalCommission',
      header: 'Commission',
      align: 'right',
      renderCell: (_v, m) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrencyOrDash(m.totalCommission, currency)}
        </span>
      ),
    },
  ];

  const planColumns: ATMTableColumn<{
    planName: string;
    merchantCount: number;
    totalCommission: number;
  }>[] = [
    {
      key: 'planName',
      header: 'Plan',
      renderCell: (_v, p) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{p.planName}</span>
      ),
    },
    {
      key: 'merchantCount',
      header: 'Merchants',
      align: 'right',
      renderCell: (_v, p) => <span className="text-slate-600 dark:text-slate-300">{p.merchantCount}</span>,
    },
    {
      key: 'totalCommission',
      header: 'Commission',
      align: 'right',
      renderCell: (_v, p) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrencyOrDash(p.totalCommission, currency)}
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
        icon={Percent}
        iconColor="amber"
        title="Commission Report"
        subtitle={`Commission charged to merchants — ${WINDOW_LABEL[windowChoice].toLowerCase()}`}
        extraActions={
          <ReportExportMenu report="commission" window={range} disabled={isLoading || isError} />
        }
      />

      {isError && (
        <ReportError
          message={errorMessage}
          onRetry={() => {
            void query.refetch();
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
            label="Total Charged"
            value={formatCurrencyOrDash(report.totalEarned, currency)}
            icon={TrendingUp}
            variant="amber"
            description="Commission earned, this window"
          />
          <ATMStatsCard
            label="Settled"
            value={formatCurrencyOrDash(report.settledAmount, currency)}
            icon={CheckCircle2}
            variant="emerald"
            description="Invoiced and cleared"
          />
          <ATMStatsCard
            label="Pending Invoice"
            value={formatCurrencyOrDash(report.pendingSettlement, currency)}
            icon={Clock}
            variant="slate"
            description="Charged but not yet invoiced"
          />
          <ATMStatsCard
            label="Average Rate"
            value={`${report.averageRate}%`}
            icon={Percent}
            variant="indigo"
            description="Weighted commission rate"
          />
        </ReportKpis>
      ) : null}

      {!isLoading && report && !hasData && (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          No commission was charged in this window. Commission is pulled from merchant
          revenue collections; a deployment with no Enterprise merchants trading records none.
        </div>
      )}

      <ATMCard title="Commission Over Time" loading={isLoading} skeleton={<ChartSkeleton height="300px" />}>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="300px" />
        ) : periodChart.length === 0 ? (
          <ReportEmpty text="No commission charges in this window." className="h-[300px]" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} />
              <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} stroke={CHART_TICK} width={70} />
              <Tooltip
                formatter={(v) => formatCurrencyOrDash(Number(v ?? 0), currency)}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="commission" name="Commission" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard
          title="By Merchant"
          padding="none"
          className="overflow-hidden"
          loading={isLoading}
        >
          {isLoading ? (
            <ATMSkeleton variant="rect" height="220px" />
          ) : (report?.byMerchant.length ?? 0) === 0 ? (
            <ReportEmpty text="No merchant was charged commission in this window." className="h-[220px]" />
          ) : (
            <ATMTable columns={merchantColumns} data={[...(report?.byMerchant ?? [])]} emptyMessage="No data." />
          )}
        </ATMCard>

        <ATMCard
          title="By Plan"
          padding="none"
          className="overflow-hidden"
          loading={isLoading}
        >
          {isLoading ? (
            <ATMSkeleton variant="rect" height="220px" />
          ) : (report?.byPlan.length ?? 0) === 0 ? (
            <ReportEmpty text="No commission by plan in this window." className="h-[220px]" />
          ) : (
            <ATMTable columns={planColumns} data={[...(report?.byPlan ?? [])]} emptyMessage="No data." />
          )}
        </ATMCard>
      </div>

      {/* 2026-08-31: the settlement-status pie is gone. The API reports two real
          buckets — pending invoice and settled — shown as tiles above; the old chart
          added a third "Approved" state that the commission model does not have. */}
    </div>
  );
}

export default CommissionReportPage;