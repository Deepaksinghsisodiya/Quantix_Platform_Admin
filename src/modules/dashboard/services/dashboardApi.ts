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

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<ApiResponse<PlatformDashboardDto>, MerchantTypeFilter | undefined>({
      query: (merchantType) => ({
        url: '/api/v1/dashboard/summary',
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
        url: '/api/v1/dashboard/revenue',
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
} = dashboardApi;
