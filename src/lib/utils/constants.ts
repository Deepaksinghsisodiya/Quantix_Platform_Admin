import type {
  BusinessType,
  MerchantType,
  MerchantStatus,
  PlatformRole,
} from '@/lib/types';
import type { SelectOption } from '@/lib/types';

// ---------------------------------------------------------------------------
// Merchant & business types
// ---------------------------------------------------------------------------

export const MERCHANT_TYPES: readonly SelectOption<MerchantType>[] = [
  { label: 'Enterprise', value: 'Enterprise' },
  { label: 'Standalone', value: 'Standalone' },
] as const;

export const BUSINESS_TYPES: readonly SelectOption<BusinessType>[] = [
  { label: 'Restaurant', value: 'Restaurant' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Both', value: 'Both' },
] as const;

// ---------------------------------------------------------------------------
// Merchant statuses
// ---------------------------------------------------------------------------

export const TENANT_STATUSES: readonly SelectOption<MerchantStatus>[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Active', value: 'Active' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Deleted', value: 'Deleted' },
  { label: 'Failed', value: 'Failed' },
] as const;

// ---------------------------------------------------------------------------
// Token tiers & validity
// ---------------------------------------------------------------------------

export const TOKEN_TIERS: readonly SelectOption[] = [
  { label: 'Basic', value: 'Basic' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Premium', value: 'Premium' },
  { label: 'Enterprise', value: 'Enterprise' },
] as const;

export const TOKEN_VALIDITY_OPTIONS: readonly SelectOption<number>[] = [
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '180 Days', value: 180 },
  { label: '365 Days', value: 365 },
] as const;

// ---------------------------------------------------------------------------
// Support tickets
// ---------------------------------------------------------------------------

export const TICKET_PRIORITIES: readonly SelectOption[] = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
] as const;

export const TICKET_STATUSES: readonly SelectOption[] = [
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Waiting on Customer', value: 'WaitingOnCustomer' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Closed', value: 'Closed' },
] as const;

// ---------------------------------------------------------------------------
// Platform roles
// ---------------------------------------------------------------------------

// 2026-05-18 (Pass 38): final 5-role lock.
export const PLATFORM_ROLES: readonly SelectOption<PlatformRole>[] = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Operations Manager', value: 'OperationsManager' },
  { label: 'Finance Manager', value: 'FinanceManager' },
  { label: 'Content Manager', value: 'ContentManager' },
  { label: 'Operator', value: 'Operator' },
] as const;

// ---------------------------------------------------------------------------
// Status colour map (Tailwind colour keywords)
// ---------------------------------------------------------------------------

export const STATUS_COLORS: Record<string, string> = {
  Active: 'green',
  Suspended: 'amber',
  Cancelled: 'red',
  Pending: 'blue',
  Deleted: 'gray',
  Failed: 'red',
  Draft: 'gray',
  Sent: 'blue',
  Paid: 'green',
  Overdue: 'red',
  Refunded: 'purple',
  Open: 'blue',
  InProgress: 'amber',
  WaitingOnCustomer: 'orange',
  Resolved: 'green',
  Closed: 'gray',
  Approved: 'green',
  Rejected: 'red',
  Processed: 'green',
  Completed: 'green',
  Locked: 'red',
  Inactive: 'gray',
} as const;

// ---------------------------------------------------------------------------
// Grace phases (Standalone token expiry lifecycle)
// ---------------------------------------------------------------------------

export interface GracePhase {
  readonly phase: 'Warning' | 'Degraded' | 'Restricted' | 'Suspended';
  readonly label: string;
  readonly defaultDays: number;
  readonly color: string;
}

export const GRACE_PHASES: readonly GracePhase[] = [
  { phase: 'Warning', label: 'Warning Period', defaultDays: 7, color: 'amber' },
  { phase: 'Degraded', label: 'Degraded Service', defaultDays: 14, color: 'orange' },
  { phase: 'Restricted', label: 'Restricted Access', defaultDays: 21, color: 'red' },
  { phase: 'Suspended', label: 'Suspended', defaultDays: 30, color: 'gray' },
] as const;
