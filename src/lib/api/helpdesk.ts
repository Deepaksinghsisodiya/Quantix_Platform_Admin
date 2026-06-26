/**
 * Helpdesk API module.
 */

import { get, post, put } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type {
  Ticket,
  TicketMessage,
  TicketFilter,
  TicketMetrics,
  CannedResponse,
  Lead,
} from '@/lib/types/helpdesk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TicketListParams extends PaginationParams, TicketFilter {}

export interface TicketCreateDto {
  readonly merchantId: string;
  readonly subject: string;
  readonly category: string;
  readonly priority: string;
  readonly message: string;
  readonly tags?: readonly string[];
}

export interface TicketUpdateDto {
  readonly subject?: string;
  readonly category?: string;
  readonly priority?: string;
  readonly status?: string;
  readonly tags?: readonly string[];
}

export interface TicketMessageDto {
  readonly content: string;
  readonly attachments?: readonly string[];
}

export interface TicketMetricsParams {
  readonly from?: string;
  readonly to?: string;
  readonly agentId?: string;
}

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

export function getTickets(params: TicketListParams): Promise<ApiListResponse<Ticket>> {
  return get<ApiListResponse<Ticket>>('/api/v1/helpdesk/tickets', params as unknown as Record<string, string | number | boolean>);
}

export function getTicket(id: string): Promise<ApiResponse<Ticket>> {
  return get<ApiResponse<Ticket>>(`/api/v1/helpdesk/tickets/${id}`);
}

export function createTicket(data: TicketCreateDto): Promise<ApiResponse<Ticket>> {
  return post<ApiResponse<Ticket>>('/api/v1/helpdesk/tickets', data);
}

export function updateTicket(id: string, data: TicketUpdateDto): Promise<ApiResponse<Ticket>> {
  return put<ApiResponse<Ticket>>(`/api/v1/helpdesk/tickets/${id}`, data);
}

export function assignTicket(id: string, agentId: string): Promise<ApiResponse<Ticket>> {
  return post<ApiResponse<Ticket>>('/api/v1/helpdesk/tickets/assign', { ticketId: id, agentId });
}

export function addTicketMessage(id: string, data: TicketMessageDto): Promise<ApiResponse<TicketMessage>> {
  return post<ApiResponse<TicketMessage>>(`/api/v1/helpdesk/tickets/${id}/comment`, data);
}

export function getTicketMetrics(params: TicketMetricsParams): Promise<ApiResponse<TicketMetrics>> {
  return get<ApiResponse<TicketMetrics>>('/api/v1/helpdesk/metrics', params as unknown as Record<string, string>);
}

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

/** Escalation path level. */
export type EscalationLevel = 'Agent' | 'TeamLead' | 'PlatformAdmin';

/** FRS-SAP-904: Escalate a ticket to the next level in the escalation path. */
export function escalateTicket(id: string, reason: string): Promise<ApiResponse<Ticket>> {
  return post<ApiResponse<Ticket>>('/api/v1/helpdesk/tickets/escalate', { ticketId: id, reason });
}

/** FRS-SAP-904: Get SLA escalation rules (Critical 4h, High 24h, Medium 48h). */
export function getEscalationRules(): Promise<ApiResponse<readonly {
  readonly priority: string;
  readonly slaHours: number;
  readonly escalationPath: readonly EscalationLevel[];
}[]>> {
  return get<ApiResponse<readonly {
    readonly priority: string;
    readonly slaHours: number;
    readonly escalationPath: readonly EscalationLevel[];
  }[]>>('/api/v1/helpdesk/escalation-rules');
}

// ---------------------------------------------------------------------------
// PF-11: Auto-Assignment (FRS-SAP-903)
// ---------------------------------------------------------------------------

/** Type-aware routing rule for auto-assignment. */
export interface RoutingRule {
  readonly id: string;
  readonly merchantType: 'Enterprise' | 'Standalone' | 'All';
  readonly category: string;
  readonly assignToAgentId: string;
  readonly assignToAgentName: string;
}

/** FRS-SAP-903: Trigger auto-assignment based on type-aware routing rules. */
export function autoAssignTicket(id: string): Promise<ApiResponse<Ticket>> {
  return post<ApiResponse<Ticket>>(`/api/v1/helpdesk/tickets/${id}/auto-assign`);
}

/** FRS-SAP-903: Get type-aware routing rules. */
export function getRoutingRules(): Promise<ApiResponse<readonly RoutingRule[]>> {
  return get<ApiResponse<readonly RoutingRule[]>>('/api/v1/helpdesk/routing-rules');
}

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
