import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PagedResponse, PaginationParams } from '@/lib/types/common';
import type { BlogPost, HelpArticle, FAQ, MarketingContent } from '@/lib/types';

export interface BlogPostParams extends Partial<PaginationParams> {
  readonly status?: string;
  readonly search?: string;
  readonly tag?: string;
  /**
   * 2026-09-05 (content Phase 0): the API defaults this to true and now HONOURS it only for a
   * caller who passes the ContentManager policy — an anonymous request for unpublished posts
   * silently gets the published set instead. The admin list must send `false` explicitly, or
   * it sees published posts only and its Draft filter matches nothing, which is what it did
   * before this parameter existed.
   */
  readonly publishedOnly?: boolean;
}

/**
 * 2026-09-05 (content Phase 2): mirrors the API's BlogPostDto.
 *
 * The previous declaration described a shape the API has never accepted — `content` for the
 * body, a `tags` array where the server stores a comma-separated string, and a nested
 * `seoMetadata` object where the server has flat `seoTitle` / `seoDescription`. Because JSON
 * binding matches names case-insensitively but does not invent them, every one of those fields
 * was silently dropped on save. Only title, slug and status ever persisted.
 */
export interface CreateBlogPostDto {
  readonly title: string;
  readonly slug: string;
  readonly body?: string;
  readonly excerpt?: string;
  readonly status: string;
  /** Comma-separated, as stored. */
  readonly tags?: string;
  readonly categoryId?: string;
  readonly authorId?: string;
  readonly featuredImageUrl?: string;
  readonly featuredImageAssetId?: string;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly ogImageUrl?: string;
  readonly canonicalUrl?: string;
  /** Draft only. ScheduledPublishJob publishes it when this time passes. */
  readonly scheduledAt?: string;
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
    // 2026-09-05: these three answer with the API's paged envelope (data + totalCount),
    // not ApiResponse<PaginatedResult<T>> — the portal used to claim a total the API never sent.
    getBlogPosts: builder.query<PagedResponse<BlogPost>, BlogPostParams>({
      query: (params) => ({
        url: '/api/v1/blog/posts',
        method: 'GET',
        params,
      }),
      providesTags: ['Content'],
    }),

