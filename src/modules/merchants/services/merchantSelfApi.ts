import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type { MerchantSelfProfile, MerchantSelfProfileUpdate } from '@/lib/api/merchantSelf';

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

    getSelfWallet: builder.query<ApiResponse<any>, void>({
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

    rechargeSelfWallet: builder.mutation<
      ApiResponse<any>,
      {
        tokenAmount: number;
        currencyAmount: number;
        currencyCode: string;
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

    getSelfTokens: builder.query<ApiResponse<any>, string | undefined>({
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

    purchaseSelfToken: builder.mutation<
      ApiResponse<any>,
      {
        validityDays: number;
        currencyAmount: number;
        currencyCode: string;
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

    getSelfInvoices: builder.query<ApiResponse<any>, { page?: number; pageSize?: number } | void>({
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

    getSelfSubscription: builder.query<ApiResponse<any>, void>({
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

    getSelfDownloads: builder.query<ApiResponse<any>, void>({
      query: () => ({
        url: '/api/v1/merchant-self/downloads',
        method: 'GET',
      }),
    }),

    getSelfDownloadUrl: builder.query<ApiResponse<{ downloadUrl: string }>, string>({
      query: (packageId) => ({
        url: `/api/v1/merchant-self/downloads/${packageId}/url`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
  useGetSelfWalletQuery,
  useGetSelfWalletTransactionsQuery,
  useRechargeSelfWalletMutation,
  useGetSelfTokensQuery,
  useGetSelfTokenDetailQuery,
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
} = merchantSelfApi;
