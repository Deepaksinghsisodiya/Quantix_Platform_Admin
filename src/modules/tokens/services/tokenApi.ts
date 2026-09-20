/**
 * Token API — 2026-08-29 rebuild.
 *
 * The previous version mapped a fictional TokenTier onto PlanType (`tierToPlan` even
 * produced 'Pro'/'Enterprise' — values that don't exist in the C# enum), synthesized
 * validFrom/validTo fields the server never sends, and computed a byTier metrics
 * breakdown client-side. All of that is gone: there are no fixed token tiers — a token
 * derives from the merchant's subscribed plan, priced and invoiced atomically by
 * POST /api/v1/tokens/issue. List rows come from the real GET /api/v1/tokens.
 */

import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type {
  RechargeToken,
  RechargeTokenDetail,
  TokenListItem,
  IssueTokenRequest,
  TokenIssueResult,
  BulkTokenRequest,
  BulkTokenResult,
} from '@/lib/types';
import type { PlanType } from '@/lib/types/platform-enums';

export interface TokenActivation {
  readonly tokenId: string;
  readonly merchantId: string;
  readonly terminalId: string | null;
  readonly activatedAt: string;
  readonly appVersion: string | null;
  readonly ipAddress: string | null;
}

// 2026-08-31: TokenPricingResult REMOVED with GET /tokens/pricing. The endpoint served a
// hardcoded tier table (100/500/1000 × an invented validity curve × an invented bulk
// discount, in a hardcoded "USD") that no screen rendered — and this mirror read
// `currency` where the wire sent `currencyCode`, so it would have shown undefined anyway.
// A token costs DailySubscriptionPrice × ValidityDays; the issue wizard gets that from
// the merchant's subscription.

/** Mirror of `TokenTemplateDto` (templates are keyed on PlanType, not tiers). */
export interface TokenTemplate {
  readonly templateId: string;
  readonly templateName: string;
  readonly plan: PlanType;
  readonly defaultLimitsPayload: string;
  readonly defaultFeatureMap: string;
  readonly defaultGracePolicyDays: string | null;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly isSystemDefined: boolean;
  readonly createdAt: string;
  readonly updatedAt: string | null;
}

/** Subset mirror of `SubscriptionDto` — what the token screens need from the merchant's plan. */
export interface MerchantSubscriptionInfo {
  readonly subscriptionId: string;
  readonly merchantId: string;
  readonly planId: string;
  readonly planDisplayName: string;
  readonly planType: PlanType;
  readonly dailySubscriptionPrice: number;
  readonly status: string;
  readonly startDate: string;
}

// 2026-08-29: TokenPaymentLink + the payment-link endpoints removed — "External" means
// payment collected OUTSIDE the platform; only a reference is recorded, for accounting.

/** Mirror of `ChargeTokenPurchaseCardDto` — card already tokenized client-side. */
export interface ChargeCardRequest {
  readonly merchantId: string;
  readonly validityDays: number;
  readonly paymentToken: string;
  readonly cardBrand?: string;
  readonly cardLast4?: string;
  readonly cardholderName?: string;
  /** Batch checkout: number of tokens the charge covers (server multiplies; default 1). */
  readonly quantity?: number;
  readonly idempotencyKey: string;
}

/** Mirror of `CardChargeResultDto` — the attempt is persisted server-side either way. */
export interface CardChargeResult {
  readonly cardChargeId: string;
  readonly status: 'Succeeded' | 'Declined';
  readonly gatewayTransactionId: string | null;
  readonly amount: number;
  readonly currencyCode: string;
  readonly provider: string;
  readonly cardBrand: string | null;
  readonly cardLast4: string | null;
  readonly gatewayMessage: string | null;
  readonly declineReason: string | null;
}

/** Mirror of `TokenPreviewDto` — dry-run of generation, nothing minted. */
export interface TokenPreview {
  readonly planName: string;
  readonly flavour: string;
  readonly sequence: number;
  readonly validityDays: number;
  readonly limitsPayload: string;
  readonly featurePayload: string;
  readonly servicesPayload: string;
  readonly paymentsPayload: string;
  readonly gracePolicyDays: string;
  readonly revokedSequences: number[];
}

