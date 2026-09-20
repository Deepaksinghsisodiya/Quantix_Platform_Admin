import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from './chartColors';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';

/** 2026-08-30: mirrors the server's RevenueLineDto — a period label and its total. */
export interface RevenueDataPoint {
  readonly month: string;
  readonly amount: number;
  readonly merchantCount?: number;
}

export interface RevenueChartProps {
  data: readonly RevenueDataPoint[];
  period?: string;
  loading?: boolean;
  className?: string;
  /** Deployment currency for axis + tooltip formatting. */
  currency?: string;
  /** Series label — reflects the active merchant-type filter. */
  seriesLabel?: string;
}

// 2026-08-30: axis/tooltip money is formatted in the DEPLOYMENT currency passed by the
// caller — the '$' literals and the hardcoded USD Intl format misprinted every figure in
// a non-USD deployment.
function makeAxisFormatter(currency: string | undefined) {
  // 2026-09-05: no 'USD' fallback — plain grouped numbers until the currency is known.
  const compact = (v: number, suffix: string) => {
    const options: Intl.NumberFormatOptions = currency
      ? { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'standard' }
      : { minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'standard' };
    return `${new Intl.NumberFormat(undefined, options).format(v)}${suffix}`;
  };
  return (value: number): string => {
    if (value >= 1_000_000) return compact(value / 1_000_000, 'M');
    if (value >= 1_000) return compact(value / 1_000, 'K');
    return compact(value, '');
  };
}

function makeTooltipFormatter(currency: string | undefined) {
  return (value: number): string => {
    const options: Intl.NumberFormatOptions = currency
      ? { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }
      : { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    return new Intl.NumberFormat(undefined, options).format(value);
  };
}

/**
 * FRS-SAP-103: revenue trend chart.
 *
 * 2026-08-30 (dashboard audit): was a two-series Enterprise/Standalone stack, but the
 * server's revenue lines carry only a period TOTAL — the split was invented by the
 * caller (with the "All" filter attributing 100% of revenue to Enterprise). One honest
 * series; filtering by merchant type is applied server-side.
 */
export function RevenueChart({ data, loading, className, currency, seriesLabel }: RevenueChartProps) {
  const gradientId = useMemo(() => `rev-gradient-${Math.random().toString(36).slice(2, 8)}`, []);
  const axisFormatter = useMemo(() => makeAxisFormatter(currency), [currency]);
  const tooltipFormatter = useMemo(() => makeTooltipFormatter(currency), [currency]);
  const label = seriesLabel ?? 'Revenue';

  if (loading) return <ChartSkeleton height="360px" className={className} />;
  if (!data.length) return <ChartEmptyState className={className} />;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data as RevenueDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${gradientId}-amount`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.enterprise.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.enterprise.main} stopOpacity={0.02} />
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
            tickFormatter={axisFormatter}
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            formatter={((value: number) => [tooltipFormatter(value), label]) as never}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: '#6b7280', strokeDasharray: '3 3' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={() => label}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={CHART_COLORS.enterprise.main}
            strokeWidth={2}
            fill={`url(#${gradientId}-amount)`}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
