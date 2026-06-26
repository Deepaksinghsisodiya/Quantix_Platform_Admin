import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { canAccess } from '@/lib/utils/permissions';
import { useDashboardWidgetStore } from '@/lib/store/dashboardWidgetStore';
import type { DashboardViewPreset } from '@/lib/store/dashboardWidgetStore';
import { useAuthStore } from '@/lib/store/authStore';
import { ROUTES } from '@/lib/config/routes';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import {
  RevenueChart,
  GrowthChart,
  SourceAttributionChart,
  CohortRetentionTable,
  MerchantHeatmap,
  CommissionChart,
  TokenMetricsChart,
} from '../components/charts';
import type { MerchantType } from '@/lib/types';
import type {
  PlatformDashboardDto,
  MerchantGrowthDto,
  RevenueMetricsDto,
  SystemHealthDto,
  UsageMetricsDto,
  MerchantHealthDto,
  TokenMetricsDashboardDto,
  CommissionDashboardDto,
} from '@/lib/api/dashboard';
import {
  Users,
  UserPlus,
  DollarSign,
  Activity,
  TicketCheck,
  Key,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  RefreshCw,
  Pause,
  Play,
  LayoutGrid,
  Eye,
  EyeOff,
  ExternalLink,
  Wrench,
  Globe,
  CreditCard,
  Percent,
} from 'lucide-react';

type DateRangeKey = '7d' | '30d' | '90d' | '12m';

const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '12m', label: '12 months' },
];

