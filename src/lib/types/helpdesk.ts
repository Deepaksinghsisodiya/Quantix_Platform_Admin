import type { MerchantType } from './common';

/**
 * Helpdesk types — 2026-09-04: realigned 1:1 to the API
 * (`Quantix.PlatformBusiness.DTOs.Helpdesk.HelpdeskDtos` + `Quantix.Foundation.Enums.Platform`).
 * The previous `Ticket` / `TicketMessage` / `AgentMetric` shapes (id, merchantName, agentId,
 * messages, tags, byCategory, slaCompliancePercent…) predated the API and matched nothing it
 * sends, so the Support Queue and ticket detail crashed for every role. Nullable API fields
 * are optional here too: the API omits nulls from its JSON.
 *
 * 2026-09-04 (user directive): tickets are NOT assigned to platform users. Whoever works a
 * ticket is recorded by name for reference (`handledBy`, may be someone outside the platform)
 * with remarks; escalation hands the ticket to the Operations Managers (`isEscalated`).
 */

/** Mirrors Foundation `TicketStatus` — nine states, serialised by name. */
export type TicketStatus =
  | 'New'
  | 'Open'
  | 'Assigned'
  | 'InProgress'
  | 'WaitingOnCustomer'
  | 'WaitingOnInternal'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

/**
 * The states the portal offers. `Assigned` stays in the type because the shared enum still
 * carries it, but with no assignment model nothing moves a ticket there any more.
 */
export const TICKET_STATUSES: readonly TicketStatus[] = [
  'New', 'Open', 'InProgress', 'WaitingOnCustomer', 'WaitingOnInternal', 'Resolved', 'Closed', 'Reopened',
];

/** States that still need someone — everything but Resolved and Closed. */
export const OPEN_TICKET_STATUSES: ReadonlySet<TicketStatus> = new Set<TicketStatus>([
  'New', 'Open', 'Assigned', 'InProgress', 'WaitingOnCustomer', 'WaitingOnInternal', 'Reopened',
]);

/** Mirrors Foundation `TicketPriority`. ('Urgent' was a portal invention the API never issues.) */
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export const TICKET_PRIORITIES: readonly TicketPriority[] = ['Critical', 'High', 'Medium', 'Low'];

/** Free text on the server; these are the values the portal offers when creating a ticket. */
export type TicketCategory =
  | 'Billing'
  | 'Technical'
  | 'Account'
  | 'Token'
  | 'Feature'
  | 'General';

/** Mirrors Foundation `CommentAuthorType`. */
export type CommentAuthorType = 'PlatformAgent' | 'Merchant';

/** One row of GET /helpdesk/tickets — mirrors `TicketListDto`. */
export interface TicketListItem {
  readonly ticketId: string;
  readonly ticketNumber: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly merchantType: MerchantType;
  readonly subject: string;
  readonly category: string;
  readonly priority: TicketPriority;
  readonly status: TicketStatus;
  /** Who is working the ticket, by name only. */
  readonly handledBy?: string | null;
  /** Handed to the Operations Managers. */
  readonly isEscalated: boolean;
  readonly slaDeadline?: string | null;
  readonly createdAt: string;
}

/** One entry of a ticket's thread — mirrors `TicketCommentDto`. */
export interface TicketComment {
  readonly commentId: string;
  readonly ticketId: string;
  readonly authorId: string;
  readonly authorType: CommentAuthorType;
  readonly content: string;
  /** Internal notes are staff-only and never shown to the merchant. */
  readonly isInternal: boolean;
  readonly createdAt: string;
}

/** GET /helpdesk/tickets/{id} — mirrors `TicketDto`. */
export interface TicketDetail {
  readonly ticketId: string;
  readonly ticketNumber: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly merchantType: MerchantType;
  readonly subject: string;
  readonly description: string;
  readonly category: string;
  readonly priority: TicketPriority;
  readonly status: TicketStatus;
  readonly handledBy?: string | null;
  readonly handlingRemarks?: string | null;
  readonly isEscalated: boolean;
  readonly escalatedAt?: string | null;
  readonly escalatedBy?: string | null;
  readonly escalationReason?: string | null;
  readonly slaDeadline?: string | null;
  readonly resolvedAt?: string | null;
  readonly closedAt?: string | null;
  readonly createdBy?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
  readonly comments: readonly TicketComment[];
}

/** Filters GET /helpdesk/tickets understands. */
export interface TicketFilter {
  /** Ticket number or subject, contains-match. */
  readonly search?: string;
  readonly merchantId?: string;
  readonly merchantType?: MerchantType;
  readonly priority?: TicketPriority;
  readonly status?: TicketStatus;
  /** true = with the Operations Managers and still open; false = not escalated. */
  readonly escalated?: boolean;
}

/** GET /helpdesk/metrics — mirrors `TicketMetricsDto` (a date-window aggregate). */
export interface TicketMetrics {
  readonly totalTickets: number;
  readonly openTickets: number;
  readonly resolvedTickets: number;
  readonly closedTickets: number;
  readonly avgResolutionHours: number;
  /** Always 0 today — the API does not track first responses yet. */
  readonly avgFirstResponseHours: number;
  /** 0 when no ticket in the window carries a rating. */
  readonly csatScore: number;
  readonly fromDate: string;
  readonly toDate: string;
}

/**
 * Sales / onboarding lead tracked by the platform. Round_16 Pass 15 §9: shape mirrors
 * `LeadDto` (Quantix.PlatformBusiness.DTOs.Content.LeadDto) 1:1 in camelCase.
 */
export interface Lead {
  readonly leadId: string;
  /** Convenience alias of leadId for legacy consumers (some pages still reference `id`). */
  readonly id?: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly companyName?: string | null;
  readonly leadType: string;
  /** Optional, typed `OnboardingMode`. */
  readonly merchantType?: 'Enterprise' | 'Standalone' | null;
  readonly status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost' | 'Spam';
  readonly convertedMerchantId?: string | null;
  readonly message?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;

  // Legacy alias fields some older list pages rely on.
  readonly businessName?: string;
  readonly contactPerson?: string;
  readonly source?: string;
  readonly assignedTo?: string | null;
  readonly notes?: string;
}

/**
 * Pre-written response template for support agents. Round_16 Pass 15 §9: shape now mirrors
 * `CannedResponseDto` from `Quantix.PlatformBusiness.DTOs.Helpdesk.HelpdeskDtos`.
 */
export interface CannedResponse {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly category: string;
  readonly merchantType?: 'Enterprise' | 'Standalone' | null;
  readonly isActive?: boolean;
  readonly createdAt?: string;

  // Optional legacy fields kept so existing list pages don't lose info if they read them.
  readonly createdBy?: string;
  readonly usageCount?: number;
}
