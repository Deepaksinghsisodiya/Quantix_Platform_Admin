import {
  useGetAuditLogsQuery,
  useExportAuditLogsMutation,
  type AuditLogEntry,
  type AuditLogParams,
  type ExportAuditLogsDto,
} from '@/modules/audit/services/auditApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useAuditLogs(params: AuditLogParams = {}) {
  return useGetAuditLogsQuery(params);
}

export function useExportAuditLogs() {
  const [trigger, result] = useExportAuditLogsMutation();
  return wrapMutation(trigger, result);
}

