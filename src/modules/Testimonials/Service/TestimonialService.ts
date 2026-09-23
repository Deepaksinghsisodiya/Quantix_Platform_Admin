import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  TestimonialItem,
  SaveTestimonialDto,
  ReorderTestimonialsDto,
} from '../Model/TestimonialTypes';

export const testimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminTestimonials: builder.query<ApiResponse<readonly TestimonialItem[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/testimonials/admin?siteVariant=${siteVariant}` : '/api/v1/testimonials/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    getTestimonialById: builder.query<ApiResponse<TestimonialItem>, string>({
      query: (id) => ({
        url: `/api/v1/testimonials/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createTestimonial: builder.mutation<ApiResponse<TestimonialItem>, SaveTestimonialDto>({
      query: (data) => ({
        url: '/api/v1/testimonials',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateTestimonial: builder.mutation<ApiResponse<TestimonialItem>, { id: string } & SaveTestimonialDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/testimonials/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteTestimonial: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/testimonials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderTestimonials: builder.mutation<ApiResponse<{ message: string }>, ReorderTestimonialsDto>({
      query: (data) => ({
        url: '/api/v1/testimonials/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useReorderTestimonialsMutation,
} = testimonialApi;
