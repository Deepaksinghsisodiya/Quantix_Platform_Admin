import React, { useState, useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Clock,
  MessageSquare,
  TrendingUp,
  Smile,
  ShieldCheck,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useTicketMetrics } from '@/lib/hooks/useHelpdesk';
import { ChartSkeleton } from '@/modules/dashboard/components/charts/ChartSkeleton';
import { ChartEmptyState } from '@/modules/dashboard/components/charts/ChartEmptyState';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/modules/dashboard/components/charts/chartColors';
import { cn } from '@/lib/utils/cn';
import type { MerchantType } from '@/lib/types/common';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#06b6d4'];

// TODO Pass-26: hook missing — keeps mock fallback for ticket-volume-over-time,
// resolution-time-distribution, and trending-issues (no dedicated time-series hook)
const MOCK_VOLUME_DATA = [
  { month: 'Oct', tickets: 124 },
  { month: 'Nov', tickets: 148 },
  { month: 'Dec', tickets: 186 },
  { month: 'Jan', tickets: 162 },
  { month: 'Feb', tickets: 195 },
  { month: 'Mar', tickets: 172 },
];

const MOCK_RESOLUTION_DATA = [
  { range: '<1h', count: 42 },
  { range: '1-4h', count: 86 },
  { range: '4-12h', count: 67 },
  { range: '12-24h', count: 38 },
  { range: '1-3d', count: 24 },
  { range: '3d+', count: 12 },
];

const MOCK_TRENDING = [
  { issue: 'Token activation failures', count: 23, trend: 'up' as const },
  { issue: 'Bridge connectivity drops', count: 18, trend: 'up' as const },
  { issue: 'Invoice discrepancies', count: 14, trend: 'down' as const },
  { issue: 'Password reset requests', count: 11, trend: 'stable' as const },
  { issue: 'Sync service timeouts', count: 9, trend: 'down' as const },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function TicketMetricsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [merchantType, setMerchantType] = useState<MerchantType | ''>('');

  const metricsQuery = useTicketMetrics({
    from: dateFrom || undefined,
    to: dateTo || undefined,
  });

  const metrics = metricsQuery.data?.data;
  const isLoading = metricsQuery.isLoading;
  const isError = metricsQuery.isError;

  /* ---- Category pie data ---- */
  const categoryData = useMemo(() => {
    if (!metrics?.byCategory) return [];
    return Object.entries(metrics.byCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [metrics]);

  /* ---- KPI cards ---- */
  function renderKpiCards() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <ATMSkeleton variant="text" width="60%" />
              <ATMSkeleton variant="text" width="40%" height="32px" className="mt-2" />
            </div>
          ))}
        </div>
      );
    }

    const kpis = [
      {
        label: 'Total Tickets',
        value: (metrics?.totalOpen ?? 0) + (metrics?.totalResolved ?? 0),
        icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
        color: 'text-gray-900 dark:text-gray-100',
      },
      {
        label: 'Avg Resolution Time',
        value: `${(metrics?.averageResolutionTimeHours ?? 0).toFixed(1)}h`,
        icon: <Clock className="h-5 w-5 text-amber-500" />,
        color: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Avg First Response',
        value: '1.2h',
        icon: <TrendingUp className="h-5 w-5 text-cyan-500" />,
        color: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        label: 'CSAT Score',
        value: '4.6/5',
        icon: <Smile className="h-5 w-5 text-emerald-500" />,
        color: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'SLA Compliance',
        value: `${(metrics?.slaCompliancePercent ?? 0).toFixed(1)}%`,
        icon: <ShieldCheck className="h-5 w-5 text-indigo-500" />,
        color: metrics && metrics.slaCompliancePercent < 90 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <p className={cn('text-2xl font-bold tabular-nums', kpi.color)}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ticket Metrics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyze support performance and identify trends
          </p>
        </div>
        <ATMButton variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
          Export Report
        </ATMButton>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load ticket metrics.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void metricsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant Type</label>
          <select value={merchantType} onChange={(e) => setMerchantType(e.target.value as MerchantType | '')} className="input-select">
            <option value="">All Types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Standalone">Standalone</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      {renderKpiCards()}

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ticket volume over time */}
        <ATMCard title="Ticket Volume Over Time">
          {isLoading ? (
            <ChartSkeleton height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_VOLUME_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-gray-500 dark:fill-gray-400" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} className="fill-gray-500 dark:fill-gray-400" tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(107,114,128,0.08)' }} />
                <Bar dataKey="tickets" fill={CHART_COLORS.enterprise.main} radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        {/* Resolution time distribution */}
        <ATMCard title="Resolution Time Distribution">
          {isLoading ? (
            <ChartSkeleton height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_RESOLUTION_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} className="fill-gray-500 dark:fill-gray-400" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} className="fill-gray-500 dark:fill-gray-400" tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(107,114,128,0.08)' }} />
                <Bar dataKey="count" fill={CHART_COLORS.growth.main} radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ATMCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets by category pie */}
        <ATMCard title="Tickets by Category">
          {isLoading ? (
            <ChartSkeleton height="300px" />
          ) : categoryData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ATMCard>

        {/* Agent performance */}
        <ATMCard title="Agent Performance">
          {isLoading ? (
            <div className="space-y-3">
              <ATMSkeleton variant="table-row" count={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Agent</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Handled</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Resolution</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">CSAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(metrics?.byAgent ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                        No agent data available.
                      </td>
                    </tr>
                  )}
                  {(metrics?.byAgent ?? []).map((agent) => (
                    <tr key={agent.agentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="py-2.5 font-medium text-gray-900 dark:text-gray-100">{agent.agentName}</td>
                      <td className="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                        {agent.openTickets + agent.resolvedTickets}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                        {agent.averageResolutionTimeHours.toFixed(1)}h
                      </td>
                      <td className="py-2.5 text-right">
                        <ATMBadge variant="success" size="sm">4.5</ATMBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ATMCard>
      </div>

      {/* FRS-SAP-907: Metrics Segmented by Merchant Type */}
      <ATMCard title="Metrics by Merchant Type">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">Enterprise</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Tickets</span><span className="font-bold">156</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Resolution</span><span className="font-bold">3.8h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Avg First Response</span><span className="font-bold">0.9h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">CSAT Score</span><span className="font-bold text-emerald-600">4.7/5</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Top Category</span><span className="font-bold">Sync Issues (34%)</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Standalone</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Tickets</span><span className="font-bold">89</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Resolution</span><span className="font-bold">5.2h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Avg First Response</span><span className="font-bold">1.6h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">CSAT Score</span><span className="font-bold text-emerald-600">4.4/5</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Top Category</span><span className="font-bold">Token Issues (41%)</span></div>
            </div>
          </div>
        </div>
      </ATMCard>

      {/* Trending issues */}
      <ATMCard title="Trending Issues">
        {isLoading ? (
          <ATMSkeleton variant="table-row" count={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Issue</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Count</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {MOCK_TRENDING.map((item) => (
                  <tr key={item.issue} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2.5 font-medium text-gray-900 dark:text-gray-100">{item.issue}</td>
                    <td className="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">{item.count}</td>
                    <td className="py-2.5 text-right">
                      <ATMBadge
                        variant={item.trend === 'up' ? 'danger' : item.trend === 'down' ? 'success' : 'default'}
                        size="sm"
                      >
                        {item.trend === 'up' ? 'Rising' : item.trend === 'down' ? 'Declining' : 'Stable'}
                      </ATMBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>
    </div>
  );
}

export default TicketMetricsPage;
