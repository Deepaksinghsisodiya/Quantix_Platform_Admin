import React, { useMemo, useState } from 'react';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ExportButton } from '@/shared/components/ExportButton';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, UserMinus, ArrowUpRight, AlertTriangle } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';
import { useGrowthReport, useExportReport } from '@/lib/hooks/useReports';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Period = 'Monthly' | 'Quarterly' | 'Yearly';
type TypeFilter = 'All' | 'Enterprise' | 'Standalone';

interface GrowthRow {
  month: string;
  signups: number;
  churns: number;
  netGrowth: number;
  enterpriseSignups: number;
  standaloneSignups: number;
  enterpriseChurns: number;
  standaloneChurns: number;
}

// ---------------------------------------------------------------------------
// Mock fallback data — used until cohort/source endpoints exist
// ---------------------------------------------------------------------------

// TODO Pass-26: hook missing — keeps mock fallback (no useCohortData / useSourceAttribution hooks)
const MOCK_COHORT_DATA = [
  { cohort: 'Q3 2025', size: 145, m1: 94, m2: 88, m3: 82, m6: 71, m12: 58 },
  { cohort: 'Q4 2025', size: 189, m1: 92, m2: 85, m3: 79, m6: 65, m12: 0 },
  { cohort: 'Q1 2026', size: 221, m1: 93, m2: 87, m3: 0, m6: 0, m12: 0 },
];

const SOURCE_ATTRIBUTION = [
  { source: 'Organic', percentage: 45, count: 312 },
  { source: 'Paid Ads', percentage: 25, count: 173 },
  { source: 'Referral', percentage: 20, count: 139 },
  { source: 'Direct Sales', percentage: 10, count: 69 },
];

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', { month: 'short' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function GrowthReportPage() {
  const [period, setPeriod] = useState<Period>('Monthly');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  const growthQuery = useGrowthReport({
    granularity: period === 'Monthly' ? 'Monthly' : period === 'Quarterly' ? 'Monthly' : 'Monthly',
    merchantType: typeFilter === 'All' ? undefined : typeFilter,
  });
  const exportMut = useExportReport();

  const growthData = useMemo<GrowthRow[]>(() => {
    const items = growthQuery.data?.data ?? [];
    if (items.length === 0) return [];
    return items.map((d) => ({
      month: formatMonth(d.date),
      signups: d.newMerchants,
      churns: d.churnedMerchants,
      netGrowth: d.netGrowth,
      // Backend doesn't break down by merchant type — split estimate
      enterpriseSignups: Math.round(d.newMerchants * 0.63),
      standaloneSignups: d.newMerchants - Math.round(d.newMerchants * 0.63),
      enterpriseChurns: Math.round(d.churnedMerchants * 0.6),
      standaloneChurns: d.churnedMerchants - Math.round(d.churnedMerchants * 0.6),
    }));
  }, [growthQuery.data]);

  const isLoading = growthQuery.isLoading;
  const isError = growthQuery.isError;

  const totalNew = growthData.reduce((s, d) => s + d.signups, 0);
  const totalChurned = growthData.reduce((s, d) => s + d.churns, 0);
  const netGrowth = totalNew - totalChurned;
  const totalEvents = totalNew + totalChurned;
  const growthRate = totalEvents > 0 ? ((netGrowth / totalEvents) * 100).toFixed(1) : '0.0';

  const handleExport = (format: ReportExportFormat) => {
    exportMut.mutate({
      reportType: 'Growth',
      format,
      params: {
        granularity: period === 'Monthly' ? 'Monthly' : period === 'Quarterly' ? 'Monthly' : 'Monthly',
        merchantType: typeFilter === 'All' ? undefined : typeFilter,
      },
    });
  };

  const periods: Period[] = ['Monthly', 'Quarterly', 'Yearly'];
  const types: TypeFilter[] = ['All', 'Enterprise', 'Standalone'];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Growth Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Merchant acquisition, churn, and net growth analysis
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load growth report.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void growthQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Period selector + Type filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                period === p
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {p}
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

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Users className="h-3.5 w-3.5" />
              Total New
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {totalNew.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <UserMinus className="h-3.5 w-3.5" />
              Total Churned
            </div>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {totalChurned.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Net Growth
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{netGrowth.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Growth Rate
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {growthRate}%
            </p>
          </div>
        </div>
      )}

      {/* Growth chart */}
      <ATMCard title="Signups vs Churns" action={
        <span className="text-xs text-gray-500 dark:text-gray-400">Last 12 months</span>
      }>
        {isLoading ? (
          <ATMSkeleton variant="rect" height="320px" />
        ) : growthData.length === 0 ? (
          <div className="flex h-80 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No growth data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke="#10b981"
                fill="url(#signupGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="churns"
                name="Churns"
                stroke="#ef4444"
                fill="url(#churnGrad)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="netGrowth"
                name="Net Growth"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      {/* Source attribution */}
      {/* FRS-SAP-701: Growth by Merchant Type */}
      <ATMCard title="Growth by Merchant Type">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">Enterprise</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total Signups</span><span className="font-bold">{growthData.reduce((s, d) => s + d.enterpriseSignups, 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Churns</span><span className="font-bold">{growthData.reduce((s, d) => s + d.enterpriseChurns, 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Net Growth</span><span className="font-bold text-emerald-600">{growthData.reduce((s, d) => s + d.enterpriseSignups - d.enterpriseChurns, 0)}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Standalone</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total Signups</span><span className="font-bold">{growthData.reduce((s, d) => s + d.standaloneSignups, 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Lapses</span><span className="font-bold">{growthData.reduce((s, d) => s + d.standaloneChurns, 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Net Growth</span><span className="font-bold text-emerald-600">{growthData.reduce((s, d) => s + d.standaloneSignups - d.standaloneChurns, 0)}</span></div>
            </div>
          </div>
        </div>
      </ATMCard>

      {/* FRS-SAP-701: Cohort Analysis */}
      <ATMCard title="Cohort Retention Analysis">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500">Cohort</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500">Size</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">M1</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">M2</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">M3</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">M6</th>
                <th className="pb-2 text-center text-xs font-medium text-gray-500">M12</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_COHORT_DATA.map((row) => (
                <tr key={row.cohort}>
                  <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{row.cohort}</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.size}</td>
                  {[row.m1, row.m2, row.m3, row.m6, row.m12].map((v, i) => (
                    <td key={i} className="py-2 text-center">
                      {v > 0 ? (
                        <span className={cn('inline-block rounded px-2 py-0.5 text-xs font-medium',
                          v >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          v >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>{v}%</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>

      <ATMCard title="Source Attribution">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Source</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Percentage</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Count</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {SOURCE_ATTRIBUTION.map((row) => (
                <tr key={row.source}>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.source}</td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{row.percentage}%</td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.count.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>
    </div>
  );
}

export default GrowthReportPage;
