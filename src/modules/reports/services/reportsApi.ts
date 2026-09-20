import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';

/* ---------------------------------------------------------------------------
 * 2026-08-31 — rewritten against the endpoints the Platform API actually serves.
 *
 * The previous slice mirrored four routes that DO NOT EXIST on this API:
 *   GET  /api/v1/reports/usage        (real route: /reports/usage-stats)
 *   GET  /api/v1/reports/tokens       (real route: /reports/token-generation)
 *   GET  /api/v1/reports/definitions  (no such endpoint, and no saved-report store)
 *   POST /api/v1/reports/export       (real route: /reports/generate)
 * and it typed the surviving routes as ARRAYS when every one of them returns a
 * single summary object. Pages therefore mapped over `[]`, got nothing, and fell
 * back to hardcoded numbers. Both halves are fixed here: real routes, real shapes,
 * real query-string names (fromDate/toDate/groupBy — not from/to/granularity).
 * ------------------------------------------------------------------------- */

/** Every report endpoint takes an explicit UTC window. */
export interface ReportWindow {
  readonly fromDate: string;
  readonly toDate: string;
}

export type RevenueGroupBy = 'day' | 'week' | 'month';

/* ── GET /reports/growth → MerchantGrowthDto ─────────────────────────────── */

export interface GrowthCohort {
  readonly cohortLabel: string;
  readonly merchantCount: number;
  readonly stillActive: number;
  readonly retentionRate: number;
}

export interface GrowthSource {
  readonly source: string;
  readonly count: number;
  readonly percentage: number;
}

export interface MerchantGrowthReport {
  readonly signups: number;
  readonly enterpriseSignups: number;
  readonly standaloneSignups: number;
  readonly activations: number;
  readonly cancellations: number;
  readonly netGrowth: number;
  readonly cohorts: readonly GrowthCohort[];
  readonly sourceAttribution: readonly GrowthSource[];
  readonly fromDate: string;
  readonly toDate: string;
}

/* ── GET /reports/revenue-analytics → RevenueAnalyticsDto ────────────────── */

export interface RevenueAnalyticsReport {
  readonly totalRevenue: number;
  readonly subscriptionRevenue: number;
  readonly usageRevenue: number;
  readonly commissionRevenue: number;
  readonly tokenSalesRevenue: number;
  readonly mrr: number;
  readonly arr: number;
  readonly enterpriseARPU: number;
  readonly standaloneARPU: number;
  readonly fromDate: string;
  readonly toDate: string;
}

/* ── GET /reports/revenue → RevenueReportDto (time series) ───────────────── */

export interface RevenueReportLine {
  readonly label: string;
  readonly amount: number;
  readonly merchantCount: number;
}

export interface RevenueReport {
  readonly fromDate: string;
  readonly toDate: string;
  readonly groupBy: string;
  readonly totalRevenue: number;
  readonly currencyCode: string;
  readonly lines: readonly RevenueReportLine[];
}

/* ── GET /reports/usage-stats → PlatformUsageStatsDto ────────────────────── */

export interface PlatformUsageStats {
  readonly enterpriseTotalTransactions: number;
  readonly enterpriseTotalApiCalls: number;
  readonly enterpriseTotalStorageMb: number;
  readonly enterpriseSyncEventCount: number;
  readonly standaloneTokenActivations: number;
  readonly standaloneEstimatedTerminals: number;
  readonly fromDate: string;
  readonly toDate: string;
}

/* ── GET /reports/churn → ChurnAnalysisDto ───────────────────────────────── */

export interface ChurnReason {
  readonly reason: string;
  readonly count: number;
  readonly merchantType: string;
}

export interface ChurnAnalysisReport {
  readonly enterpriseCancellations: number;
  readonly standaloneLapses: number;
  readonly enterpriseChurnRate: number;
  readonly standaloneLapseRate: number;
  readonly topReasons: readonly ChurnReason[];
  readonly atRiskMerchants: number;
  readonly fromDate: string;
  readonly toDate: string;
}

/* ── GET /reports/merchant-health → MerchantHealthDto[] ──────────────────── */

export interface MerchantHealthRow {
  readonly merchantId: string;
  readonly companyName: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly merchantStatus: string;
  readonly gracePeriodPhase: string;
  readonly tokenBalance: number;
  readonly activePlanName?: string | null;
  readonly lastLoginAt?: string | null;
  readonly lastActivityAt?: string | null;
  readonly orderVolumeThisMonth: number;
  readonly transactionTrend: number;
  readonly riskClassification: string;
  readonly healthScore: number;
  readonly tokenExpiryDate?: string | null;
}

/* ── GET /reports/behavior → MerchantBehaviorDto ─────────────────────────── */

