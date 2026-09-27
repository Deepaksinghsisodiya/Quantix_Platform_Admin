import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  SupportSectionItem,
  SaveSupportSectionPayload,
} from '../Model/CustomerSupportTypes';

export const customerSupportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSupportSections: builder.query<ApiResponse<readonly SupportSectionItem[]>, { siteVariant?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/support-section/admin?${queryStr}` : '/api/v1/support-section/admin',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getSupportSectionById: builder.query<ApiResponse<SupportSectionItem>, string>({
      query: (id) => ({
        url: `/api/v1/support-section/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createSupportSection: builder.mutation<ApiResponse<SupportSectionItem>, SaveSupportSectionPayload>({
      query: (data) => ({
        url: '/api/v1/support-section',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateSupportSection: builder.mutation<ApiResponse<SupportSectionItem>, { id: string } & SaveSupportSectionPayload>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/support-section/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteSupportSection: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/support-section/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveSupportSection: builder.mutation<ApiResponse<SupportSectionItem>, string>({
      query: (id) => ({
        url: `/api/v1/support-section/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminSupportSectionsQuery,
  useGetSupportSectionByIdQuery,
  useCreateSupportSectionMutation,
  useUpdateSupportSectionMutation,
  useDeleteSupportSectionMutation,
  useToggleActiveSupportSectionMutation,
} = customerSupportApi;
