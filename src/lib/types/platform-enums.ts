/**
 * Round_16 Pass 2 audit C-1/C-2: canonical mirrors of `Quantix.Foundation.Enums.Platform.*`.
 * Solution_Rules §9: 1:1 with C# enums; values use the enum-name string (matches
 * `JsonStringEnumConverter` registered in `Program.cs`).
 *
 * Keep this file in sync when adding/removing Foundation enum members.
 */

/** Mirror of `OnboardingMode`. */
export type OnboardingMode = 'Enterprise' | 'Standalone';

/** Mirror of `MerchantStatus`. */
export type MerchantStatus =
  | 'PendingApproval'
  | 'Provisioning'
  | 'Active'
  | 'Suspended'
  | 'Cancelled'
  | 'Deactivated'
  | 'Terminated'
  | 'Failed';

/** Mirror of `BillingCycleType`. */
export type BillingCycleType = 'Monthly' | 'Quarterly' | 'Annual';

/** Mirror of `PlanType` (§11.1). */
export type PlanType = 'Trial' | 'Basic' | 'Pro' | 'Enterprise' | 'Custom';

/** Mirror of `RechargeTokenStatus` (Round_16 Pass 1). */
export type RechargeTokenStatus = 'Active' | 'Consumed' | 'Expired' | 'Revoked';

/** Mirror of `TokenRevocationReason` (Round_16 Pass 1). */
export type TokenRevocationReason =
  | 'None'
  | 'MerchantSuspended'
  | 'MerchantTerminated'
  | 'PlanChanged'
  | 'BillingDispute'
  | 'ComplianceAction'
  | 'Manual';

/** Mirror of `SettlementStatus` (Round_16 Pass 1). */
export type SettlementStatus = 'Draft' | 'Approved' | 'Settled' | 'Disputed';

/** Mirror of `DisputeStatus` (Round_16 Pass 1). */
export type DisputeStatus = 'Open' | 'UnderReview' | 'Resolved' | 'Withdrawn';

/** Mirror of `WebhookDeliveryStatus` (Round_16 Pass 1). */
export type WebhookDeliveryStatus = 'Pending' | 'InProgress' | 'Delivered' | 'Failed' | 'Dead';

/** Mirror of `InvoiceStatus`. */
export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Overdue' | 'Voided' | 'Refunded';

/** 2026-05-18 (Pass 37): Mirror of `WalletTransactionType` after the locked 7-value trim. */
export type WalletTransactionType =
  | 'SubscriptionDeduction'
  | 'CommissionCharge'
  | 'Adjustment'
  | 'Withdrawal'
  | 'Recharge'
  | 'Bonus'
  | 'Refund';
