import type { MerchantType } from './common';

export type TicketStatus =
  | 'New'
  | 'Open'
  | 'InProgress'
  | 'WaitingOnCustomer'
  | 'Resolved'
  | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketCategory =
  | 'Billing'
  | 'Technical'
  | 'Account'
  | 'Token'
  | 'Feature'
  | 'General';

/** A support ticket raised by or on behalf of a merchant. */
export interface Ticket {
  readonly id: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly merchantType: MerchantType;
  readonly subject: string;
  readonly category: TicketCategory;
  readonly priority: TicketPriority;
  readonly status: TicketStatus;
  readonly agentId: string | null;
  readonly agentName: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly slaDeadline: string | null;
  readonly messages: readonly TicketMessage[];
  readonly tags: readonly string[];
}

/** A single message within a ticket thread. */
export interface TicketMessage {
  readonly id: string;
  readonly ticketId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorRole: 'Agent' | 'Customer' | 'System';
  readonly content: string;
  readonly attachments: readonly string[];
  readonly createdAt: string;
}

/** Filter criteria for ticket list queries. */
export interface TicketFilter {
  readonly search?: string;
  readonly merchantId?: string;
  readonly merchantType?: MerchantType;
  readonly category?: TicketCategory;
  readonly priority?: TicketPriority;
  readonly status?: TicketStatus;
  readonly agentId?: string;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  readonly slaBreached?: boolean;
}

/** Aggregated helpdesk metrics for dashboards. */
export interface TicketMetrics {
  readonly totalOpen: number;
  readonly totalResolved: number;
  readonly averageResolutionTimeHours: number;
  readonly slaCompliancePercent: number;
  readonly byCategory: Record<TicketCategory, number>;
  readonly byPriority: Record<TicketPriority, number>;
  readonly byAgent: readonly AgentMetric[];
}

export interface AgentMetric {
  readonly agentId: string;
  readonly agentName: string;
  readonly openTickets: number;
  readonly resolvedTickets: number;
  readonly averageResolutionTimeHours: number;
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
