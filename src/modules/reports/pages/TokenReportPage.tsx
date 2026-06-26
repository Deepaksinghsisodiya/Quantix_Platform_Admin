import React, { useState } from 'react';
import { ATMBadge, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ExportButton } from '@/shared/components/ExportButton';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Key, Clock, RefreshCw, DollarSign } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const TOKENS_BY_PERIOD = [
  { month: 'Apr', basic: 320, standard: 180, advance: 90, premium: 35 },
  { month: 'May', basic: 345, standard: 195, advance: 102, premium: 40 },
  { month: 'Jun', basic: 360, standard: 210, advance: 108, premium: 42 },
  { month: 'Jul', basic: 380, standard: 220, advance: 115, premium: 48 },
  { month: 'Aug', basic: 395, standard: 235, advance: 120, premium: 51 },
  { month: 'Sep', basic: 410, standard: 240, advance: 128, premium: 55 },
  { month: 'Oct', basic: 430, standard: 255, advance: 135, premium: 58 },
  { month: 'Nov', basic: 445, standard: 268, advance: 142, premium: 62 },
  { month: 'Dec', basic: 420, standard: 250, advance: 130, premium: 56 },
  { month: 'Jan', basic: 460, standard: 280, advance: 148, premium: 67 },
  { month: 'Feb', basic: 475, standard: 290, advance: 155, premium: 72 },
  { month: 'Mar', basic: 498, standard: 305, advance: 162, premium: 78 },
];

const TOKEN_STATUS = [
  { name: 'Active', value: 4280, color: '#10b981' },
  { name: 'Expired', value: 1850, color: '#9ca3af' },
  { name: 'Consumed', value: 3420, color: '#6366f1' },
  { name: 'Revoked', value: 310, color: '#ef4444' },
];

const RENEWAL_TREND = [
  { month: 'Apr', rate: 62 },
  { month: 'May', rate: 63 },
  { month: 'Jun', rate: 61 },
  { month: 'Jul', rate: 64 },
  { month: 'Aug', rate: 65 },
  { month: 'Sep', rate: 64 },
  { month: 'Oct', rate: 66 },
  { month: 'Nov', rate: 67 },
  { month: 'Dec', rate: 63 },
  { month: 'Jan', rate: 68 },
  { month: 'Feb', rate: 69 },
  { month: 'Mar', rate: 67 },
];

const TIER_BREAKDOWN = [
  { tier: 'Basic', generated: 4938, active: 1820, expired: 980, avgLifetime: 98, revenue: 148140 },
  { tier: 'Standard', generated: 2928, active: 1240, expired: 520, avgLifetime: 142, revenue: 234240 },
  { tier: 'Advance', generated: 1535, active: 780, expired: 240, avgLifetime: 168, revenue: 306700 },
  { tier: 'Premium', generated: 664, active: 440, expired: 110, avgLifetime: 210, revenue: 265600 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TokenReportPage() {
  const [loading] = useState(false);

  const handleExport = (_format: ReportExportFormat) => {
    // stub
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Token Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Token generation, lifecycle, and revenue analysis by tier
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              Avg Lifetime
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">142 days</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-3.5 w-3.5" />
              Renewal Rate
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">67%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Key className="h-3.5 w-3.5" />
              Total Generated (YTD)
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {TIER_BREAKDOWN.reduce((s, t) => s + t.generated, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <DollarSign className="h-3.5 w-3.5" />
              Token Revenue (YTD)
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(TIER_BREAKDOWN.reduce((s, t) => s + t.revenue, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Stacked bar chart + Status pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Tokens Generated by Tier" action={
          <span className="text-xs text-gray-500 dark:text-gray-400">12 months, stacked</span>
        }>
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={TOKENS_BY_PERIOD} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Bar dataKey="basic" name="Basic" stackId="tokens" fill="#93c5fd" radius={[0, 0, 0, 0]} />
                <Bar dataKey="standard" name="Standard" stackId="tokens" fill="#6366f1" />
                <Bar dataKey="advance" name="Advance" stackId="tokens" fill="#a855f7" />
                <Bar dataKey="premium" name="Premium" stackId="tokens" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        <ATMCard title="Token Status Distribution">
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={TOKEN_STATUS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} (${value.toLocaleString()})`}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {TOKEN_STATUS.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number) => value.toLocaleString()) as never}
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
      </div>

      {/* Renewal rate trend */}
      <ATMCard title="Renewal Rate Trend" action={
        <span className="text-xs text-gray-500 dark:text-gray-400">12 months</span>
      }>
        {loading ? (
          <ATMSkeleton variant="rect" height="280px" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={RENEWAL_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                domain={[50, 80]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={((value: number) => `${value}%`) as never}
                contentStyle={{
                  backgroundColor: 'var(--color-surface, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                name="Renewal Rate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      {/* Per-tier breakdown table */}
      <ATMCard title="Per-Tier Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tier</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Generated</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Active</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Expired</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Avg Lifetime</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {TIER_BREAKDOWN.map((row) => (
                <tr key={row.tier}>
                  <td className="py-3">
                    <ATMBadge variant="default" size="sm">{row.tier}</ATMBadge>
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.generated.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.active.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.expired.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.avgLifetime} days
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="font-semibold">
                <td className="py-3 text-gray-900 dark:text-gray-100">Total</td>
                <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                  {TIER_BREAKDOWN.reduce((s, t) => s + t.generated, 0).toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                  {TIER_BREAKDOWN.reduce((s, t) => s + t.active, 0).toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                  {TIER_BREAKDOWN.reduce((s, t) => s + t.expired, 0).toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-gray-100">142 days</td>
                <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatCurrency(TIER_BREAKDOWN.reduce((s, t) => s + t.revenue, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ATMCard>
      {/* FRS-SAP-710: Token Consumption & Activation Analytics */}
      <ATMCard title="Token Consumption Analytics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Consumed</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">4,832</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Revoked</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">127</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Activation Lag</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">2.4 days</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue / Token (avg)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(79.80)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Activation lag = average time between token generation and first terminal activation. Lower is better — indicates smooth merchant onboarding.
        </p>
      </ATMCard>
    </div>
  );
}

export default TokenReportPage;