const TYPE_FILTERS: { value: 'All' | MerchantType; label: string }[] = [
  { value: 'All', label: 'All Types' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Standalone', label: 'Standalone' },
];

const VIEW_PRESETS: DashboardViewPreset[] = [
  'Default',
  'Enterprise Focus',
  'Standalone Focus',
  'Revenue',
  'Support',
];

interface AdminDashboardProps {
  summaryQuery: any;
  growthQuery: any;
  revenueQuery: any;
  systemHealthQuery: any;
  usageQuery: any;
  merchantHealthQuery: any;
  tokenMetricsQuery: any;
  commissionQuery: any;
  dateRange: DateRangeKey;
  setDateRange: (range: DateRangeKey) => void;
  merchantTypeFilter: 'All' | MerchantType;
  setMerchantType: (type: 'All' | MerchantType) => void;
  paused: boolean;
  secondsUntilRefresh: number;
  toggleRefresh: () => void;
  refreshNow: () => void;
  isLoadingHeader: boolean;
  hasError: boolean;
}

interface KpiCardData {
  title: string;
  icon: React.ReactNode;
  value: string;
  trend?: { value: number; direction: 'up' | 'down' };
  details: { label: string; value: string }[];
  color: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  permission: { module: string; action: string };
}

interface ServiceStatus {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  responseTimeMs: number;
  uptime: string;
}

// Adapt functions (bridging server shapes to charts)
function adaptRevenueData(metrics: RevenueMetricsDto | undefined, filter: 'All' | MerchantType): any[] {
  if (!metrics) return [];
  return metrics.lines.map((l) => {
    const enterprise = filter === 'Enterprise' ? l.amount : filter === 'All' ? l.amount : 0;
    const standalone = filter === 'Standalone' ? l.amount : 0;
    return {
      month: l.label,
      enterprise,
      standalone,
      mrr: l.amount,
      arr: l.amount * 12,
    };
  });
}

function adaptGrowthData(growth: MerchantGrowthDto | undefined): any[] {
  if (!growth) return [];
  return growth.cohorts.map((c) => ({
    month: c.cohortLabel,
    signups: c.merchantCount,
    churns: Math.max(0, c.merchantCount - c.stillActive),
    netGrowth: c.stillActive,
  }));
}

function adaptSourceAttribution(growth: MerchantGrowthDto | undefined): any[] {
  if (!growth) return [];
  return growth.sourceAttribution.map((s) => ({
    source: s.source,
    count: s.count,
    percentage: s.percentage,
  }));
}

function adaptCohortRetention(growth: MerchantGrowthDto | undefined): any[] {
  if (!growth) return [];
  return growth.cohorts.map((c) => ({
    cohort: c.cohortLabel,
    month0: 100,
    month1: c.retentionRate,
    month2: c.retentionRate,
    month3: c.retentionRate,
    month6: c.retentionRate,
    month12: c.retentionRate,
  }));
}

function adaptMerchantHealth(rows: readonly MerchantHealthDto[] | undefined): any[] {
  if (!rows) return [];
  return rows.map((r) => {
    const activity =
      r.riskClassification === 'AtRisk' ? 'atRisk'
      : r.healthScore >= 70 ? 'active'
      : r.healthScore >= 40 ? 'low'
      : 'inactive';
    return {
      merchantId: r.merchantId,
      name: r.companyName,
      activity,
      lastSeen: r.lastActivityAt ?? r.lastLoginAt ?? '—',
      transactionsLast7d: Math.round(Number(r.orderVolumeThisMonth) || 0),
      merchantType: r.merchantType,
      tokenBalance: r.tokenBalance > 0 ? r.tokenBalance : 0,
      usageRate: null,
      churnRiskScore: 100 - r.healthScore,
    };
  });
}

function adaptCommissionTrend(summary: CommissionDashboardDto | undefined): any[] {
  if (!summary) return [];
  return summary.trend.map((t) => ({
    month: t.month,
    earned: t.amount,
    rate: 0,
  }));
}

function adaptServices(health: SystemHealthDto | undefined): ServiceStatus[] {
  if (!health) return [];
  return (health.services ?? []).map((s) => ({
    name: s.serviceName,
    status: (s.status as ServiceStatus['status']) || 'Healthy',
    responseTimeMs: 0,
    uptime: '—',
  }));
}

function adaptTokenMetrics(_: TokenMetricsDashboardDto | undefined): any[] {
  return [];
}

// Fade in component
function StaggeredFadeIn({ index, children, className }: { index: number; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('animate-fade-in-up opacity-0', className)}
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}

// KPI widget card
function KpiCard({ card, index }: { card: KpiCardData; index: number }) {
  const isPositive = card.trend?.direction === 'up';
  return (
    <StaggeredFadeIn index={index}>
      <div
        className={cn(
          'rounded-2xl border-y border-r border-l-4 border-gray-100 bg-white p-5',
          'dark:border-gray-800 dark:bg-gray-900',
          'transition-all duration-300 hover:shadow-lg hover:border-accent-500/20 dark:hover:border-accent-500/10 shadow-sm',
        )}
        style={{ borderLeftColor: card.color }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-550 dark:text-gray-400">
              {card.icon}
              {card.title}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value}
            </p>
          </div>
          {card.trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold',
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400',
              )}
            >
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(card.trend.value)}%
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          {card.details.map((d) => (
            <div
              key={d.label}
              className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
            >
              <span className="font-medium">{d.label}</span>
              <span className="font-bold text-gray-700 dark:text-gray-250">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </StaggeredFadeIn>
  );
}

// Service status widget card
function ServiceCard({ service }: { service: ServiceStatus }) {
  const statusConfig = {
    Healthy: { icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />, badge: 'success' as const },
    Degraded: { icon: <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />, badge: 'warning' as const },
    Unhealthy: { icon: <XCircle className="h-4.5 w-4.5 text-red-500" />, badge: 'danger' as const },
  };
  const config = statusConfig[service.status] ?? statusConfig.Healthy;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3',
        'dark:border-gray-800 dark:bg-gray-900/60',
        'transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700',
      )}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
          {service.name}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          {service.responseTimeMs > 0 ? `${service.responseTimeMs}ms / ` : ''}{service.uptime} uptime
        </p>
      </div>
      <StatusBadge status={config.badge} label={service.status} />
    </div>
  );
}

