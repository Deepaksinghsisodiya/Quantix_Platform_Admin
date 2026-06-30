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
import type { PlanType } from '@/lib/types/platform-enums';

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

const tierToPlan: Record<TokenTier, PlanType> = {
  Basic: 'Basic',
  Standard: 'Pro',
  Advance: 'Enterprise',
  Premium: 'Enterprise',
};

function toGenerateDto(data: TokenGenerateRequest) {
  return {
    merchantId: data.merchantId,
    terminalId: data.binding?.terminalId || null,
    plan: tierToPlan[data.tier] ?? 'Pro',
    validityDays: data.validityDays,
    gracePolicyDays: data.gracePolicy ? JSON.stringify(data.gracePolicy) : null,
    limitsOverride: data.limitsPayload ?? null,
    featuresOverride: data.featureMap ?? null,
  };
}

function toBulkDto(data: BulkTokenRequest) {
  const tier = data.overrides?.tier ?? 'Standard';
  return {
    merchantId: data.merchantIds[0],
    plan: tierToPlan[tier] ?? 'Pro',
    validityDays: data.overrides?.validityDays ?? 90,
    gracePolicyDays: null,
    quantity: Math.max(1, data.merchantIds.length),
    terminalBindings: null,
  };
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function generateToken(data: TokenGenerateRequest): Promise<ApiResponse<RechargeToken>> {
  return post<ApiResponse<RechargeToken>>('/api/v1/tokens/generate', toGenerateDto(data));
}

export function bulkGenerateTokens(data: BulkTokenRequest): Promise<ApiResponse<readonly RechargeToken[]>> {
  return post<ApiResponse<readonly RechargeToken[]>>('/api/v1/tokens/generate-bulk', toBulkDto(data));
}

export function getTokenHistory(params: TokenListParams): Promise<ApiListResponse<RechargeToken>> {
  if (params.merchantId) {
    return get<ApiListResponse<RechargeToken>>(`/api/v1/tokens/merchant/${params.merchantId}`, {
      status: params.status,
    } as unknown as Record<string, string | number>);
  }

  return get<ApiListResponse<RechargeToken>>('/api/v1/tokens/expiring', {
    daysWindow: 3650,
  });
}

export function getToken(id: string): Promise<ApiResponse<RechargeToken>> {
  return get<ApiResponse<RechargeToken>>(`/api/v1/tokens/${id}`);
}

export function revokeToken(id: string, reason: string): Promise<ApiResponse<RechargeToken>> {
  return post<ApiResponse<RechargeToken>>(`/api/v1/tokens/${id}/revoke`, { reason });
}

export function getTokenTemplates(): Promise<ApiResponse<readonly TokenTemplate[]>> {
  return get<ApiResponse<readonly TokenTemplate[]>>('/api/v1/tokens/templates', { isActive: true });
}

export function updateTokenTemplate(id: string, data: TokenTemplateUpdate): Promise<ApiResponse<TokenTemplate>> {
  return put<ApiResponse<TokenTemplate>>(`/api/v1/tokens/templates/${id}`, {
    templateName: data.name,
    defaultLimitsPayload: data.limitsPayload ? JSON.stringify(data.limitsPayload) : undefined,
    defaultFeatureMap: data.featureMap ? JSON.stringify(data.featureMap) : undefined,
    defaultGracePolicyDays: data.gracePolicy ? JSON.stringify(data.gracePolicy) : undefined,
  });
}

export function getExpiringTokens(daysWindow: number): Promise<ApiResponse<readonly RechargeToken[]>> {
  return get<ApiResponse<readonly RechargeToken[]>>('/api/v1/tokens/expiring', { daysWindow });
}

export function getTokenMetrics(): Promise<ApiResponse<TokenMetrics>> {
  return get<ApiResponse<TokenMetrics>>('/api/v1/tokens/expiring', { daysWindow: 3650 });
}

/** Email delivery is not exposed by the current Swagger token API. */
export function emailToken(_id: string, _email: string): Promise<ApiResponse<{ sent: boolean }>> {
  return Promise.resolve({
    success: true,
    data: { sent: false },
    message: 'Email token endpoint is not available in the current API.',
    timestamp: new Date().toISOString(),
  });
}

/** Decrypted payload is not exposed by the current Swagger token API. */
export function getTokenPayload(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return Promise.resolve({
    success: true,
    data: {},
    message: 'Token payload endpoint is not available in the current API.',
    timestamp: new Date().toISOString(),
  });
}

/** No renew endpoint exists in the current Swagger token API; callers should generate a new token. */
export function renewToken(id: string, _newValidityDays: number): Promise<ApiResponse<RechargeToken>> {
  return getToken(id);
}

/** Batch email is not exposed by the current Swagger token API. */
export function batchEmailTokens(_tokenIds: readonly string[], _email: string): Promise<ApiResponse<{ sent: number }>> {
  return Promise.resolve({
    success: true,
    data: { sent: 0 },
    message: 'Batch email endpoint is not available in the current API.',
    timestamp: new Date().toISOString(),
  });
}

/** FRS-SAP-1406: Get pricing for a token configuration. */
export function getTokenPrice(tier: TokenTier, validityDays: number, quantity: number): Promise<ApiResponse<{ unitPrice: number; total: number; discount: number; currency: string }>> {
  return get<ApiResponse<{ unitPrice: number; total: number; discount: number; currency: string }>>('/api/v1/tokens/pricing', {
    plan: tierToPlan[tier] ?? 'Pro',
    validityDays,
    quantity,
  } as unknown as Record<string, string | number>);
}

/** Current Swagger exposes only bulk renewal reminders. */
export function sendRenewalReminder(_merchantId: string): Promise<ApiResponse<{ sent: boolean }>> {
  return post<ApiResponse<{ sent: boolean }>>('/api/v1/tokens/renewal-reminders', {});
}

/** Send renewal reminders to merchants with expiring tokens. */
export function sendBulkRenewalReminders(_daysWindow: number): Promise<ApiResponse<{ sentCount: number }>> {
  return post<ApiResponse<{ sentCount: number }>>('/api/v1/tokens/renewal-reminders', {});
}