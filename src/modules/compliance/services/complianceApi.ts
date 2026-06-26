import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type { ComplianceMetrics, DataRequest } from '@/lib/types';

export interface DataRequestParams extends Partial<PaginationParams> {
  readonly status?: string;
  readonly type?: string;
  readonly regulation?: string;
  readonly region?: string;
}

export interface ProcessDataRequestDto {
  readonly requestId: string;
  readonly action: 'Approve' | 'Reject' | 'Complete';
  readonly notes?: string;
}

export const complianceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplianceDashboard: builder.query<ApiResponse<ComplianceMetrics>, void>({
      query: () => ({
        url: '/api/v1/compliance/dashboard',
        method: 'GET',
      }),
      providesTags: ['Compliance' as any],
    }),

    getDataRequests: builder.query<ApiResponse<PaginatedResult<DataRequest>>, DataRequestParams>({
      query: (params) => ({
        url: '/api/v1/compliance/data-requests',
        method: 'GET',
        params,
      }),
      providesTags: ['Compliance' as any],
    }),

    processDataRequest: builder.mutation<ApiResponse<DataRequest>, ProcessDataRequestDto>({
      query: ({ requestId, action, notes }) => ({
        url: `/api/v1/compliance/data-requests/${requestId}/process`,
        method: 'PUT',
        data: { action, notes },
      }),
      invalidatesTags: ['Compliance' as any],
    }),

    generateExportPackage: builder.mutation<ApiResponse<{ downloadUrl: string; sizeBytes: number }>, string>({
      query: (requestId) => ({
        url: `/api/v1/compliance/data-requests/${requestId}/generate-export`,
        method: 'POST',
      }),
      invalidatesTags: ['Compliance' as any],
    }),

    executeAnonymization: builder.mutation<ApiResponse<{ anonymizedRecords: number; certificateUrl: string }>, string>({
      query: (requestId) => ({
        url: `/api/v1/compliance/data-requests/${requestId}/execute-anonymization`,
        method: 'POST',
      }),
      invalidatesTags: ['Compliance' as any],
    }),

    fulfillDataRequest: builder.mutation<ApiResponse<DataRequest>, string>({
      query: (requestId) => ({
        url: `/api/v1/compliance/data-requests/${requestId}/fulfill`,
        method: 'POST',
      }),
      invalidatesTags: ['Compliance' as any],
    }),
  }),
});

export const {
  useGetComplianceDashboardQuery,
  useGetDataRequestsQuery,
  useProcessDataRequestMutation,
  useGenerateExportPackageMutation,
  useExecuteAnonymizationMutation,
  useFulfillDataRequestMutation,
} = complianceApi;
