import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  SocialProofMetric,
  SaveSocialProofMetricDto,
  ReorderSocialProofMetricsDto,
} from '../Model/SocialProofTypes';

// Dedicated tags. The previous blanket 'Content' tag was shared by 45 endpoints across
// 18 modules, so every social proof mutation refetched the entire admin app and the list
// visibly reloaded. Scoping invalidation to these two tags keeps a toggle local.
const SOCIAL_PROOF_LIST_TAG = 'SocialProofMetrics' as const;

type SocialProofTag = typeof SOCIAL_PROOF_LIST_TAG | { type: 'SocialProofMetric'; id: string };

export const socialProofApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSocialProofMetrics: builder.query<ApiResponse<readonly SocialProofMetric[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/social-proof-metrics/admin?siteVariant=${siteVariant}` : '/api/v1/social-proof-metrics/admin',
        method: 'GET',
      }),
      providesTags: (result) => [
        SOCIAL_PROOF_LIST_TAG,
        ...(result?.data ?? []).map((metric) => ({ type: 'SocialProofMetric', id: metric.metricId } as const)),
      ],
    }),

    getSocialProofMetricById: builder.query<ApiResponse<SocialProofMetric>, string>({
      query: (id) => ({
        url: `/api/v1/social-proof-metrics/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'SocialProofMetric', id }],
    }),

    createSocialProofMetric: builder.mutation<ApiResponse<SocialProofMetric>, SaveSocialProofMetricDto>({
      query: (data) => ({
        url: '/api/v1/social-proof-metrics',
        method: 'POST',
        data,
      }),
      invalidatesTags: [SOCIAL_PROOF_LIST_TAG],
    }),

    updateSocialProofMetric: builder.mutation<ApiResponse<SocialProofMetric>, { id: string } & SaveSocialProofMetricDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/social-proof-metrics/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [SOCIAL_PROOF_LIST_TAG, { type: 'SocialProofMetric', id }],
      // Publish/unpublish flips the switch the moment it is clicked. A failed request
      // unwinds the cache to the server state, so the UI never waits on a round trip.
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const optimistic = patch as Partial<SocialProofMetric>;
        const patches = [
          dispatch(
            socialProofApi.util.updateQueryData('getAdminSocialProofMetrics', undefined, (draft) => {
              const current = draft?.data ?? [];
              // ApiResponse.data is readonly, so rebuild the envelope instead of mutating it.
              return { ...draft!, data: current.map((metric) => (metric.metricId === id ? { ...metric, ...optimistic } : metric)) };
            })
          ),
          dispatch(
            socialProofApi.util.updateQueryData('getSocialProofMetricById', id, (draft) => {
              if (!draft?.data) return draft;
              return { ...draft, data: { ...draft.data, ...optimistic } };
            })
          ),
        ];
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    deleteSocialProofMetric: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/social-proof-metrics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [SOCIAL_PROOF_LIST_TAG, { type: 'SocialProofMetric', id }],
    }),

    reorderSocialProofMetrics: builder.mutation<ApiResponse<{ message: string }>, ReorderSocialProofMetricsDto>({
      query: (data) => ({
        url: '/api/v1/social-proof-metrics/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: [SOCIAL_PROOF_LIST_TAG],
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

export type { SocialProofTag };
