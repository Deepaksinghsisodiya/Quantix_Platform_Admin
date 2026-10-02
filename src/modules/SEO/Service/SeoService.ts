import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type { SeoMetadataItem, SaveSeoMetadataPayload } from '../Model/SeoTypes';

export const seoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSeoList: builder.query<ApiResponse<readonly SeoMetadataItem[]>, { siteVariant?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/seo/admin?${queryStr}` : '/api/v1/seo/admin',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getSeoById: builder.query<ApiResponse<SeoMetadataItem>, string>({
      query: (id) => ({
        url: `/api/v1/seo/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    saveSeoMetadata: builder.mutation<ApiResponse<SeoMetadataItem>, SaveSeoMetadataPayload>({
      query: (data) => ({
        url: '/api/v1/seo/admin',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateSeoMetadata: builder.mutation<ApiResponse<SeoMetadataItem>, { id: string } & SaveSeoMetadataPayload>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/seo/admin/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteSeoMetadata: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/seo/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveSeo: builder.mutation<ApiResponse<SeoMetadataItem>, string>({
      query: (id) => ({
        url: `/api/v1/seo/admin/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetAdminSeoListQuery,
  useGetSeoByIdQuery,
  useSaveSeoMetadataMutation,
  useUpdateSeoMetadataMutation,
  useDeleteSeoMetadataMutation,
  useToggleActiveSeoMutation,
} = seoApi;
