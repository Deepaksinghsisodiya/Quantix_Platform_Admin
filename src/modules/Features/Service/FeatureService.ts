import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  PlatformFeature,
  SavePlatformFeatureDto,
} from '../Model/FeatureTypes';

export const featuresApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFeatures: builder.query<ApiResponse<readonly PlatformFeature[]>, { siteVariant?: string; category?: string; search?: string } | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && arg.siteVariant) params.append('siteVariant', arg.siteVariant);
        if (arg && arg.category) params.append('category', arg.category);
        if (arg && arg.search) params.append('search', arg.search);
        const queryStr = params.toString();
        return {
          url: queryStr ? `/api/v1/features?${queryStr}` : '/api/v1/features',
          method: 'GET',
        };
      },
      providesTags: ['Content'],
    }),

    getFeatureById: builder.query<ApiResponse<PlatformFeature>, string>({
      query: (id) => ({
        url: `/api/v1/features/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createFeature: builder.mutation<ApiResponse<PlatformFeature>, SavePlatformFeatureDto>({
      query: (data) => ({
        url: '/api/v1/features',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateFeature: builder.mutation<ApiResponse<PlatformFeature>, { id: string } & SavePlatformFeatureDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/features/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteFeature: builder.mutation<ApiResponse<{ message: string } | boolean>, string>({
      query: (id) => ({
        url: `/api/v1/features/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveFeature: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/features/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleNavbarFeature: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/features/${id}/toggle-navbar`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminFeaturesQuery,
  useGetFeatureByIdQuery,
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useDeleteFeatureMutation,
  useToggleActiveFeatureMutation,
  useToggleNavbarFeatureMutation,
} = featuresApi;
