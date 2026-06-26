/**
 * Billing API module.
 */

import { get, post, put } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type { Invoice, SubscriptionPlan, TokenPricing } from '@/lib/types/billing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BillingDashboard {
  readonly totalRevenue: number;
  readonly monthlyRevenue: number;
  readonly outstandingAmount: number;
  readonly overdueAmount: number;
  readonly invoiceCount: number;
  readonly paidCount: number;
  readonly overdueCount: number;
  readonly revenueByMonth: readonly { readonly month: string; readonly amount: number }[];
  readonly revenueByType: Record<string, number>;
}

export interface InvoiceListParams extends PaginationParams {
  readonly search?: string;
  readonly merchantId?: string;
  readonly type?: string;
  readonly status?: string;
  readonly issuedFrom?: string;
  readonly issuedTo?: string;
}

export interface GenerateInvoiceDto {
  readonly merchantId: string;
  readonly type: string;
  readonly items: readonly {
    readonly description: string;
    readonly quantity: number;
    readonly unitPrice: number;
    readonly taxRate: number;
  }[];
  readonly dueDate: string;
  readonly notes?: string;
}

export interface PlanCreateDto {
  readonly name: string;
  readonly tier: string;
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly currency: string;
  readonly features: readonly string[];
  readonly maxLocations: number;
  readonly maxTerminals: number;
}

export interface PlanUpdateDto {
  readonly name?: string;
  readonly monthlyPrice?: number;
  readonly annualPrice?: number;
  readonly features?: readonly string[];
  readonly maxLocations?: number;
  readonly maxTerminals?: number;
  readonly isActive?: boolean;
}

export interface TokenPricingUpdateDto {
  readonly tiers: readonly {
    readonly tier: string;
    readonly validityDays: number;
    readonly price: number;
    readonly currency: string;
    readonly bulkDiscounts: readonly { readonly minQuantity: number; readonly discountPercent: number }[];
  }[];
  /** FRS-SAP-609: Schedule price changes for a future date. */
  readonly effectiveDate?: string;
}

/** FRS-SAP-601: Revenue split by merchant type. */
export interface RevenueByMerchantType {
  readonly enterprise: {
    readonly subscription: number;
    readonly usageOverage: number;
    readonly commission: number;
    readonly total: number;
    readonly merchantCount: number;
  };
  readonly standalone: {
    readonly tokenSales: number;
    readonly total: number;
    readonly merchantCount: number;
  };
}

/** FRS-SAP-603: Billing cycle configuration. */
export interface BillingCycleConfig {
  readonly monthlyCycles: number;
  readonly annualCycles: number;
  readonly gracePeriodDays: number;
  readonly proRataEnabled: boolean;
  readonly nextBatchRun: string;
}

/** FRS-SAP-610: Commission calculation rules. */
export interface CommissionRateCap {
  readonly maxCommissionPerTransaction: number;
  readonly maxRateOverride: number;
  readonly minTransactionValue: number;
}

export interface CommissionCalculationRule {
  readonly transactionType: string;
  readonly commissionable: boolean;
  readonly description: string;
}

export interface RefundDto {
  readonly amount: number;
  readonly reason: string;
}

/** PF-07: Payment method for token purchase. */
export type TokenPaymentMethod = 'online' | 'manual' | 'prepaid';