// Customize widget configuration panel
function WidgetConfigPanel({ onClose }: { onClose: () => void }) {
  const { widgets, toggleWidget, reorderWidget, activePreset, setPreset, resetToDefault } =
    useDashboardWidgetStore();

  const ordered = useMemo(
    () => [...widgets].sort((a, b) => a.order - b.order),
    [widgets],
  );

  return (
    <ATMCard title="Configure Widgets" extra={<button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600">Close</button>}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Views</p>
          <div className="flex flex-wrap gap-1.5">
            {VIEW_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPreset(preset)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                  activePreset === preset
                    ? 'bg-accent-600 text-white shadow-md shadow-accent-500/25'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Sections (top to bottom)</p>
          <ul className="space-y-1">
            {ordered.map((widget, idx) => (
              <li
                key={widget.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50/50 hover:bg-gray-100/50 dark:text-gray-300 dark:bg-gray-950/40 dark:hover:bg-gray-900/60 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={widget.visible}
                  onChange={() => toggleWidget(widget.id)}
                  className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500 dark:border-gray-800"
                  aria-label={`Toggle ${widget.visible}`}
                />
                {widget.visible ? (
                  <Eye className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="flex-1 truncate">{widget.label}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reorderWidget(widget.id, idx - 1)}
                    disabled={idx === 0}
                    className={cn(
                      'rounded p-1 text-gray-400 transition-colors',
                      idx === 0
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200',
                    )}
                    aria-label={`Move ${widget.label} up`}
                    title="Move up"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 rotate-[-45deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderWidget(widget.id, idx + 1)}
                    disabled={idx === ordered.length - 1}
                    className={cn(
                      'rounded p-1 text-gray-400 transition-colors',
                      idx === ordered.length - 1
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200',
                    )}
                    aria-label={`Move ${widget.label} down`}
                    title="Move down"
                  >
                    <ArrowDownRight className="h-3.5 w-3.5 rotate-45" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={resetToDefault}
          className="text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          Reset to Default
        </button>
      </div>
    </ATMCard>
  );
}

// Mini stat displays
function StatMini({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('text-center bg-gray-50/50 dark:bg-gray-950/20 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800', className)}>
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  summaryQuery,
  growthQuery,
  revenueQuery,
  systemHealthQuery,
  usageQuery,
  merchantHealthQuery,
  tokenMetricsQuery,
  commissionQuery,
  dateRange,
  setDateRange,
  merchantTypeFilter,
  setMerchantType,
  paused,
  secondsUntilRefresh,
  toggleRefresh,
  refreshNow,
  isLoadingHeader,
  hasError,
}) => {
  const navigate = useNavigate();
  const { widgets } = useDashboardWidgetStore();
  const { user, permissions } = useAuthStore();
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showTypeBreakdown, setShowTypeBreakdown] = useState(false);

  const summary: PlatformDashboardDto | undefined = summaryQuery.data?.data;
  const growth: MerchantGrowthDto | undefined = growthQuery.data?.data;
  const revenue: RevenueMetricsDto | undefined = revenueQuery.data?.data;
  const systemHealth: SystemHealthDto | undefined = systemHealthQuery.data?.data;
  const usage: UsageMetricsDto | undefined = usageQuery.data?.data;
  const merchantHealthRows = merchantHealthQuery.data?.data;
  const tokenMetrics: TokenMetricsDashboardDto | undefined = tokenMetricsQuery.data?.data;
  const commission: CommissionDashboardDto | undefined = commissionQuery.data?.data;

  // Derive KPI data
  const kpiCards: KpiCardData[] = useMemo(() => {
    const currency = summary?.revenueCurrency ?? 'USD';
    return [
      {
        title: 'Total Active Merchants',
        icon: <Users className="h-3.5 w-3.5" />,
        value: (summary?.activeMerchants ?? 0).toLocaleString(),
        details: [
          { label: 'Enterprise', value: (summary?.enterpriseMerchants ?? 0).toLocaleString() },
          { label: 'Standalone', value: (summary?.standaloneMerchants ?? 0).toLocaleString() },
          { label: 'Total', value: (summary?.totalMerchants ?? 0).toLocaleString() },
        ],
        color: '#3b82f6',
      },
      {
        title: 'New Signups (Month)',
        icon: <UserPlus className="h-3.5 w-3.5" />,
        value: (summary?.newSignupsThisMonth ?? 0).toLocaleString(),
        details: [
          { label: 'Enterprise', value: (summary?.enterpriseSignupsThisMonth ?? 0).toLocaleString() },
          { label: 'Standalone', value: (summary?.standaloneSignupsThisMonth ?? 0).toLocaleString() },
        ],
        color: '#06b6d4',
      },
      {
        title: 'Total Revenue (Month)',
        icon: <DollarSign className="h-3.5 w-3.5" />,
        value: formatCurrency(summary?.totalRevenueThisMonth ?? 0, currency),
        details: [
          { label: 'Subscription', value: formatCurrency(summary?.subscriptionRevenue ?? 0, currency) },
          { label: 'Token Sales', value: formatCurrency(summary?.tokenRevenue ?? 0, currency) },
          { label: 'Commission', value: formatCurrency(summary?.commissionRevenue ?? 0, currency) },
        ],
        color: '#8b5cf6',
      },
      {
        title: 'MRR / ARR',
        icon: <Activity className="h-3.5 w-3.5" />,
        value: formatCurrency(summary?.mrr ?? 0, currency),
        details: [
          { label: 'ARR', value: formatCurrency(summary?.arr ?? 0, currency) },
          { label: 'Enterprise ARPU', value: formatCurrency(revenue?.enterpriseARPU ?? 0, currency) },
          { label: 'Standalone ARPU', value: formatCurrency(revenue?.standaloneARPU ?? 0, currency) },
        ],
        color: '#22c55e',
      },
      {
        title: 'Open Tickets',
        icon: <TicketCheck className="h-3.5 w-3.5" />,
        value: (summary?.openSupportTickets ?? 0).toLocaleString(),
        details: [
          { label: 'In Grace Period', value: (summary?.merchantsInGracePeriod ?? 0).toLocaleString() },
          { label: 'Compliance Pending', value: (summary?.pendingComplianceRequests ?? 0).toLocaleString() },
        ],
        color: '#f59e0b',
      },
      {
        title: 'Token Generation',
        icon: <Key className="h-3.5 w-3.5" />,
        value: (tokenMetrics?.totalGenerated ?? 0).toLocaleString(),
        details: [
          { label: 'Active', value: (tokenMetrics?.activeTokens ?? 0).toLocaleString() },
          { label: 'Expired', value: (tokenMetrics?.expiredTokens ?? 0).toLocaleString() },
          { label: 'Revenue', value: formatCurrency(tokenMetrics?.revenueFromTokens ?? 0, tokenMetrics?.revenueCurrency ?? 'USD') },
        ],
        color: '#ec4899',
      },
    ];
  }, [summary, revenue, tokenMetrics]);

  // Derived Quick Actions (with permission filtering)
  const allQuickActions: QuickAction[] = useMemo(
    () => [
      {
        label: 'Register Enterprise Merchant',
        icon: <Plus className="h-4 w-4" />,
        route: ROUTES.TENANTS.REGISTER_ENTERPRISE,
        color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10',
        permission: { module: 'merchants', action: 'create' },
      },
      {
        label: 'Register Standalone Merchant',
        icon: <Plus className="h-4 w-4" />,
        route: ROUTES.TENANTS.REGISTER_STANDALONE,
        color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10',
        permission: { module: 'merchants', action: 'create' },
      },
      {
        label: 'Generate Recharge Token',
        icon: <Key className="h-4 w-4" />,
        route: ROUTES.TOKENS.GENERATE,
        color: 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/10',
        permission: { module: 'token', action: 'generate' },
      },
      {
        label: 'View Open Tickets',
        icon: <TicketCheck className="h-4 w-4" />,
        route: ROUTES.SUPPORT.TICKETS,
        color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
        permission: { module: 'tickets', action: 'view' },
      },
      {
        label: 'View Overdue Invoices',
        icon: <CreditCard className="h-4 w-4" />,
        route: ROUTES.BILLING.INVOICES,
        color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
        permission: { module: 'invoices', action: 'view' },
      },
      {
        label: 'View Commission Overview',
        icon: <Percent className="h-4 w-4" />,
        route: ROUTES.COMMISSION.OVERVIEW,
        color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
        permission: { module: 'commission', action: 'view' },
      },
      {
        label: 'Trigger Maintenance',
        icon: <Wrench className="h-4 w-4" />,
        route: ROUTES.SETTINGS.PLATFORM,
        color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
        permission: { module: 'settings', action: 'update' },
      },
      {
        label: 'Platform Settings',
        icon: <Settings className="h-4 w-4" />,
        route: ROUTES.SETTINGS.PLATFORM,
        color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
        permission: { module: 'settings', action: 'update' },
      },
    ],
    [],
  );

  const quickActions = useMemo(
    () =>
      user
        ? allQuickActions.filter((a) =>
            canAccess(user.role, a.permission.module, a.permission.action, permissions),
          )
        : [],
    [allQuickActions, user, permissions],
  );

  // Adapt query results
  const revenueData = useMemo(() => adaptRevenueData(revenue, merchantTypeFilter), [revenue, merchantTypeFilter]);
  const growthData = useMemo(() => adaptGrowthData(growth), [growth]);
  const sourceAttribution = useMemo(() => adaptSourceAttribution(growth), [growth]);
  const cohortRetention = useMemo(() => adaptCohortRetention(growth), [growth]);
  const heatmapData = useMemo(() => adaptMerchantHealth(merchantHealthRows), [merchantHealthRows]);
  const commissionTrend = useMemo(() => adaptCommissionTrend(commission), [commission]);
  const tokenChartData = useMemo(() => adaptTokenMetrics(tokenMetrics), [tokenMetrics]);
  const services = useMemo(() => adaptServices(systemHealth), [systemHealth]);

  const filteredHeatmapData = useMemo(() => {
    if (merchantTypeFilter === 'All') return heatmapData;
    return heatmapData.filter((t) => t.merchantType === merchantTypeFilter);
  }, [heatmapData, merchantTypeFilter]);

  const commissionStats = useMemo(() => {
    const currency = commission?.currencyCode ?? 'USD';
    return {
      totalEarnedMonth: formatCurrency(commission?.totalEarnedCurrentMonth ?? 0, currency),
      pendingSettlement: formatCurrency(commission?.pendingSettlement ?? 0, currency),
      ytdEarned: formatCurrency(
        commissionTrend.reduce((sum, t) => sum + t.earned, 0),
        currency,
      ),
      lastMonth: formatCurrency(commissionTrend[commissionTrend.length - 1]?.earned ?? 0, currency),
    };
  }, [commission, commissionTrend]);

  const statusPageUrl = 'https://status.quantix.io';

  // Mapping slots to sections
  const widgetSlots: Record<string, React.ReactNode> = {
    'kpi-cards': (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingHeader
          ? Array.from({ length: 6 }, (_, i) => (
              <ATMSkeleton key={i} height="140px" className="rounded-2xl animate-pulse" />
            ))
          : kpiCards.map((card, i) => (
              <KpiCard key={card.title} card={card} index={i} />
            ))}
      </div>
    ),
    'revenue-chart': (
      <ATMCard
        title="Revenue Trend"
        extra={<span className="text-xs font-semibold text-gray-500">By period</span>}
      >
        <RevenueChart data={revenueData} period={dateRange} loading={revenueQuery.isLoading} />
      </ATMCard>
    ),
    'growth-chart': (
      <ATMCard
        title="Merchant Growth"
        extra={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTypeBreakdown((v) => !v)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
                showTypeBreakdown
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400',
              )}
            >
              By Type
            </button>
            <span className="text-xs font-medium text-gray-500">
              Signups vs Churns
            </span>
          </div>
        }
      >
        <GrowthChart
          data={growthData}
          period={dateRange}
          loading={growthQuery.isLoading}
          showTypeBreakdown={showTypeBreakdown}
        />
      </ATMCard>
    ),
    'source-attribution': (
      <ATMCard
        title="Signup Source Attribution"
        extra={
          <span className="text-xs font-semibold text-gray-500">
            {sourceAttribution.length} sources tracked
          </span>
        }
      >
        <SourceAttributionChart
          data={sourceAttribution}
          loading={growthQuery.isLoading}
        />
      </ATMCard>
    ),
    'active-users': (
      <ATMCard
        title="Active Users & Usage"
        extra={
          <span className="text-xs font-semibold text-gray-500">
            {usage?.fromDate ? `${dateRange} window` : 'Live'}
          </span>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatMini label="Active Users" value={(summary?.activeUsers ?? 0).toLocaleString()} />
            <StatMini label="Transactions" value={(usage?.totalTransactions ?? 0).toLocaleString()} />
            <StatMini label="Orders" value={(usage?.totalOrders ?? 0).toLocaleString()} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatMini label="API Calls (Ent.)" value={
              usage?.totalApiCalls
                ? usage.totalApiCalls >= 1_000_000
                  ? `${(usage.totalApiCalls / 1_000_000).toFixed(1)}M`
                  : usage.totalApiCalls.toLocaleString()
                : '0'
            } />
            <StatMini label="Storage (MB)" value={(usage?.storageUsedMb ?? 0).toLocaleString()} />
            <StatMini label="Bridge Health" value={
              usage?.bridgeHealthPercent != null ? `${usage.bridgeHealthPercent.toFixed(0)}%` : '—'
            } />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-accent-500" />
              <span>Top Merchants by Transaction Volume</span>
            </p>
            <div className="space-y-2">
              {(usage?.perMerchant ?? []).slice(0, 5).map((t) => {
                const total = (usage?.totalTransactions ?? 1) || 1;
                const pct = Math.min(100, Math.round((Number(t.transactions) / total) * 100));
                return (
                  <div key={t.merchantId} className="flex items-center gap-3 text-xs font-semibold">
                    <span className="w-32 text-gray-700 dark:text-gray-300 truncate">{t.companyName}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-accent-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-right text-gray-500 dark:text-gray-400">
                      {Number(t.transactions).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {(!usage || (usage.perMerchant?.length ?? 0) === 0) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No usage data in this window.</p>
              )}
            </div>
          </div>
        </div>
      </ATMCard>
    ),
    'merchant-heatmap': (
      <ATMCard
        title="Merchant Health"
        extra={
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>{filteredHeatmapData.length} merchants</span>
            <ATMBadge color="success" label={`${filteredHeatmapData.filter((t) => t.activity === 'active').length} active`} />
            <ATMBadge color="danger" label={`${filteredHeatmapData.filter((t) => t.activity === 'atRisk').length} at risk`} />
          </div>
        }
      >
        <MerchantHeatmap
          data={filteredHeatmapData}
          loading={merchantHealthQuery.isLoading}
          onMerchantClick={(id) => navigate(ROUTES.TENANTS.DETAIL(id))}
        />
      </ATMCard>
    ),
    'commission-overview': (
      <ATMCard
        title="Commission Overview"
        extra={
          <button
            type="button"
            onClick={() => navigate(ROUTES.COMMISSION.OVERVIEW)}
            className="text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            View Details
          </button>
        }
      >
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatMini label="This Month" value={commissionStats.totalEarnedMonth} />
          <StatMini label="YTD" value={commissionStats.ytdEarned} />
          <StatMini label="Last Month" value={commissionStats.lastMonth} />
          <StatMini label="Pending" value={commissionStats.pendingSettlement} />
        </div>
        <CommissionChart data={commissionTrend} loading={commissionQuery.isLoading} />

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Top Earning Merchants</p>
          <div className="space-y-1.5">
            {(commission?.topMerchants ?? []).slice(0, 5).map((m, i) => (
              <div key={m.merchantId} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-gray-400 dark:text-gray-500">{i + 1}.</span>
                  <span className="text-gray-700 dark:text-gray-300">{m.companyName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">{m.transactionCount} txns</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(m.amount, commission?.currencyCode ?? 'USD')}
                  </span>
                </div>
              </div>
            ))}
            {(!commission || (commission.topMerchants?.length ?? 0) === 0) && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">No commission earned yet.</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Rate Distribution</p>
          <div className="flex gap-2">
            {(commission?.rateDistribution ?? []).map((d) => (
              <div
                key={d.bucket}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 text-center dark:border-gray-800 dark:bg-gray-950/20"
              >
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{d.bucket}</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{d.merchantCount} merchants</p>
              </div>
            ))}
            {(!commission || (commission.rateDistribution?.length ?? 0) === 0) && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">No rate buckets configured.</p>
            )}
          </div>
        </div>
      </ATMCard>
    ),
    'token-metrics': (
      <ATMCard
        title="Standalone Token Metrics"
        extra={
          <button
            type="button"
            onClick={() => navigate(ROUTES.TOKENS.LIST)}
            className="text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            View All Tokens
          </button>
        }
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <StatMini label="Generated" value={(tokenMetrics?.totalGenerated ?? 0).toLocaleString()} />
          <StatMini label="Active" value={(tokenMetrics?.activeTokens ?? 0).toLocaleString()} />
          <StatMini label="Consumed" value={(tokenMetrics?.consumedTokens ?? 0).toLocaleString()} />
          <StatMini label="Expired" value={(tokenMetrics?.expiredTokens ?? 0).toLocaleString()} />
          <StatMini label="Revoked" value={(tokenMetrics?.revokedTokens ?? 0).toLocaleString()} />
          <StatMini
            label="Revenue"
            value={formatCurrency(
              tokenMetrics?.revenueFromTokens ?? 0,
              tokenMetrics?.revenueCurrency ?? 'USD',
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {tokenChartData.length > 0 ? (
              <TokenMetricsChart data={tokenChartData} period={dateRange} loading={tokenMetricsQuery.isLoading} />
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-950/20">
                Per-tier time series not yet exposed by the server.
                Summary KPIs above reflect current totals.
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Renewal Rate</p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/20">
              <p className="text-2xl font-extrabold text-accent-600 dark:text-accent-400">
                {((tokenMetrics?.renewalRate ?? 0) * 100).toFixed(1)}%
              </p>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                Projected depletion: <span className="font-bold text-gray-700 dark:text-gray-300">{(tokenMetrics?.projectedDepletionDays ?? 0).toFixed(0)} days</span>
              </p>
            </div>
          </div>
        </div>
      </ATMCard>
    ),
    'revenue-breakdown': (
      <ATMCard
        title="Revenue Breakdown"
        extra={
          <button
            type="button"
            onClick={() => navigate(ROUTES.REPORTS.REVENUE)}
            className="text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            Full Report
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Enterprise Revenue Split</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-650 dark:text-gray-400">Subscription</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.subscriptionRevenue ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-655 dark:text-gray-400">Usage</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.usageRevenue ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-655 dark:text-gray-400">Commission</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.commissionRevenue ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-800" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-655 dark:text-gray-400">Standalone Token Sales</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.tokenSalesRevenue ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Per-Merchant Averages (ARPU)</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-650 dark:text-gray-400">Enterprise ARPU</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.enterpriseARPU ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-655 dark:text-gray-400">Standalone ARPU</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.standaloneARPU ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-800" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Total in Window</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenue?.totalRevenue ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Revenue Movement</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-gray-655 dark:text-gray-400">MRR (current)</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(revenue?.mrr ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-gray-655 dark:text-gray-400">Churn</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">
                  -{formatCurrency(revenue?.churnRevenue ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>ARR (annualised)</span>
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {formatCurrency(revenue?.arr ?? 0, revenue?.currencyCode ?? 'USD')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ATMCard>
    ),
    'cohort-retention': (
      <ATMCard
        title="Cohort Retention"
        extra={
          <span className="text-xs font-semibold text-gray-500">
            % of merchants retained per cohort
          </span>
        }
      >
        <CohortRetentionTable data={cohortRetention} loading={growthQuery.isLoading} />
      </ATMCard>
    ),
    'quick-actions': quickActions.length > 0 ? (
      <ATMCard title="Quick Actions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.route)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]',
                action.color,
              )}
            >
              {action.icon}
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>
      </ATMCard>
    ) : null,
    'system-health': (
      <ATMCard
        title="System Health"
        extra={
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500">
              {(systemHealth?.activeIncidents ?? 0)} active incident{(systemHealth?.activeIncidents ?? 0) !== 1 ? 's' : ''}
              {systemHealth?.uptimePercent != null && (
                <> &middot; uptime {systemHealth.uptimePercent.toFixed(2)}%</>
              )}
            </span>
            <a
              href={statusPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
            >
              Status Page
              <ExternalLink className="h-3 w-3" />
            </a>
            <StatusBadge
              status={
                services.every((s) => s.status === 'Healthy')
                  ? 'success'
                  : services.some((s) => s.status === 'Unhealthy')
                    ? 'danger'
                    : 'warning'
              }
              label={
                services.length === 0
                  ? 'Loading…'
                  : services.every((s) => s.status === 'Healthy')
                    ? 'Operational'
                    : 'Degraded'
              }
            />
          </div>
        }
      >
        {systemHealthQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ATMSkeleton key={i} height="60px" className="rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        )}
      </ATMCard>
    ),
  };

  const visibleSorted = [...widgets]
    .sort((a, b) => a.order - b.order)
    .filter((w) => w.visible);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Platform overview and key metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-550 bg-gray-50 dark:bg-gray-950/30 px-3 h-9 rounded-xl border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={toggleRefresh}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
              title={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={refreshNow}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors animate-in duration-300"
              title="Refresh now"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {!paused && <span className="tabular-nums font-mono text-gray-400">{secondsUntilRefresh}s</span>}
          </div>

          <button
            type="button"
            onClick={() => setShowWidgetConfig((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 h-9 text-xs font-bold transition-all duration-300 hover:shadow-sm',
              showWidgetConfig
                ? 'border-accent-300 bg-accent-50 text-accent-700 dark:border-accent-600 dark:bg-accent-950/20 dark:text-accent-400'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Customize
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 h-9 items-center">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setDateRange(range.key)}
                  className={cn(
                    'rounded-lg px-3 h-7 flex items-center justify-center text-xs font-bold transition-all duration-300 uppercase tracking-wider',
                    dateRange === range.key
                      ? 'bg-gray-950 text-white dark:bg-gray-50 dark:text-gray-950 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {hasError && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-xs font-bold text-red-700 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-300 flex items-center gap-2.5">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>One or more dashboard queries failed. Some sections may show stale data.</span>
          <button
            type="button"
            onClick={() => void refreshNow()}
            className="underline ml-auto font-black hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Type filter pills */}
      <div className="inline-flex items-center gap-1 bg-gray-50/60 dark:bg-gray-950/30 p-1 rounded-xl border border-gray-200 dark:border-gray-800 h-9">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">Filter:</span>
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setMerchantType(filter.value)}
            className={cn(
              'rounded-lg px-3.5 h-7 flex items-center justify-center text-xs font-bold transition-all duration-300 uppercase tracking-wider',
              merchantTypeFilter === filter.value
                ? 'bg-accent-600 text-white shadow-sm shadow-accent-500/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {showWidgetConfig && (
        <StaggeredFadeIn index={0}>
          <WidgetConfigPanel onClose={() => setShowWidgetConfig(false)} />
        </StaggeredFadeIn>
      )}

      {visibleSorted.map((w, i) => (
        <StaggeredFadeIn key={w.id} index={i}>
          {widgetSlots[w.id]}
        </StaggeredFadeIn>
      ))}
    </div>
  );
};

export default AdminDashboard;
