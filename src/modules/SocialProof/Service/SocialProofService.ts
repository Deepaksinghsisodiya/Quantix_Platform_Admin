import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  SocialProofMetric,
  SaveSocialProofMetricDto,
  ReorderSocialProofMetricsDto,
} from '../Model/SocialProofTypes';

export const socialProofApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSocialProofMetrics: builder.query<ApiResponse<readonly SocialProofMetric[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/social-proof-metrics/admin?siteVariant=${siteVariant}` : '/api/v1/social-proof-metrics/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    getSocialProofMetricById: builder.query<ApiResponse<SocialProofMetric>, string>({
      query: (id) => ({
        url: `/api/v1/social-proof-metrics/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createSocialProofMetric: builder.mutation<ApiResponse<SocialProofMetric>, SaveSocialProofMetricDto>({
      query: (data) => ({
        url: '/api/v1/social-proof-metrics',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateSocialProofMetric: builder.mutation<ApiResponse<SocialProofMetric>, { id: string } & SaveSocialProofMetricDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/social-proof-metrics/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteSocialProofMetric: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/social-proof-metrics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderSocialProofMetrics: builder.mutation<ApiResponse<{ message: string }>, ReorderSocialProofMetricsDto>({
      query: (data) => ({
        url: '/api/v1/social-proof-metrics/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminSocialProofMetricsQuery,
  useGetSocialProofMetricByIdQuery,
  useCreateSocialProofMetricMutation,
  useUpdateSocialProofMetricMutation,
  useDeleteSocialProofMetricMutation,
  useReorderSocialProofMetricsMutation,
} = socialProofApi;
