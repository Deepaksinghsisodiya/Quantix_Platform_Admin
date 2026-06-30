import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type {
  RechargeToken,
  TokenFilter,
  TokenGenerateRequest,
  BulkTokenRequest,
  TokenTemplate,
  TokenTier,
} from '@/lib/types';
import type { PlanType } from '@/lib/types/platform-enums';

export interface TokenMetrics {
  readonly totalActive: number;
  readonly totalExpired: number;
  readonly totalRevoked: number;
  readonly expiringWithin30Days: number;
  readonly generatedThisMonth: number;
  readonly byTier: Record<string, number>;
}

type TokenListParams = Partial<TokenFilter & PaginationParams>;

const tierToPlan: Record<TokenTier, PlanType> = {
  Basic: 'Basic',
  Standard: 'Pro',
  Advance: 'Enterprise',
  Premium: 'Enterprise',
};

const planToTier = (plan?: PlanType | string): TokenTier => {
  if (plan === 'Basic') return 'Basic';
  if (plan === 'Enterprise' || plan === 'Custom') return 'Premium';
  return 'Standard';
};

const safeJsonRecord = <T extends Record<string, any>>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const mapGenerateTokenRequest = (request: TokenGenerateRequest) => ({
  merchantId: request.merchantId,
  terminalId: request.binding?.terminalId || null,
  plan: tierToPlan[request.tier] ?? 'Pro',
  validityDays: request.validityDays,
  gracePolicyDays: request.gracePolicy ? JSON.stringify(request.gracePolicy) : null,
  limitsOverride: request.limitsPayload ?? null,
  featuresOverride: request.featureMap ?? null,
});

const mapBulkGenerateRequest = (request: BulkTokenRequest) => {
  const firstMerchantId = request.merchantIds?.[0] ?? '';
  const tier = request.overrides?.tier ?? 'Standard';

  return {
    merchantId: firstMerchantId,
    plan: tierToPlan[tier] ?? 'Pro',
    validityDays: request.overrides?.validityDays ?? 90,
    gracePolicyDays: null,
    quantity: Math.max(1, request.merchantIds?.length ?? 1),
    terminalBindings: null,
  };
};

const daysBetween = (from?: string, to?: string) => {
  if (!from || !to) return 0;
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - start) / 86_400_000));
};

const mapTokenResponse = (token: any): RechargeToken => {
  if (!token) return token;

  const id = token.id ?? token.tokenId;
  const validFrom = token.validFrom ?? token.validFromDate ?? token.createdAt ?? new Date().toISOString();
  const validTo = token.validTo ?? token.validToDate ?? token.expiresAt ?? validFrom;
  const tier = token.tier ?? planToTier(token.plan);
  const tokenString = token.tokenString ?? token.encodedToken ?? token.tokenHash ?? '';
  const limitsPayload = safeJsonRecord<Record<string, number>>(token.limitsPayload, {});
  const featureMap = safeJsonRecord<Record<string, boolean>>(token.featurePayload ?? token.featureMap, {});

  return {
    ...token,
    id,
    merchantId: token.merchantId,
    merchantName: token.merchantName ?? token.companyName ?? token.displayName ?? '',
    tier,
    validFrom,
    validTo,
    validityDays: token.validityDays ?? daysBetween(validFrom, validTo),
    status: token.status ?? 'Active',
    generatedAt: token.generatedAt ?? token.createdAt ?? validFrom,
    generatedBy: token.generatedBy ?? 'System',
    tokenString,
    qrCodeData: token.qrCodeData ?? token.qrCodeBase64 ?? tokenString,
    binding: token.binding ?? {
      merchantId: token.merchantId,
      businessId: token.merchantId,
      locationId: null,
      terminalId: token.activatedTerminalId ?? null,
    },
    businessNature: token.businessNature ?? 'Retail',
    tokenVersion: token.tokenVersion ?? 3,
    limitsPayload,
    featureMap,
    gracePolicy: token.gracePolicy ?? {
      gracePeriodDays: 0,
      warningDays: 0,
      degradedDays: 0,
      restrictedDays: 0,
      readOnlyDuringGrace: false,
      notifyDaysBeforeExpiry: [],
    },
    priceAtGeneration: token.priceAtGeneration ?? token.priceTokens ?? null,
    priceCurrency: typeof token.priceCurrency === 'string' ? token.priceCurrency : null,
  };
};

const unwrapArray = (response: any): any[] => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.tokens)) return data.tokens;
  return [];
};