/** Rates are nullable server-side: an empty denominator is undefined, not 0%. */
export interface MerchantBehaviorReport {
  readonly enterpriseFeatureAdoptionRate?: number | null;
  readonly enterpriseOnboardingCompletionRate?: number | null;
  readonly standaloneRenewalRate?: number | null;
  readonly fromDate: string;
  readonly toDate: string;
}

/* ── GET /reports/commission-detailed → CommissionReportDto ──────────────── */

export interface CommissionByMerchant {
  readonly merchantId: string;
  readonly companyName: string;
  readonly totalCommission: number;
  readonly transactionCount: number;
  readonly ratePercent: number;
}

export interface CommissionByPlan {
  readonly planName: string;
  readonly totalCommission: number;
  readonly merchantCount: number;
}

export interface CommissionByPeriod {
  readonly periodLabel: string;
  readonly commissionAmount: number;
  readonly transactionCount: number;
}

export interface CommissionReport {
  readonly totalEarned: number;
  readonly byMerchant: readonly CommissionByMerchant[];
  readonly byPlan: readonly CommissionByPlan[];
  readonly byPeriod: readonly CommissionByPeriod[];
  readonly pendingSettlement: number;
  readonly settledAmount: number;
  readonly averageRate: number;
  readonly fromDate: string;
  readonly toDate: string;
}

/* ── GET /reports/token-generation → TokenGenerationReportDto ────────────── */

export interface TokenByPlan {
  readonly plan: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  readonly count: number;
  readonly active: number;
  readonly expired: number;
  readonly revenue: number;
}

export interface TokenByPeriod {
  readonly periodLabel: string;
  readonly generated: number;
  readonly activated: number;
  readonly revenue: number;
}

export interface TokenGenerationReport {
  readonly totalGenerated: number;
  readonly activeTokens: number;
  readonly expiredTokens: number;
  readonly renewalRate: number;
  readonly byPlan: readonly TokenByPlan[];
  readonly byPeriod: readonly TokenByPeriod[];
  readonly fromDate: string;
  readonly toDate: string;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGrowthReport: builder.query<
      ApiResponse<MerchantGrowthReport>,
      ReportWindow & { merchantType?: 'Enterprise' | 'Standalone' }
    >({
      query: (params) => ({ url: '/api/v1/reports/growth', method: 'GET', params }),
    }),

    getRevenueAnalytics: builder.query<ApiResponse<RevenueAnalyticsReport>, ReportWindow>({
      query: (params) => ({ url: '/api/v1/reports/revenue-analytics', method: 'GET', params }),
    }),

    getRevenueSeries: builder.query<ApiResponse<RevenueReport>, ReportWindow & { groupBy?: RevenueGroupBy }>({
      query: ({ groupBy = 'month', ...params }) => ({
        url: '/api/v1/reports/revenue',
        method: 'GET',
        params: { ...params, groupBy },
      }),
    }),

    getUsageStats: builder.query<ApiResponse<PlatformUsageStats>, ReportWindow>({
      query: (params) => ({ url: '/api/v1/reports/usage-stats', method: 'GET', params }),
    }),

    getChurnReport: builder.query<ApiResponse<ChurnAnalysisReport>, ReportWindow>({
      query: (params) => ({ url: '/api/v1/reports/churn', method: 'GET', params }),
    }),

    getMerchantBehavior: builder.query<ApiResponse<MerchantBehaviorReport>, ReportWindow>({
      query: (params) => ({ url: '/api/v1/reports/behavior', method: 'GET', params }),
    }),

    getMerchantHealth: builder.query<
      ApiResponse<readonly MerchantHealthRow[]>,
      { page?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: '/api/v1/reports/merchant-health',
        method: 'GET',
        params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 },
      }),
    }),

    getCommissionReport: builder.query<ApiResponse<CommissionReport>, ReportWindow>({
      query: (params) => ({ url: '/api/v1/reports/commission-detailed', method: 'GET', params }),
    }),

    getTokenGenerationReport: builder.query<ApiResponse<TokenGenerationReport>, ReportWindow>({
      query: (params) => ({ url: '/api/v1/reports/token-generation', method: 'GET', params }),
    }),

    // 2026-08-31: exportReport / getReportDefinitions REMOVED — POST /reports/export and
    // GET /reports/definitions have never existed on this API, so both silently 404'd.
    // Report FILE generation (POST /reports/generate) now answers 501 with a stated
    // reason: no PDF/CSV renderer is wired up, and there is no saved-report store.
  }),
});

export const {
  useGetGrowthReportQuery,
  useGetRevenueAnalyticsQuery,
  useGetRevenueSeriesQuery,
  useGetUsageStatsQuery,
  useGetChurnReportQuery,
  useGetMerchantBehaviorQuery,
  useGetMerchantHealthQuery,
  useGetCommissionReportQuery,
  useGetTokenGenerationReportQuery,
} = reportsApi;
