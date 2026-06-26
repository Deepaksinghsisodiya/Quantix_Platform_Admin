import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from './chartColors';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';

export interface CommissionDataPoint {
  readonly month: string;
  readonly earned: number;
  readonly rate: number;
}

export interface CommissionChartProps {
  data: readonly CommissionDataPoint[];
  loading?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

/**
 * FRS-SAP-110: Commission overview chart.
 * Bar for earned commission + line for rate trend.
 */
export function CommissionChart({ data, loading, className }: CommissionChartProps) {
  if (loading) return <ChartSkeleton height="300px" className={className} />;
  if (!data.length) return <ChartEmptyState message="No commission data available." className={className} />;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data as CommissionDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="earned"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, 'dataMax + 2']}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              if (name === 'earned') return [formatCurrency(value), 'Commission Earned'];
              return [`${value.toFixed(1)}%`, 'Commission Rate'];
            }) as never}
            cursor={{ fill: 'rgba(107, 114, 128, 0.06)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value: string) =>
              value === 'earned' ? 'Commission Earned' : 'Commission Rate'
            }
          />
          <Bar
            yAxisId="earned"
            dataKey="earned"
            fill={CHART_COLORS.commission.main}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="rate"
            stroke={CHART_COLORS.revenue.main}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
