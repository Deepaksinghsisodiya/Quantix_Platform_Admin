import {
  useGetAuditLogsQuery,
  useLazyExportAuditLogsQuery,
  type AuditLogEntry,
  type AuditLogParams,
  type ExportAuditLogsParams,
} from '@/modules/audit/services/auditApi';

export function useAuditLogs(params: AuditLogParams = {}) {
  return useGetAuditLogsQuery(params);
}

/** 2026-09-08: the export is a GET returning the CSV/JSON text; callers download it themselves. */
export function useExportAuditLogs() {
  return useLazyExportAuditLogsQuery();
}

export type { AuditLogEntry, AuditLogParams, ExportAuditLogsParams };