    getBlogPost: builder.query<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    createBlogPost: builder.mutation<ApiResponse<BlogPost>, CreateBlogPostDto>({
      query: (data) => ({
        url: '/api/v1/blog/posts',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateBlogPost: builder.mutation<ApiResponse<BlogPost>, UpdateBlogPostDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    getHelpArticles: builder.query<PagedResponse<HelpArticle>, HelpArticleParams>({
      query: (params) => ({
        url: '/api/v1/help-centre/articles',
        method: 'GET',
        params,
      }),
      providesTags: ['Content'],
    }),

    /** FAQs come back whole on one page — the API never truncates them. */
    getFaqs: builder.query<PagedResponse<FAQ>, FaqParams>({
      query: (params) => ({
        url: '/api/v1/help-centre/faqs',
        method: 'GET',
        params,
      }),
      providesTags: ['Content'],
    }),

    getMarketingContent: builder.query<ApiResponse<readonly MarketingContent[]>, void>({
      query: () => ({
        url: '/api/v1/marketing/content/homepage',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    updateMarketingContent: builder.mutation<ApiResponse<MarketingContent>, { section: string; content: string; status: string }>({
      query: (data) => ({
        url: '/api/v1/marketing/content',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteBlogPost: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    scheduleBlogPost: builder.mutation<ApiResponse<BlogPost>, { id: string; scheduleDate: string }>({
      query: ({ id, scheduleDate }) => ({
        url: `/api/v1/blog/posts/${id}/schedule`,
        method: 'POST',
        data: { scheduleDate },
      }),
      invalidatesTags: ['Content'],
    }),

    deleteHelpArticle: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/help-centre/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    deleteFaq: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/help-centre/faqs/${id}`,
        method: 'DELETE',
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

    submitForReview: builder.mutation<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}/publish`,
        method: 'POST',
        data: { status: 'pending_review' },
      }),
      invalidatesTags: ['Content'],
    }),

    approveReview: builder.mutation<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Content'],
    }),

    rejectReview: builder.mutation<ApiResponse<BlogPost>, { id: string; feedback: string }>({
      query: ({ id, feedback }) => ({
        url: `/api/v1/blog/posts/${id}/archive`,
        method: 'POST',
        data: { feedback },
      }),
      invalidatesTags: ['Content'],
    }),

    unpublishBlogPost: builder.mutation<ApiResponse<BlogPost>, string>({
      query: (id) => ({
        url: `/api/v1/blog/posts/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: ['Content'],
    }),

    setAutoUnpublish: builder.mutation<ApiResponse<BlogPost>, { id: string; unpublishAt: string }>({
      query: ({ id, unpublishAt }) => ({
        url: `/api/v1/blog/posts/${id}`,
        method: 'PUT',
        data: { autoArchiveAt: unpublishAt },
      }),
      invalidatesTags: ['Content'],
    }),
    // 2026-09-05 (content Phase 2): the write endpoints the portal never had. FAQ editing was
    // impossible from here (delete and reorder only) and help articles were read-only, which is
    // why both pages fell back to hardcoded arrays and "coming soon" toasts.
    createFaq: builder.mutation<ApiResponse<FAQ>, { question: string; answer: string; category?: string; merchantType?: string | null; sortOrder?: number }>({
      query: (data) => ({ url: '/api/v1/help-centre/faqs', method: 'POST', data }),
      invalidatesTags: ['Content'],
    }),

    updateFaq: builder.mutation<ApiResponse<FAQ>, { faqId: string; question?: string; answer?: string; category?: string; merchantType?: string | null; sortOrder?: number; isActive?: boolean }>({
      query: ({ faqId, ...data }) => ({ url: `/api/v1/help-centre/faqs/${faqId}`, method: 'PUT', data }),
      invalidatesTags: ['Content'],
    }),

    getFaqCategories: builder.query<ApiResponse<readonly string[]>, void>({
      query: () => ({ url: '/api/v1/help-centre/faqs/categories', method: 'GET' }),
      providesTags: ['Content'],
    }),

    getHelpArticle: builder.query<ApiResponse<HelpArticle>, string>({
      query: (slug) => ({ url: `/api/v1/help-centre/articles/${slug}`, method: 'GET' }),
      providesTags: ['Content'],
    }),

    createHelpArticle: builder.mutation<ApiResponse<HelpArticle>, Record<string, unknown>>({
      query: (data) => ({ url: '/api/v1/help-centre/articles', method: 'POST', data }),
      invalidatesTags: ['Content'],
    }),

    updateHelpArticle: builder.mutation<ApiResponse<HelpArticle>, { articleId: string } & Record<string, unknown>>({
      query: ({ articleId, ...data }) => ({ url: `/api/v1/help-centre/articles/${articleId}`, method: 'PUT', data }),
      invalidatesTags: ['Content'],
    }),

    getHelpCategories: builder.query<ApiResponse<readonly { contentId: string; title: string }[]>, void>({
      query: () => ({ url: '/api/v1/help-centre/categories', method: 'GET' }),
      providesTags: ['Content'],
    }),

    getBlogCategories: builder.query<ApiResponse<readonly { categoryId: string; name: string; slug: string }[]>, void>({
      query: () => ({ url: '/api/v1/blog/categories', method: 'GET' }),
      providesTags: ['Content'],
    }),

    getBlogAuthors: builder.query<ApiResponse<readonly { authorId: string; name: string; postCount: number }[]>, void>({
      query: () => ({ url: '/api/v1/blog/authors', method: 'GET' }),
      providesTags: ['Content'],
    }),
  }),
});

export const {
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useGetFaqCategoriesQuery,
  useGetHelpArticleQuery,
  useCreateHelpArticleMutation,
  useUpdateHelpArticleMutation,
  useGetHelpCategoriesQuery,
  useGetBlogCategoriesQuery,
  useGetBlogAuthorsQuery,
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
