/**
 * Helpdesk API module — the plain-client half (canned responses, leads, SLA policy,
 * auto-close). Ticket calls live in the RTK slice `modules/helpdesk/services/helpdeskApi`.
 *
 * 2026-09-04: the ticket functions that used to sit here (getTickets / getTicket /
 * createTicket / updateTicket / assignTicket / addTicketMessage / getTicketMetrics /
 * escalateTicket / autoAssignTicket) and their DTOs were REMOVED — nothing called them and
 * they were typed against the invented `Ticket` shape the API never sent.
 */

import { get, put } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type { CannedResponse, Lead } from '@/lib/types/helpdesk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeadListParams extends PaginationParams {
  readonly search?: string;
  readonly status?: string;
  readonly source?: string;
  readonly assignedTo?: string;
}

export interface LeadUpdateDto {
  readonly status?: string;
  readonly assignedTo?: string | null;
  readonly notes?: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getCannedResponses(): Promise<ApiResponse<readonly CannedResponse[]>> {
  return get<ApiResponse<readonly CannedResponse[]>>('/api/v1/helpdesk/canned-responses');
}

export function getLeads(params: LeadListParams): Promise<ApiListResponse<Lead>> {
  return get<ApiListResponse<Lead>>('/api/v1/helpdesk/leads', params as unknown as Record<string, string | number>);
}

export function updateLead(id: string, data: LeadUpdateDto): Promise<ApiResponse<Lead>> {
  return put<ApiResponse<Lead>>(`/api/v1/helpdesk/leads/${id}`, data);
}

// ---------------------------------------------------------------------------
// PF-11: Escalation (FRS-SAP-904)
// ---------------------------------------------------------------------------

export type TicketPriorityName = 'Critical' | 'High' | 'Medium' | 'Low';

/**
 * The SLA window per priority — mirror of SlaPolicyDto. This is the platform's whole
 * escalation policy. 2026-09-04: the `escalationPath` field and the `EscalationLevel`
 * type (Agent → TeamLead → PlatformAdmin) described a path that never existed server-side.
 */
export interface SlaPolicy {
  readonly priority: TicketPriorityName | string;
  readonly slaHours: number;
}

export function getEscalationRules(): Promise<ApiResponse<readonly SlaPolicy[]>> {
  return get<ApiResponse<readonly SlaPolicy[]>>('/api/v1/helpdesk/escalation-rules');
}

export function updateEscalationRules(policy: readonly SlaPolicy[]): Promise<ApiResponse<readonly SlaPolicy[]>> {
  return put<ApiResponse<readonly SlaPolicy[]>>('/api/v1/helpdesk/escalation-rules', policy);
}

// 2026-09-04: `RoutingRule` + `getRoutingRules` REMOVED — they mirrored a 501 for a
// "type-aware routing rules" feature with no entity, no writer and no consumer.

// ---------------------------------------------------------------------------
// PF-11: Auto-Close
// ---------------------------------------------------------------------------

/** Get auto-close configuration (default 7 days after Resolved). */
export function getAutoCloseConfig(): Promise<ApiResponse<{ autoCloseDays: number; enabled: boolean }>> {
  return get<ApiResponse<{ autoCloseDays: number; enabled: boolean }>>('/api/v1/helpdesk/auto-close-config');
}

/** Update auto-close configuration. */
export function updateAutoCloseConfig(data: { autoCloseDays: number; enabled: boolean }): Promise<ApiResponse<{ autoCloseDays: number; enabled: boolean }>> {
  return put<ApiResponse<{ autoCloseDays: number; enabled: boolean }>>('/api/v1/helpdesk/auto-close-config', data);
}
