import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { canAccess } from '@/lib/utils/permissions';
import { useDashboardWidgetStore } from '@/lib/store/dashboardWidgetStore';
import { useDashboardLayoutSync } from '@/lib/store/useDashboardLayoutSync';
import type { DashboardViewPreset } from '@/lib/store/dashboardWidgetStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useGetSetupStatusQuery } from '@/modules/settings/services/settingsApi';
import { ROUTES } from '@/lib/config/routes';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
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
  LayoutDashboard,
  Eye,
  EyeOff,
  Wrench,
  Globe,
  CreditCard,
  Percent,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

type KpiVariant = 'accent' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';

interface KpiCardData {
  title: string;
  icon: LucideIcon;
  value: string;
  description: string;
  variant: KpiVariant;
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

// Adapt functions (bridging server shapes to charts) with bulletproof Array.isArray fallbacks
// 2026-08-30: the server's revenue lines carry a period TOTAL and no per-type split, so
// the old "enterprise vs standalone" stacking was invented (with 'All' dumping every
// dollar into the enterprise series). One honest series per period; the merchant-type
// filter is already applied server-side, so the total IS the filtered total.
function adaptRevenueData(metrics: RevenueMetricsDto | undefined): any[] {
  if (!metrics || !metrics.lines || !Array.isArray(metrics.lines)) return [];
  return metrics.lines.map((l) => ({
    month: l.label,
    amount: l.amount,
    merchantCount: l.merchantCount,
  }));
}

function adaptGrowthData(growth: MerchantGrowthDto | undefined): any[] {
  if (!growth || !growth.cohorts || !Array.isArray(growth.cohorts)) return [];
  return growth.cohorts.map((c) => ({
    month: c.cohortLabel,
    signups: c.merchantCount,
    churns: Math.max(0, c.merchantCount - c.stillActive),
    netGrowth: c.stillActive,
  }));
}

function adaptSourceAttribution(growth: MerchantGrowthDto | undefined): any[] {
  if (!growth || !growth.sourceAttribution || !Array.isArray(growth.sourceAttribution)) return [];
  return growth.sourceAttribution.map((s) => ({
    source: s.source,
    count: s.count,
    percentage: s.percentage,
  }));
}

// 2026-08-30: the server returns ONE retention figure per cohort (merchants signed up,
// how many are still active). The old adapter fanned that single number across invented
// M0/M1/M2/M3/M6/M12 columns — a fabricated retention curve. Honest shape only.
function adaptCohortRetention(growth: MerchantGrowthDto | undefined): any[] {
  if (!growth || !growth.cohorts || !Array.isArray(growth.cohorts)) return [];
  return growth.cohorts.map((c) => ({
    cohort: c.cohortLabel,
    merchantCount: c.merchantCount,
    stillActive: c.stillActive,
    retentionRate: c.retentionRate,
  }));
}

function adaptMerchantHealth(rows: readonly MerchantHealthDto[] | undefined): any[] {
  if (!rows || !Array.isArray(rows)) return [];
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

// 2026-08-30: the wire has periodStart/periodEnd/commissionAmount/transactionCount —
// the old adapter read t.month / t.amount (both undefined) and hardcoded `rate: 0`,
// which drew a permanently-flat "Commission Rate" line. Volume is the real second series.
function adaptCommissionTrend(summary: CommissionDashboardDto | undefined): any[] {
  if (!summary || !summary.trend || !Array.isArray(summary.trend)) return [];
  return summary.trend.map((t) => ({
    month: new Date(t.periodStart).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
    earned: t.commissionAmount,
    transactionCount: t.transactionCount,
  }));
}

function adaptServices(health: SystemHealthDto | undefined): ServiceStatus[] {
  if (!health || !health.services || !Array.isArray(health.services)) return [];
  return health.services.map((s) => ({
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

// Service status widget card
function ServiceCard({ service }: { service: ServiceStatus }) {
  const statusConfig = {
    Healthy: { icon: <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />, badge: 'success' as const },
    Degraded: { icon: <AlertTriangle className="h-[18px] w-[18px] text-amber-500" />, badge: 'warning' as const },
    Unhealthy: { icon: <XCircle className="h-[18px] w-[18px] text-red-500" />, badge: 'danger' as const },
  };
  const config = statusConfig[service.status] ?? statusConfig.Healthy;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3.5',
        'dark:border-gray-800/80 dark:bg-[#13151a]/95',
        'transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
      )}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
          {service.name}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-mono">
          {service.responseTimeMs > 0 ? `${service.responseTimeMs}ms · ` : ''}{service.uptime} uptime
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
    <ATMCard title="Configure Widgets" extra={<button type="button" onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600">Close</button>}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Views</p>
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
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Sections (top to bottom)</p>
          <ul className="space-y-1">
            {ordered.map((widget, idx) => (
              <li
                key={widget.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/50 hover:bg-slate-100/50 dark:text-slate-300 dark:bg-slate-950/40 dark:hover:bg-slate-900/60 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={widget.visible}
                  onChange={() => toggleWidget(widget.id)}
                  className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-800"
                  aria-label={`${widget.visible ? 'Hide' : 'Show'} ${widget.label}`}
                />
                {widget.visible ? (
                  <Eye className="h-4 w-4 text-slate-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                )}
                <span className="flex-1 truncate">{widget.label}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reorderWidget(widget.id, idx - 1)}
                    disabled={idx === 0}
                    className={cn(
                      'rounded p-1 text-slate-400 transition-colors',
                      idx === 0
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200',
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
                      'rounded p-1 text-slate-400 transition-colors',
                      idx === ordered.length - 1
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200',
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
    <div className={cn('text-center bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800', className)}>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
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
  // 2026-09-04: "Customize" is saved on the user's account, not just this browser.
  useDashboardLayoutSync();
  const { user, permissions } = useAuthStore();
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showTypeBreakdown, setShowTypeBreakdown] = useState(false);

  // 2026-08-30: deployment currency (platform.currency, frozen at setup) — the fallback
  // for every money figure until its own payload arrives. Was a hardcoded 'USD' in 15
  // places, which would misprice the whole dashboard in a non-USD deployment.
  const { data: setupRes } = useGetSetupStatusQuery();
  const platformCurrency = setupRes?.data?.currency || undefined;

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
    const currency = summary?.revenueCurrency ?? platformCurrency;
    return [
      {
        title: 'Total Active Merchants',
        icon: Users,
        value: (summary?.activeMerchants ?? 0).toLocaleString(),
        description: `Enterprise ${(summary?.enterpriseMerchants ?? 0).toLocaleString()} · Standalone ${(summary?.standaloneMerchants ?? 0).toLocaleString()} · Total ${(summary?.totalMerchants ?? 0).toLocaleString()}`,
        variant: 'accent',
      },
      {
        title: 'New Signups (Month)',
        icon: UserPlus,
        value: (summary?.newSignupsThisMonth ?? 0).toLocaleString(),
        description: `Enterprise ${(summary?.enterpriseSignupsThisMonth ?? 0).toLocaleString()} · Standalone ${(summary?.standaloneSignupsThisMonth ?? 0).toLocaleString()}`,
        variant: 'indigo',
      },
      {
        title: 'Total Revenue (Month)',
        icon: DollarSign,
        value: formatCurrencyOrDash(summary?.totalRevenueThisMonth ?? 0, currency),
        description: `Subscription ${formatCurrencyOrDash(summary?.subscriptionRevenue ?? 0, currency)} · Token sales ${formatCurrencyOrDash(summary?.tokenRevenue ?? 0, currency)} · Commission ${formatCurrencyOrDash(summary?.commissionRevenue ?? 0, currency)}`,
        variant: 'purple',
      },
      {
        title: 'MRR / ARR',
        icon: Activity,
        value: formatCurrencyOrDash(summary?.mrr ?? 0, currency),
        description: `ARR ${formatCurrencyOrDash(summary?.arr ?? 0, currency)} · Enterprise ARPU ${formatCurrencyOrDash(revenue?.enterpriseARPU ?? 0, currency)} · Standalone ARPU ${formatCurrencyOrDash(revenue?.standaloneARPU ?? 0, currency)}`,
        variant: 'emerald',
      },
      {
        title: 'Open Tickets',
        icon: TicketCheck,
        value: (summary?.openSupportTickets ?? 0).toLocaleString(),
        description: `In grace period ${(summary?.merchantsInGracePeriod ?? 0).toLocaleString()} · Compliance pending ${(summary?.pendingComplianceRequests ?? 0).toLocaleString()}`,
        variant: 'amber',
      },
      // 2026-08-30: tokens exist only for Standalone merchants, and the token-metrics
      // endpoint is platform-wide (no type filter). Under an Enterprise filter this card
      // used to report Standalone token revenue right beside a $0.00 total — dropped
      // instead of showing a figure the filter can't honour.
      ...(merchantTypeFilter === 'Enterprise'
        ? []
        : [{
            title: 'Token Generation',
            icon: Key,
            value: (tokenMetrics?.totalGenerated ?? 0).toLocaleString(),
            description: `Active ${(tokenMetrics?.activeTokens ?? 0).toLocaleString()} · Expired ${(tokenMetrics?.expiredTokens ?? 0).toLocaleString()} · Revenue ${formatCurrencyOrDash(tokenMetrics?.revenueFromTokens ?? 0, tokenMetrics?.revenueCurrency ?? platformCurrency)}`,
            variant: 'rose' as const,
          }]),
    ];
  }, [summary, revenue, tokenMetrics, platformCurrency, merchantTypeFilter]);

  // Derived Quick Actions (with permission filtering)
  const allQuickActions: QuickAction[] = useMemo(
    () => [
      {
        // 2026-08-12: the two register actions collapsed into the unified onboarding wizard.
        label: 'New Merchant Signup',
        icon: <Plus className="h-4 w-4" />,
        route: '/merchants/signups/new',
        color: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
        permission: { module: 'merchants', action: 'create' },
      },
      {
        label: 'Generate Recharge Token',
        icon: <Key className="h-4 w-4" />,
        route: ROUTES.TOKENS.GENERATE,
        color: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20',
        permission: { module: 'token', action: 'generate' },
      },
      {
        label: 'View Open Tickets',
        icon: <TicketCheck className="h-4 w-4" />,
        route: ROUTES.SUPPORT.QUEUE,
        color: 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60',
        permission: { module: 'tickets', action: 'view' },
      },
      {
        label: 'View Overdue Invoices',
        icon: <CreditCard className="h-4 w-4" />,
        route: ROUTES.BILLING.INVOICES,
        color: 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60',
        permission: { module: 'invoices', action: 'view' },
      },
      {
        label: 'View Commission Overview',
        icon: <Percent className="h-4 w-4" />,
        route: ROUTES.COMMISSION.OVERVIEW,
        color: 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60',
        permission: { module: 'commission', action: 'view' },
      },
      {
        label: 'Trigger Maintenance',
        icon: <Wrench className="h-4 w-4" />,
        route: ROUTES.SETTINGS.PLATFORM,
        color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
        permission: { module: 'settings', action: 'update' },
      },
      {
        label: 'Platform Settings',
        icon: <Settings className="h-4 w-4" />,
        route: ROUTES.SETTINGS.PLATFORM,
        color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
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
  const revenueData = useMemo(() => adaptRevenueData(revenue), [revenue]);
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

  // 2026-08-30: this DTO carries no currency of its own — commission is booked in the
  // deployment currency. `totalEarnedCurrentMonth` never existed on the wire either
  // (server: totalEarnedThisMonth), so "This Month" always rendered 0.
  const commissionStats = useMemo(() => {
    const currency = platformCurrency;
    return {
      totalEarnedMonth: formatCurrencyOrDash(commission?.totalEarnedThisMonth ?? 0, currency),
      pendingSettlement: formatCurrencyOrDash(commission?.pendingSettlement ?? 0, currency),
      // All-time earned comes straight from the server; the trend is a windowed series
      // and summing it is not the same figure.
      ytdEarned: formatCurrencyOrDash(commission?.totalEarned ?? 0, currency),
      lastMonth: formatCurrencyOrDash(commissionTrend[commissionTrend.length - 1]?.earned ?? 0, currency),
    };
  }, [commission, commissionTrend, platformCurrency]);

  // 2026-08-30: the "Status Page" link pointed at a hardcoded https://status.quantix.io
  // that does not exist (and hardcoded the brand, which is operator-configurable). The
  // dead link is removed; System Health below is the real, measured status.

  // Mapping slots to sections
  const widgetSlots: Record<string, React.ReactNode> = {
    'kpi-cards': (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingHeader
          ? Array.from({ length: 6 }, (_, i) => (
              <ATMSkeleton key={i} height="150px" className="rounded-2xl animate-pulse" />
            ))
          : kpiCards.map((card, i) => (
              <StaggeredFadeIn key={card.title} index={i}>
                <ATMStatsCard
                  label={card.title}
                  value={card.value}
                  icon={card.icon}
                  variant={card.variant}
                  description={card.description}
                />
              </StaggeredFadeIn>
            ))}
      </div>
    ),
    'revenue-chart': (
      <ATMCard
        title="Revenue Trend"
        extra={<span className="text-xs font-semibold text-slate-500">By period</span>}
      >
        <RevenueChart
          data={revenueData}
          period={dateRange}
          loading={revenueQuery.isLoading}
          currency={revenue?.currencyCode ?? platformCurrency}
          seriesLabel={merchantTypeFilter === 'All' ? 'Revenue (all merchants)' : `Revenue (${merchantTypeFilter})`}
        />
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
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              By Type
            </button>
            <span className="text-xs font-medium text-slate-500">
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
          <span className="text-xs font-semibold text-slate-500">
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
          <span className="text-xs font-semibold text-slate-500">
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

          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-accent-500" />
              <span>Top Merchants by Transaction Volume</span>
            </p>
            <div className="space-y-2">
              {(usage?.perMerchant ?? []).slice(0, 5).map((t) => {
                const total = (usage?.totalTransactions ?? 1) || 1;
                const pct = Math.min(100, Math.round((Number(t.transactions) / total) * 100));
                return (
                  <div key={t.merchantId} className="flex items-center gap-3 text-xs font-semibold">
                    <span className="w-32 text-slate-700 dark:text-slate-300 truncate">{t.companyName}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-accent-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-right text-slate-500 dark:text-slate-400">
                      {Number(t.transactions).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {(!usage || (usage.perMerchant?.length ?? 0) === 0) && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No usage data in this window.</p>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
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
        <CommissionChart data={commissionTrend} loading={commissionQuery.isLoading} currency={platformCurrency} />

        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Top Earning Merchants</p>
          <div className="space-y-1.5">
            {(commission?.byMerchant ?? []).slice(0, 5).map((m, i) => (
              <div key={m.merchantId} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-slate-400 dark:text-slate-500">{i + 1}.</span>
                  <span className="text-slate-700 dark:text-slate-300">{m.companyName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{m.transactionCount} txns</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrencyOrDash(m.totalCommission, platformCurrency)}
                  </span>
                </div>
              </div>
            ))}
            {(!commission || (commission.byMerchant?.length ?? 0) === 0) && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No commission earned yet.</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Rate Distribution</p>
          <div className="flex gap-2">
            {/* 2026-08-30: `d.bucket` did not exist on the wire (server sends rateBucket),
                so every row rendered a blank label AND carried key={undefined} — the
                source of React's "unique key" warning for this whole page. */}
            {(commission?.rateDistribution ?? []).map((d) => (
              <div
                key={d.rateBucket}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-center dark:border-slate-800 dark:bg-slate-950/20"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{d.rateBucket}</p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{d.merchantCount} merchants</p>
              </div>
            ))}
            {(!commission || (commission.rateDistribution?.length ?? 0) === 0) && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No rate buckets configured.</p>
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
            value={formatCurrencyOrDash(
              tokenMetrics?.revenueFromTokens ?? 0,
              tokenMetrics?.revenueCurrency ?? platformCurrency,
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {tokenChartData.length > 0 ? (
              <TokenMetricsChart data={tokenChartData} period={dateRange} loading={tokenMetricsQuery.isLoading} />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/20">
                Per-tier time series not yet exposed by the server.
                Summary KPIs above reflect current totals.
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Renewal Rate</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/20">
              <p className="text-2xl font-extrabold text-accent-600 dark:text-accent-400">
                {((tokenMetrics?.renewalRate ?? 0) * 100).toFixed(1)}%
              </p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Projected depletion: <span className="font-bold text-slate-700 dark:text-slate-300">{(tokenMetrics?.projectedDepletionDays ?? 0).toFixed(0)} days</span>
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
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Enterprise Revenue Split</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Subscription</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.subscriptionRevenue ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Usage</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.usageRevenue ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Commission</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.commissionRevenue ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Standalone Token Sales</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.tokenSalesRevenue ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Per-Merchant Averages (ARPU)</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Enterprise ARPU</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.enterpriseARPU ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Standalone ARPU</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.standaloneARPU ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Total in Window</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyOrDash(revenue?.totalRevenue ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Revenue Movement</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-500 dark:text-slate-400">MRR (current)</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyOrDash(revenue?.mrr ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-slate-500 dark:text-slate-400">Churn</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">
                  -{formatCurrencyOrDash(revenue?.churnRevenue ?? 0, revenue?.currencyCode ?? platformCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>ARR (annualised)</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {formatCurrencyOrDash(revenue?.arr ?? 0, revenue?.currencyCode ?? platformCurrency)}
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
          <span className="text-xs font-semibold text-slate-500">
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
            <span className="text-xs font-semibold text-slate-500">
              {(systemHealth?.activeIncidents ?? 0)} active incident{(systemHealth?.activeIncidents ?? 0) !== 1 ? 's' : ''}
              {systemHealth?.uptimePercent != null && (
                <> &middot; uptime {systemHealth.uptimePercent.toFixed(2)}%</>
              )}
            </span>
            {services.length === 0 ? (
              <ATMSkeleton width="90px" height="22px" className="rounded-full" />
            ) : (
              <StatusBadge
                status={
                  services.every((s) => s.status === 'Healthy')
                    ? 'success'
                    : services.some((s) => s.status === 'Unhealthy')
                      ? 'danger'
                      : 'warning'
                }
                label={
                  services.every((s) => s.status === 'Healthy')
                    ? 'Operational'
                    : 'Degraded'
                }
              />
            )}
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
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        icon={LayoutDashboard}
        iconColor="theme"
        title="Dashboard"
        subtitle="Platform overview and real-time operational metrics"
        extraActions={
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/80 dark:bg-[#13151a]/80 px-2.5 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xs">
              <button
                type="button"
                onClick={toggleRefresh}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={refreshNow}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors animate-in duration-300"
                title="Refresh now"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              {!paused && <span className="tabular-nums font-mono text-slate-400 dark:text-slate-500 text-[11px]">{secondsUntilRefresh}s</span>}
            </div>

            <button
              type="button"
              onClick={() => setShowWidgetConfig((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border px-3 h-9 text-xs font-bold transition-all duration-200 shadow-xs',
                showWidgetConfig
                  ? 'border-primary-500/40 bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:border-primary-500/30'
                  : 'border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#13151a]/80 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 backdrop-blur-xl',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Customize
            </button>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-[#13151a]/80 text-slate-400 dark:text-slate-500 backdrop-blur-xl shadow-xs">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="inline-flex rounded-xl border border-slate-200/80 bg-white/80 p-0.5 dark:border-slate-800 dark:bg-[#13151a]/80 h-9 items-center backdrop-blur-xl shadow-xs">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.key}
                    type="button"
                    onClick={() => setDateRange(range.key)}
                    className={cn(
                      'rounded-lg px-2.5 h-7 flex items-center justify-center text-[11px] font-bold transition-all duration-200 uppercase tracking-wider',
                      dateRange === range.key
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {hasError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2.5">
          <AlertTriangle className="h-[18px] w-[18px]" />
          <span>One or more dashboard queries failed. Some sections may show stale data.</span>
          <button
            type="button"
            onClick={() => void refreshNow()}
            className="underline ml-auto font-black hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Type filter pills */}
      <div className="inline-flex items-center gap-1 bg-white/80 dark:bg-[#13151a]/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 h-9 backdrop-blur-xl shadow-xs">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">Filter:</span>
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setMerchantType(filter.value)}
            className={cn(
              'rounded-lg px-3 h-7 flex items-center justify-center text-[11px] font-bold transition-all duration-200 uppercase tracking-wider',
              merchantTypeFilter === filter.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
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
