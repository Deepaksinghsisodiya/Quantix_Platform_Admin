import { baseApi } from '@/core/services/baseApi';
import { postForm } from '@/lib/api/client';
import { resolveApiUrl } from '@/lib/config/runtimeConfig';
import type { ApiResponse, PagedResponse } from '@/lib/types';

/**
 * 2026-09-05 (content Phase 1) — the media library.
 *
 * Before this the portal had no way to get an image onto the server at all. Every image field
 * was a text box for a URL the operator had to host elsewhere, and the two finished drag-and-drop
 * upload components in shared/ui had zero consumers.
 */

/** Mirror of the API's MediaAssetDto. */
export interface MediaAsset {
  readonly assetId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly altText: string | null;
  readonly caption: string | null;
  readonly folder: string;
  readonly isVideo: boolean;
  readonly createdAt: string;
  /** Relative to the API base — see absoluteMediaUrl below. */
  readonly url: string;
}

export interface MediaReference {
  readonly usedBy: string;
  readonly title: string;
}

export interface MediaListParams {
  readonly folder?: string;
  readonly search?: string;
  readonly videosOnly?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface UpdateMediaAssetDto {
  readonly assetId: string;
  readonly altText?: string | null;
  readonly caption?: string | null;
  readonly folder?: string;
}

/**
 * The API returns a RELATIVE url so a stored row survives a change of deployment host. Anything
 * that renders an image has to resolve it against whichever API base this build is pointed at,
 * which is the same runtime config every other call uses.
 */
export function absoluteMediaUrl(url: string): string {
  return resolveApiUrl(url);
}

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMediaAssets: builder.query<PagedResponse<MediaAsset>, MediaListParams>({
      query: (params) => ({ url: '/api/v1/media', method: 'GET', params }),
      providesTags: ['Media'],
    }),

    getMediaFolders: builder.query<ApiResponse<string[]>, void>({
      query: () => ({ url: '/api/v1/media/folders', method: 'GET' }),
      providesTags: ['Media'],
    }),

    getMediaReferences: builder.query<ApiResponse<MediaReference[]>, string>({
      query: (assetId) => ({ url: `/api/v1/media/${assetId}/references`, method: 'GET' }),
      providesTags: ['Media'],
    }),

    updateMediaAsset: builder.mutation<ApiResponse<MediaAsset>, UpdateMediaAssetDto>({
      query: ({ assetId, ...data }) => ({ url: `/api/v1/media/${assetId}`, method: 'PUT', data }),
      invalidatesTags: ['Media'],
    }),

    deleteMediaAsset: builder.mutation<ApiResponse<unknown>, string>({
      query: (assetId) => ({ url: `/api/v1/media/${assetId}`, method: 'DELETE' }),
      invalidatesTags: ['Media'],
    }),
  }),
});

/**
 * Upload goes through the multipart helper rather than an RTK endpoint: the shared base query
 * serialises a JSON body, and this is the one call in the module that sends FormData. Callers
 * invalidate the Media tag afterwards so the library refreshes.
 */
export async function uploadMediaAsset(
  file: File,
  opts: { folder?: string; altText?: string; caption?: string } = {},
): Promise<MediaAsset> {
  const form = new FormData();
  form.append('file', file);
  if (opts.folder) form.append('folder', opts.folder);
  if (opts.altText) form.append('altText', opts.altText);
  if (opts.caption) form.append('caption', opts.caption);
  const res = await postForm<ApiResponse<MediaAsset>>('/api/v1/media', form);
  return res.data;
}

export const {
  useGetMediaAssetsQuery,
  useGetMediaFoldersQuery,
  useGetMediaReferencesQuery,
  useUpdateMediaAssetMutation,
  useDeleteMediaAssetMutation,
} = mediaApi;
