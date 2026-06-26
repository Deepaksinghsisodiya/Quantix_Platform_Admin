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
import { TOKEN_TIER_COLORS, CHART_COLORS, TOOLTIP_STYLE } from './chartColors';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';

export interface TokenMetricsDataPoint {
  readonly month: string;
  readonly basic: number;
  readonly standard: number;
  readonly advance: number;
  readonly premium: number;
  readonly revenue: number;
}

export interface TokenMetricsChartProps {
  data: readonly TokenMetricsDataPoint[];
  period?: string;
  loading?: boolean;
  className?: string;
}

const TIER_KEYS = ['basic', 'standard', 'advance', 'premium'] as const;
const TIER_LABELS: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  advance: 'Advance',
  premium: 'Premium',
  revenue: 'Token Revenue',
};

function formatCurrencyAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

/**
 * FRS-SAP-109: Token generation metrics chart.
 * Stacked bars for tokens by tier with a revenue line overlay.
 */
export function TokenMetricsChart({ data, loading, className }: TokenMetricsChartProps) {
  if (loading) return <ChartSkeleton height="360px" className={className} />;
  if (!data.length) return <ChartEmptyState message="No token data available." className={className} />;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data as TokenMetricsDataPoint[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="tokens"
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tickFormatter={formatCurrencyAxis}
            tick={{ fontSize: 11 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              const label = TIER_LABELS[name] ?? name;
              if (name === 'revenue') {
                return [formatCurrencyAxis(value), label];
              }
              return [value.toLocaleString(), label];
            }) as never}
            cursor={{ fill: 'rgba(107, 114, 128, 0.06)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value: string) => TIER_LABELS[value] ?? value}
          />
          {TIER_KEYS.map((tier) => (
            <Bar
              key={tier}
              yAxisId="tokens"
              dataKey={tier}
              stackId="tokens"
              fill={TOKEN_TIER_COLORS[tier.charAt(0).toUpperCase() + tier.slice(1)]}
              radius={tier === 'premium' ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
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
