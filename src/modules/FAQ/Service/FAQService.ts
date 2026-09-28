import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse, PagedResponse } from '@/lib/types/common';
import type { FAQItem, SaveFAQPayload } from '../Model/FAQTypes';

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFaqs: builder.query<PagedResponse<FAQItem>, { category?: string; merchantType?: string } | void>({
      query: (arg) => {
        const params: Record<string, string> = {};
        if (arg?.category && arg.category !== '__all__') params.category = arg.category;
        if (arg?.merchantType && arg.merchantType !== '__all__') params.merchantType = arg.merchantType;
        return {
          url: '/api/v1/help-centre/faqs',
          method: 'GET',
          params: Object.keys(params).length > 0 ? params : undefined,
        };
      },
      providesTags: ['Content'],
    }),

    getFaqById: builder.query<FAQItem | undefined, string>({
      query: () => ({
        url: '/api/v1/help-centre/faqs',
        method: 'GET',
      }),
      transformResponse: (response: PagedResponse<FAQItem>, _meta, id) => {
        return response.data?.find((f) => f.faqId === id);
      },
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    getFaqCategories: builder.query<ApiResponse<readonly string[]>, void>({
      query: () => ({
        url: '/api/v1/help-centre/faqs/categories',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    createFaq: builder.mutation<ApiResponse<FAQItem>, SaveFAQPayload>({
      query: (data) => ({
        url: '/api/v1/help-centre/faqs',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateFaq: builder.mutation<ApiResponse<FAQItem>, { id: string } & SaveFAQPayload>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/help-centre/faqs/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteFaq: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/api/v1/help-centre/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveFaq: builder.mutation<ApiResponse<FAQItem>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/v1/help-centre/faqs/${id}`,
        method: 'PUT',
        data: { isActive },
      }),
      invalidatesTags: ['Content'],
    }),

    reorderFaqs: builder.mutation<ApiResponse<unknown>, readonly string[]>({
      query: (orderedIds) => ({
        url: '/api/v1/help-centre/faqs/reorder',
        method: 'POST',
        data: { orderedIds },
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminFaqsQuery,
  useGetFaqByIdQuery,
  useGetFaqCategoriesQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useToggleActiveFaqMutation,
  useReorderFaqsMutation,
} = faqApi;
