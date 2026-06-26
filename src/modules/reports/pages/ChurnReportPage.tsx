import React, { useState } from 'react';
import { ATMBadge, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ExportButton } from '@/shared/components/ExportButton';
import {
  LineChart,
  Line,
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
import { UserMinus, TrendingDown, AlertTriangle, Building2 } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CHURN_TREND = [
  { month: 'Apr', enterprise: 0.8, standalone: 4.2, overall: 2.1 },
  { month: 'May', enterprise: 0.6, standalone: 3.8, overall: 1.8 },
  { month: 'Jun', enterprise: 1.0, standalone: 5.1, overall: 2.6 },
  { month: 'Jul', enterprise: 0.7, standalone: 4.0, overall: 2.0 },
  { month: 'Aug', enterprise: 0.9, standalone: 4.5, overall: 2.3 },
  { month: 'Sep', enterprise: 1.1, standalone: 5.3, overall: 2.8 },
  { month: 'Oct', enterprise: 0.8, standalone: 4.1, overall: 2.1 },
  { month: 'Nov', enterprise: 1.2, standalone: 5.6, overall: 2.9 },
  { month: 'Dec', enterprise: 1.5, standalone: 6.2, overall: 3.4 },
  { month: 'Jan', enterprise: 0.9, standalone: 4.3, overall: 2.2 },
  { month: 'Feb', enterprise: 0.7, standalone: 3.9, overall: 1.9 },
  { month: 'Mar', enterprise: 1.2, standalone: 4.8, overall: 2.8 },
];

const CHURN_REASONS = [
  { name: 'Price', value: 35, color: '#ef4444' },
  { name: 'Features', value: 25, color: '#f59e0b' },
  { name: 'Service', value: 20, color: '#6366f1' },
  { name: 'Competitor', value: 15, color: '#10b981' },
  { name: 'Other', value: 5, color: '#9ca3af' },
];

type RiskLevel = 'High' | 'Medium' | 'Low';

interface AtRiskMerchant {
  readonly id: string;
  readonly name: string;
  readonly type: 'Enterprise' | 'Standalone';
  readonly riskScore: RiskLevel;
  readonly lastActivity: string;
  readonly reason: string;
}

const AT_RISK_TENANTS: AtRiskMerchant[] = [
  { id: 'ar-001', name: 'Horizon Mart', type: 'Enterprise', riskScore: 'High', lastActivity: '2026-03-12', reason: 'No transactions for 14 days' },
  { id: 'ar-002', name: 'Cascade Wines', type: 'Standalone', riskScore: 'High', lastActivity: '2026-03-08', reason: 'Token expiring, no renewal' },
  { id: 'ar-003', name: 'Terra Firma Foods', type: 'Enterprise', riskScore: 'High', lastActivity: '2026-03-15', reason: 'Downgraded plan, low usage' },
  { id: 'ar-004', name: 'Midnight Diner', type: 'Standalone', riskScore: 'Medium', lastActivity: '2026-03-20', reason: 'Support ticket escalated' },
  { id: 'ar-005', name: 'Sahara Spice', type: 'Standalone', riskScore: 'Medium', lastActivity: '2026-03-18', reason: 'Declining transaction volume' },
  { id: 'ar-006', name: 'Rio Grill', type: 'Enterprise', riskScore: 'Medium', lastActivity: '2026-03-22', reason: 'Payment failure (2 retries)' },
  { id: 'ar-007', name: 'Amber Glow Cafe', type: 'Standalone', riskScore: 'Low', lastActivity: '2026-03-25', reason: 'Competitor inquiry detected' },
  { id: 'ar-008', name: 'Wave Rider Surf Shop', type: 'Standalone', riskScore: 'Low', lastActivity: '2026-03-26', reason: 'Reduced feature usage' },
];

const riskBadgeVariant: Record<RiskLevel, 'danger' | 'warning' | 'default'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'default',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ChurnReportPage() {
  const [loading] = useState(false);

  const handleExport = (_format: ReportExportFormat) => {
    // stub
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Churn Analysis</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Churn rates, reasons, and at-risk merchant identification
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Churn rate cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <ATMSkeleton key={i} variant="card" height="100px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Building2 className="h-3.5 w-3.5" />
              Enterprise Churn
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">1.2%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Current month</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <UserMinus className="h-3.5 w-3.5" />
              Standalone Churn
            </div>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">4.8%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Current month</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <TrendingDown className="h-3.5 w-3.5" />
              Overall Churn
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">2.8%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Current month</p>
          </div>
        </div>
      )}

      {/* Churn trend + Reasons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="Churn Rate Trend" action={
          <span className="text-xs text-gray-500 dark:text-gray-400">12 months</span>
        }>
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={CHURN_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="enterprise" name="Enterprise" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="standalone" name="Standalone" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="overall" name="Overall" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        <ATMCard title="Churn Reasons">
          {loading ? (
            <ATMSkeleton variant="rect" height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={CHURN_REASONS}
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
                  {CHURN_REASONS.map((entry) => (
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

      {/* At-risk merchants */}
      <ATMCard
        title="At-Risk Merchants"
        action={
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            {AT_RISK_TENANTS.length} identified
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Merchant</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Risk Score</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Last Activity</th>
                <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {AT_RISK_TENANTS.map((merchant) => (
                <tr key={merchant.id}>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{merchant.name}</td>
                  <td className="py-3">
                    <ATMBadge
                      variant={merchant.type === 'Enterprise' ? 'enterprise' : 'standalone'}
                      size="sm"
                    >
                      {merchant.type}
                    </ATMBadge>
                  </td>
                  <td className="py-3">
                    <ATMBadge variant={riskBadgeVariant[merchant.riskScore]} size="sm" dot>
                      {merchant.riskScore}
                    </ATMBadge>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{merchant.lastActivity}</td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{merchant.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ATMCard>
      {/* FRS-SAP-704: Pre-Churn Patterns */}
      <ATMCard title="Pre-Churn Pattern Detection">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Common behavioral indicators observed 30–60 days before churn. Use these signals for proactive intervention.
        </p>
        <div className="space-y-2">
          {[
            { pattern: 'Usage drop >50% over 30 days', frequency: '78%', type: 'Enterprise', severity: 'High' },
            { pattern: 'No login for 14+ consecutive days', frequency: '65%', type: 'Both', severity: 'High' },
            { pattern: 'Support ticket escalation to complaint', frequency: '42%', type: 'Enterprise', severity: 'Medium' },
            { pattern: 'Failed payment retry 2+ times', frequency: '38%', type: 'Enterprise', severity: 'High' },
            { pattern: 'Token not renewed within 7 days of expiry', frequency: '71%', type: 'Standalone', severity: 'High' },
            { pattern: 'Downgrade from higher tier', frequency: '35%', type: 'Both', severity: 'Medium' },
            { pattern: 'API call volume drops to near-zero', frequency: '54%', type: 'Enterprise', severity: 'Medium' },
          ].map((p) => (
            <div key={p.pattern} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.pattern}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <ATMBadge variant={p.type === 'Enterprise' ? 'enterprise' : p.type === 'Standalone' ? 'standalone' : 'default'} size="sm">{p.type}</ATMBadge>
                  <ATMBadge variant={p.severity === 'High' ? 'danger' : 'warning'} size="sm">{p.severity}</ATMBadge>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{p.frequency}</span>
            </div>
          ))}
        </div>
      </ATMCard>
    </div>
  );
}

export default ChurnReportPage;