/** Parse a JSON-encoded payload column ({} on any failure — payloads are display-only here). */
export const parseJsonRecord = <T extends Record<string, unknown>>(value: string | null | undefined): T => {
  if (!value) return {} as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
};

const unwrapArray = (response: any): any[] => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── List & Detail ─────────────────────────────────────────────────
    /** GET /api/v1/tokens — tokens with merchant identity; from/to window the query
     *  SERVER-side (2026-08-30: Token History defaults to the last 30 days so the
     *  payload stays light as history grows). Client filters/paginates the window. */
    getAllTokens: builder.query<
      ApiResponse<readonly TokenListItem[]>,
      { status?: string; from?: string; to?: string } | void
    >({
      query: (params) => {
        const query: Record<string, string> = {};
        if (params?.status) query.status = params.status;
        if (params?.from) query.from = params.from;
        if (params?.to) query.to = params.to;
        return {
          url: '/api/v1/tokens',
          method: 'GET',
          params: Object.keys(query).length > 0 ? query : undefined,
        };
      },
      providesTags: ['Tokens'],
    }),

    getTokensByMerchant: builder.query<ApiResponse<readonly RechargeToken[]>, { merchantId: string; status?: string }>({
      query: ({ merchantId, status }) => ({
        url: `/api/v1/tokens/merchant/${merchantId}`,
        method: 'GET',
        params: status ? { status } : undefined,
      }),
      providesTags: ['Tokens'],
    }),

    getToken: builder.query<ApiResponse<RechargeTokenDetail>, string>({
      query: (id) => ({
        url: `/api/v1/tokens/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Tokens', id }, 'Tokens'],
    }),

    /** GET /api/v1/billing/subscriptions/{merchantId} — the plan every token derives from. */
    getMerchantSubscription: builder.query<ApiResponse<MerchantSubscriptionInfo>, string>({
      query: (merchantId) => ({
        url: `/api/v1/billing/subscriptions/${merchantId}`,
        method: 'GET',
      }),
      providesTags: ['Tokens'],
    }),

    /** POST /tokens/preview — dry-run: exactly what the token will contain. */
    previewToken: builder.query<ApiResponse<TokenPreview>, { merchantId: string; terminalId?: string | null; validityDays: number }>({
      query: (data) => ({
        url: '/api/v1/tokens/preview',
        method: 'POST',
        data,
      }),
      providesTags: ['Tokens'],
    }),

    // ─── Issue (the only single-token generation path) ─────────────────
    /** POST /api/v1/tokens/issue — plan from subscription; token + paid invoice atomically. */
    issueToken: builder.mutation<ApiResponse<TokenIssueResult>, IssueTokenRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/issue',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Tokens'],
    }),

    /** POST /api/v1/tokens/issue-bulk — PAID batch; plan derived server-side from the subscription. */
    bulkGenerateTokens: builder.mutation<ApiResponse<BulkTokenResult>, BulkTokenRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/issue-bulk',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Tokens'],
    }),

    // ─── Card checkout ─────────────────────────────────────────────────
    /** POST /tokens/charge-card — charges a client-tokenized card; amount is plan-derived server-side. */
    chargeCard: builder.mutation<ApiResponse<CardChargeResult>, ChargeCardRequest>({
      query: (data) => ({
        url: '/api/v1/tokens/charge-card',
        method: 'POST',
        data,
      }),
    }),

    // ─── Mark as applied ───────────────────────────────────────────────
    /** POST /tokens/{id}/mark-applied — operator records a locally-applied token (Local-Only
     * POS never calls home); starts the validity window. */
    markTokenApplied: builder.mutation<ApiResponse<RechargeTokenDetail>, { tokenId: string; appliedAt?: string | null }>({
      query: ({ tokenId, appliedAt }) => ({
        url: `/api/v1/tokens/${tokenId}/mark-applied`,
        method: 'POST',
        data: { appliedAt: appliedAt || null },
      }),
      invalidatesTags: (_res, _err, { tokenId }) => [{ type: 'Tokens', id: tokenId }, 'Tokens'],
    }),

    // ─── Delivery ──────────────────────────────────────────────────────
    /** POST /tokens/{id}/send — emails the token to the merchant; fails visibly when email is off. */
    sendToken: builder.mutation<ApiResponse<boolean>, string>({
      query: (tokenId) => ({
        url: `/api/v1/tokens/${tokenId}/send`,
        method: 'POST',
      }),
    }),

    // ─── Revoke ────────────────────────────────────────────────────────
    revokeToken: builder.mutation<ApiResponse<boolean>, { tokenId: string; reason: string }>({
      query: ({ tokenId, reason }) => ({
        url: `/api/v1/tokens/${tokenId}/revoke`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_res, _err, { tokenId }) => [{ type: 'Tokens', id: tokenId }, 'Tokens'],
    }),

    // 2026-08-30: getExpiringTokens / getExpiringByMerchant removed with the Token
    // Validity page — "expiring" only covers tokens with a recorded apply date, which
    // misrepresents coverage for disconnected merchants. Server endpoints removed too.

    // ─── Activations ───────────────────────────────────────────────────
    getTokenActivations: builder.query<ApiResponse<readonly TokenActivation[]>, { merchantId?: string; dateFrom?: string; dateTo?: string }>({
      query: (params) => ({
        url: '/api/v1/tokens/activations',
        method: 'GET',
        params,
      }),
      providesTags: ['Tokens'],
    }),

    // ─── Export ────────────────────────────────────────────────────────
    exportTokensCsv: builder.query<Blob, { merchantId?: string; status?: string }>({
      query: (params) => ({
        url: '/api/v1/tokens/export/csv',
        method: 'GET',
        params,
        responseType: 'blob',
      }),
    }),

    // 2026-08-31: getTokenPricing removed with GET /tokens/pricing (fabricated tier table).

    // 2026-08-30: sendRenewalReminders removed with the Token Validity page.

    // ─── Templates ─────────────────────────────────────────────────────
    getTokenTemplates: builder.query<ApiResponse<readonly TokenTemplate[]>, void>({
      query: () => ({
        url: '/api/v1/tokens/templates',
        method: 'GET',
        params: { isActive: true },
      }),
      providesTags: ['Tokens'],
    }),

    getTokenTemplateById: builder.query<ApiResponse<TokenTemplate>, string>({
      query: (id) => ({
        url: `/api/v1/tokens/templates/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Tokens', id }],
    }),

    createTokenTemplate: builder.mutation<ApiResponse<TokenTemplate>, {
      templateName: string;
      plan: PlanType;
      defaultLimitsPayload?: string | null;
      defaultFeatureMap?: string | null;
      defaultGracePolicyDays?: string | null;
      description?: string | null;
    }>({
      query: (data) => ({
        url: '/api/v1/tokens/templates',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Tokens'],
    }),

    updateTokenTemplate: builder.mutation<ApiResponse<TokenTemplate>, {
      id: string;
      templateName?: string | null;
      defaultLimitsPayload?: string | null;
      defaultFeatureMap?: string | null;
      defaultGracePolicyDays?: string | null;
      description?: string | null;
      isActive?: boolean | null;
    }>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/tokens/templates/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Tokens'],
    }),

    deactivateTokenTemplate: builder.mutation<ApiResponse<TokenTemplate>, string>({
      query: (id) => ({
        url: `/api/v1/tokens/templates/${id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['Tokens'],
    }),
  }),
});

export const {
  useGetAllTokensQuery,
  useGetTokensByMerchantQuery,
  useGetMerchantSubscriptionQuery,
  usePreviewTokenQuery,
  useGetTokenQuery,
  useIssueTokenMutation,
  useChargeCardMutation,
  useMarkTokenAppliedMutation,
  useSendTokenMutation,
  useBulkGenerateTokensMutation,
  useRevokeTokenMutation,
  useGetTokenActivationsQuery,
  useExportTokensCsvQuery,
  useLazyExportTokensCsvQuery,
  useGetTokenTemplatesQuery,
  useGetTokenTemplateByIdQuery,
  useCreateTokenTemplateMutation,
  useUpdateTokenTemplateMutation,
  useDeactivateTokenTemplateMutation,
} = tokenApi;
