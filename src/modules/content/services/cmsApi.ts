import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';

/**
 * 2026-09-05 (content Phase 2) — the CMS content blocks the website renders.
 *
 * The Marketing Content page was calling two endpoints that do not exist. It read
 * `GET /marketing/content/homepage`, but that route's parameter is a CmsContentType and
 * "homepage" is not one of its members, so the request 400'd. It saved with
 * `PUT /marketing/content`, where only `POST /marketing/content` and `PUT /marketing/content/{id}`
 * exist, so the save 405'd. The page had therefore never loaded or saved anything, which is why
 * hero banners, testimonials and case studies could not be edited at all.
 *
 * These are the routes MarketingController actually exposes.
 */

/**
 * The members of CmsContentType, in the order the marketing site uses them.
 * 2026-09-08: `Testimonial` is gone from the enum. Testimonials have had their own table and page
 * (a person, a company, a rating) since content Phase 3; the untyped block type duplicated it.
 */
export const CMS_CONTENT_TYPES = [
  'HeroBanner',
  'FeatureHighlight',
  'CaseStudy',
  'PricingNote',
  'CTA',
  'FooterContent',
] as const;

export type CmsContentType = (typeof CMS_CONTENT_TYPES)[number];

export const CMS_TYPE_LABEL: Record<CmsContentType, string> = {
  HeroBanner: 'Hero Banner',
  FeatureHighlight: 'Feature Highlight',
  CaseStudy: 'Case Study',
  PricingNote: 'Pricing Note',
  CTA: 'Call to Action',
  FooterContent: 'Footer Content',
};

export interface CmsContent {
  readonly contentId: string;
  readonly contentType: CmsContentType;
  readonly title: string;
  readonly body: string | null;
  readonly imageUrl: string | null;
  readonly imageAssetId: string | null;
  readonly linkUrl: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly pageSlug: string | null;
  readonly locale: string;
  readonly createdAt: string;
}

export interface SaveCmsContentDto {
  readonly contentType?: CmsContentType;
  readonly title: string;
  readonly body?: string | null;
  readonly imageUrl?: string | null;
  readonly imageAssetId?: string | null;
  readonly linkUrl?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
  readonly pageSlug?: string | null;
  readonly locale?: string;
}

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCmsContentByType: builder.query<ApiResponse<readonly CmsContent[]>, CmsContentType>({
      query: (contentType) => ({ url: `/api/v1/marketing/content/${contentType}`, method: 'GET' }),
      providesTags: ['Content'],
    }),

    createCmsContent: builder.mutation<ApiResponse<CmsContent>, SaveCmsContentDto>({
      query: (data) => ({ url: '/api/v1/marketing/content', method: 'POST', data }),
      invalidatesTags: ['Content'],
    }),

    updateCmsContent: builder.mutation<ApiResponse<CmsContent>, { contentId: string } & SaveCmsContentDto>({
      query: ({ contentId, ...data }) => ({
        url: `/api/v1/marketing/content/${contentId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteCmsContent: builder.mutation<ApiResponse<unknown>, string>({
      query: (contentId) => ({ url: `/api/v1/marketing/content/${contentId}`, method: 'DELETE' }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetCmsContentByTypeQuery,
  useCreateCmsContentMutation,
  useUpdateCmsContentMutation,
  useDeleteCmsContentMutation,
} = cmsApi;
