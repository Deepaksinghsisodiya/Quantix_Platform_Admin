import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type { CommissionSummary, CommissionRate } from '@/lib/types';
import type { MerchantRevenueCollection, CycleRunResult } from '@/lib/types/revenueCollection';
import type { RevenueCollectionFilter } from '@/lib/api/revenueCollection';

export const commissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommissionDashboard: builder.query<ApiResponse<CommissionSummary>, void>({
      query: () => ({
        url: '/api/v1/commission/dashboard',
        method: 'GET',
      }),
      providesTags: ['Commission' as any],
    }),

    getCommissionRates: builder.query<ApiResponse<readonly CommissionRate[]>, void>({
      query: () => ({
        url: '/api/v1/commission/rates',
        method: 'GET',
      }),
      providesTags: ['Commission' as any],
    }),


    getRevenueCollections: builder.query<ApiResponse<readonly MerchantRevenueCollection[]>, RevenueCollectionFilter>({
      query: (params) => ({
        url: '/api/v1/commission/collections',
        method: 'GET',
        params,
      }),
      providesTags: ['Commission' as any],
    }),

    triggerCollection: builder.mutation<ApiResponse<MerchantRevenueCollection>, { merchantId: string; periodStart?: string; periodEnd?: string }>({
      query: (data) => ({
        url: '/api/v1/commission/collections/trigger',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Commission' as any],
    }),

    runCollectionCycle: builder.mutation<ApiResponse<CycleRunResult>, void>({
      query: () => ({
        url: '/api/v1/commission/collections/run-cycle',
        method: 'POST',
      }),
      invalidatesTags: ['Commission' as any],
    }),

    runChargeCycle: builder.mutation<ApiResponse<CycleRunResult>, void>({
      query: () => ({
        url: '/api/v1/commission/charges/run-cycle',
        method: 'POST',
      }),
      invalidatesTags: ['Commission' as any],
    }),
  }),
});

export const {
  useGetCommissionDashboardQuery,
  useGetCommissionRatesQuery,
  useGetRevenueCollectionsQuery,
  useTriggerCollectionMutation,
  useRunCollectionCycleMutation,
  useRunChargeCycleMutation,
} = commissionApi;

