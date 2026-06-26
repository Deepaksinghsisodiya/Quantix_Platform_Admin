import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse, PaginatedResult, PaginationParams } from '@/lib/types/common';
import type { Ticket, TicketFilter, TicketMetrics, Lead } from '@/lib/types';

export interface CreateTicketDto {
  readonly merchantId: string;
  readonly subject: string;
  readonly category: string;
  readonly priority: string;
  readonly message: string;
}

export interface AssignTicketDto {
  readonly ticketId: string;
  readonly agentId: string;
}

export interface MetricsParams {
  readonly from?: string;
  readonly to?: string;
  readonly agentId?: string;
}

export interface LeadParams extends Partial<PaginationParams> {
  readonly status?: string;
  readonly source?: string;
  readonly search?: string;
}

export const helpdeskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<ApiResponse<PaginatedResult<Ticket>>, Partial<TicketFilter & PaginationParams>>({
      query: (params) => ({
        url: '/api/v1/helpdesk/tickets',
        method: 'GET',
        params,
      }),
      providesTags: ['Tickets' as any],
    }),

    getTicket: builder.query<ApiResponse<Ticket>, string>({
      query: (id) => ({
        url: `/api/v1/helpdesk/tickets/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Tickets' as any, id }, 'Tickets' as any],
    }),

    createTicket: builder.mutation<ApiResponse<Ticket>, CreateTicketDto>({
      query: (data) => ({
        url: '/api/v1/helpdesk/tickets',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Tickets' as any],
    }),

    assignTicket: builder.mutation<ApiResponse<Ticket>, AssignTicketDto>({
      query: ({ ticketId, agentId }) => ({
        url: '/api/v1/helpdesk/tickets/assign',
        method: 'POST',
        data: { ticketId, agentId },
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    getTicketMetrics: builder.query<ApiResponse<TicketMetrics>, MetricsParams>({
      query: (params) => ({
        url: '/api/v1/helpdesk/metrics',
        method: 'GET',
        params,
      }),
      providesTags: ['Tickets' as any],
    }),

    getLeads: builder.query<ApiResponse<PaginatedResult<Lead>>, LeadParams>({
      query: (params) => ({
        url: '/api/v1/helpdesk/leads',
        method: 'GET',
        params,
      }),
      providesTags: ['Tickets' as any],
    }),

    addTicketMessage: builder.mutation<ApiResponse<unknown>, { ticketId: string; message: string }>({
      query: ({ ticketId, message }) => ({
        url: `/api/v1/helpdesk/tickets/${ticketId}/comment`,
        method: 'POST',
        data: { message },
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    updateTicket: builder.mutation<ApiResponse<Ticket>, { ticketId: string; data: Record<string, unknown> }>({
      query: ({ ticketId, data }) => ({
        url: `/api/v1/helpdesk/tickets/${ticketId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    escalateTicket: builder.mutation<ApiResponse<Ticket>, { ticketId: string; reason: string }>({
      query: ({ ticketId, reason }) => ({
        url: '/api/v1/helpdesk/tickets/escalate',
        method: 'POST',
        data: { ticketId, reason },
      }),
      invalidatesTags: (_res, _err, { ticketId }) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
    }),

    autoAssignTicket: builder.mutation<ApiResponse<Ticket>, string>({
      query: (ticketId) => ({
        url: `/api/v1/helpdesk/tickets/${ticketId}/auto-assign`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, ticketId) => [{ type: 'Tickets' as any, id: ticketId }, 'Tickets' as any],
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
  useAssignTicketMutation,
  useGetTicketMetricsQuery,
  useGetLeadsQuery,
  useAddTicketMessageMutation,
  useUpdateTicketMutation,
  useEscalateTicketMutation,
  useAutoAssignTicketMutation,
  useUpdateLeadMutation,
} = helpdeskApi;
