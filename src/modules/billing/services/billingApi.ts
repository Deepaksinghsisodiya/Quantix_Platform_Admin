import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type { Invoice, SubscriptionPlan } from '@/lib/types';

/**
 * GET /billing/dashboard — mirrors the server's `BillingDashboardDto` 1:1.
 * 2026-09-04: the previous shape here (totalRevenue / monthlyRevenue / activeSubscriptions)
 * was never what the API sent; Billing Overview worked only because it re-declared the real
 * shape locally. One definition now, shared by Billing Overview and the Finance desktop.
 */
export interface BillingDashboard {
  readonly totalInvoiced: number;
  readonly collected: number;
  readonly outstanding: number;
  readonly overdue: number;
  readonly overdueCount: number;
  readonly outstandingCount: number;
  readonly currencyCode: string;
  /** Percent change vs the previous month; null when there is no prior-month baseline. */
  readonly totalInvoicedChangePercent: number | null;
  readonly collectedChangePercent: number | null;
  readonly revenueByType: readonly { readonly name: string; readonly amount: number }[];
  readonly revenueByMonth: readonly { readonly month: string; readonly period: string; readonly amount: number }[];
  readonly periodStart: string;
  readonly generatedAt: string;
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


export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 2026-08-13: live escalation-stage counts (replaced a hardcoded MOCK_ESCALATION array).
    getEscalationSummary: builder.query<ApiResponse<readonly {
      stage: string; dayThreshold: number; action: string; invoiceCount: number; totalAmount: number;
    }[]>, void>({
      query: () => ({
        url: '/api/v1/billing/invoices/escalation-summary',
        method: 'GET',
      }),
      providesTags: ['Invoices' as any],
    }),

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
      providesTags: ['Plans'],
    }),

    createPlan: builder.mutation<ApiResponse<SubscriptionPlan>, CreatePlanDto>({
      query: (data) => ({
        url: '/api/v1/billing/plans',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Plans'],
    }),

    updatePlan: builder.mutation<ApiResponse<SubscriptionPlan>, { id: string; data: Partial<CreatePlanDto> }>({
      query: ({ id, data }) => ({
        url: `/api/v1/billing/plans/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Plans'],
    }),

    deletePlan: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/billing/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plans'],
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
        params: {
          merchantId: data.merchantId,
          tokenId: (data as any).tokenId || (data as any).id,
        },
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
  useGetEscalationSummaryQuery,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useMarkInvoicePaidMutation,
  useRetryPaymentMutation,
  useSendPaymentReminderMutation,
  useCreditWalletAllocationMutation,
  useCreateTokenInvoiceMutation,
  useRecordManualPaymentMutation,
  useSettleCommissionMutation,
} = billingApi;
