import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
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

export type MerchantTypeFilter = 'All' | 'Enterprise' | 'Standalone';

/* 2026-09-04: the signed-in user's dashboard arrangement — mirrors DashboardLayoutDto. */
export interface DashboardLayoutWidget {
  readonly id: string;
  readonly visible: boolean;
  readonly order: number;
}
export interface DashboardLayout {
  readonly activePreset: string;
  readonly widgets: readonly DashboardLayoutWidget[];
  readonly updatedAt?: string | null;
}
/** `layout` is null until the user has saved one. */
export interface DashboardLayoutLookup {
  readonly layout: DashboardLayout | null;
}

/**
 * 2026-08-30 (dashboard audit) — this slice had drifted badly from the real API:
 *
 *  1. getDashboardSummary called `/api/v1/billing/dashboard`, which DOES NOT EXIST
 *     (404 on every load) — so every KPI rendered 0 / $0.00 while the platform had
 *     real merchants and revenue. The real endpoint is `GET /api/v1/dashboard`, and it
 *     already returns PlatformDashboardDto field-for-field.
 *  2. Its transformResponse then FABRICATED the missing numbers: an invented 40/60
 *     enterprise/standalone split (Math.floor/ceil of activeMerchants), arr = mrr × 12,
 *     and a hardcoded 'USD'. All removed — the server computes these for real.
 *  3. getRevenueMetrics called the legacy `/revenue` report (no MRR/ARR/ARPU, ignores
 *     merchantType) instead of `/revenue-metrics`.
 *  4. getMerchantHealth called `/api/v1/merchants` and invented health telemetry
 *     (bridgeStatus 'Online', lastHeartbeat = now, healthScore 100, activeTerminals 1)
 *     — every merchant looked perfectly healthy. The real `/dashboard/merchant-health`
 *     endpoint returns risk classification, health score, grace phase and token balance.
 *  5. Four endpoints used transformErrorResponse to turn FAILURES into fake successes
 *     (system-health even reported "Healthy, CPU 15%" when the call failed). That
 *     defeated the page's own error banner and violates the no-silent-failures rule —
 *     removed, so a failed query surfaces as an error the operator can retry.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<ApiResponse<PlatformDashboardDto>, MerchantTypeFilter | undefined>({
      query: (merchantType) => ({
        url: '/api/v1/dashboard',
        method: 'GET',
        params: merchantType && merchantType !== 'All' ? { merchantType } : undefined,
      }),
      providesTags: ['Dashboard'],
    }),

    getMerchantGrowth: builder.query<
      ApiResponse<MerchantGrowthDto>,
      { fromDate: string; toDate: string; merchantType?: MerchantTypeFilter }
    >({
      query: ({ fromDate, toDate, merchantType }) => ({
        url: '/api/v1/dashboard/growth',
        method: 'GET',
        params: {
          fromDate,
          toDate,
          ...(merchantType && merchantType !== 'All' ? { merchantType } : {}),
        },
      }),
      providesTags: ['Dashboard'],
    }),

    getRevenueMetrics: builder.query<
      ApiResponse<RevenueMetricsDto>,
      { fromDate: string; toDate: string; groupBy?: 'day' | 'week' | 'month'; merchantType?: MerchantTypeFilter }
    >({
      query: ({ fromDate, toDate, groupBy = 'month', merchantType }) => ({
        url: '/api/v1/dashboard/revenue-metrics',
        method: 'GET',
        params: {
          fromDate,
          toDate,
          groupBy,
          ...(merchantType && merchantType !== 'All' ? { merchantType } : {}),
        },
      }),
      providesTags: ['Dashboard'],
    }),

    getSystemHealth: builder.query<ApiResponse<SystemHealthDto>, void>({
      query: () => ({
        url: '/api/v1/dashboard/system-health',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    getUsageMetrics: builder.query<
      ApiResponse<UsageMetricsDto>,
      { fromDate: string; toDate: string; merchantType?: MerchantTypeFilter }
    >({
      query: ({ fromDate, toDate, merchantType }) => ({
        url: '/api/v1/dashboard/usage-metrics',
        method: 'GET',
        params: {
          fromDate,
          toDate,
          ...(merchantType && merchantType !== 'All' ? { merchantType } : {}),
        },
      }),
      providesTags: ['Dashboard'],
    }),

    getMerchantHealth: builder.query<
      ApiResponse<readonly MerchantHealthDto[]>,
      { page?: number; pageSize?: number; merchantType?: MerchantTypeFilter }
    >({
      query: ({ page = 1, pageSize = 50, merchantType }) => ({
        url: '/api/v1/dashboard/merchant-health',
        method: 'GET',
        params: {
          page,
          pageSize,
          ...(merchantType && merchantType !== 'All' ? { merchantType } : {}),
        },
      }),
      providesTags: ['Dashboard'],
    }),

    getTokenMetrics: builder.query<ApiResponse<TokenMetricsDashboardDto>, void>({
      query: () => ({
        url: '/api/v1/dashboard/token-metrics',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    getCommissionSummary: builder.query<ApiResponse<CommissionDashboardDto>, void>({
      query: () => ({
        url: '/api/v1/dashboard/commission-summary',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // 2026-09-04: per-user layout persistence (replaces the 501 the portal never called).
    getDashboardLayout: builder.query<ApiResponse<DashboardLayoutLookup>, void>({
      query: () => ({
        url: '/api/v1/dashboard/layout',
        method: 'GET',
      }),
      providesTags: ['DashboardLayout'],
    }),

    saveDashboardLayout: builder.mutation<ApiResponse<DashboardLayout>, DashboardLayout>({
      query: (layout) => ({
        url: '/api/v1/dashboard/layout',
        method: 'PUT',
        data: layout,
      }),
      // No invalidation: the local store is the truth after a save; refetching would only
      // re-hydrate the same layout and bounce a second save.
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetMerchantGrowthQuery,
  useGetRevenueMetricsQuery,
  useGetSystemHealthQuery,
  useGetUsageMetricsQuery,
  useGetMerchantHealthQuery,
  useGetTokenMetricsQuery,
  useGetCommissionSummaryQuery,
  useGetDashboardLayoutQuery,
  useSaveDashboardLayoutMutation,
} = dashboardApi;
