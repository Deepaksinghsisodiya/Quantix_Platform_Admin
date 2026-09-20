import type {
  Merchant,
  OnboardingChecklist,
  DbEngine,
  BillingFrequency,
  PreferredPaymentMethod,
  MerchantFeatureFlags,
  MerchantOperationalLimits,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
  MerchantFilter,
  MerchantNote,
  MerchantTag,
} from '@/lib/types/merchant';

import type {
  SignupQueueParams,
  SignupQueueEntry,
} from '@/lib/api/registration';

// ── Deboarding types (Pass 39; 2026-08-30 moved here from the deleted axios
//    duplicate lib/api/deboarding.ts — the RTK merchantApi slice is the ONE client). ──

export type DeboardingStatus =
  | 'ConsentGiven'
  | 'Deactivated'
  | 'AwaitingSettlement'
  | 'AwaitingRecharge'
  | 'AdminEscalated'
  | 'BillingSettled'
  | 'RefundIssued'
  | 'Completed'
  | 'Cancelled';

export type DeboardingStepKey =
  | 'ConsentGiven'
  | 'AccountDeactivated'
  | 'FinalInvoiceGenerated'
  | 'BillingSettled'
  | 'RefundIssued'
  | 'SoftDeleted';

export type DeboardingStepStatus = 'Pending' | 'InProgress' | 'Completed' | 'NotApplicable';

/** 2026-08-30: human labels for the workflow status chips — the raw enum names
 *  ("ConsentGiven", "AwaitingSettlement") leaked into the UI. One map for every surface
 *  (detail workflow card, deboarding queue). */
