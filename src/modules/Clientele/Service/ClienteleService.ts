import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  ClientBrand,
  SaveClientBrandDto,
  ReorderClienteleDto,
} from '../Model/ClienteleTypes';

export const clienteleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminClientele: builder.query<ApiResponse<readonly ClientBrand[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/clientele/admin?siteVariant=${siteVariant}` : '/api/v1/clientele/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    getClientBrandById: builder.query<ApiResponse<ClientBrand>, string>({
      query: (id) => ({
        url: `/api/v1/clientele/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createClientBrand: builder.mutation<ApiResponse<ClientBrand>, SaveClientBrandDto>({
      query: (data) => ({
        url: '/api/v1/clientele',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateClientBrand: builder.mutation<ApiResponse<ClientBrand>, { id: string } & SaveClientBrandDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/clientele/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteClientBrand: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/clientele/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveClientBrand: builder.mutation<ApiResponse<ClientBrand>, string>({
      query: (id) => ({
        url: `/api/v1/clientele/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleFeaturedClientBrand: builder.mutation<ApiResponse<ClientBrand>, string>({
      query: (id) => ({
        url: `/api/v1/clientele/${id}/toggle-featured`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderClientele: builder.mutation<ApiResponse<{ message: string }>, ReorderClienteleDto>({
      query: (data) => ({
        url: '/api/v1/clientele/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminClienteleQuery,
  useGetClientBrandByIdQuery,
  useCreateClientBrandMutation,
  useUpdateClientBrandMutation,
  useDeleteClientBrandMutation,
  useToggleActiveClientBrandMutation,
  useToggleFeaturedClientBrandMutation,
  useReorderClienteleMutation,
} = clienteleApi;
