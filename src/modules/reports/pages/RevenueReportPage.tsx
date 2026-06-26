import React, { useState } from 'react';
import { ATMBadge, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ExportButton } from '@/shared/components/ExportButton';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const REVENUE_BREAKDOWN = [
  { name: 'Subscriptions', value: 3120000, color: '#6366f1' },
  { name: 'Token Sales', value: 998400, color: '#10b981' },
  { name: 'Commission', value: 201300, color: '#f59e0b' },
  { name: 'Usage Fees', value: 165000, color: '#ec4899' },
];

const REVENUE_TREND = [
  { month: 'Apr', subscriptions: 232000, tokens: 72000, commission: 12400, usage: 11000, total: 327400 },
  { month: 'May', subscriptions: 241000, tokens: 77500, commission: 13200, usage: 11500, total: 343200 },
  { month: 'Jun', subscriptions: 254000, tokens: 81200, commission: 14100, usage: 12000, total: 361300 },
  { month: 'Jul', subscriptions: 263000, tokens: 84800, commission: 14800, usage: 12400, total: 375000 },
  { month: 'Aug', subscriptions: 278000, tokens: 88300, commission: 15900, usage: 13000, total: 395200 },
  { month: 'Sep', subscriptions: 287000, tokens: 92100, commission: 16500, usage: 13500, total: 409100 },
  { month: 'Oct', subscriptions: 299000, tokens: 96400, commission: 17400, usage: 14000, total: 426800 },
  { month: 'Nov', subscriptions: 311000, tokens: 100200, commission: 18200, usage: 14600, total: 444000 },
  { month: 'Dec', subscriptions: 320000, tokens: 94800, commission: 17100, usage: 14200, total: 446100 },
  { month: 'Jan', subscriptions: 333000, tokens: 104500, commission: 19700, usage: 15200, total: 472400 },
  { month: 'Feb', subscriptions: 344000, tokens: 108900, commission: 20500, usage: 15800, total: 489200 },
  { month: 'Mar', subscriptions: 358000, tokens: 113200, commission: 21500, usage: 16400, total: 509100 },
];

const ARPU_BY_TYPE = [
  { type: 'Enterprise - Basic', arpu: 180, merchants: 245 },
  { type: 'Enterprise - Standard', arpu: 340, merchants: 312 },
  { type: 'Enterprise - Advance', arpu: 520, merchants: 189 },
  { type: 'Enterprise - Premium', arpu: 890, merchants: 88 },
  { type: 'Standalone - Basic', arpu: 45, merchants: 198 },
  { type: 'Standalone - Standard', arpu: 85, merchants: 142 },
  { type: 'Standalone - Advance', arpu: 130, merchants: 73 },
];

const TOP_CONTRIBUTORS = [
  { name: 'Metro Hospitality Group', type: 'Enterprise' as const, plan: 'Premium', revenue: 42800 },
  { name: 'Coastal Dining Co', type: 'Enterprise' as const, plan: 'Premium', revenue: 38200 },
  { name: 'Urban Eats Network', type: 'Enterprise' as const, plan: 'Advance', revenue: 31500 },
  { name: 'Sakura Restaurant Chain', type: 'Enterprise' as const, plan: 'Premium', revenue: 28900 },
  { name: 'Fresh Market Holdings', type: 'Enterprise' as const, plan: 'Advance', revenue: 25400 },
  { name: 'Pixel Electronics', type: 'Enterprise' as const, plan: 'Standard', revenue: 22100 },
  { name: 'Peak Retail Corp', type: 'Enterprise' as const, plan: 'Advance', revenue: 19800 },
  { name: 'Brew Brothers Franchise', type: 'Enterprise' as const, plan: 'Standard', revenue: 17600 },
  { name: 'Garden Plate Cafes', type: 'Enterprise' as const, plan: 'Standard', revenue: 15300 },
  { name: 'Noodle House Express', type: 'Standalone' as const, plan: 'Advance', revenue: 12800 },
];

// Summaries
const totalBreakdown = REVENUE_BREAKDOWN.reduce((s, d) => s + d.value, 0);
const latestMonth = REVENUE_TREND[REVENUE_TREND.length - 1]!;
const mrr = latestMonth.total;
const arr = mrr * 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function RevenueReportPage() {
  const [loading] = useState(false);

  const handleExport = (_format: ReportExportFormat) => {
    // stub
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Revenue Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Revenue breakdown, trends, and top contributors
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* MRR/ARR cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <DollarSign className="h-3.5 w-3.5" />
              MRR
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(mrr)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-3.5 w-3.5" />
              ARR
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(arr)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-3.5 w-3.5" />
              Total Revenue (YTD)
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(totalBreakdown)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <DollarSign className="h-3.5 w-3.5" />
              Avg ARPU
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(mrr / 1247)}
            </p>
          </div>
        </div>
      )}

      {/* Revenue breakdown (pie) + Trend (area) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Revenue by Stream">
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={REVENUE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={(({ name, percent }: { name: string; percent?: number }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  ) as never}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {REVENUE_BREAKDOWN.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number) => formatCurrency(value)) as never}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        <ATMCard title="Revenue Trend" action={
          <span className="text-xs text-gray-500 dark:text-gray-400">12 months</span>
        }>
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={((value: number) => formatCurrency(value)) as never}
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
                  dataKey="total"
                  name="Total Revenue"
                  stroke="#6366f1"
                  fill="url(#revTotalGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ATMCard>
      </div>

      {/* ARPU by type */}
      <ATMCard title="ARPU by Plan Type">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type / Plan</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">ARPU</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Merchants</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">MRR Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {ARPU_BY_TYPE.map((row) => (
                <tr key={row.type}>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.type}</td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(row.arpu)}</td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.merchants.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {formatCurrency(row.arpu * row.merchants)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>

      {/* Top contributors */}
      <ATMCard title="Top 10 Revenue Contributors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Merchant</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Revenue (MRR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {TOP_CONTRIBUTORS.map((row, idx) => (
                <tr key={row.name}>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.name}</td>
                  <td className="py-3">
                    <ATMBadge
                      variant={row.type === 'Enterprise' ? 'enterprise' : 'standalone'}
                      size="sm"
                    >
                      {row.type}
                    </ATMBadge>
                  </td>
                  <td className="py-3">
                    <ATMBadge variant="default" size="sm">{row.plan}</ATMBadge>
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>
      {/* FRS-SAP-702: LTV & Token RPU */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Customer Lifetime Value (LTV)">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Enterprise LTV (avg)</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(8420)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Standalone LTV (avg)</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(2180)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Blended LTV</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(5890)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Calculated as ARPU × avg lifetime (months). Enterprise avg lifetime: 24 months. Standalone avg lifetime: 14 months.
            </p>
          </div>
        </ATMCard>
        <ATMCard title="Revenue Per User">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Enterprise ARPU (monthly)</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(369.78)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Standalone Token RPU (monthly)</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(155.60)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Token RPU = total token revenue ÷ active Standalone merchants ÷ months. Standalone merchants purchase tokens on-demand, not monthly.
            </p>
          </div>
        </ATMCard>
      </div>
    </div>
  );
}

export default RevenueReportPage;
