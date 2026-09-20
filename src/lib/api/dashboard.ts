/**
 * Dashboard API module.
 * FRS-SAP-1xx: Platform Dashboard endpoints and types.
 *
 * 2026-05-06 (Pass 23): rewritten to align with the actual server DTOs in
 * `Quantix.PlatformBusiness.DTOs.Dashboard.DashboardDtos`. Pre-pass the SPA
 * types had drifted from the server contract — invented fields that didn't
 * exist server-side (peakHour, churnRate, signupsToday) and missed fields
 * the server provides (subscriptionRevenue, tokenRevenue, commissionRevenue,
 * pendingComplianceRequests, walletBalanceAggregate, generatedAt). This file
 * now mirrors the server response shapes 1:1.
 */

import { get, post } from './client';
import type { ApiResponse } from '@/lib/types/common';

// ---------------------------------------------------------------------------
// FRS-SAP-101: Platform Dashboard KPIs (mirrors PlatformDashboardDto)
// ---------------------------------------------------------------------------

export interface PlatformDashboardDto {
  readonly totalMerchants: number;
  readonly activeMerchants: number;
  readonly enterpriseMerchants: number;
  readonly standaloneMerchants: number;
  readonly newSignupsThisMonth: number;
  readonly enterpriseSignupsThisMonth: number;
  readonly standaloneSignupsThisMonth: number;
  readonly totalRevenueThisMonth: number;
  readonly subscriptionRevenue: number;
  readonly tokenRevenue: number;
  readonly commissionRevenue: number;
  readonly revenueCurrency: string;
  readonly mrr: number;
  readonly arr: number;
  readonly activeUsers: number;
  readonly walletBalanceAggregate: number;
  readonly merchantsInGracePeriod: number;
  readonly openSupportTickets: number;
  readonly pendingComplianceRequests: number;
  readonly generatedAt: string;
}

// ---------------------------------------------------------------------------
// FRS-SAP-102: Merchant Growth (mirrors MerchantGrowthDto)
// ---------------------------------------------------------------------------

export interface MerchantGrowthDto {
  readonly signups: number;
  readonly enterpriseSignups: number;
  readonly standaloneSignups: number;
  readonly activations: number;
  readonly cancellations: number;
  readonly netGrowth: number;
  readonly cohorts: readonly CohortDto[];
  readonly sourceAttribution: readonly SourceAttributionDto[];
  readonly fromDate: string;
  readonly toDate: string;
}

export interface CohortDto {
  readonly cohortLabel: string;
  readonly merchantCount: number;
  readonly stillActive: number;
  readonly retentionRate: number;
}

export interface SourceAttributionDto {
  readonly source: string;
  readonly count: number;
  readonly percentage: number;
}

// ---------------------------------------------------------------------------
// FRS-SAP-103: Revenue Metrics (mirrors RevenueMetricsDto)
// ---------------------------------------------------------------------------

export interface RevenueMetricsDto {
  readonly totalRevenue: number;
  readonly subscriptionRevenue: number;
  readonly usageRevenue: number;
  readonly commissionRevenue: number;
  readonly tokenSalesRevenue: number;
  readonly mrr: number;
  readonly arr: number;
  readonly enterpriseARPU: number;
  readonly standaloneARPU: number;
  readonly churnRevenue: number;
  readonly currencyCode: string;
  readonly lines: readonly RevenueLineDto[];
  readonly fromDate: string;
  readonly toDate: string;
  readonly groupBy: string;
}

export interface RevenueLineDto {
  readonly label: string;
  readonly amount: number;
  readonly merchantCount: number;
}

// ---------------------------------------------------------------------------
// FRS-SAP-104: System Health (mirrors SystemHealthDto)
// ---------------------------------------------------------------------------

export interface SystemHealthDto {
  readonly services: readonly ServiceStatusDto[];
  readonly uptimePercent: number;
  readonly activeIncidents: number;
  readonly checkedAt: string;
}

