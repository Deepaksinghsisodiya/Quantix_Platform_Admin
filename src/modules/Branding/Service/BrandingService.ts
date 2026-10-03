import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type { BrandingItem, SaveBrandingPayload } from '../Model/BrandingTypes';

export const brandingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminBranding: builder.query<ApiResponse<BrandingItem[]>, { siteVariant?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/branding/admin?${queryStr}` : '/api/v1/branding/admin',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    saveBranding: builder.mutation<ApiResponse<BrandingItem>, SaveBrandingPayload>({
      query: (data) => ({
        url: '/api/v1/branding',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetAdminBrandingQuery,
  useSaveBrandingMutation,
} = brandingApi;
