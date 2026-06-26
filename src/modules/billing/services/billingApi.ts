import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type { Invoice, SubscriptionPlan, TokenPricing } from '@/lib/types';

export interface BillingDashboard {
  readonly totalRevenue: number;
  readonly monthlyRevenue: number;
  readonly outstandingAmount: number;
  readonly overdueInvoices: number;
  readonly activeSubscriptions: number;
  readonly revenueByMonth: readonly { readonly month: string; readonly amount: number }[];
}

export interface InvoiceListParams extends Partial<PaginationParams> {
  readonly merchantId?: string;
  readonly status?: string;
  readonly type?: string;
  readonly merchantType?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface CreatePlanDto {
  readonly name: string;
  readonly tier: string;
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly currency: string;
  readonly features: readonly string[];
  readonly maxLocations: number;
  readonly maxTerminals: number;
}

export interface UpdateTokenPricingDto {
  readonly id: string;
  readonly tier: string;
  readonly validityDays: number;
  readonly price: number;
  readonly currency: string;
  readonly bulkDiscounts: readonly { readonly minQuantity: number; readonly discountPercent: number }[];
}

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingDashboard: builder.query<ApiResponse<BillingDashboard>, void>({
      query: () => ({
        url: '/api/v1/billing/dashboard',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    getInvoices: builder.query<ApiResponse<PaginatedResult<Invoice>>, InvoiceListParams>({
      query: (params) => ({
        url: '/api/v1/billing/invoices',
        method: 'GET',
        params,
      }),
      providesTags: ['Merchants'],
    }),

    getInvoice: builder.query<ApiResponse<Invoice>, string>({
      query: (id) => ({
        url: `/api/v1/billing/invoices/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    getPlans: builder.query<ApiResponse<readonly SubscriptionPlan[]>, void>({
      query: () => ({
        url: '/api/v1/billing/plans',
        method: 'GET',
      }),
    }),

    createPlan: builder.mutation<ApiResponse<SubscriptionPlan>, CreatePlanDto>({
      query: (data) => ({
        url: '/api/v1/billing/plans',
        method: 'POST',
        data,
      }),
    }),

    getTokenPricing: builder.query<ApiResponse<readonly TokenPricing[]>, void>({
      query: () => ({
        url: '/api/v1/billing/token-pricing',
        method: 'GET',
      }),
    }),

    updateTokenPricing: builder.mutation<ApiResponse<TokenPricing>, UpdateTokenPricingDto>({
      query: (data) => ({
        url: `/api/v1/billing/token-pricing/${data.id}`,
        method: 'PUT',
        data,
      }),
    }),

    markInvoicePaid: builder.mutation<ApiResponse<Invoice>, { invoiceId: string; paymentRef: string }>({
      query: ({ invoiceId, paymentRef }) => ({
        url: `/api/v1/billing/invoices/${invoiceId}/mark-paid`,
        method: 'POST',
        data: { paymentRef },
      }),
      invalidatesTags: (_res, _err, { invoiceId }) => [{ type: 'Merchants', id: invoiceId }, 'Merchants', 'Dashboard'],
    }),

    retryPayment: builder.mutation<
      ApiResponse<{ attempt: number; status: string; nextRetryAt: string | null }>,
      string
    >({
      query: (invoiceId) => ({
        url: `/api/v1/billing/payments/retry/${invoiceId}`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, invoiceId) => [{ type: 'Merchants', id: invoiceId }, 'Merchants', 'Dashboard'],
    }),

    sendPaymentReminder: builder.mutation<ApiResponse<{ sent: boolean }>, string>({
      query: (invoiceId) => ({
        url: `/api/v1/billing/invoices/${invoiceId}/send-reminder`,
        method: 'POST',
      }),
    }),

    creditWalletAllocation: builder.mutation<
      ApiResponse<{ walletBalance: number }>,
      { merchantId: string; amount: number; reason: string; billingCycleId: string }
    >({
      query: ({ merchantId, amount, reason }) => ({
        url: `/api/v1/wallet/${merchantId}/adjust`,
        method: 'POST',
        data: { amount, reason, type: 'credit' },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    createTokenInvoice: builder.mutation<
      ApiResponse<Invoice>,
      {
        merchantId: string;
        tokenId: string;
        tier: string;
        validityDays: number;
        quantity: number;
        unitPrice: number;
        bulkDiscountPercent: number;
        taxRate: number;
        paymentMethod: 'online' | 'manual' | 'prepaid';
        invoiceOption: 'immediate' | 'next-billing';
      }
    >({
      query: (data) => ({
        url: '/api/v1/billing/invoices/token-purchase',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants', 'Dashboard'],
    }),

    recordManualPayment: builder.mutation<
      ApiResponse<Invoice>,
      { invoiceId: string; amount: number; method: string; reference: string }
    >({
      query: ({ invoiceId, ...data }) => ({
        url: `/api/v1/billing/invoices/${invoiceId}/record-payment`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_res, _err, { invoiceId }) => [{ type: 'Merchants', id: invoiceId }, 'Merchants', 'Dashboard'],
    }),

    settleCommission: builder.mutation<
      ApiResponse<{ statementId: string; amount: number }>,
      { merchantId: string; periodStart: string; periodEnd: string }
    >({
      query: ({ merchantId, ...data }) => ({
        url: `/api/v1/commission/merchants/${merchantId}/settle`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetBillingDashboardQuery,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetPlansQuery,
  useCreatePlanMutation,
  useGetTokenPricingQuery,
  useUpdateTokenPricingMutation,
  useMarkInvoicePaidMutation,
  useRetryPaymentMutation,
  useSendPaymentReminderMutation,
  useCreditWalletAllocationMutation,
  useCreateTokenInvoiceMutation,
  useRecordManualPaymentMutation,
  useSettleCommissionMutation,
} = billingApi;
