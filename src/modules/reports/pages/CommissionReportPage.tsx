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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Percent, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const COMMISSION_BY_PERIOD = [
  { month: 'Apr', commission: 12400 },
  { month: 'May', commission: 13200 },
  { month: 'Jun', commission: 14100 },
  { month: 'Jul', commission: 14800 },
  { month: 'Aug', commission: 15900 },
  { month: 'Sep', commission: 16500 },
  { month: 'Oct', commission: 17400 },
  { month: 'Nov', commission: 18200 },
  { month: 'Dec', commission: 17100 },
  { month: 'Jan', commission: 19700 },
  { month: 'Feb', commission: 20500 },
  { month: 'Mar', commission: 21500 },
];

const MERCHANT_COMMISSIONS = [
  { name: 'Metro Hospitality Group', transactions: 48200, totalValue: 2410000, commission: 4820 },
  { name: 'Coastal Dining Co', transactions: 42100, totalValue: 2105000, commission: 4210 },
  { name: 'Urban Eats Network', transactions: 38500, totalValue: 1925000, commission: 3850 },
  { name: 'Sakura Restaurant Chain', transactions: 35200, totalValue: 1760000, commission: 3520 },
  { name: 'Fresh Market Holdings', transactions: 31800, totalValue: 1590000, commission: 3180 },
  { name: 'Pixel Electronics', transactions: 28400, totalValue: 1420000, commission: 2840 },
  { name: 'Peak Retail Corp', transactions: 25100, totalValue: 1255000, commission: 2510 },
  { name: 'Brew Brothers Franchise', transactions: 22800, totalValue: 1140000, commission: 2280 },
  { name: 'Garden Plate Cafes', transactions: 18600, totalValue: 930000, commission: 1860 },
  { name: 'Noodle House Express', transactions: 8200, totalValue: 410000, commission: 820 },
];

const SETTLEMENT_STATUS = [
  { name: 'Settled', value: 65, color: '#10b981' },
  { name: 'Approved', value: 22, color: '#6366f1' },
  { name: 'Pending', value: 13, color: '#f59e0b' },
];

const totalCommission = COMMISSION_BY_PERIOD.reduce((s, d) => s + d.commission, 0);
const avgRate = 5.0;
const minRate = 3.5;
const maxRate = 7.0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CommissionReportPage() {
  const [loading] = useState(false);

  const handleExport = (_format: ReportExportFormat) => {
    // stub
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Commission Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commission earnings, merchant breakdown, and settlement status
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Percent className="h-3.5 w-3.5" />
              Total Earned (YTD)
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(totalCommission)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Average Rate
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{avgRate}%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <ArrowDownRight className="h-3.5 w-3.5" />
              Min Rate
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{minRate}%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Max Rate
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{maxRate}%</p>
          </div>
        </div>
      )}

      {/* Commission bar chart + Settlement pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Commission by Period" action={
          <span className="text-xs text-gray-500 dark:text-gray-400">12 months</span>
        }>
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={COMMISSION_BY_PERIOD} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Bar dataKey="commission" name="Commission" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        <ATMCard title="Settlement Status">
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={SETTLEMENT_STATUS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {SETTLEMENT_STATUS.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number) => `${value}%`) as never}
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

      {/* Merchant table */}
      <ATMCard title="Commission by Merchant">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Merchant</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Transactions</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total Value</th>
                <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MERCHANT_COMMISSIONS.map((row, idx) => (
                <tr key={row.name}>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.name}</td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.transactions.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                    {formatCurrency(row.totalValue)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>
      {/* FRS-SAP-709: Commission Rate Effectiveness & Disputes */}
      <ATMCard title="Rate Effectiveness Analysis">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Rate by Plan Tier</h4>
            <div className="space-y-2">
              {[
                { plan: 'Starter', rate: 3.0, merchants: 312, avgCommission: 42 },
                { plan: 'Growth', rate: 2.5, merchants: 428, avgCommission: 89 },
                { plan: 'Business', rate: 2.0, merchants: 356, avgCommission: 156 },
                { plan: 'Enterprise', rate: 1.5, merchants: 151, avgCommission: 284 },
              ].map((p) => (
                <div key={p.plan} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.plan}</span>
                    <span className="ml-2 text-xs text-gray-500">({p.merchants} merchants)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ATMBadge variant="default" size="sm">{p.rate}%</ATMBadge>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(p.avgCommission)}/mo avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Settlement Status</h4>
            <div className="space-y-2">
              {[
                { status: 'Settled', count: 1842, amount: 186500, variant: 'success' as const },
                { status: 'Pending', count: 234, amount: 21500, variant: 'warning' as const },
                { status: 'Disputed', count: 12, amount: 3200, variant: 'danger' as const },
              ].map((s) => (
                <div key={s.status} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <ATMBadge variant={s.variant} size="sm" dot>{s.status}</ATMBadge>
                    <span className="text-xs text-gray-500">{s.count.toLocaleString()} transactions</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(s.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ATMCard>
    </div>
  );
}

export default CommissionReportPage;