export interface ServiceStatusDto {
  readonly serviceName: string;
  readonly status: string;
  readonly lastChecked: string | null;
  readonly message: string | null;
}

// ---------------------------------------------------------------------------
// FRS-SAP-105: Usage Metrics (mirrors UsageMetricsDto)
// ---------------------------------------------------------------------------

export interface UsageMetricsDto {
  readonly totalTransactions: number;
  readonly totalOrders: number;
  readonly totalApiCalls: number;
  readonly storageUsedMb: number;
  readonly perMerchant: readonly MerchantUsageDto[];
  readonly syncFrequencyAvgMinutes: number | null;
  readonly bridgeHealthPercent: number | null;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface MerchantUsageDto {
  readonly merchantId: string;
  readonly companyName: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly transactions: number;
  readonly orders: number;
  readonly apiCalls: number;
  readonly storageUsedMb: number;
}

// ---------------------------------------------------------------------------
// FRS-SAP-106: Merchant Health (mirrors MerchantHealthDto)
// ---------------------------------------------------------------------------

export interface MerchantHealthDto {
  readonly merchantId: string;
  readonly companyName: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly merchantStatus: string;
  readonly gracePeriodPhase: string;
  readonly tokenBalance: number;
  readonly activePlanName: string | null;
  readonly lastLoginAt: string | null;
  readonly lastActivityAt: string | null;
  readonly orderVolumeThisMonth: number;
  readonly transactionTrend: number;
  readonly riskClassification: string;
  readonly healthScore: number;
  readonly tokenExpiryDate: string | null;
}

// ---------------------------------------------------------------------------
// FRS-SAP-109: Token Metrics (NEW V2; mirrors TokenMetricsDashboardDto)
// ---------------------------------------------------------------------------

export interface TokenMetricsDashboardDto {
  readonly totalGenerated: number;
  readonly activeTokens: number;
  readonly expiredTokens: number;
  readonly consumedTokens: number;
  readonly revokedTokens: number;
  readonly revenueFromTokens: number;
  readonly revenueCurrency: string;
  readonly renewalRate: number;
  readonly projectedDepletionDays: number;
  readonly generatedAt: string;
}

// ---------------------------------------------------------------------------
// FRS-SAP-110: Commission Summary (NEW V2; mirrors CommissionDashboardDto from
// Quantix.PlatformBusiness.DTOs.Commission. Only the dashboard-relevant fields
// are surfaced here; the full DTO is consumed by the Commission detail page.)
// ---------------------------------------------------------------------------

/**
 * 2026-08-30: realigned to the server's CommissionDashboardDto. Three of the six field
 * names here never existed on the wire — `totalEarnedCurrentMonth` (server:
 * totalEarnedThisMonth), `topMerchants` (server: byMerchant) and `currencyCode` (not on
 * this DTO at all) — so the Commission panel silently rendered $0.00 and "No commission
 * earned yet" while the server had real figures, and `rateDistribution[].bucket`
 * (server: rateBucket) resolved to undefined, which is what produced React's
 * "unique key" warning on the whole Dashboard.
 */
export interface CommissionDashboardDto {
  readonly totalEarnedThisMonth: number;
  readonly totalEarned: number;
  readonly pendingCommission: number;
  readonly pendingSettlement: number;
  readonly byMerchant: readonly CommissionByMerchantDto[];
  readonly trend: readonly CommissionTrendDto[];
  readonly rateDistribution: readonly RateDistributionDto[];
}

export interface CommissionByMerchantDto {
  readonly merchantId: string;
  readonly companyName: string;
  /** 2026-08-30: was `amount` — the wire field is totalCommission. */
  readonly totalCommission: number;
  readonly transactionCount: number;
}

/** 2026-08-30: the wire carries a period range + amount + volume, not month/amount. */
export interface CommissionTrendDto {
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly commissionAmount: number;
  readonly transactionCount: number;
}

export interface RateDistributionDto {
  /** 2026-08-30: was `bucket` — the wire field is rateBucket. */
  readonly rateBucket: string;
  readonly merchantCount: number;
  readonly totalCommission: number;
}

// ---------------------------------------------------------------------------
// FRS-SAP-108: Configurable Dashboard Widgets — 2026-09-04: the DashboardWidget /
// DashboardLayout / DashboardWidgetPosition mirrors and the widgets/layouts fetchers
// are REMOVED. They described server stubs (empty arrays and a 501) that nothing called.
// The real per-user layout lives in modules/dashboard/services/dashboardApi.ts
// (GET/PUT /api/v1/dashboard/layout) and is synced by lib/store/useDashboardLayoutSync.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Endpoints (paths verified against
// `src/Tier2-Platform/Quantix.PlatformApi/Controllers/v1/Admin/DashboardController.cs`)
// ---------------------------------------------------------------------------

export type MerchantTypeFilter = 'Enterprise' | 'Standalone';

interface DateRangeParams {
  readonly fromDate: string;
  readonly toDate: string;
}

export function getDashboardSummary(
  merchantType?: MerchantTypeFilter,
): Promise<ApiResponse<PlatformDashboardDto>> {
  return get<ApiResponse<PlatformDashboardDto>>(
    '/api/v1/dashboard',
    merchantType ? { merchantType } : undefined,
  );
}

export function getMerchantGrowth(
  range: DateRangeParams,
  merchantType?: MerchantTypeFilter,
): Promise<ApiResponse<MerchantGrowthDto>> {
  return get<ApiResponse<MerchantGrowthDto>>(
    '/api/v1/dashboard/growth',
    { ...range, ...(merchantType ? { merchantType } : {}) },
  );
}

export function getRevenueMetrics(
  range: DateRangeParams,
  groupBy: 'day' | 'week' | 'month' = 'month',
  merchantType?: MerchantTypeFilter,
): Promise<ApiResponse<RevenueMetricsDto>> {
  // 2026-05-06 fix: was hitting `/revenue` (legacy endpoint that ignored merchantType).
  // The merchantType-aware endpoint is `/revenue-metrics`.
  return get<ApiResponse<RevenueMetricsDto>>(
    '/api/v1/dashboard/revenue-metrics',
    { ...range, groupBy, ...(merchantType ? { merchantType } : {}) },
  );
}

export function getSystemHealth(): Promise<ApiResponse<SystemHealthDto>> {
  return get<ApiResponse<SystemHealthDto>>('/api/v1/dashboard/system-health');
}

export function getUsageMetrics(
  range: DateRangeParams,
  merchantType?: MerchantTypeFilter,
): Promise<ApiResponse<UsageMetricsDto>> {
  return get<ApiResponse<UsageMetricsDto>>(
    '/api/v1/dashboard/usage-metrics',
    { ...range, ...(merchantType ? { merchantType } : {}) },
  );
}

export function getMerchantHealth(
  page = 1,
  pageSize = 50,
  merchantType?: MerchantTypeFilter,
): Promise<ApiResponse<readonly MerchantHealthDto[]>> {
  return get<ApiResponse<readonly MerchantHealthDto[]>>(
    '/api/v1/dashboard/merchant-health',
    { page, pageSize, ...(merchantType ? { merchantType } : {}) },
  );
}

export function getTokenMetrics(): Promise<ApiResponse<TokenMetricsDashboardDto>> {
  return get<ApiResponse<TokenMetricsDashboardDto>>('/api/v1/dashboard/token-metrics');
}

export function getCommissionSummary(): Promise<ApiResponse<CommissionDashboardDto>> {
  // 2026-05-06 fix: was hitting `/commission` which 404s; correct path is `/commission-summary`.
  return get<ApiResponse<CommissionDashboardDto>>('/api/v1/dashboard/commission-summary');
}
