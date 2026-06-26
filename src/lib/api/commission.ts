/**
 * Commission API module [SPA-018].
 * 2026-05-17 (Pass 35): Slimmed after Platform-pull revenue redesign.
 * Removed: getCommissionLedger, getSettlements, approveSettlement, getCommissionDisputes,
 * createDispute, resolveDispute, generateStatement, emailStatement, getCommissionAggregation.
 * Phase C/F add: getRevenueCollections, triggerRevenueCollection (per-merchant manual).
 */

import { get, post, put, del } from './client';
import type { ApiResponse } from '@/lib/types/common';
import type {
  CommissionSummary,
  CommissionRate,
  CommissionExemption,
} from '@/lib/types/commission';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommissionRateCreate {
  readonly planId?: string | null;
  readonly merchantId?: string | null;
  readonly rate: number;
  readonly minTransactionValue: number;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string | null;
}

export interface CommissionRateUpdate {
  readonly rate?: number;
  readonly minTransactionValue?: number;
  readonly effectiveTo?: string | null;
}

export interface ExemptionCreate {
  readonly merchantId: string;
  readonly reason: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string | null;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getCommissionDashboard(): Promise<ApiResponse<CommissionSummary>> {
  return get<ApiResponse<CommissionSummary>>('/api/v1/commission/dashboard');
}

export function getCommissionRates(): Promise<ApiResponse<readonly CommissionRate[]>> {
  return get<ApiResponse<readonly CommissionRate[]>>('/api/v1/commission/rates');
}

export function createCommissionRate(data: CommissionRateCreate): Promise<ApiResponse<CommissionRate>> {
  return post<ApiResponse<CommissionRate>>('/api/v1/commission/rates', data);
}

export function updateCommissionRate(id: string, data: CommissionRateUpdate): Promise<ApiResponse<CommissionRate>> {
  return put<ApiResponse<CommissionRate>>(`/api/v1/commission/rates/${id}`, data);
}

export function getCommissionExemptions(): Promise<ApiResponse<readonly CommissionExemption[]>> {
  return get<ApiResponse<readonly CommissionExemption[]>>('/api/v1/commission/exemptions');
}

export function createExemption(data: ExemptionCreate): Promise<ApiResponse<CommissionExemption>> {
  return post<ApiResponse<CommissionExemption>>('/api/v1/commission/exemptions', data);
}

export function removeExemption(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/commission/exemptions/${id}`);
}
