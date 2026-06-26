import React, { useState } from 'react';
import { ATMBadge, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ExportButton } from '@/shared/components/ExportButton';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Server, Database, RefreshCw, Zap, Key } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const SYNC_FREQUENCY = [
  { month: 'Apr', syncs: 142000, apiCalls: 890000 },
  { month: 'May', syncs: 156000, apiCalls: 945000 },
  { month: 'Jun', syncs: 168000, apiCalls: 1020000 },
  { month: 'Jul', syncs: 175000, apiCalls: 1080000 },
  { month: 'Aug', syncs: 189000, apiCalls: 1150000 },
  { month: 'Sep', syncs: 195000, apiCalls: 1210000 },
  { month: 'Oct', syncs: 208000, apiCalls: 1290000 },
  { month: 'Nov', syncs: 215000, apiCalls: 1350000 },
  { month: 'Dec', syncs: 198000, apiCalls: 1200000 },
  { month: 'Jan', syncs: 225000, apiCalls: 1420000 },
  { month: 'Feb', syncs: 232000, apiCalls: 1480000 },
  { month: 'Mar', syncs: 245000, apiCalls: 1560000 },
];

// Activity heatmap: hour of day (0-23) x day of week (0-6)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function generateHeatmapValues(): number[][] {
  return DAYS.map((_, dayIdx) =>
    HOURS.map((hour) => {
      // Simulate realistic patterns: higher during business hours, lower on weekends
      const isWeekend = dayIdx >= 5;
      const isBusinessHour = hour >= 9 && hour <= 21;
      const isPeak = hour >= 11 && hour <= 14;
      let base = isWeekend ? 20 : 40;
      if (isBusinessHour) base += isWeekend ? 15 : 35;
      if (isPeak) base += isWeekend ? 10 : 25;
      return Math.floor(base + Math.random() * 20);
    }),
  );
}

const HEATMAP_DATA = generateHeatmapValues();

const TOP_USERS = [
  { name: 'Metro Hospitality Group', type: 'Enterprise' as const, transactions: 48200, apiCalls: 185000, storage: '4.2 GB' },
  { name: 'Coastal Dining Co', type: 'Enterprise' as const, transactions: 42100, apiCalls: 162000, storage: '3.8 GB' },
  { name: 'Urban Eats Network', type: 'Enterprise' as const, transactions: 38500, apiCalls: 148000, storage: '3.5 GB' },
  { name: 'Sakura Restaurant Chain', type: 'Enterprise' as const, transactions: 35200, apiCalls: 135000, storage: '3.1 GB' },
  { name: 'Fresh Market Holdings', type: 'Enterprise' as const, transactions: 31800, apiCalls: 122000, storage: '2.8 GB' },
  { name: 'Pixel Electronics', type: 'Enterprise' as const, transactions: 28400, apiCalls: 109000, storage: '2.5 GB' },
  { name: 'Peak Retail Corp', type: 'Enterprise' as const, transactions: 25100, apiCalls: 96000, storage: '2.2 GB' },
  { name: 'Brew Brothers Franchise', type: 'Enterprise' as const, transactions: 22800, apiCalls: 87000, storage: '1.9 GB' },
  { name: 'Noodle House Express', type: 'Standalone' as const, transactions: 8200, apiCalls: 31000, storage: '680 MB' },
  { name: 'Golden Dragon', type: 'Standalone' as const, transactions: 6500, apiCalls: 24000, storage: '520 MB' },
];

// ---------------------------------------------------------------------------
// Heatmap color helper
// ---------------------------------------------------------------------------

