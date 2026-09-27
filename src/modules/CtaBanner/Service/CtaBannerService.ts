import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  CtaBannerItem,
  SaveCtaBannerPayload,
} from '../Model/CtaBannerTypes';

export const ctaBannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCtaBanners: builder.query<ApiResponse<readonly CtaBannerItem[]>, { siteVariant?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/cta-banner/admin?${queryStr}` : '/api/v1/cta-banner/admin',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getCtaBannerById: builder.query<ApiResponse<CtaBannerItem>, string>({
      query: (id) => ({
        url: `/api/v1/cta-banner/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createCtaBanner: builder.mutation<ApiResponse<CtaBannerItem>, SaveCtaBannerPayload>({
      query: (data) => ({
        url: '/api/v1/cta-banner',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateCtaBanner: builder.mutation<ApiResponse<CtaBannerItem>, { id: string } & SaveCtaBannerPayload>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/cta-banner/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteCtaBanner: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/cta-banner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveCtaBanner: builder.mutation<ApiResponse<CtaBannerItem>, string>({
      query: (id) => ({
        url: `/api/v1/cta-banner/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminCtaBannersQuery,
  useGetCtaBannerByIdQuery,
  useCreateCtaBannerMutation,
  useUpdateCtaBannerMutation,
  useDeleteCtaBannerMutation,
  useToggleActiveCtaBannerMutation,
} = ctaBannerApi;
