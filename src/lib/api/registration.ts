/**
 * Merchant Registration API module.
 */

import { get, post } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type {
  Merchant,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
} from '@/lib/types/merchant';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignupQueueParams extends PaginationParams {
  readonly search?: string;
  readonly status?: 'Pending' | 'Verified' | 'Provisioning' | 'Failed' | 'Completed';
}

export interface SignupQueueEntry {
  readonly id: string;
  readonly businessName: string;
  readonly email: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly status: 'Pending' | 'Verified' | 'Provisioning' | 'Failed' | 'Completed';
  readonly step: string;
  readonly error: string | null;
  readonly submittedAt: string;
  readonly completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function registerEnterprise(data: MerchantCreateEnterprise): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>('/api/v1/registration/enterprise', data);
}

export function registerStandalone(data: MerchantCreateStandalone): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>('/api/v1/registration/standalone', data);
}

export function getSignupQueue(params: SignupQueueParams): Promise<ApiListResponse<SignupQueueEntry>> {
  return get<ApiListResponse<SignupQueueEntry>>('/api/v1/registration/queue', params as unknown as Record<string, string | number>);
}

export function resendVerification(id: string): Promise<ApiResponse<{ sent: boolean }>> {
  return post<ApiResponse<{ sent: boolean }>>(`/api/v1/registration/${id}/resend-verification`);
}

/**
 * FRS-SAP-301 / FRS-SAP-303: retry DB provisioning for a merchant currently in
 * <c>ProvisioningStatus.Failed</c>. Resets the merchant back to Requested; the
 * DatabaseProvisioningJob picks it up on the next ≤30s tick and re-runs.
 * Backed by <c>POST /api/v1/merchants/{id}/retry-provisioning</c>.
 */
export function retryProvisioning(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
  return post<ApiResponse<{ id: string; status: string }>>(`/api/v1/merchants/${id}/retry-provisioning`);
}

/**
 * FRS-SAP-301: bypass the OTP / payment-capture gate for sales-led trial
 * activations. Marks the merchant Active immediately; reason is recorded in
 * ActivityLog. Backed by <c>POST /api/v1/merchants/{id}/bypass-payment</c>.
 */
export function bypassPayment(id: string, reason: string = 'Sales-led trial activation'): Promise<ApiResponse<{ id: string; status: string }>> {
  return post<ApiResponse<{ id: string; status: string }>>(`/api/v1/merchants/${id}/bypass-payment`, { reason });
}

/**
 * Pass 40 (2026-05-24) — OperationsManager-only "Accept Merchant" action that
 * activates the merchant + provisions the single merchant-self PlatformUser login
 * + emails the temp credentials. Backed by
 * <c>POST /api/v1/registration/{id}/activate</c>. This endpoint was tightened from
 * PlatformAdmin policy to OperationsManager in Pass 40b.
 */
export function activateMerchant(id: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/registration/${id}/activate`);
}
