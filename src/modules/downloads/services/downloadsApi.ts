import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';

/* ---------------------------------------------------------------------------
 * 2026-09-04: admin catalogue of download packages, typed against the wire.
 * Mirrors DownloadPackageDto / SaveDownloadPackageDto in
 * PlatformBusiness/DTOs/Download/DownloadGateDtos.cs.
 * ------------------------------------------------------------------------- */

/** One feature gate — the catalog code plus its display name, joined server-side. */
export interface DownloadFeatureGate {
  readonly featureCode: string;
  readonly featureName: string;
}

export interface DownloadPackage {
  readonly packageId: string;
  readonly appName: string;
  readonly platform: string;
  readonly version: string;
  readonly downloadUrl: string;
  /** Bytes. */
  readonly fileSize: number;
  readonly releaseNotes: string | null;
  readonly isLatest: boolean;
  readonly isActive: boolean;
  readonly releasedAt: string;
  readonly requiredFeatures: readonly DownloadFeatureGate[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

/** One payload for publish and edit — the server has one save path too. */
export interface SaveDownloadPackage {
  readonly appName: string;
  readonly platform: string;
  readonly version: string;
  readonly downloadUrl: string;
  readonly fileSize: number;
  readonly releaseNotes: string | null;
  readonly isLatest: boolean;
  readonly isActive: boolean;
  /** ISO instant; a date-only pick is sent as midnight UTC. */
  readonly releasedAt: string;
  readonly requiredFeatureCodes: readonly string[];
}

/** The save payload for an existing package, optionally with overrides (re-activation, etc.). */
export function toSavePayload(
  pkg: DownloadPackage,
  overrides: Partial<SaveDownloadPackage> = {},
): SaveDownloadPackage {
  return {
    appName: pkg.appName,
    platform: pkg.platform,
    version: pkg.version,
    downloadUrl: pkg.downloadUrl,
    fileSize: pkg.fileSize,
    releaseNotes: pkg.releaseNotes,
    isLatest: pkg.isLatest,
    isActive: pkg.isActive,
    releasedAt: pkg.releasedAt,
    requiredFeatureCodes: pkg.requiredFeatures.map((g) => g.featureCode),
    ...overrides,
  };
}

export const downloadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDownloadPackages: builder.query<ApiResponse<readonly DownloadPackage[]>, void>({
      query: () => ({
        url: '/api/v1/downloads',
        method: 'GET',
      }),
      providesTags: ['Downloads'],
    }),

    createDownloadPackage: builder.mutation<ApiResponse<DownloadPackage>, SaveDownloadPackage>({
      query: (dto) => ({
        url: '/api/v1/downloads',
        method: 'POST',
        data: dto,
      }),
      invalidatesTags: ['Downloads'],
    }),

    updateDownloadPackage: builder.mutation<
      ApiResponse<DownloadPackage>,
      { packageId: string; dto: SaveDownloadPackage }
    >({
      query: ({ packageId, dto }) => ({
        url: `/api/v1/downloads/${packageId}`,
        method: 'PUT',
        data: dto,
      }),
      invalidatesTags: ['Downloads'],
    }),

    deactivateDownloadPackage: builder.mutation<ApiResponse<boolean>, string>({
      query: (packageId) => ({
        url: `/api/v1/downloads/${packageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Downloads'],
    }),
  }),
});

export const {
  useGetDownloadPackagesQuery,
  useCreateDownloadPackageMutation,
  useUpdateDownloadPackageMutation,
  useDeactivateDownloadPackageMutation,
} = downloadsApi;
