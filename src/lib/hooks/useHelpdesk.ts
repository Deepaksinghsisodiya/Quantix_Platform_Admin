import {
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
  type TicketListParams,
  type MetricsParams,
  type LeadParams,
} from '@/modules/helpdesk/services/helpdeskApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useTickets(params: TicketListParams = {}) {
  return useGetTicketsQuery(params);
}

export function useTicket(id: string | undefined) {
  return useGetTicketQuery(id ?? '', {
    skip: !id,
  });
}

export function useCreateTicket() {
  const [trigger, result] = useCreateTicketMutation();
  return wrapMutation(trigger, result);
}

// 2026-09-04: useAssignTicket / useAutoAssignTicket REMOVED with the assignment model —
// tickets are not assigned to platform users; the handler is a name saved via useUpdateTicket.

export function useTicketMetrics(params: MetricsParams = {}) {
  return useGetTicketMetricsQuery(params);
}

export function useLeads(params: LeadParams = {}) {
  return useGetLeadsQuery(params);
}

/** FRS-SAP-902: add a reply or an internal note to a ticket's thread. */
export function useAddTicketComment() {
  const [trigger, result] = useAddTicketCommentMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-902: replace a ticket's status / priority / handler / SLA (full UpdateTicketDto). */
export function useUpdateTicket() {
  const [trigger, result] = useUpdateTicketMutation();
  return wrapMutation(trigger, result);
}

/** Mark a ticket Resolved (stamps ResolvedAt). Operators and Operations Managers both may. */
export function useResolveTicket() {
  const [trigger, result] = useResolveTicketMutation();
  return wrapMutation(trigger, result);
}

/** Close a ticket (stamps ClosedAt). */
export function useCloseTicket() {
  const [trigger, result] = useCloseTicketMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-904: escalate — hands the ticket to the Operations Managers with a reason. */
export function useEscalateTicket() {
  const [trigger, result] = useEscalateTicketMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-908: Update lead status/details. */
export function useUpdateLead() {
  const [trigger, result] = useUpdateLeadMutation();
  return wrapMutation(trigger, result);
}
