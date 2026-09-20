import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';

/**
 * 2026-09-05 (content Phase 3) — testimonials, announcements, clientele and galleries.
 *
 * None of these existed in any form: no entity, no endpoint, no page. Testimonials came closest,
 * as a row type in the shared CmsContent table with a title, a body and an image, and no field
 * for who said it, where they work or what they rated.
 */

/** The fields every website content block shares. */
export interface WebsiteContentBase {
  readonly title: string;
  readonly body: string | null;
  readonly mediaAssetId: string | null;
  readonly linkUrl: string | null;
  readonly pageSlug: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  /** Optional visibility window. Outside it, the public simply does not see the block. */
  readonly publishFrom: string | null;
  readonly publishUntil: string | null;
}

export interface Testimonial extends WebsiteContentBase {
  readonly testimonialId: string;
  readonly personName: string;
  readonly personRole: string | null;
  readonly companyName: string | null;
  readonly rating: number | null;
  readonly merchantType: string | null;
  readonly createdAt: string;
}

export interface Announcement extends WebsiteContentBase {
  readonly announcementId: string;
  readonly kind: 'News' | 'Event' | 'Notice';
  readonly eventStartsAt: string | null;
  readonly eventEndsAt: string | null;
  readonly location: string | null;
  readonly isPinned: boolean;
  readonly createdAt: string;
}

export interface ClientLogo extends WebsiteContentBase {
  readonly clientLogoId: string;
  readonly websiteUrl: string | null;
  readonly industry: string | null;
  readonly isFeatured: boolean;
  readonly createdAt: string;
}

export interface GalleryItem {
  readonly galleryItemId: string;
  readonly galleryId: string;
  readonly mediaAssetId: string | null;
  readonly externalVideoUrl: string | null;
  readonly caption: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface Gallery extends WebsiteContentBase {
  readonly galleryId: string;
  readonly slug: string;
  readonly itemCount: number;
  readonly items: readonly GalleryItem[];
  readonly createdAt: string;
}

type Save = Record<string, unknown>;

export const websiteContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Testimonials
    getTestimonials: builder.query<ApiResponse<readonly Testimonial[]>, void>({
      query: () => ({ url: '/api/v1/testimonials', method: 'GET' }),
      providesTags: ['Content'],
    }),
    saveTestimonial: builder.mutation<ApiResponse<Testimonial>, { id?: string } & Save>({
      query: ({ id, ...data }) => ({
        url: id ? `/api/v1/testimonials/${id}` : '/api/v1/testimonials',
        method: id ? 'PUT' : 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
    deleteTestimonial: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({ url: `/api/v1/testimonials/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Content'],
    }),

    // Announcements
    getAnnouncements: builder.query<ApiResponse<readonly Announcement[]>, void>({
      query: () => ({ url: '/api/v1/announcements', method: 'GET' }),
      providesTags: ['Content'],
    }),
    saveAnnouncement: builder.mutation<ApiResponse<Announcement>, { id?: string } & Save>({
      query: ({ id, ...data }) => ({
        url: id ? `/api/v1/announcements/${id}` : '/api/v1/announcements',
        method: id ? 'PUT' : 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
    deleteAnnouncement: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({ url: `/api/v1/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Content'],
    }),

    // Clientele
    getClientele: builder.query<ApiResponse<readonly ClientLogo[]>, void>({
      query: () => ({ url: '/api/v1/clientele', method: 'GET' }),
      providesTags: ['Content'],
    }),
    saveClient: builder.mutation<ApiResponse<ClientLogo>, { id?: string } & Save>({
      query: ({ id, ...data }) => ({
        url: id ? `/api/v1/clientele/${id}` : '/api/v1/clientele',
        method: id ? 'PUT' : 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
    deleteClient: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({ url: `/api/v1/clientele/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Content'],
    }),

    // Galleries
    getGalleries: builder.query<ApiResponse<readonly Gallery[]>, void>({
      query: () => ({ url: '/api/v1/galleries', method: 'GET' }),
      providesTags: ['Content'],
    }),
    getGallery: builder.query<ApiResponse<Gallery>, string>({
      query: (slug) => ({ url: `/api/v1/galleries/${slug}`, method: 'GET' }),
      providesTags: ['Content'],
    }),
    saveGallery: builder.mutation<ApiResponse<Gallery>, { id?: string } & Save>({
      query: ({ id, ...data }) => ({
        url: id ? `/api/v1/galleries/${id}` : '/api/v1/galleries',
        method: id ? 'PUT' : 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
    deleteGallery: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({ url: `/api/v1/galleries/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Content'],
    }),

    // Gallery items
    saveGalleryItem: builder.mutation<ApiResponse<GalleryItem>, { galleryId: string; itemId?: string } & Save>({
      query: ({ galleryId, itemId, ...data }) => ({
        url: itemId
          ? `/api/v1/galleries/${galleryId}/items/${itemId}`
          : `/api/v1/galleries/${galleryId}/items`,
        method: itemId ? 'PUT' : 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
    deleteGalleryItem: builder.mutation<ApiResponse<unknown>, { galleryId: string; itemId: string }>({
      query: ({ galleryId, itemId }) => ({
        url: `/api/v1/galleries/${galleryId}/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetTestimonialsQuery,
  useSaveTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetAnnouncementsQuery,
  useSaveAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetClienteleQuery,
  useSaveClientMutation,
  useDeleteClientMutation,
  useGetGalleriesQuery,
  useGetGalleryQuery,
  useSaveGalleryMutation,
  useDeleteGalleryMutation,
  useSaveGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = websiteContentApi;
