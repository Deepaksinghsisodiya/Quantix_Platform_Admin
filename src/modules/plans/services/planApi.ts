import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type { Plan, CreatePlanDto, UpdatePlanDto } from '../types/plan.types';

export const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlansList: builder.query<ApiResponse<readonly Plan[]>, void>({
      query: () => ({
        url: '/api/v1/billing/plans',
        method: 'GET',
      }),
      providesTags: ['Plans'],
    }),

    getPlanById: builder.query<ApiResponse<Plan>, string>({
      query: (id) => ({
        url: `/api/v1/billing/plans/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Plans', id }],
    }),

    createPlan: builder.mutation<ApiResponse<Plan>, CreatePlanDto>({
      query: (data) => ({
        url: '/api/v1/billing/plans',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Plans'],
    }),

    updatePlan: builder.mutation<ApiResponse<Plan>, UpdatePlanDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/billing/plans/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Plans'],
    }),

    togglePlanStatus: builder.mutation<ApiResponse<Plan>, { id: string; status: 'Active' | 'Inactive' }>({
      query: ({ id, status }) => ({
        url: `/api/v1/billing/plans/${id}/status`,
        method: 'PATCH',
        data: { status },
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
  }),
});

export const {
  useGetPlansListQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useTogglePlanStatusMutation,
  useDeletePlanMutation,
} = planApi;
