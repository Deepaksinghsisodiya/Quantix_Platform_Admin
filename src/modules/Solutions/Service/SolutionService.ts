import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  SolutionItem,
  SaveSolutionItemDto,
  ReorderSolutionsDto,
} from '../Model/SolutionTypes';

export const solutionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSolutions: builder.query<ApiResponse<readonly SolutionItem[]>, { siteVariant?: string; itemType?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        if (arg && arg.itemType) params.append('itemType', arg.itemType);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/solutions/admin?${queryStr}` : '/api/v1/solutions/admin',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getSolutionById: builder.query<ApiResponse<SolutionItem>, string>({
      query: (id) => ({
        url: `/api/v1/solutions/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createSolution: builder.mutation<ApiResponse<SolutionItem>, SaveSolutionItemDto>({
      query: (data) => ({
        url: '/api/v1/solutions',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateSolution: builder.mutation<ApiResponse<SolutionItem>, { id: string } & SaveSolutionItemDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/solutions/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteSolution: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/solutions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveSolution: builder.mutation<ApiResponse<SolutionItem>, string>({
      query: (id) => ({
        url: `/api/v1/solutions/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderSolutions: builder.mutation<ApiResponse<{ message: string }>, ReorderSolutionsDto>({
      query: (data) => ({
        url: '/api/v1/solutions/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminSolutionsQuery,
  useGetSolutionByIdQuery,
  useCreateSolutionMutation,
  useUpdateSolutionMutation,
  useDeleteSolutionMutation,
  useToggleActiveSolutionMutation,
  useReorderSolutionsMutation,
} = solutionsApi;
