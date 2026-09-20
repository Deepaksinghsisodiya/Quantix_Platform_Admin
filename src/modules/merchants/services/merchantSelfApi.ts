import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PagedResponse } from '@/lib/types/common';
import type { MerchantSelfProfile, MerchantSelfProfileUpdate } from '@/lib/api/merchantSelf';
import type { TicketComment, TicketDetail, TicketListItem, TicketPriority, TicketStatus } from '@/lib/types/helpdesk';

/* ---------------------------------------------------------------------------
 * 2026-09-02: typed mirrors for the payloads the merchant dashboard renders.
 * These endpoints were all `ApiResponse<any>`, which is how a page ends up
 * reading fields the wire never sends. Verified against the live API as a real
 * merchant login (see the note on each optional field).
 *
 * Enterprise-only routes (/wallet, /wallet/transactions, /subscription,
 * /subscription/history, /commission, /revenue-report) answer 400
 * MERCHANT_TYPE_MISMATCH for a Standalone merchant — callers must skip them
 * rather than render an error the merchant can do nothing about.
 * ------------------------------------------------------------------------- */

/** Mirror of RechargeTokenDto as served to the merchant. */
export interface MerchantSelfToken {
  readonly tokenId: string;
  readonly plan: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  /** Operator-defined plan name carried on the token payload (V4). */
  readonly planName?: string | null;
  readonly validityDays: number;
  readonly status: 'Active' | 'Consumed' | 'Expired' | 'Revoked' | 'Superseded';
  readonly sequence: number;
  /** Absent until the merchant applies the token — Rule 7: the window starts on apply. */
  readonly activatedAt?: string | null;
  /** Absent until applied, for the same reason. */
  readonly expiresAt?: string | null;
  readonly priceCurrency: number;
  readonly revokedAt?: string | null;
  readonly revokedReason?: string | null;
  readonly createdAt: string;
}

/** Mirror of the invoice summary rows on /merchant-self/invoices. */
export interface MerchantSelfInvoice {
  readonly invoiceId: string;
  readonly invoiceNumber: string;
  readonly invoiceDate: string;
  readonly invoiceType: string;
  readonly totalCurrency: number;
  readonly currencyCode: string;
  readonly status: 'Draft' | 'Issued' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded' | string;
  readonly dueDate?: string | null;
}

/** Mirror of WalletDto (Enterprise only). Balance is denominated in tokens. */
export interface MerchantSelfWallet {
  readonly walletId: string;
  readonly tokenBalance: number;
  readonly lastDeductionDate?: string | null;
  readonly lastTopUpDate?: string | null;
  /** Measured: average tokens deducted per day over the last 30 days (0 until the first deduction). */
  readonly consumptionRatePerDay: number;
  readonly projectedDepletionDays: number;
  /** 2026-09-04: the daily deduction the wallet faces — the active subscription's price, in tokens. */
  readonly plannedDailyCharge: number;
  /** What projectedDepletionDays rests on: measured usage, the plan's daily charge, or nothing yet. */
  readonly runwayBasis: 'Usage' | 'Plan' | 'None';
  readonly gracePeriodPhase: string;
  readonly gracePeriodStartDate?: string | null;
}

/**
 * 2026-09-04: what a wallet recharge costs — GET /merchant-self/wallet/quote. Priced from the
 * platform's exchange rate and currency; the recharge charges exactly this. The dialog used to
 * let the merchant type the currency amount themselves.
 */
export interface MerchantSelfWalletQuote {
  readonly tokenAmount: number;
  readonly currencyAmount: number;
  readonly currencyCode: string;
  readonly tokensPerCurrencyUnit: number;
  readonly onlinePaymentEnabled: boolean;
  /** Tokens per day the subscription deducts; 0 when no active subscription. */
  readonly plannedDailyCharge: number;
  /** How many days of the daily charge this amount covers; null when there is no daily charge. */
  readonly daysCovered: number | null;
  /**
   * 2026-09-05 (decision B): the wallet coverage rule measured against the balance this
   * recharge would leave. `isMet` false means the recharge will be refused.
   */
  readonly coverage: WalletCoverageStatus;
}

/** Mirrors WalletCoverageRequirementDto — every amount is in tokens. */
export interface WalletCoverageRequirement {
  readonly minimumTokens: number;
  readonly subscriptionDays: number;
  readonly dailyCharge: number;
  readonly subscriptionComponent: number;
  readonly commissionComponent: number;
  readonly expectedMonthlyRevenue: number | null;
  readonly commissionPercent: number;
  readonly currencyCode: string;
  readonly basis: string;
  readonly explanation: string;
}

/** Mirrors WalletCoverageStatusDto. */
export interface WalletCoverageStatus {
  readonly requirement: WalletCoverageRequirement;
  readonly balanceTokens: number;
  readonly shortfallTokens: number;
  readonly isMet: boolean;
}

