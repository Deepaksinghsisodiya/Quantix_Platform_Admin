import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  IntegrationItem,
  SaveIntegrationDto,
  ReorderIntegrationsDto,
} from '../Model/IntegrationTypes';

export const integrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminIntegrations: builder.query<ApiResponse<readonly IntegrationItem[]>, { siteVariant?: string; category?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.siteVariant) queryParams.append('siteVariant', params.siteVariant);
        if (params?.category) queryParams.append('category', params.category);
        const qs = queryParams.toString();
        return {
          url: qs ? `/api/v1/integrations/admin?${qs}` : '/api/v1/integrations/admin',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getIntegrationById: builder.query<ApiResponse<IntegrationItem>, string>({
      query: (id) => ({
        url: `/api/v1/integrations/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createIntegration: builder.mutation<ApiResponse<IntegrationItem>, SaveIntegrationDto>({
      query: (data) => ({
        url: '/api/v1/integrations',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateIntegration: builder.mutation<ApiResponse<IntegrationItem>, { id: string } & SaveIntegrationDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/integrations/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteIntegration: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/integrations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveIntegration: builder.mutation<ApiResponse<IntegrationItem>, string>({
      query: (id) => ({
        url: `/api/v1/integrations/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    togglePopularIntegration: builder.mutation<ApiResponse<IntegrationItem>, string>({
      query: (id) => ({
        url: `/api/v1/integrations/${id}/toggle-popular`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleNavbarIntegration: builder.mutation<ApiResponse<IntegrationItem>, string>({
      query: (id) => ({
        url: `/api/v1/integrations/${id}/toggle-navbar`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderIntegrations: builder.mutation<ApiResponse<{ message: string }>, ReorderIntegrationsDto>({
      query: (data) => ({
        url: '/api/v1/integrations/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminIntegrationsQuery,
  useGetIntegrationByIdQuery,
  useCreateIntegrationMutation,
  useUpdateIntegrationMutation,
  useDeleteIntegrationMutation,
  useToggleActiveIntegrationMutation,
  useTogglePopularIntegrationMutation,
  useToggleNavbarIntegrationMutation,
  useReorderIntegrationsMutation,
} = integrationApi;