const toPaginatedResponse = (response: any, params: TokenListParams): ApiResponse<PaginatedResult<RechargeToken>> => {
  const data = response?.data ?? response;
  const rawItems = Array.isArray(data?.items) ? data.items : unwrapArray(response);
  const items = rawItems.map(mapTokenResponse);
  const page = params.page ?? data?.page ?? 1;
  const pageSize = params.pageSize ?? data?.pageSize ?? items.length;
  const totalCount = data?.totalCount ?? items.length;

  return {
    ...(response ?? {}),
    success: response?.success ?? true,
    timestamp: response?.timestamp ?? new Date().toISOString(),
    data: {
      items,
      totalCount,
      page,
      pageSize,
      totalPages: data?.totalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize))),
      hasNextPage: data?.hasNextPage ?? page * pageSize < totalCount,
      hasPreviousPage: data?.hasPreviousPage ?? page > 1,
    },
  };
};

export const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTokenHistory: builder.query<ApiResponse<PaginatedResult<RechargeToken>>, TokenListParams>({
      query: (params) => {
        if (params.merchantId) {
          return {
            url: `/api/v1/tokens/merchant/${params.merchantId}`,
            method: 'GET',
            params: { status: params.status },
          };
        }

        return {
          url: '/api/v1/tokens/expiring',
          method: 'GET',
          params: { daysWindow: 3650 },
        };
      },
      transformResponse: (response: any, _meta, params) => toPaginatedResponse(response, params),
      providesTags: ['Merchants'],
    }),

    getToken: builder.query<ApiResponse<RechargeToken>, string>({
      query: (id) => ({
        url: `/api/v1/tokens/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapTokenResponse(response.data),
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    generateToken: builder.mutation<ApiResponse<RechargeToken>, TokenGenerateRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/generate',
        method: 'POST',
        data: mapGenerateTokenRequest(data),
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapTokenResponse(response.data),
      }),
      invalidatesTags: ['Merchants'],
    }),

    bulkGenerateTokens: builder.mutation<ApiResponse<readonly RechargeToken[]>, BulkTokenRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/generate-bulk',
        method: 'POST',
        data: mapBulkGenerateRequest(data),
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: unwrapArray(response).map(mapTokenResponse),
      }),
      invalidatesTags: ['Merchants'],
    }),

    revokeToken: builder.mutation<ApiResponse<RechargeToken>, { tokenId: string; reason: string }>({
      query: ({ tokenId, reason }) => ({
        url: `/api/v1/tokens/${tokenId}/revoke`,
        method: 'POST',
        data: { reason },
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapTokenResponse(response.data),
      }),
      invalidatesTags: (_res, _err, { tokenId }) => [{ type: 'Merchants', id: tokenId }, 'Merchants'],
    }),

    getExpiringTokens: builder.query<ApiResponse<readonly RechargeToken[]>, { daysWindow: number }>({
      query: ({ daysWindow }) => ({
        url: '/api/v1/tokens/expiring',
        method: 'GET',
        params: { daysWindow },
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: unwrapArray(response).map(mapTokenResponse),
      }),
    }),

    getTokenTemplates: builder.query<ApiResponse<readonly TokenTemplate[]>, void>({
      query: () => ({
        url: '/api/v1/tokens/templates',
        method: 'GET',
        params: { isActive: true },
      }),
    }),

    getTokenMetrics: builder.query<ApiResponse<TokenMetrics>, void>({
      query: () => ({
        url: '/api/v1/tokens/expiring',
        method: 'GET',
        params: { daysWindow: 3650 },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        const tokens = unwrapArray(response).map(mapTokenResponse);
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const expiringWithin30Days = tokens.filter((token) => {
          const validTo = new Date(token.validTo).getTime();
          const days = Math.ceil((validTo - now.getTime()) / 86_400_000);
          return days >= 0 && days <= 30;
        }).length;

        return {
          ...response,
          data: {
            totalActive: tokens.filter((token) => token.status === 'Active').length,
            totalExpired: tokens.filter((token) => token.status === 'Expired').length,
            totalRevoked: tokens.filter((token) => token.status === 'Revoked').length,
            expiringWithin30Days,
            generatedThisMonth: tokens.filter((token) => {
              const generatedAt = new Date(token.generatedAt);
              return generatedAt.getMonth() === month && generatedAt.getFullYear() === year;
            }).length,
            byTier: tokens.reduce<Record<string, number>>((acc, token) => {
              acc[token.tier] = (acc[token.tier] ?? 0) + 1;
              return acc;
            }, {}),
          },
        };
      },
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