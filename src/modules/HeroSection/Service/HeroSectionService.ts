import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  HeroSlide,
  SaveHeroSlideDto,
  ReorderHeroSlidesDto,
} from '../Model/HeroSectionTypes';

export const heroSectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminHeroSlides: builder.query<ApiResponse<readonly HeroSlide[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/hero-slides/admin?siteVariant=${siteVariant}` : '/api/v1/hero-slides/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    getHeroSlideById: builder.query<ApiResponse<HeroSlide>, string>({
      query: (id) => ({
        url: `/api/v1/hero-slides/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createHeroSlide: builder.mutation<ApiResponse<HeroSlide>, SaveHeroSlideDto>({
      query: (data) => ({
        url: '/api/v1/hero-slides',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateHeroSlide: builder.mutation<ApiResponse<HeroSlide>, { id: string } & SaveHeroSlideDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/hero-slides/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteHeroSlide: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/hero-slides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderHeroSlides: builder.mutation<ApiResponse<{ message: string }>, ReorderHeroSlidesDto>({
      query: (data) => ({
        url: '/api/v1/hero-slides/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminHeroSlidesQuery,
  useGetHeroSlideByIdQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useReorderHeroSlidesMutation,
} = heroSectionApi;