export const DEBOARDING_STATUS_LABEL: Record<DeboardingStatus, string> = {
  ConsentGiven: 'Consent Given',
  Deactivated: 'Deactivated',
  AwaitingSettlement: 'Awaiting Settlement',
  AwaitingRecharge: 'Awaiting Recharge',
  AdminEscalated: 'Admin Escalated',
  BillingSettled: 'Billing Settled',
  RefundIssued: 'Refund Issued',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export interface MerchantDeboardingStep {
  readonly deboardingStepId: string;
  readonly stepKey: DeboardingStepKey;
  readonly stepLabel: string;
  readonly status: DeboardingStepStatus;
  readonly completedAt: string | null;
  readonly completedBy: string | null;
  /** Resolved operator display name (server-side; falls back to the raw id when the user row is gone). */
  readonly completedByName: string | null;
  readonly note: string | null;
}

export interface MerchantDeboarding {
  readonly deboardingId: string;
  readonly merchantId: string;
  readonly companyName: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly status: DeboardingStatus;
  readonly consentGivenAt: string;
  readonly consentGivenBy: string;
  readonly consentNote: string | null;
  readonly deactivatedAt: string | null;
  readonly deactivatedBy: string | null;
  readonly finalInvoiceId: string | null;
  readonly finalInvoiceGeneratedAt: string | null;
  readonly finalInvoiceTotal: number | null;
  readonly finalInvoiceCurrencyCode: string | null;
  readonly walletBalanceAtSettlement: number | null;
  readonly securityDepositAtSettlement: number | null;
  readonly shortfallAmount: number | null;
  readonly merchantRechargeAskedAt: string | null;
  readonly merchantRechargedAt: string | null;
  readonly billingSettledAt: string | null;
  readonly refundWithdrawalId: string | null;
  readonly refundIssuedAt: string | null;
  readonly refundAmount: number | null;
  readonly completedAt: string | null;
  readonly cancelledAt: string | null;
  readonly cancellationReason: string | null;
  readonly notes: string | null;
  readonly steps: readonly MerchantDeboardingStep[];
}

export interface GiveConsentDto {
  readonly merchantId: string;
  readonly note?: string;
}

export interface AskMerchantToRechargeDto {
  readonly deboardingId: string;
  readonly shortfallAmount: number;
  readonly note?: string;
}

export interface IssueRefundDto {
  readonly deboardingId: string;
  readonly channel: string;
  readonly payoutDetails?: string;
  readonly payoutReference?: string;
  readonly note?: string;
}

export interface CancelDeboardingDto {
  readonly deboardingId: string;
  readonly reason: string;
}

export interface DeboardingFilter {
  readonly status?: DeboardingStatus;
  readonly merchantId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

// ── Terminal registry types (Pass 34; 2026-08-30 moved here from the deleted axios
//    duplicate lib/api/terminals.ts — the RTK merchantApi slice is the ONE client).
//    lastSeenAt dropped with the entity column: nothing ever wrote it and Standalone
//    Local-Only terminals never sync to Platform. terminalType is a fixed taxonomy
//    (Restaurant | Retail | Inventory) validated against the merchant's plan.

export interface MerchantTerminal {
  terminalId: string;
  merchantId: string;
  terminalCode: string;
  terminalName: string;
  terminalType: string | null;
  isRegistered: boolean;
  registeredAt: string | null;
  createdAt: string;
}

export interface CreateMerchantTerminalDto {
  merchantId: string;
  terminalCode: string;
  terminalName: string;
  terminalType: string;
}

export interface UpdateMerchantTerminalDto {
  terminalCode: string;
  terminalName: string;
  terminalType: string;
}

export interface PlatformPairingCode {
  code: string;
  expiresAt: string;
  terminalId: string;
  terminalName: string;
  merchantId: string;
}

import type { MerchantType, MerchantStatus } from '@/lib/types/common';

// 2026-08-30: declared here after deleting the dead axios module lib/api/merchants.ts
// (every function in it was unconsumed; the RTK merchantApi slice is the ONE client).
export interface MerchantTimelineEntry {
  readonly id: string;
  readonly merchantId: string;
  readonly event: string;
  readonly description: string;
  readonly performedBy: string;
  readonly timestamp: string;
  readonly metadata: Record<string, unknown>;
}

/** FRS-SPA-507 export (2026-08-30): POST /merchants/{id}/export streams the export
 *  document ITSELF as a JSON attachment (no ApiResponse envelope) — platform-side
 *  records only; Tier-4 cloud data exports from the merchant cloud itself. */
export interface MerchantDataExportDocument {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly merchant: Record<string, unknown>;
  readonly [section: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*  2026-08-31: merchant Communications — mirrors MerchantCommunicationsDto.   */
/*  Every row is derived from an ActivityLog entry an actual send path wrote,  */
/*  so a message the platform never sent reads "Not sent", never "Sent".       */
/* -------------------------------------------------------------------------- */

export type MerchantCommunicationStatus = 'NotSent' | 'Sent' | 'Failed';

export interface MerchantCommunication {
  readonly kind: string;
  readonly title: string;
  readonly recipient: string;
  readonly status: MerchantCommunicationStatus;
  /** Absent (not just null) when nothing was recorded — ASP.NET omits null keys. Also
   *  absent when the audit row predates audit-timestamp stamping: "sent, time unknown". */
  readonly occurredAt?: string | null;
  readonly detail?: string | null;
  readonly canResend: boolean;
}

export interface MerchantCommunications {
  readonly contactName: string;
  readonly contactEmail: string;
  readonly communications: readonly MerchantCommunication[];
}

export type {
  Merchant,
  OnboardingChecklist,
  DbEngine,
  BillingFrequency,
  PreferredPaymentMethod,
  MerchantFeatureFlags,
  MerchantOperationalLimits,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
  MerchantFilter,
  MerchantNote,
  MerchantTag,
  SignupQueueParams,
  SignupQueueEntry,
  // (deboarding + terminal types are declared directly above — exported at declaration)
  MerchantType,
  MerchantStatus,
  // (MerchantTimelineEntry is declared directly above — exported at its declaration)
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}
export type RegisterResponse = ApiResponse<Merchant>;
