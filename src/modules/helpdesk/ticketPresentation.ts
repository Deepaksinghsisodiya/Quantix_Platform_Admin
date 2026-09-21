import type { TicketPriority, TicketStatus } from '@/lib/types/helpdesk';
import { ArrowDown, ArrowUp, Archive, CheckCircle2, ChevronUp, Clock, Hourglass, Loader, Minus, RotateCcw, Sparkles, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 2026-09-04: one place for how a ticket's status, priority and SLA are shown. The queue
 * and the detail page each carried their own copy, and both were missing three of the
 * API's nine statuses (Assigned / WaitingOnInternal / Reopened) — a lookup miss crashed
 * the row.
 */

export type BadgeTone = 'danger' | 'warning' | 'info' | 'default' | 'success';

export const PRIORITY_CONFIG: Readonly<Record<TicketPriority, { variant: BadgeTone; label: string }>> = {
  Critical: { variant: 'danger', label: 'Critical' },
  High: { variant: 'warning', label: 'High' },
  Medium: { variant: 'info', label: 'Medium' },
  Low: { variant: 'default', label: 'Low' },
};

export const STATUS_CONFIG: Readonly<Record<TicketStatus, { variant: BadgeTone; label: string }>> = {
  New: { variant: 'info', label: 'New' },
  Open: { variant: 'info', label: 'Open' },
  Assigned: { variant: 'info', label: 'Assigned' },
  InProgress: { variant: 'warning', label: 'In Progress' },
  WaitingOnCustomer: { variant: 'default', label: 'Waiting on Customer' },
  WaitingOnInternal: { variant: 'default', label: 'Waiting on Internal' },
  Resolved: { variant: 'success', label: 'Resolved' },
  Closed: { variant: 'default', label: 'Closed' },
  Reopened: { variant: 'warning', label: 'Reopened' },
};

/** Semantic icon per priority, used by the merchant list + ticket pages. */
export const PRIORITY_ICONS: Readonly<Record<TicketPriority, LucideIcon>> = {
  Critical: ArrowUp,
  High: ChevronUp,
  Medium: Minus,
  Low: ArrowDown,
};

/** Semantic icon per status, used by the merchant list + ticket pages. */
export const STATUS_ICONS: Readonly<Record<TicketStatus, LucideIcon>> = {
  New: Sparkles,
  Open: Clock,
  Assigned: User,
  InProgress: Loader,
  WaitingOnCustomer: Hourglass,
  WaitingOnInternal: Hourglass,
  Resolved: CheckCircle2,
  Closed: Archive,
  Reopened: RotateCcw,
};

/**
 * Which states a ticket may be moved to from each state. 2026-09-04: nothing moves a ticket
 * INTO `Assigned` any more (no assignment model); the row exists only so a legacy ticket in
 * that state can still be moved on.
 */
export const STATUS_TRANSITIONS: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = {
  New: ['Open', 'InProgress'],
  Open: ['InProgress', 'WaitingOnCustomer', 'WaitingOnInternal', 'Resolved'],
  Assigned: ['InProgress', 'WaitingOnCustomer', 'WaitingOnInternal', 'Resolved'],
  InProgress: ['WaitingOnCustomer', 'WaitingOnInternal', 'Resolved'],
  WaitingOnCustomer: ['InProgress', 'Resolved'],
  WaitingOnInternal: ['InProgress', 'Resolved'],
  Resolved: ['Closed', 'Reopened'],
  Closed: ['Reopened'],
  Reopened: ['InProgress', 'Resolved'],
};

export interface SlaCountdown {
  readonly text: string;
  readonly breached: boolean;
}

/** Time left until the SLA deadline, or "Breached". */
export function slaTimeRemaining(deadline: string | null | undefined): SlaCountdown {
  if (!deadline) return { text: 'No SLA', breached: false };
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { text: 'Breached', breached: true };
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return { text: `${Math.floor(hours / 24)}d ${hours % 24}h`, breached: false };
  return { text: `${hours}h ${mins}m`, breached: false };
}
