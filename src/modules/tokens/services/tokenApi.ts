import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type {
  RechargeToken,
  TokenFilter,
  TokenGenerateRequest,
  BulkTokenRequest,
  TokenTemplate,
} from '@/lib/types';

export interface TokenMetrics {
  readonly totalActive: number;
  readonly totalExpired: number;
  readonly totalRevoked: number;
  readonly expiringWithin30Days: number;
  readonly generatedThisMonth: number;
  readonly byTier: Record<string, number>;
}

export const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTokenHistory: builder.query<ApiResponse<PaginatedResult<RechargeToken>>, Partial<TokenFilter & PaginationParams>>({
      query: (params) => ({
        url: '/api/v1/tokens',
        method: 'GET',
        params,
      }),
      providesTags: ['Merchants'],
    }),

    getToken: builder.query<ApiResponse<RechargeToken>, string>({
      query: (id) => ({
        url: `/api/v1/tokens/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    generateToken: builder.mutation<ApiResponse<RechargeToken>, TokenGenerateRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/generate',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    bulkGenerateTokens: builder.mutation<ApiResponse<readonly RechargeToken[]>, BulkTokenRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/generate/bulk',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    revokeToken: builder.mutation<ApiResponse<RechargeToken>, { tokenId: string; reason: string }>({
      query: ({ tokenId, reason }) => ({
        url: `/api/v1/tokens/${tokenId}/revoke`,
        method: 'PUT',
        data: { reason },
      }),
      invalidatesTags: (_res, _err, { tokenId }) => [{ type: 'Merchants', id: tokenId }, 'Merchants'],
    }),

    getExpiringTokens: builder.query<ApiResponse<readonly RechargeToken[]>, { daysWindow: number }>({
      query: ({ daysWindow }) => ({
        url: '/api/v1/tokens/expiring',
        method: 'GET',
        params: { daysWindow },
      }),
    }),

    getTokenTemplates: builder.query<ApiResponse<readonly TokenTemplate[]>, void>({
      query: () => ({
        url: '/api/v1/tokens/templates',
        method: 'GET',
      }),
    }),

    getTokenMetrics: builder.query<ApiResponse<TokenMetrics>, void>({
      query: () => ({
        url: '/api/v1/tokens/metrics',
        method: 'GET',
      }),
    }),

    renewToken: builder.mutation<ApiResponse<RechargeToken>, { tokenId: string; validityDays: number }>({
      query: ({ tokenId, validityDays }) => ({
        url: `/api/v1/tokens/${tokenId}/renew`,
        method: 'POST',
        data: { validityDays },
      }),
      invalidatesTags: (_res, _err, { tokenId }) => [{ type: 'Merchants', id: tokenId }, 'Merchants'],
    }),
  }),
});

export const {
  useGetTokenHistoryQuery,
  useGetTokenQuery,
  useGenerateTokenMutation,
  useBulkGenerateTokensMutation,
  useRevokeTokenMutation,
  useGetExpiringTokensQuery,
  useGetTokenTemplatesQuery,
  useGetTokenMetricsQuery,
  useRenewTokenMutation,
} = tokenApi;
