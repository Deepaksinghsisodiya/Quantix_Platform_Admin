import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';

export interface HeroSlide {
  readonly heroSlideId: string;
  readonly siteVariant: string;
  readonly badge: string;
  readonly heading: string;
  readonly subheading: string | null;
  readonly primaryCtaLabel: string | null;
  readonly primaryCtaUrl: string | null;
  readonly secondaryCtaLabel: string | null;
  readonly secondaryCtaUrl: string | null;
  readonly featureHighlights: readonly string[];
  readonly mediaAssetId: string | null;
  readonly imageUrl: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveHeroSlideDto {
  readonly siteVariant: string;
  readonly badge: string;
  readonly heading: string;
  readonly subheading?: string | null;
  readonly primaryCtaLabel?: string | null;
  readonly primaryCtaUrl?: string | null;
  readonly secondaryCtaLabel?: string | null;
  readonly secondaryCtaUrl?: string | null;
  readonly featureHighlights?: readonly string[];
  readonly mediaAssetId?: string | null;
  readonly imageUrl?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderHeroSlidesDto {
  readonly orderedIds: readonly string[];
}

export const heroSlidesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminHeroSlides: builder.query<ApiResponse<readonly HeroSlide[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/hero-slides/admin?siteVariant=${siteVariant}` : '/api/v1/hero-slides/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
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
});

export const {
  useGetAdminHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useReorderHeroSlidesMutation,
} = heroSlidesApi;
