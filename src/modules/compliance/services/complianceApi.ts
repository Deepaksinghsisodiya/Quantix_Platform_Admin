import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type {
  ComplianceDashboard,
  ComplianceRequest,
  ComplianceRequestType,
  ComplianceStatus,
  ConsentRecord,
  CreateComplianceRequest,
} from '@/lib/types/compliance';

/**
 * 2026-09-08: every route here exists on ComplianceController.
 *
 * The previous module called `/compliance/data-requests` (the list is `GET /compliance`),
 * `PUT .../{id}/process` with an action string, and `POST .../generate-export`,
 * `.../execute-anonymization` and `.../fulfill` — none of which the API has ever had. So the
 * Data Requests page could not list, approve, reject, export or delete anything.
 *
 * What the API does have: approve / reject (both take `ProcessComplianceRequestDto`), export
 * (completes an approved Data Export), delete (completes an approved Right To Delete — this
 * soft-deletes the merchant), and create.
 */

export interface ComplianceListParams {
  readonly type?: ComplianceRequestType;
  readonly status?: ComplianceStatus;
  readonly merchantId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/** Mirrors the server's ProcessComplianceRequestDto. */
export interface ProcessComplianceRequest {
  readonly requestId: string;
  readonly isApproved: boolean;
  readonly approvedBy: string;
  readonly notes?: string;
}

export const complianceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplianceDashboard: builder.query<ApiResponse<ComplianceDashboard>, void>({
      query: () => ({ url: '/api/v1/compliance/dashboard', method: 'GET' }),
      providesTags: ['Compliance' as any],
    }),

    getComplianceRequests: builder.query<ApiResponse<readonly ComplianceRequest[]>, ComplianceListParams>({
      query: (params) => ({ url: '/api/v1/compliance', method: 'GET', params }),
      providesTags: ['Compliance' as any],
    }),

    getComplianceRequest: builder.query<ApiResponse<ComplianceRequest>, string>({
      query: (id) => ({ url: `/api/v1/compliance/${id}`, method: 'GET' }),
      providesTags: ['Compliance' as any],
    }),

    createComplianceRequest: builder.mutation<ApiResponse<ComplianceRequest>, CreateComplianceRequest>({
      query: (data) => ({ url: '/api/v1/compliance', method: 'POST', data }),
      invalidatesTags: ['Compliance' as any],
    }),

    approveComplianceRequest: builder.mutation<ApiResponse<ComplianceRequest>, ProcessComplianceRequest>({
      query: (data) => ({ url: `/api/v1/compliance/${data.requestId}/approve`, method: 'POST', data }),
      invalidatesTags: ['Compliance' as any],
    }),

    rejectComplianceRequest: builder.mutation<ApiResponse<ComplianceRequest>, ProcessComplianceRequest>({
      query: (data) => ({ url: `/api/v1/compliance/${data.requestId}/reject`, method: 'POST', data }),
      invalidatesTags: ['Compliance' as any],
    }),

    /** Completes an approved Data Export. The API answers with an export reference string. */
    processComplianceExport: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({ url: `/api/v1/compliance/${id}/export`, method: 'POST' }),
      invalidatesTags: ['Compliance' as any, 'Merchants'],
    }),

    /** Completes an approved Right To Delete — the merchant record is soft-deleted. Admin only. */
    processComplianceDeletion: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/v1/compliance/${id}/delete`, method: 'POST' }),
      invalidatesTags: ['Compliance' as any, 'Merchants'],
    }),

    // 2026-08-13: platform-wide consent records (the screen previously rendered a
    // hardcoded MOCK_CONSENTS array of invented merchants and policy versions).
    getAllConsents: builder.query<ApiResponse<readonly ConsentRecord[]>, void>({
      query: () => ({ url: '/api/v1/compliance/consents', method: 'GET' }),
      providesTags: ['Compliance' as any],
    }),
  }),
});

export const {
  useGetComplianceDashboardQuery,
  useGetComplianceRequestsQuery,
  useGetComplianceRequestQuery,
  useCreateComplianceRequestMutation,
  useApproveComplianceRequestMutation,
  useRejectComplianceRequestMutation,
  useProcessComplianceExportMutation,
  useProcessComplianceDeletionMutation,
  useGetAllConsentsQuery,
} = complianceApi;
