import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type { ApiListResponse } from '@/lib/api/types';
import type {
  Wallet,
  WalletListParams,
  ManualAdjustment,
  AddBonus,
  RefundWallet,
  RechargeOnline,
  RechargeOffline,
  WalletRecharge,
  WalletRechargeFilter,
  WalletTransaction,
} from '@/lib/api/wallet';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallets: builder.query<ApiListResponse<Wallet>, WalletListParams>({
      query: (params) => ({
        url: '/api/v1/wallet/summary',
        method: 'GET',
        params,
      }),
      providesTags: ['Merchants'],
    }),

    getWallet: builder.query<ApiResponse<Wallet>, string>({
      query: (merchantId) => ({
        url: `/api/v1/wallet/${merchantId}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, merchantId) => [{ type: 'Merchants', id: merchantId }, 'Merchants'],
    }),

    getWalletTransactions: builder.query<
      ApiResponse<readonly WalletTransaction[]>,
      { merchantId: string; params?: any }
    >({
      query: ({ merchantId, params }) => ({
        url: `/api/v1/wallet/${merchantId}/transactions`,
        method: 'GET',
        params,
      }),
    }),

    adjustWallet: builder.mutation<ApiResponse<Wallet>, ManualAdjustment>({
      query: (data) => ({
        url: '/api/v1/wallet/adjust',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    addBonus: builder.mutation<ApiResponse<Wallet>, AddBonus>({
      query: (data) => ({
        url: '/api/v1/wallet/bonus',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    refund: builder.mutation<ApiResponse<Wallet>, RefundWallet>({
      query: (data) => ({
        url: '/api/v1/wallet/refund',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    rechargeOnline: builder.mutation<ApiResponse<WalletRecharge>, RechargeOnline>({
      query: (data) => ({
        url: '/api/v1/wallet/recharge/online',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    rechargeOffline: builder.mutation<ApiResponse<WalletRecharge>, RechargeOffline>({
      query: (data) => ({
        url: '/api/v1/wallet/recharge/offline',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Merchants'],
    }),

    getRecharges: builder.query<ApiResponse<readonly WalletRecharge[]>, WalletRechargeFilter>({
      query: (filter) => ({
        url: '/api/v1/wallet/recharges',
        method: 'GET',
        params: filter,
      }),
    }),
  }),
});

export const {
  useGetWalletsQuery,
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useAdjustWalletMutation,
  useAddBonusMutation,
  useRefundMutation,
  useRechargeOnlineMutation,
  useRechargeOfflineMutation,
  useGetRechargesQuery,
} = walletApi;