/** Mirror of SubscriptionDto (Enterprise only). */
export interface MerchantSelfSubscription {
  readonly subscriptionId: string;
  readonly planDisplayName: string;
  readonly planType: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  readonly dailySubscriptionPrice: number;
  readonly baseDailyPrice: number;
  readonly commissionPercent: number;
  readonly startDate: string;
  readonly endDate?: string | null;
  readonly status: string;
}

/**
 * 2026-09-02: what a token costs this merchant, from GET /merchant-self/tokens/quote.
 * The purchase endpoint charges exactly this — the client no longer supplies an amount.
 */
export interface MerchantSelfTokenQuote {
  readonly validityDays: number;
  readonly dailyPrice: number;
  readonly amount: number;
  readonly currencyCode: string;
  readonly planName: string;
  /** Deployment accepts online card payment. Carried here so the merchant portal never
   *  has to call the admin-only /settings/setup-status route (which 403s for them). */
  readonly onlinePaymentEnabled: boolean;
}

/**
 * 2026-09-04: one package as the merchant sees it. Every ACTIVE package is listed, with
 * `isEligible` saying whether this merchant's enabled features satisfy its gates and
 * `upgradeHint` naming what is missing when they don't. The URL is deliberately absent —
 * it comes from the eligibility-checked `/downloads/{id}/url` route only.
 */
export interface MerchantSelfDownloadPackage {
  readonly packageId: string;
  readonly appName: string;
  readonly platform: string;
  readonly version: string;
  /** Bytes. */
  readonly fileSize: number;
  readonly releaseNotes: string | null;
  readonly isLatest: boolean;
  readonly releasedAt: string;
  readonly requiredFeatures: readonly { readonly featureCode: string; readonly featureName: string }[];
  readonly isEligible: boolean;
  readonly upgradeHint: string | null;
}

/** Mirror of MerchantDownloadsDto — `packages` is empty when nothing is published. */
export interface MerchantSelfDownloads {
  readonly merchantId: string;
  readonly packages: readonly MerchantSelfDownloadPackage[];
}

