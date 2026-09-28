import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  BusinessProblem,
  SaveBusinessProblemDto,
} from '../Model/BusinessProblemTypes';

export const businessProblemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminBusinessProblems: builder.query<ApiResponse<readonly BusinessProblem[]>, { siteVariant?: string; search?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        if (arg && arg.search) params.append('search', arg.search);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/business-problems?${queryStr}` : '/api/v1/business-problems',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getBusinessProblemById: builder.query<ApiResponse<BusinessProblem>, string>({
      query: (id) => ({
        url: `/api/v1/business-problems/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createBusinessProblem: builder.mutation<ApiResponse<BusinessProblem>, SaveBusinessProblemDto>({
      query: (data) => ({
        url: '/api/v1/business-problems',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateBusinessProblem: builder.mutation<ApiResponse<BusinessProblem>, { id: string } & SaveBusinessProblemDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/business-problems/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteBusinessProblem: builder.mutation<ApiResponse<{ message: string } | boolean>, string>({
      query: (id) => ({
        url: `/api/v1/business-problems/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveBusinessProblem: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/business-problems/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderBusinessProblems: builder.mutation<ApiResponse<{ message: string }>, { orderedIds: string[] }>({
      query: (data) => ({
        url: '/api/v1/business-problems/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminBusinessProblemsQuery,
  useGetBusinessProblemByIdQuery,
  useCreateBusinessProblemMutation,
  useUpdateBusinessProblemMutation,
  useDeleteBusinessProblemMutation,
  useToggleActiveBusinessProblemMutation,
  useReorderBusinessProblemsMutation,
} = businessProblemsApi;
