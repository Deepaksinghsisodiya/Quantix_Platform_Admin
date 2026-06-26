import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';

export interface AuditLogEntry {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly action: string;
  readonly resource: string;
  readonly resourceId: string | null;
  readonly details: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly timestamp: string;
}

export interface AuditLogParams extends Partial<PaginationParams> {
  readonly userId?: string;
  readonly action?: string;
  readonly resource?: string;
  readonly from?: string;
  readonly to?: string;
  readonly search?: string;
}

export interface ExportAuditLogsDto {
  readonly format: 'CSV' | 'JSON';
  readonly from: string;
  readonly to: string;
  readonly userId?: string;
  readonly action?: string;
  readonly resource?: string;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<ApiResponse<PaginatedResult<AuditLogEntry>>, AuditLogParams>({
      query: (params) => ({
        url: '/api/v1/audit/logs',
        method: 'GET',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),

    exportAuditLogs: builder.mutation<ApiResponse<{ readonly downloadUrl: string }>, ExportAuditLogsDto>({
      query: (data) => ({
        url: '/api/v1/audit/logs/export',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useExportAuditLogsMutation,
} = auditApi;
