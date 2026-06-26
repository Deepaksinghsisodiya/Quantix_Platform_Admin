import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from './chartColors';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';

export interface TypeComparisonMetric {
  readonly metric: string;
  readonly enterprise: number;
  readonly standalone: number;
  readonly unit?: string;
}

export interface TypeComparisonChartProps {
  data: readonly TypeComparisonMetric[];
  loading?: boolean;
  className?: string;
}

/**
 * FRS-SAP-1606: Enterprise vs Standalone side-by-side comparison.
 * Horizontal grouped bar chart.
 */
export function TypeComparisonChart({ data, loading, className }: TypeComparisonChartProps) {
  if (loading) return <ChartSkeleton height="320px" className={className} />;
  if (!data.length) return <ChartEmptyState message="No comparison data available." className={className} />;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data as TypeComparisonMetric[]}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="metric"
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              const label = name === 'enterprise' ? 'Enterprise' : 'Standalone';
              return [value.toLocaleString(), label];
            }) as never}
            cursor={{ fill: 'rgba(107, 114, 128, 0.06)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value: string) =>
              value === 'enterprise' ? 'Enterprise' : 'Standalone'
            }
          />
          <Bar
            dataKey="enterprise"
            fill={CHART_COLORS.enterprise.main}
            radius={[0, 4, 4, 0]}
            barSize={14}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="standalone"
            fill={CHART_COLORS.standalone.main}
            radius={[0, 4, 4, 0]}
            barSize={14}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