function heatmapColor(value: number): string {
  if (value >= 80) return 'bg-blue-600 dark:bg-blue-500';
  if (value >= 60) return 'bg-blue-400 dark:bg-blue-400';
  if (value >= 40) return 'bg-blue-300 dark:bg-blue-600/50';
  if (value >= 20) return 'bg-blue-200 dark:bg-blue-800/60';
  return 'bg-blue-50 dark:bg-blue-900/30';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function UsageReportPage() {
  const [loading] = useState(false);

  const handleExport = (_format: ReportExportFormat) => {
    // stub
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Usage Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform activity, API usage, and engagement metrics
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Enterprise metrics */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enterprise Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Activity className="h-3.5 w-3.5" />
                Transactions (MTD)
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                {(428000).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Server className="h-3.5 w-3.5" />
                API Calls (MTD)
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                {(1560000).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Database className="h-3.5 w-3.5" />
                Storage Used
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                128.4 GB
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Events (MTD)
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                {(245000).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Standalone metrics */}
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Standalone Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Key className="h-3.5 w-3.5" />
                Token Activations (MTD)
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                {(1043).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Zap className="h-3.5 w-3.5" />
                Est. Active Terminals
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                {(3842).toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Sync frequency chart */}
      <ATMCard title="Sync & API Activity" action={
        <span className="text-xs text-gray-500 dark:text-gray-400">12 months</span>
      }>
        {loading ? (
          <ATMSkeleton variant="rect" height="320px" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={SYNC_FREQUENCY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={((value: number) => value.toLocaleString()) as never}
                contentStyle={{
                  backgroundColor: 'var(--color-surface, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="syncs" name="Sync Events" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="apiCalls" name="API Calls" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ATMCard>

      {/* Activity heatmap */}
      <ATMCard title="Activity Heatmap" action={
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Intensity by hour of day and day of week
        </span>
      }>
        {loading ? (
          <ATMSkeleton variant="rect" height="240px" />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Hour labels */}
              <div className="mb-1 flex">
                <div className="w-10 shrink-0" />
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500"
                  >
                    {h % 3 === 0 ? `${h}:00` : ''}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {DAYS.map((day, dayIdx) => (
                <div key={day} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-10 shrink-0 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                  {HOURS.map((hour) => (
                    <div
                      key={`${day}-${hour}`}
                      className={cn(
                        'flex-1 aspect-square rounded-sm transition-colors',
                        heatmapColor(HEATMAP_DATA[dayIdx]![hour]!),
                      )}
                      title={`${day} ${hour}:00 - Activity: ${HEATMAP_DATA[dayIdx]![hour]!}`}
                    />
                  ))}
                </div>
              ))}
              {/* Legend */}
              <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <div className="h-3 w-3 rounded-sm bg-blue-50 dark:bg-blue-900/30" />
                <div className="h-3 w-3 rounded-sm bg-blue-200 dark:bg-blue-800/60" />
                <div className="h-3 w-3 rounded-sm bg-blue-300 dark:bg-blue-600/50" />
                <div className="h-3 w-3 rounded-sm bg-blue-400 dark:bg-blue-400" />
                <div className="h-3 w-3 rounded-sm bg-blue-600 dark:bg-blue-500" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </ATMCard>

      {/* Top 10 by activity */}
      <ATMCard title="Top 10 Users by Activity">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Merchant</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Transactions</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">API Calls</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {TOP_USERS.map((row, idx) => (
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
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.transactions.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.apiCalls.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">{row.storage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>
      {/* FRS-SAP-705: Merchant Behavior & Adoption Insights */}
      <ATMCard title="Behavior & Adoption Insights">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-4">
          {[
            { label: 'Onboarding Rate', value: '84%', desc: 'Complete all steps' },
            { label: 'Feature Adoption', value: '62%', desc: 'Use 3+ features' },
            { label: 'Time to First Txn', value: '3.2 days', desc: 'Enterprise avg' },
            { label: 'Token Renewal Rate', value: '78%', desc: 'Standalone avg' },
            { label: 'Tier Upgrade Rate', value: '12%', desc: 'Standalone quarterly' },
            { label: 'Health Score (avg)', value: '72/100', desc: 'All merchants' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{m.value}</p>
              <p className="text-[10px] text-gray-400">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Enterprise Feature Adoption</h4>
            <div className="space-y-1.5">
              {[
                { feature: 'Multi-location', adoption: 45 },
                { feature: 'API access', adoption: 62 },
                { feature: 'Webhook notifications', adoption: 38 },
                { feature: 'Custom reports', adoption: 28 },
                { feature: 'Cloud sync', adoption: 95 },
              ].map((f) => (
                <div key={f.feature} className="flex items-center gap-2 text-xs">
                  <span className="w-32 text-gray-700 dark:text-gray-300">{f.feature}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.adoption}%` }} />
                  </div>
                  <span className="w-8 text-right text-gray-500">{f.adoption}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Standalone Patterns</h4>
            <div className="space-y-1.5">
              {[
                { pattern: 'Token renewed on time', rate: 78 },
                { pattern: 'Upgraded tier at renewal', rate: 12 },
                { pattern: 'Purchased bulk (5+)', rate: 34 },
                { pattern: 'Used support within 30d', rate: 22 },
                { pattern: 'Activated within 48h', rate: 89 },
              ].map((p) => (
                <div key={p.pattern} className="flex items-center gap-2 text-xs">
                  <span className="w-40 text-gray-700 dark:text-gray-300">{p.pattern}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.rate}%` }} />
                  </div>
                  <span className="w-8 text-right text-gray-500">{p.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ATMCard>
    </div>
  );
}

export default UsageReportPage;
