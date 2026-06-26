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

export interface RevenueDataPoint {
  readonly month: string;
  readonly enterprise: number;
  readonly standalone: number;
  readonly mrr: number;
  readonly arr: number;
}

export interface RevenueChartProps {
  data: readonly RevenueDataPoint[];
  period?: string;
  loading?: boolean;
  className?: string;
}

function formatCurrencyAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatTooltipValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * FRS-SAP-103: MRR/ARR revenue trend chart.
 * Area chart with two fills — Enterprise (blue) and Standalone (green).
 */
export function RevenueChart({ data, loading, className }: RevenueChartProps) {
  if (loading) return <ChartSkeleton height="360px" className={className} />;
  if (!data.length) return <ChartEmptyState className={className} />;

  const gradientId = useMemo(() => `rev-gradient-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data as RevenueDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${gradientId}-enterprise`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.enterprise.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.enterprise.main} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${gradientId}-standalone`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.standalone.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.standalone.main} stopOpacity={0.02} />
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
            tickFormatter={formatCurrencyAxis}
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={((value: number, name: string) => [
              formatTooltipValue(value),
              name === 'enterprise' ? 'Enterprise' : 'Standalone',
            ]) as never}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: '#6b7280', strokeDasharray: '3 3' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value: string) =>
              value === 'enterprise' ? 'Enterprise Revenue' : 'Standalone Revenue'
            }
          />
          <Area
            type="monotone"
            dataKey="enterprise"
            stroke={CHART_COLORS.enterprise.main}
            strokeWidth={2}
            fill={`url(#${gradientId}-enterprise)`}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="standalone"
            stroke={CHART_COLORS.standalone.main}
            strokeWidth={2}
            fill={`url(#${gradientId}-standalone)`}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
