import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type { BlogPost, HelpArticle, FAQ, MarketingContent } from '@/lib/types';

export interface BlogPostParams extends Partial<PaginationParams> {
  readonly status?: string;
  readonly search?: string;
  readonly tag?: string;
}

export interface CreateBlogPostDto {
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly status: string;
  readonly tags: readonly string[];
  readonly featuredImage?: string;
  readonly seoMetadata?: {
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly keywords: readonly string[];
  };
}

export interface UpdateBlogPostDto extends Partial<CreateBlogPostDto> {
  readonly id: string;
}

export interface HelpArticleParams extends Partial<PaginationParams> {
  readonly category?: string;
  readonly status?: string;
  readonly search?: string;
}

export interface FaqParams extends Partial<PaginationParams> {
  readonly category?: string;
  readonly search?: string;
}

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogPosts: builder.query<ApiResponse<PaginatedResult<BlogPost>>, BlogPostParams>({
      query: (params) => ({
        url: '/api/v1/blog/posts',
        method: 'GET',
        params,
      }),
      providesTags: ['Tasks' as any], // Wait, using Tasks or a generic content tag, or we can use custom tags since baseApi registers custom tags. Let's see what tags baseApi has.
      // baseApi has: 'Sessions', 'Tasks', 'Settings', etc. Let's check baseApi.ts tags:
      // It has 'Tasks', 'Settings', 'TimeEntries', 'AuditLogs', 'Dashboard', 'Merchants', 'Deboarding', 'Terminals', 'SignupQueue', 'Webhooks'.
      // Since it doesn't have a specific 'Content' tag, we can map to 'Tasks' or use 'Settings' or use type casting as any.
    }),

    getBlogPost: builder.query<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'GET',
      }),
    }),

    createBlogPost: builder.mutation<ApiResponse<BlogPost>, CreateBlogPostDto>({
      query: (data) => ({
        url: '/api/v1/blog/posts',
        method: 'POST',
        data,
      }),
    }),

    updateBlogPost: builder.mutation<ApiResponse<BlogPost>, UpdateBlogPostDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'PUT',
        data,
      }),
    }),

    getHelpArticles: builder.query<ApiResponse<PaginatedResult<HelpArticle>>, HelpArticleParams>({
      query: (params) => ({
        url: '/api/v1/help-centre/articles',
        method: 'GET',
        params,
      }),
    }),

    getFaqs: builder.query<ApiResponse<PaginatedResult<FAQ>>, FaqParams>({
      query: (params) => ({
        url: '/api/v1/help-centre/faqs',
        method: 'GET',
        params,
      }),
    }),

    getMarketingContent: builder.query<ApiResponse<readonly MarketingContent[]>, void>({
      query: () => ({
        url: '/api/v1/marketing/content/homepage',
        method: 'GET',
      }),
    }),

    updateMarketingContent: builder.mutation<ApiResponse<MarketingContent>, { section: string; content: string; status: string }>({
      query: (data) => ({
        url: '/api/v1/marketing/content',
        method: 'PUT',
        data,
      }),
    }),

    deleteBlogPost: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'DELETE',
      }),
    }),

    scheduleBlogPost: builder.mutation<ApiResponse<BlogPost>, { id: string; scheduleDate: string }>({
      query: ({ id, scheduleDate }) => ({
        url: `/api/v1/blog/posts/${id}/schedule`,
        method: 'POST',
        data: { scheduleDate },
      }),
    }),

    deleteHelpArticle: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/help-centre/articles/${id}`,
        method: 'DELETE',
      }),
    }),

    deleteFaq: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/help-centre/faqs/${id}`,
        method: 'DELETE',
      }),
    }),

    reorderFaqs: builder.mutation<ApiResponse<unknown>, readonly string[]>({
      query: (orderedIds) => ({
        url: '/api/v1/help-centre/faqs/reorder',
        method: 'POST',
        data: { orderedIds },
      }),
    }),

    submitForReview: builder.mutation<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}/publish`,
        method: 'POST',
        data: { status: 'pending_review' },
      }),
    }),

    approveReview: builder.mutation<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}/publish`,
        method: 'POST',
      }),
    }),

    rejectReview: builder.mutation<ApiResponse<BlogPost>, { id: string; feedback: string }>({
      query: ({ id, feedback }) => ({
        url: `/api/v1/blog/posts/${id}/archive`,
        method: 'POST',
        data: { feedback },
      }),
    }),

    unpublishBlogPost: builder.mutation<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}/archive`,
        method: 'POST',
      }),
    }),

    setAutoUnpublish: builder.mutation<ApiResponse<BlogPost>, { id: string; unpublishAt: string }>({
      query: ({ id, unpublishAt }) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'PUT',
        data: { autoArchiveAt: unpublishAt },
      }),
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useGetHelpArticlesQuery,
  useGetFaqsQuery,
  useGetMarketingContentQuery,
  useUpdateMarketingContentMutation,
  useDeleteBlogPostMutation,
  useScheduleBlogPostMutation,
  useDeleteHelpArticleMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
  useSubmitForReviewMutation,
  useApproveReviewMutation,
  useRejectReviewMutation,
  useUnpublishBlogPostMutation,
  useSetAutoUnpublishMutation,
} = contentApi;
