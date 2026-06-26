import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from './chartColors';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';

// ---------------------------------------------------------------------------
// FRS-SAP-102: Merchant Growth Metrics
// ---------------------------------------------------------------------------

export interface GrowthDataPoint {
  readonly month: string;
  readonly signups: number;
  readonly churns: number;
  readonly netGrowth: number;
  readonly enterpriseSignups?: number;
  readonly standaloneSignups?: number;
}

export interface SourceAttributionEntry {
  readonly source: string;
  readonly count: number;
  readonly percentage: number;
}

export interface CohortRetentionEntry {
  readonly cohort: string;
  readonly month0: number;
  readonly month1: number;
  readonly month2: number;
  readonly month3: number;
  readonly month6: number;
  readonly month12: number;
}

export interface GrowthChartProps {
  data: readonly GrowthDataPoint[];
  period?: string;
  loading?: boolean;
  className?: string;
  /** Show merchant type breakdown bars */
  showTypeBreakdown?: boolean;
}

export interface SourceAttributionChartProps {
  data: readonly SourceAttributionEntry[];
  conversionRate?: number;
  loading?: boolean;
  className?: string;
}

export interface CohortRetentionTableProps {
  data: readonly CohortRetentionEntry[];
  loading?: boolean;
  className?: string;
}

const LEGEND_MAP: Record<string, string> = {
  signups: 'New Signups',
  churns: 'Churns',
  netGrowth: 'Net Growth',
  enterpriseSignups: 'Enterprise',
  standaloneSignups: 'Standalone',
};

const SOURCE_COLORS: Record<string, string> = {
  Organic: '#22c55e',
  Paid: '#3b82f6',
  Referral: '#8b5cf6',
  Sales: '#f59e0b',
};

/**
 * FRS-SAP-102: Merchant growth chart — stacked area (signups vs churns)
 * with a net-growth line overlay and optional type breakdown.
 */
export function GrowthChart({ data, loading, className, showTypeBreakdown }: GrowthChartProps) {
  if (loading) return <ChartSkeleton height="360px" className={className} />;
  if (!data.length) return <ChartEmptyState className={className} />;

  const gradientId = useMemo(() => `growth-${Math.random().toString(36).slice(2, 8)}`, []);
  const hasTypeBreakdown = showTypeBreakdown && data.some((d) => d.enterpriseSignups != null);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data as GrowthDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${gradientId}-signups`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.growth.main} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_COLORS.growth.main} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${gradientId}-churns`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.churn.main} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_COLORS.churn.main} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={((value: number, name: string) => [value, LEGEND_MAP[name] ?? name]) as never}
            cursor={{ stroke: '#6b7280', strokeDasharray: '3 3' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value: string) => LEGEND_MAP[value] ?? value}
          />
          {hasTypeBreakdown ? (
            <>
              <Bar
                dataKey="enterpriseSignups"
                fill={CHART_COLORS.enterprise.main}
                stackId="type"
                radius={[0, 0, 0, 0]}
                animationDuration={800}
              />
              <Bar
                dataKey="standaloneSignups"
                fill={CHART_COLORS.standalone.main}
                stackId="type"
                radius={[3, 3, 0, 0]}
                animationDuration={800}
              />
            </>
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="signups"
                stroke={CHART_COLORS.growth.main}
                strokeWidth={2}
                fill={`url(#${gradientId}-signups)`}
                stackId="growth"
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="churns"
                stroke={CHART_COLORS.churn.main}
                strokeWidth={2}
                fill={`url(#${gradientId}-churns)`}
                stackId="growth"
                animationDuration={800}
                animationEasing="ease-out"
              />
            </>
          )}
          <Line
            type="monotone"
            dataKey="netGrowth"
            stroke={CHART_COLORS.enterprise.main}
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * FRS-SAP-102: Source attribution donut chart.
 * Shows signup sources: Organic, Paid, Referral, Sales with conversion rate.
 */
export function SourceAttributionChart({ data, conversionRate, loading, className }: SourceAttributionChartProps) {
  if (loading) return <ChartSkeleton height="280px" className={className} />;
  if (!data.length) return <ChartEmptyState message="No attribution data available." className={className} />;

  return (
    <div className={className}>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={240}>
          <PieChart>
            <Pie
              data={data as SourceAttributionEntry[]}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="count"
              nameKey="source"
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.source}
                  fill={SOURCE_COLORS[entry.source] ?? '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={((value: number, name: string) => [
                `${value} (${data.find((d) => d.source === name)?.percentage ?? 0}%)`,
                name,
              ]) as never}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {data.map((entry) => (
            <div key={entry.source} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: SOURCE_COLORS[entry.source] ?? '#94a3b8' }}
                />
                <span className="text-gray-700 dark:text-gray-300">{entry.source}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.count}</span>
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  ({entry.percentage}%)
                </span>
              </div>
            </div>
          ))}
          {conversionRate != null && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Signup → Active Conversion</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{conversionRate}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * FRS-SAP-102: Cohort retention table.
 * Shows retention percentages across month cohorts.
 */
export function CohortRetentionTable({ data, loading, className }: CohortRetentionTableProps) {
  if (loading) return <ChartSkeleton height="200px" className={className} />;
  if (!data.length) return <ChartEmptyState message="No retention data available." className={className} />;

  const columns = ['M0', 'M1', 'M2', 'M3', 'M6', 'M12'];
  const fields = ['month0', 'month1', 'month2', 'month3', 'month6', 'month12'] as const;

  function cellColor(value: number): string {
    if (value >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (value >= 60) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    if (value >= 40) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    if (value >= 20) return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">Cohort</th>
              {columns.map((col) => (
                <th key={col} className="px-2 py-1.5 text-center font-medium text-gray-500 dark:text-gray-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.cohort}>
                <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                  {row.cohort}
                </td>
                {fields.map((field) => (
                  <td key={field} className="px-1 py-1">
                    <span
                      className={`inline-flex w-full items-center justify-center rounded px-2 py-0.5 text-[10px] font-medium ${cellColor(row[field])}`}
                    >
                      {row[field]}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