/** PF-07: Create invoice for a Standalone token purchase. */
export interface CreateTokenInvoiceDto {
  readonly merchantId: string;
  readonly tokenId: string;
  readonly tier: string;
  readonly validityDays: number;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly bulkDiscountPercent: number;
  readonly taxRate: number;
  readonly paymentMethod: TokenPaymentMethod;
  /** FRS-SAP-1406: immediate or next-billing. */
  readonly invoiceOption: 'immediate' | 'next-billing';
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getBillingDashboard(): Promise<ApiResponse<BillingDashboard>> {
  return get<ApiResponse<BillingDashboard>>('/api/v1/billing/dashboard');
}

export function getInvoices(params: InvoiceListParams): Promise<ApiListResponse<Invoice>> {
  return get<ApiListResponse<Invoice>>('/api/v1/billing/invoices', params as unknown as Record<string, string | number>);
}

export function getInvoice(id: string): Promise<ApiResponse<Invoice>> {
  return get<ApiResponse<Invoice>>(`/api/v1/billing/invoices/${id}`);
}

export function generateInvoice(data: GenerateInvoiceDto): Promise<ApiResponse<Invoice>> {
  return post<ApiResponse<Invoice>>('/api/v1/billing/invoices', data);
}

export function sendInvoice(id: string): Promise<ApiResponse<{ sent: boolean }>> {
  return post<ApiResponse<{ sent: boolean }>>(`/api/v1/billing/invoices/${id}/send`);
}

export function getPlans(): Promise<ApiResponse<readonly SubscriptionPlan[]>> {
  return get<ApiResponse<readonly SubscriptionPlan[]>>('/api/v1/billing/plans');
}

export function createPlan(data: PlanCreateDto): Promise<ApiResponse<SubscriptionPlan>> {
  return post<ApiResponse<SubscriptionPlan>>('/api/v1/billing/plans', data);
}

export function updatePlan(id: string, data: PlanUpdateDto): Promise<ApiResponse<SubscriptionPlan>> {
  return put<ApiResponse<SubscriptionPlan>>(`/api/v1/billing/plans/${id}`, data);
}

export function getTokenPricing(): Promise<ApiResponse<readonly TokenPricing[]>> {
  return get<ApiResponse<readonly TokenPricing[]>>('/api/v1/billing/token-pricing');
}

export function updateTokenPricing(data: TokenPricingUpdateDto): Promise<ApiResponse<readonly TokenPricing[]>> {
  return put<ApiResponse<readonly TokenPricing[]>>('/api/v1/billing/token-pricing', data);
}

export function processRefund(invoiceId: string, data: RefundDto): Promise<ApiResponse<{ refundId: string }>> {
  return post<ApiResponse<{ refundId: string }>>(`/api/v1/billing/invoices/${invoiceId}/refund`, data);
}

/** FRS-SAP-602: Generate invoice PDF. */
export function getInvoicePdf(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
  return get<ApiResponse<{ downloadUrl: string }>>(`/api/v1/billing/invoices/${id}/pdf`);
}

/** PF-07: Create a TokenPurchase invoice for a Standalone token. */
export function createTokenInvoice(data: CreateTokenInvoiceDto): Promise<ApiResponse<Invoice>> {
  return post<ApiResponse<Invoice>>('/api/v1/billing/invoices/token-purchase', data);
}

/** PF-07: Record manual payment for a token purchase invoice. */
export function recordManualPayment(invoiceId: string, data: {
  readonly amount: number;
  readonly method: string;
  readonly reference: string;
}): Promise<ApiResponse<Invoice>> {
  return post<ApiResponse<Invoice>>(`/api/v1/billing/invoices/${invoiceId}/record-payment`, data);
}

/** FRS-SAP-601: Revenue by merchant type. */
export function getRevenueByMerchantType(): Promise<ApiResponse<RevenueByMerchantType>> {
  return get<ApiResponse<RevenueByMerchantType>>('/api/v1/billing/revenue-report');
}

/** FRS-SAP-603: Billing cycle configuration. */
export function getBillingCycleConfig(): Promise<ApiResponse<BillingCycleConfig>> {
  return get<ApiResponse<BillingCycleConfig>>('/api/v1/billing/cycle-config');
}

/** FRS-SAP-606: Deprecate a subscription plan. */
export function deprecatePlan(id: string): Promise<ApiResponse<SubscriptionPlan>> {
  return post<ApiResponse<SubscriptionPlan>>(`/api/v1/billing/plans/${id}/deprecate`);
}

/** FRS-SAP-610: Commission rate caps. */
export function getCommissionRateCaps(): Promise<ApiResponse<CommissionRateCap>> {
  return get<ApiResponse<CommissionRateCap>>('/api/v1/commission/rate-caps');
}

export function updateCommissionRateCaps(caps: CommissionRateCap): Promise<ApiResponse<CommissionRateCap>> {
  return put<ApiResponse<CommissionRateCap>>('/api/v1/commission/rate-caps', caps);
}

/** FRS-SAP-610: Commission calculation rules. */
export function getCommissionCalculationRules(): Promise<ApiResponse<readonly CommissionCalculationRule[]>> {
  return get<ApiResponse<readonly CommissionCalculationRule[]>>('/api/v1/commission/calculation-rules');
}

// ---------------------------------------------------------------------------
// PF-06: Enterprise Billing Cycle â€” Payment Processing
// ---------------------------------------------------------------------------

/** Mark an invoice as Paid after manual confirmation or payment gateway callback. */
export function markInvoicePaid(invoiceId: string, paymentRef: string): Promise<ApiResponse<Invoice>> {
  return post<ApiResponse<Invoice>>(`/api/v1/billing/invoices/${invoiceId}/mark-paid`, { paymentRef });
}

/** Record a payment attempt (auto-charge or manual). */
export function recordPayment(invoiceId: string, data: {
  readonly amount: number;
  readonly method: string;
  readonly reference: string;
}): Promise<ApiResponse<{ paymentId: string; status: 'Completed' | 'Failed' }>> {
  return post<ApiResponse<{ paymentId: string; status: 'Completed' | 'Failed' }>>(`/api/v1/billing/invoices/${invoiceId}/payments`, data);
}

/** Retry payment for an overdue invoice (max 3 attempts, 24h apart). */
export function retryPayment(invoiceId: string): Promise<ApiResponse<{ attempt: number; status: 'Completed' | 'Failed'; nextRetryAt: string | null }>> {
  return post<ApiResponse<{ attempt: number; status: 'Completed' | 'Failed'; nextRetryAt: string | null }>>(`/api/v1/billing/payments/retry/${invoiceId}`);
}

/** Get payment attempts for an invoice. */
export function getPaymentAttempts(invoiceId: string): Promise<ApiResponse<readonly {
  readonly attempt: number;
  readonly status: 'Completed' | 'Failed';
  readonly attemptedAt: string;
  readonly failureReason: string | null;
}[]>> {
  return get<ApiResponse<readonly {
    readonly attempt: number;
    readonly status: 'Completed' | 'Failed';
    readonly attemptedAt: string;
    readonly failureReason: string | null;
  }[]>>(`/api/v1/billing/invoices/${invoiceId}/payment-attempts`);
}

/** Send payment reminder email for an overdue invoice. */
export function sendPaymentReminder(invoiceId: string): Promise<ApiResponse<{ sent: boolean }>> {
  return post<ApiResponse<{ sent: boolean }>>(`/api/v1/billing/invoices/${invoiceId}/send-reminder`);
}

// ---------------------------------------------------------------------------
// PF-06: Wallet Top-Up (billing-cycle triggered)
// ---------------------------------------------------------------------------

/** Credit monthly token allocation to Enterprise merchant wallet after successful payment. */
export function creditWalletAllocation(merchantId: string, data: {
  readonly amount: number;
  readonly reason: string;
  readonly billingCycleId: string;
}): Promise<ApiResponse<{ walletBalance: number }>> {
  return post<ApiResponse<{ walletBalance: number }>>(`/api/v1/wallet/${merchantId}/adjust`, {
    amount: data.amount,
    reason: data.reason,
    type: 'credit',
  });
}

// 2026-05-17 (Pass 35): PF-06 Commission Settlement section removed.
// settleCommission + getCommissionStatementPdf are gone — the new design has the Invoice as
// the single billable artefact (no separate Statement PDF), and invoice generation is driven
// by the Admin-configured cadence in CommissionInvoiceJob (Phase D), not by a manual
// "settle" call. Operators can still trigger on-demand invoice generation via the new
// RevenueCollections page in Phase F.

// ---------------------------------------------------------------------------
// PF-10: Overdue & Suspension Escalation
// ---------------------------------------------------------------------------

/** Escalation stage for an overdue Enterprise invoice. */
export type EscalationStage = 'Grace' | 'Reminder1' | 'Reminder2' | 'FinalNotice' | 'Suspended';

/** An overdue invoice with its current escalation stage. */
export interface OverdueEscalationEntry {
  readonly invoiceId: string;
  readonly invoiceNumber: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly amount: number;
  readonly currency: string;
  readonly dueDate: string;
  readonly daysOverdue: number;
  readonly stage: EscalationStage;
  readonly lastContactedAt: string | null;
  readonly contactedBy: string | null;
  readonly autoSuspensionDate: string;
}

/** PF-10: Get all overdue invoices grouped by escalation stage. */
export function getOverdueEscalation(): Promise<ApiResponse<{
  readonly grace: readonly OverdueEscalationEntry[];
  readonly reminder1: readonly OverdueEscalationEntry[];
  readonly reminder2: readonly OverdueEscalationEntry[];
  readonly finalNotice: readonly OverdueEscalationEntry[];
  readonly suspended: readonly OverdueEscalationEntry[];
  readonly summary: {
    readonly totalOverdue: number;
    readonly totalAmount: number;
    readonly graceCount: number;
    readonly reminder1Count: number;
    readonly reminder2Count: number;
    readonly finalNoticeCount: number;
    readonly suspendedCount: number;
  };
}>> {
  return get<ApiResponse<{
    readonly grace: readonly OverdueEscalationEntry[];
    readonly reminder1: readonly OverdueEscalationEntry[];
    readonly reminder2: readonly OverdueEscalationEntry[];
    readonly finalNotice: readonly OverdueEscalationEntry[];
    readonly suspended: readonly OverdueEscalationEntry[];
    readonly summary: {
      readonly totalOverdue: number;
      readonly totalAmount: number;
      readonly graceCount: number;
      readonly reminder1Count: number;
      readonly reminder2Count: number;
      readonly finalNoticeCount: number;
      readonly suspendedCount: number;
    };
  }>>('/api/v1/billing/overdue-escalation');
}

/** PF-10 Day 30: Trigger suspension for an overdue invoice (Enterprise only). */
export function triggerOverdueSuspension(invoiceId: string): Promise<ApiResponse<{ suspended: boolean; merchantId: string }>> {
  return post<ApiResponse<{ suspended: boolean; merchantId: string }>>(`/api/v1/billing/invoices/${invoiceId}/trigger-suspension`);
}

/** PF-10 Day 14: Record manual outreach contact for an overdue invoice. */
export function markOverdueContacted(invoiceId: string, notes: string): Promise<ApiResponse<OverdueEscalationEntry>> {
  return post<ApiResponse<OverdueEscalationEntry>>(`/api/v1/billing/invoices/${invoiceId}/mark-contacted`, { notes });
}

/** PF-10 Standalone: Get lapsed merchants (token expired, not renewed). */
export function getLapsedStandaloneMerchantsCount(): Promise<ApiResponse<{ count: number; merchantIds: readonly string[] }>> {
  return get<ApiResponse<{ count: number; merchantIds: readonly string[] }>>('/api/v1/billing/standalone/lapsed');
}
