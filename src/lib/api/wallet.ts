/**
 * Wallet API module.
 *
 * 2026-05-18 (Pass 37): aligned to the locked Tier-2 wallet redesign.
 *   - 7 transaction types only: SubscriptionDeduction / CommissionCharge / Adjustment /
 *     Withdrawal / Recharge / Bonus / Refund.
 *   - Recharge has 2 operator-initiated paths (online via gateway, offline single-step).
 *   - 2-step Submit â†’ Approve manual flow dropped; renamed WalletTopUpRequest â†’ WalletRecharge.
 *   - WalletTransaction now carries OpeningBalance + Reason inline.
 */

import { get, post } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WalletTransactionType =
  | 'SubscriptionDeduction'
  | 'CommissionCharge'
  | 'Adjustment'
  | 'Withdrawal'
  | 'Recharge'
  | 'Bonus'
  | 'Refund';

export type WalletTransactionStream = 'Balance' | 'SecurityDeposit';

export type WalletRechargeStatus = 'Pending' | 'Captured' | 'Approved' | 'Failed' | 'Cancelled';

export type GracePeriodPhase = 'None' | 'Warning' | 'Restricted' | 'Suspended' | 'Locked';

export interface Wallet {
  readonly walletId: string;
  readonly merchantId: string;
  readonly tokenBalance: number;
  readonly lastDeductionDate: string | null;
  readonly lastTopUpDate: string | null;
  readonly consumptionRatePerDay: number;
  readonly projectedDepletionDays: number;
  readonly gracePeriodPhase: GracePeriodPhase;
  readonly gracePeriodStartDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string | null;
}

export interface WalletListParams extends PaginationParams {
  readonly search?: string;
  readonly minBalance?: number;
  readonly maxBalance?: number;
  readonly gracePeriodPhase?: GracePeriodPhase;
  readonly sortBy?: string;
}

/** 2026-05-18 (Pass 37): Adjustment is always a DEBIT — amount must be positive (service negates). */
export interface ManualAdjustment {
  readonly merchantId: string;
  readonly tokenAmount: number;
  readonly reason: string;
  readonly adjustedBy: string;
}

export interface AddBonus {
  readonly merchantId: string;
  readonly tokenAmount: number;
  readonly reason: string;
}

export interface RefundWallet {
  readonly merchantId: string;
  readonly tokenAmount: number;
  readonly reason: string;
  readonly referenceType?: string;
  readonly referenceId?: string;
}

export interface RechargeOnline {
  readonly merchantId: string;
  readonly tokenAmount: number;
  readonly currencyAmount: number;
  readonly currencyCode?: string;
  /** Gateway-issued tokenised payment method (we never see the PAN). */
  readonly paymentToken: string;
  readonly description?: string;
}

export interface RechargeOffline {
  readonly merchantId: string;
  readonly tokenAmount: number;
  readonly currencyAmount?: number;
  readonly currencyCode?: string;
  /** "Cash" | "Wire" | "Check" | etc. */
  readonly channelLabel: string;
  readonly evidenceNote?: string;
  readonly recordedNote?: string;
}

export interface WalletRecharge {
  readonly walletRechargeId: string;
  readonly merchantId: string;
  readonly walletId: string;
  readonly tokenAmount: number;
  readonly currencyAmount: number | null;
  readonly currencyCode: string | null;
  readonly status: WalletRechargeStatus;
  /** "Online" | "Offline". */
  readonly channel: string;
  readonly evidenceNote: string | null;
  readonly paymentReference: string | null;
  readonly failureReason: string | null;
  readonly recordedNote: string | null;
  readonly createdAt: string;
  readonly processedAt: string | null;
}

export interface WalletRechargeFilter extends PaginationParams {
  readonly merchantId?: string;
  readonly status?: WalletRechargeStatus;
  readonly channel?: 'Online' | 'Offline';
}

/** 2026-05-18 (Pass 37): row carries OpeningBalance + Reason inline. */
export interface WalletTransaction {
  readonly walletTransactionId: string;
  readonly walletId: string;
  readonly transactionType: WalletTransactionType;
  readonly stream: WalletTransactionStream;
  readonly openingBalance: number;
  readonly tokenAmount: number;
  readonly tokenBalanceAfter: number;
  readonly currencyAmount: number | null;
  readonly currencyCode: string | null;
  readonly exchangeRateUsed: number | null;
  readonly referenceType: string | null;
  readonly referenceId: string | null;
  readonly reason: string | null;
  readonly description: string | null;
  readonly createdBy: string | null;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getWallets(params: WalletListParams): Promise<ApiListResponse<Wallet>> {
  return get<ApiListResponse<Wallet>>('/api/v1/wallet/summary', params as unknown as Record<string, string | number>);
}

export function getWallet(merchantId: string): Promise<ApiResponse<Wallet>> {
  return get<ApiResponse<Wallet>>(`/api/v1/wallet/${merchantId}`);
}

export function getWalletTransactions(
  merchantId: string,
  params?: { transactionType?: WalletTransactionType; fromDate?: string; toDate?: string; page?: number; pageSize?: number; }
): Promise<ApiResponse<readonly WalletTransaction[]>> {
  return get<ApiResponse<readonly WalletTransaction[]>>(
    `/api/v1/wallet/${merchantId}/transactions`,
    params as unknown as Record<string, string | number>);
}

export function adjustWallet(data: ManualAdjustment): Promise<ApiResponse<Wallet>> {
  return post<ApiResponse<Wallet>>('/api/v1/wallet/adjust', data);
}

export function addBonus(data: AddBonus): Promise<ApiResponse<Wallet>> {
  return post<ApiResponse<Wallet>>('/api/v1/wallet/bonus', data);
}

export function refund(data: RefundWallet): Promise<ApiResponse<Wallet>> {
  return post<ApiResponse<Wallet>>('/api/v1/wallet/refund', data);
}

// â”€â”€ Recharge (Pass 37) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function rechargeOnline(data: RechargeOnline): Promise<ApiResponse<WalletRecharge>> {
  return post<ApiResponse<WalletRecharge>>('/api/v1/wallet/recharge/online', data);
}

export function rechargeOffline(data: RechargeOffline): Promise<ApiResponse<WalletRecharge>> {
  return post<ApiResponse<WalletRecharge>>('/api/v1/wallet/recharge/offline', data);
}

export function getRecharges(filter: WalletRechargeFilter): Promise<ApiResponse<readonly WalletRecharge[]>> {
  return get<ApiResponse<readonly WalletRecharge[]>>('/api/v1/wallet/recharges', filter as unknown as Record<string, string | number>);
}
