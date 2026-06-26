import {
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
  type CreateTicketDto,
  type AssignTicketDto,
  type MetricsParams,
  type LeadParams,
} from '@/modules/helpdesk/services/helpdeskApi';
import type { TicketFilter } from '@/lib/types';
import type { PaginationParams } from '@/lib/types/common';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useTickets(params: Partial<TicketFilter & PaginationParams> = {}) {
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

export function useAssignTicket() {
  const [trigger, result] = useAssignTicketMutation();
  return wrapMutation(trigger, result);
}

export function useTicketMetrics(params: MetricsParams = {}) {
  return useGetTicketMetricsQuery(params);
}

export function useLeads(params: LeadParams = {}) {
  return useGetLeadsQuery(params);
}

/** FRS-SAP-902: Add message to ticket conversation. */
export function useAddTicketMessage() {
  const [trigger, result] = useAddTicketMessageMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-902: Update ticket details (status, priority, etc.). */
export function useUpdateTicket() {
  const [trigger, result] = useUpdateTicketMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-904: Escalate a ticket to the next level (Agent→TeamLead→PlatformAdmin). */
export function useEscalateTicket() {
  const [trigger, result] = useEscalateTicketMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-903: Auto-assign ticket based on type-aware routing rules. */
export function useAutoAssignTicket() {
  const [trigger, result] = useAutoAssignTicketMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-908: Update lead status/details. */
export function useUpdateLead() {
  const [trigger, result] = useUpdateLeadMutation();
  return wrapMutation(trigger, result);
}

