/**
 * Tokens API module [SPA-017].
 */

import { get, post, put } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type {
  RechargeToken,
  TokenGenerateRequest,
  BulkTokenRequest,
  TokenFilter,
  TokenTemplate,
  TokenTier,
} from '@/lib/types/token';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TokenListParams extends PaginationParams, TokenFilter {}

export interface TokenTemplateUpdate {
  readonly name?: string;
  readonly validityDays?: number;
  readonly limitsPayload?: Record<string, number>;
  readonly featureMap?: Record<string, boolean>;
  readonly gracePolicy?: {
    readonly gracePeriodDays?: number;
    readonly readOnlyDuringGrace?: boolean;
    readonly notifyDaysBeforeExpiry?: readonly number[];
  };
}

export interface TokenMetrics {
  readonly totalActive: number;
  readonly totalExpired: number;
  readonly totalRevoked: number;
  readonly totalConsumed: number;
  readonly expiringWithin7Days: number;
  readonly expiringWithin30Days: number;
  readonly byTier: Record<TokenTier, number>;
  readonly generatedThisMonth: number;
  readonly revenueThisMonth: number;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function generateToken(data: TokenGenerateRequest): Promise<ApiResponse<RechargeToken>> {
  return post<ApiResponse<RechargeToken>>('/api/v1/tokens', data);
}

export function bulkGenerateTokens(data: BulkTokenRequest): Promise<ApiResponse<readonly RechargeToken[]>> {
  return post<ApiResponse<readonly RechargeToken[]>>('/api/v1/tokens/bulk', data);
}

export function getTokenHistory(params: TokenListParams): Promise<ApiListResponse<RechargeToken>> {
  return get<ApiListResponse<RechargeToken>>('/api/v1/tokens', params as unknown as Record<string, string | number>);
}

export function getToken(id: string): Promise<ApiResponse<RechargeToken>> {
  return get<ApiResponse<RechargeToken>>(`/api/v1/tokens/${id}`);
}

export function revokeToken(id: string, reason: string): Promise<ApiResponse<RechargeToken>> {
  return post<ApiResponse<RechargeToken>>(`/api/v1/tokens/${id}/revoke`, { reason });
}

export function getTokenTemplates(): Promise<ApiResponse<readonly TokenTemplate[]>> {
  return get<ApiResponse<readonly TokenTemplate[]>>('/api/v1/tokens/templates');
}

export function updateTokenTemplate(tier: TokenTier, data: TokenTemplateUpdate): Promise<ApiResponse<TokenTemplate>> {
  return put<ApiResponse<TokenTemplate>>(`/api/v1/tokens/templates/${tier}`, data);
}

export function getExpiringTokens(daysWindow: number): Promise<ApiResponse<readonly RechargeToken[]>> {
  return get<ApiResponse<readonly RechargeToken[]>>('/api/v1/tokens/expiring', { daysWindow });
}

export function getTokenMetrics(): Promise<ApiResponse<TokenMetrics>> {
  return get<ApiResponse<TokenMetrics>>('/api/v1/tokens/metrics');
}

/** FRS-SAP-1401: Email token to merchant. */
export function emailToken(id: string, email: string): Promise<ApiResponse<{ sent: boolean }>> {
  return post<ApiResponse<{ sent: boolean }>>(`/api/v1/tokens/${id}/email`, { email });
}

/** FRS-SAP-1402: Get decrypted token payload (admin view). */
export function getTokenPayload(id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return get<ApiResponse<Record<string, unknown>>>(`/api/v1/tokens/${id}/payload`);
}

/** FRS-SAP-1407: Renew an expiring token with a new validity period. */
export function renewToken(id: string, newValidityDays: number): Promise<ApiResponse<RechargeToken>> {
  return post<ApiResponse<RechargeToken>>(`/api/v1/tokens/${id}/renew`, { validityDays: newValidityDays });
}

/** FRS-SAP-1405: Batch email tokens to merchant. */
export function batchEmailTokens(tokenIds: readonly string[], email: string): Promise<ApiResponse<{ sent: number }>> {
  return post<ApiResponse<{ sent: number }>>('/api/v1/tokens/batch-email', { tokenIds, email });
}

/** FRS-SAP-1406: Get pricing for a token configuration. */
export function getTokenPrice(tier: TokenTier, validityDays: number, quantity: number): Promise<ApiResponse<{ unitPrice: number; total: number; discount: number; currency: string }>> {
  return get<ApiResponse<{ unitPrice: number; total: number; discount: number; currency: string }>>('/api/v1/tokens/price', { tier, validityDays, quantity } as unknown as Record<string, string | number>);
}

/** FRS-SAP-1407: Send renewal reminder email to a specific merchant. */
export function sendRenewalReminder(tokenId: string): Promise<ApiResponse<{ sent: boolean }>> {
  return post<ApiResponse<{ sent: boolean }>>(`/api/v1/tokens/${tokenId}/renewal-reminder`);
}

/** FRS-SAP-1407: Send bulk renewal reminders to all merchants with tokens expiring within a window. */
export function sendBulkRenewalReminders(daysWindow: number): Promise<ApiResponse<{ sentCount: number }>> {
  return post<ApiResponse<{ sentCount: number }>>('/api/v1/tokens/bulk-renewal-reminders', { daysWindow });
}
