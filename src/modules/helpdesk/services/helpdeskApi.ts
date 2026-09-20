import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PagedResponse, PaginationParams } from '@/lib/types/common';
import type {
  TicketListItem,
  TicketDetail,
  TicketComment,
  TicketFilter,
  TicketMetrics,
  TicketStatus,
  TicketPriority,
  CommentAuthorType,
  Lead,
} from '@/lib/types';

/**
 * 2026-09-04: every ticket endpoint here speaks the API's own contract —
 *   • GET /helpdesk/tickets answers with the PagedResponse envelope (data + totalCount);
 *     `escalated=true` lists the tickets handed to the Operations Managers that are open;
 *   • PUT /helpdesk/tickets/{id} takes the FULL UpdateTicketDto (the server replaces
 *     status / priority / handler / SLA wholesale, so callers must send current values);
 *   • POST …/comment takes AddCommentDto (author id + type, internal flag);
 *   • Resolved and Closed are their own endpoints (they stamp ResolvedAt / ClosedAt).
 * Assignment endpoints (assign / auto-assign) were REMOVED with the assignment model —
 * tickets are not assigned to platform users; the handler is a name on the ticket.
 */

export interface TicketListParams extends TicketFilter {
  readonly page?: number;
  readonly pageSize?: number;
}

/** Mirrors the server's CreateTicketDto. 2026-09-08: `message` was not a field the API reads - it is `description`. */
export interface CreateTicketDto {
  readonly merchantId: string;
  readonly subject: string;
  readonly category: string;
  readonly priority: string;
  readonly description: string;
}

/** Mirrors the server's UpdateTicketDto — a full replacement, not a patch. */
export interface UpdateTicketDto {
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly category?: string | null;
  /** Who is working the ticket, by name (may be outside the platform). */
  readonly handledBy?: string | null;
  readonly handlingRemarks?: string | null;
  readonly slaDeadline?: string | null;
}

/** Mirrors the server's AddCommentDto. */
export interface AddCommentDto {
  readonly ticketId: string;
  readonly authorId: string;
  readonly authorType: CommentAuthorType;
  readonly content: string;
  readonly isInternal: boolean;
}

export interface MetricsParams {
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly merchantType?: 'Enterprise' | 'Standalone';
}

export interface LeadParams extends Partial<PaginationParams> {
  readonly status?: string;
  readonly source?: string;
  readonly search?: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const helpdeskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<PagedResponse<TicketListItem>, TicketListParams>({
      query: (params) => ({
        url: '/api/v1/helpdesk/tickets',
        method: 'GET',
        params,
      }),
      providesTags: ['Tickets' as any],
    }),

    getTicket: builder.query<ApiResponse<TicketDetail>, string>({
      query: (id) => ({
        url: `/api/v1/helpdesk/tickets/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Tickets' as any, id }, 'Tickets' as any],
    }),

    createTicket: builder.mutation<ApiResponse<TicketDetail>, CreateTicketDto>({
      query: (data) => ({
        url: '/api/v1/helpdesk/tickets',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Tickets' as any],
    }),

    getTicketMetrics: builder.query<ApiResponse<TicketMetrics>, MetricsParams>({
      // The API needs an explicit window; the last 30 days is the default when none is given.
      query: ({ fromDate, toDate, ...params }) => {
        const to = toDate ? new Date(toDate) : new Date();
        const from = fromDate ? new Date(fromDate) : new Date(to.getTime() - THIRTY_DAYS_MS);
        return {
          url: '/api/v1/helpdesk/metrics',
          method: 'GET',
          params: { ...params, fromDate: from.toISOString(), toDate: to.toISOString() },
        };
      },
      providesTags: ['Tickets' as any],
    }),

    // 2026-09-05: paged envelope, like tickets.
    getLeads: builder.query<PagedResponse<Lead>, LeadParams>({
      query: (params) => ({
        url: '/api/v1/helpdesk/leads',
        method: 'GET',
        params,
      }),
      providesTags: ['Tickets' as any],
    }),

    addTicketComment: builder.mutation<ApiResponse<TicketComment>, AddCommentDto>({
      query: (data) => ({
        url: `/api/v1/helpdesk/tickets/${data.ticketId}/comment`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    updateTicket: builder.mutation<ApiResponse<TicketDetail>, { ticketId: string; data: UpdateTicketDto }>({
      query: ({ ticketId, data }) => ({
        url: `/api/v1/helpdesk/tickets/${ticketId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    resolveTicket: builder.mutation<ApiResponse<TicketDetail>, { ticketId: string; resolvedBy: string }>({
      query: ({ ticketId, resolvedBy }) => ({
        url: `/api/v1/helpdesk/tickets/${ticketId}/resolve`,
        method: 'POST',
        data: { resolvedBy },
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    closeTicket: builder.mutation<ApiResponse<TicketDetail>, string>({
      query: (ticketId) => ({
        url: `/api/v1/helpdesk/tickets/${ticketId}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, ticketId) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    /** Hands the ticket to the Operations Managers; the API records who escalated from the token. */
    escalateTicket: builder.mutation<ApiResponse<TicketDetail>, { ticketId: string; reason: string }>({
      query: ({ ticketId, reason }) => ({
        url: '/api/v1/helpdesk/tickets/escalate',
        method: 'POST',
        data: { ticketId, reason },
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    updateLead: builder.mutation<ApiResponse<Lead>, { leadId: string; data: Record<string, unknown> }>({
      query: ({ leadId, data }) => ({
        url: `/api/v1/helpdesk/leads/${leadId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Tickets' as any],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useGetTicketMetricsQuery,
  useGetLeadsQuery,
  useAddTicketCommentMutation,
  useUpdateTicketMutation,
  useResolveTicketMutation,
  useCloseTicketMutation,
  useEscalateTicketMutation,
  useUpdateLeadMutation,
} = helpdeskApi;
