import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';

/**
 * Audit Trail — 2026-09-08: realigned to AuditController.
 *
 * Two things were wrong. A second endpoint of the same name in settingsApi pointed at
 * `/settings/audit` (a route that does not exist; it fell into the `{key}` setting lookup and
 * 400'd), and RTK keeps the FIRST injection of a name, so this module's query was never the one
 * that ran: the Audit Trail page and the consent audit trail were both sent to the wrong route.
 * That duplicate is gone. And the shapes here described a paginated envelope with `id` /
 * `resource` / `timestamp` fields the API never sent; `GET /audit/logs` answers a plain array of
 * `ActivityLogDto` (logId, entityType, createdAt) and the export is a GET that returns the CSV or
 * JSON text itself, not a download link.
 */

/** Mirrors `ActivityLogDto`. Nullable API fields are optional (the API omits nulls). */
export interface AuditLogEntry {
  readonly logId: string;
  readonly userId?: string | null;
  readonly userName?: string | null;
  readonly action: string;
  readonly entityType?: string | null;
  readonly entityId?: string | null;
  readonly details?: string | null;
  readonly ipAddress?: string | null;
  readonly createdAt: string;
}

/** Mirrors `ActivityLogFilterDto`. */
export interface AuditLogParams {
  readonly userId?: string;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ExportAuditLogsParams extends AuditLogParams {
  readonly format: 'csv' | 'json';
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<ApiResponse<readonly AuditLogEntry[]>, AuditLogParams>({
      query: (params) => ({
        url: '/api/v1/audit/logs',
        method: 'GET',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),

    /** The export body (CSV or JSON text) for the same filter. */
    exportAuditLogs: builder.query<ApiResponse<string>, ExportAuditLogsParams>({
      query: (params) => ({
        url: '/api/v1/audit/logs/export',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useLazyExportAuditLogsQuery,
} = auditApi;
