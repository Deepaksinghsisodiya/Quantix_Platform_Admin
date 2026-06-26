/**
 * Audit Log API module.
 *
 * Round_16 Pass 14: rewritten to mirror the canonical C# AuditController surface
 * (`/api/v1/audit/logs`) and `ActivityLogDto`. Solution_Rules §9: TS field names are the
 * camelCase mirror of the C# DTO — `logId`, `userId`, `userName`, `action`, `entityType`,
 * `entityId`, `details`, `ipAddress`, `createdAt`. The prior shape (`AuditLog`) wasn't
 * what the server returned and the path was wrong (`/api/v1/audit-logs`).
 */

import { get, post } from './client';
import type { ApiResponse } from '@/lib/types/common';

// ---------------------------------------------------------------------------
// Types — server-shape mirrors
// ---------------------------------------------------------------------------

export interface ActivityLog {
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

export interface ActivityLogFilter {
  readonly userId?: string;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface SecurityEvent {
  readonly logId: string;
  readonly eventType: string;
  readonly userId?: string | null;
  readonly details?: string | null;
  readonly ipAddress?: string | null;
  readonly severity: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Endpoints — match `Quantix.PlatformApi/Controllers/v1/Admin/AuditController.cs` 1:1
// ---------------------------------------------------------------------------

export function getAuditLogs(filter: ActivityLogFilter): Promise<ApiResponse<readonly ActivityLog[]>> {
  return get<ApiResponse<readonly ActivityLog[]>>('/api/v1/audit/logs', filter as unknown as Record<string, string | number>);
}

export function exportAuditLogs(
  filter: ActivityLogFilter,
  format: 'csv' | 'json' | 'pdf',
): Promise<ApiResponse<{ readonly downloadUrl: string }>> {
  return get<ApiResponse<{ readonly downloadUrl: string }>>('/api/v1/audit/logs/export', {
    ...filter,
    format,
  } as unknown as Record<string, string>);
}

export function logAuditEvent(payload: {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
}): Promise<ApiResponse<{ readonly eventId: string }>> {
  return post<ApiResponse<{ readonly eventId: string }>>('/api/v1/audit/log', payload);
}

export function getSecurityEvents(params: {
  fromDate?: string;
  toDate?: string;
  eventType?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<readonly SecurityEvent[]>> {
  return get<ApiResponse<readonly SecurityEvent[]>>(
    '/api/v1/audit/security-events',
    params as unknown as Record<string, string | number>,
  );
}
