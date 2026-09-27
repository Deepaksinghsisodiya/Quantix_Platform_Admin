import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  HowItWorksStepItem,
  SaveHowItWorksStepDto,
  ReorderHowItWorksDto,
} from '../Model/HowItWorksTypes';

export const howItWorksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminHowItWorks: builder.query<ApiResponse<readonly HowItWorksStepItem[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/how-it-works/admin?siteVariant=${siteVariant}` : '/api/v1/how-it-works/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    getHowItWorksStepById: builder.query<ApiResponse<HowItWorksStepItem>, string>({
      query: (id) => ({
        url: `/api/v1/how-it-works/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createHowItWorksStep: builder.mutation<ApiResponse<HowItWorksStepItem>, SaveHowItWorksStepDto>({
      query: (data) => ({
        url: '/api/v1/how-it-works',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateHowItWorksStep: builder.mutation<ApiResponse<HowItWorksStepItem>, { id: string } & SaveHowItWorksStepDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/how-it-works/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteHowItWorksStep: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/how-it-works/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveHowItWorksStep: builder.mutation<ApiResponse<HowItWorksStepItem>, string>({
      query: (id) => ({
        url: `/api/v1/how-it-works/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderHowItWorks: builder.mutation<ApiResponse<{ message: string }>, ReorderHowItWorksDto>({
      query: (data) => ({
        url: '/api/v1/how-it-works/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminHowItWorksQuery,
  useGetHowItWorksStepByIdQuery,
  useCreateHowItWorksStepMutation,
  useUpdateHowItWorksStepMutation,
  useDeleteHowItWorksStepMutation,
  useToggleActiveHowItWorksStepMutation,
  useReorderHowItWorksMutation,
} = howItWorksApi;
