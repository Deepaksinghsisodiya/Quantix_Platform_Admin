/**
 * 2026-05-18 (Pass 39): merchant deboarding workflow API surface.
 *
 * Two-role design:
 *   â€¢ POST /consent â€” Admin-only (merchants.deboard.consent permission).
 *   â€¢ All other mutating endpoints â€” Operations Manager (merchants.deboard.execute).
 */

import { get, post } from './client';
import type { ApiResponse } from '@/lib/types/common';

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

export interface MerchantDeboardingStep {
  readonly deboardingStepId: string;
  readonly stepKey: DeboardingStepKey;
  readonly stepLabel: string;
  readonly status: DeboardingStepStatus;
  readonly completedAt: string | null;
  readonly completedBy: string | null;
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

// â”€â”€ Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function giveConsent(dto: GiveConsentDto): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>('/api/v1/deboarding/consent', dto);
}

export function deactivate(deboardingId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/${deboardingId}/deactivate`);
}

export function generateFinalInvoice(deboardingId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/${deboardingId}/final-invoice`);
}

export function settle(deboardingId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/${deboardingId}/settle`);
}

export function askRecharge(dto: AskMerchantToRechargeDto): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>('/api/v1/deboarding/ask-recharge', dto);
}

export function retrySettle(deboardingId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/${deboardingId}/retry-settle`);
}

export function issueRefund(dto: IssueRefundDto): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>('/api/v1/deboarding/refund', dto);
}

export function softDelete(deboardingId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/${deboardingId}/soft-delete`);
}

export function cancelDeboarding(dto: CancelDeboardingDto): Promise<ApiResponse<MerchantDeboarding>> {
  return post<ApiResponse<MerchantDeboarding>>('/api/v1/deboarding/cancel', dto);
}

export function getById(deboardingId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return get<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/${deboardingId}`);
}

export function getByMerchant(merchantId: string): Promise<ApiResponse<MerchantDeboarding>> {
  return get<ApiResponse<MerchantDeboarding>>(`/api/v1/deboarding/by-merchant/${merchantId}`);
}

export function list(filter: DeboardingFilter): Promise<ApiResponse<readonly MerchantDeboarding[]>> {
  return get<ApiResponse<readonly MerchantDeboarding[]>>('/api/v1/deboarding', filter as unknown as Record<string, string | number>);
}
