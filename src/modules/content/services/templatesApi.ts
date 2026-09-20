import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';

/**
 * 2026-09-08 (content Phase 4) — article templates: the skeleton a writer starts a blog post or
 * help article from. Mirrors `ArticleTemplateDto` / `SaveArticleTemplateDto` on
 * /api/v1/content/templates. Staff-only in both directions.
 */

export type ArticleTemplateKind = 'Any' | 'Blog' | 'HelpArticle';

export const TEMPLATE_KIND_LABEL: Record<ArticleTemplateKind, string> = {
  Any: 'Blog and help articles',
  Blog: 'Blog posts',
  HelpArticle: 'Help articles',
};

export interface ArticleTemplate {
  readonly templateId: string;
  readonly name: string;
  readonly description: string | null;
  readonly kind: ArticleTemplateKind;
  readonly titlePattern: string | null;
  readonly body: string;
  readonly excerpt: string | null;
  readonly tags: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string | null;
}

export interface SaveArticleTemplateDto {
  readonly name: string;
  readonly description?: string | null;
  readonly kind: ArticleTemplateKind;
  readonly titlePattern?: string | null;
  readonly body: string;
  readonly excerpt?: string | null;
  readonly tags?: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticleTemplates: builder.query<ApiResponse<readonly ArticleTemplate[]>, { kind?: ArticleTemplateKind; includeInactive?: boolean }>({
      query: (params) => ({ url: '/api/v1/content/templates', method: 'GET', params }),
      providesTags: ['Content'],
    }),
    createArticleTemplate: builder.mutation<ApiResponse<ArticleTemplate>, SaveArticleTemplateDto>({
      query: (data) => ({ url: '/api/v1/content/templates', method: 'POST', data }),
      invalidatesTags: ['Content'],
    }),
    updateArticleTemplate: builder.mutation<ApiResponse<ArticleTemplate>, { templateId: string } & SaveArticleTemplateDto>({
      query: ({ templateId, ...data }) => ({ url: `/api/v1/content/templates/${templateId}`, method: 'PUT', data }),
      invalidatesTags: ['Content'],
    }),
    deleteArticleTemplate: builder.mutation<ApiResponse<boolean>, string>({
      query: (templateId) => ({ url: `/api/v1/content/templates/${templateId}`, method: 'DELETE' }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetArticleTemplatesQuery,
  useCreateArticleTemplateMutation,
  useUpdateArticleTemplateMutation,
  useDeleteArticleTemplateMutation,
} = templatesApi;