export const merchantSelfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSelfProfile: builder.query<ApiResponse<MerchantSelfProfile>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/profile',
        method: 'GET',
      }),
      providesTags: ['Profile' as any],
    }),

    updateSelfProfile: builder.mutation<ApiResponse<MerchantSelfProfile>, MerchantSelfProfileUpdate>({
      query: (dto) => ({
        url: '/api/v1/merchant-self/profile',
        method: 'PATCH',
        data: dto,
      }),
      invalidatesTags: ['Profile' as any],
    }),

    getSelfWallet: builder.query<ApiResponse<MerchantSelfWallet>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/wallet',
        method: 'GET',
      }),
      providesTags: ['Merchants'],
    }),

    getSelfWalletTransactions: builder.query<
      ApiResponse<any>,
      { fromDate?: string; toDate?: string; page?: number; pageSize?: number }
    >({
      query: ({ fromDate, toDate, page = 1, pageSize = 50 }) => ({
        url: '/api/v1/merchant-self/wallet/transactions',
        method: 'GET',
        params: { fromDate, toDate, page, pageSize },
      }),
    }),

    getSelfWalletQuote: builder.query<ApiResponse<MerchantSelfWalletQuote>, number>({
      query: (tokenAmount) => ({
        url: '/api/v1/merchant-self/wallet/quote',
        method: 'GET',
        params: { tokenAmount },
      }),
    }),

    // 2026-09-04: the server prices the recharge (wallet/quote) — currencyAmount/currencyCode
    // are no longer part of the request.
    rechargeSelfWallet: builder.mutation<
      ApiResponse<any>,
      {
        tokenAmount: number;
        paymentToken: string;
        description?: string;
      }
    >({
      query: (dto) => ({
        url: '/api/v1/merchant-self/wallet/recharge',
        method: 'POST',
        data: dto,
      }),
      invalidatesTags: ['Merchants'],
    }),

    getSelfTokens: builder.query<ApiResponse<readonly MerchantSelfToken[]>, string | undefined>({
      query: (status) => ({
        url: '/api/v1/merchant-self/tokens',
        method: 'GET',
        params: status ? { status } : undefined,
      }),
      providesTags: ['Merchants'],
    }),

    getSelfTokenDetail: builder.query<ApiResponse<any>, string>({
      query: (tokenId) => ({
        url: `/api/v1/merchant-self/tokens/${tokenId}`,
        method: 'GET',
      }),
    }),

    getSelfTokenQuote: builder.query<ApiResponse<MerchantSelfTokenQuote>, number>({
      query: (validityDays) => ({
        url: '/api/v1/merchant-self/tokens/quote',
        method: 'GET',
        params: { validityDays },
      }),
    }),

    // 2026-09-02: currencyAmount/currencyCode are no longer sent — the server prices the
    // token from the merchant's plan and charges that. 2026-09-04: the server DTO is
    // trimmed to match (ValidityDays + PaymentToken).
    purchaseSelfToken: builder.mutation<
      ApiResponse<any>,
      {
        validityDays: number;
        paymentToken: string;
      }
    >({
      query: (dto) => ({
        url: '/api/v1/merchant-self/tokens/purchase',
        method: 'POST',
        data: dto,
      }),
      invalidatesTags: ['Merchants'],
    }),

    getSelfInvoices: builder.query<ApiResponse<readonly MerchantSelfInvoice[]>, { page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: '/api/v1/merchant-self/invoices',
        method: 'GET',
        params: params || { page: 1, pageSize: 20 },
      }),
    }),

    getSelfInvoice: builder.query<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/api/v1/merchant-self/invoices/${id}`,
        method: 'GET',
      }),
    }),

    downloadSelfInvoice: builder.query<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/api/v1/merchant-self/invoices/${id}/download`,
        method: 'GET',
      }),
    }),

    getSelfPayments: builder.query<ApiResponse<any>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/payments',
        method: 'GET',
      }),
    }),

    getSelfSubscription: builder.query<ApiResponse<MerchantSelfSubscription>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/subscription',
        method: 'GET',
      }),
    }),

    getSelfSubscriptionHistory: builder.query<ApiResponse<any>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/subscription/history',
        method: 'GET',
      }),
    }),

    getSelfCommission: builder.query<ApiResponse<any>, { fromDate?: string; toDate?: string } | void>({
      query: (params) => ({
        url: '/api/v1/merchant-self/commission',
        method: 'GET',
        params: params || undefined,
      }),
    }),

    getSelfRevenueReport: builder.query<ApiResponse<any>, { fromDate?: string; toDate?: string } | void>({
      query: (params) => ({
        url: '/api/v1/merchant-self/revenue-report',
        method: 'GET',
        params: params || undefined,
      }),
    }),

    getSelfDownloads: builder.query<ApiResponse<MerchantSelfDownloads>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/downloads',
        method: 'GET',
      }),
      providesTags: ['Downloads'],
    }),

    getSelfDownloadUrl: builder.query<ApiResponse<{ downloadUrl: string }>, string>({
      query: (packageId) => ({
        url: `/api/v1/merchant-self/downloads/${packageId}/url`,
        method: 'GET',
      }),
    }),

    // 2026-09-08: the merchant's own helpdesk. Same SupportTicket rows the staff Support Queue
    // works, scoped server-side to the merchant_id claim; internal notes never leave the API.
    getSelfTickets: builder.query<PagedResponse<TicketListItem>, { status?: TicketStatus; search?: string; page?: number; pageSize?: number }>({
      query: (params) => ({
        url: '/api/v1/merchant-self/support/tickets',
        method: 'GET',
        params,
      }),
      providesTags: ['Tickets'],
    }),

    getSelfTicket: builder.query<ApiResponse<TicketDetail>, string>({
      query: (ticketId) => ({
        url: `/api/v1/merchant-self/support/tickets/${ticketId}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Tickets', id }, 'Tickets'],
    }),

    createSelfTicket: builder.mutation<ApiResponse<TicketDetail>, { subject: string; description: string; category: string; priority: TicketPriority }>({
      query: (data) => ({
        url: '/api/v1/merchant-self/support/tickets',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Tickets'],
    }),

    replySelfTicket: builder.mutation<ApiResponse<TicketComment>, { ticketId: string; content: string }>({
      query: ({ ticketId, content }) => ({
        url: `/api/v1/merchant-self/support/tickets/${ticketId}/reply`,
        method: 'POST',
        data: { content },
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets', id: ticketId }, 'Tickets'],
    }),
  }),
});

export const {
  useGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
  useGetSelfWalletQuery,
  useGetSelfWalletTransactionsQuery,
  useGetSelfWalletQuoteQuery,
  useRechargeSelfWalletMutation,
  useGetSelfTokensQuery,
  useGetSelfTokenDetailQuery,
  useGetSelfTokenQuoteQuery,
  usePurchaseSelfTokenMutation,
  useGetSelfInvoicesQuery,
  useGetSelfInvoiceQuery,
  useLazyDownloadSelfInvoiceQuery,
  useGetSelfPaymentsQuery,
  useGetSelfSubscriptionQuery,
  useGetSelfSubscriptionHistoryQuery,
  useGetSelfCommissionQuery,
  useGetSelfRevenueReportQuery,
  useGetSelfDownloadsQuery,
  useLazyGetSelfDownloadUrlQuery,
  useGetSelfTicketsQuery,
  useGetSelfTicketQuery,
  useCreateSelfTicketMutation,
  useReplySelfTicketMutation,
} = merchantSelfApi;
