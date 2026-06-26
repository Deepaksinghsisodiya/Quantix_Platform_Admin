/**
 * Round_16 Pass 2 audit C-2: canonical TS mirrors of `Quantix.PlatformBusiness.DTOs.Limit.*`.
 * Solution_Rules §9 + §11 (token V3 schema).
 *
 * The legacy `token.ts` carries a fictional `TokenTier (Basic/Standard/Advance/Premium)` and
 * a `TokenBinding` object that don't exist in C#. Use these mirrors for any new code talking
 * to PlatformApi.
 */

import type { PlanType, RechargeTokenStatus, TokenRevocationReason } from './platform-enums';

/** Mirror of `RechargeTokenDto`. */
export interface RechargeTokenApi {
  readonly tokenId: string;
  readonly merchantId: string;
  readonly tokenHash: string;
  readonly plan: PlanType;
  readonly limitsPayload: string;     // JSON-encoded { LimitCode: number }
  readonly featurePayload: string;    // JSON-encoded { FeatureCode: boolean }
  readonly validFromDate: string;
  readonly validToDate: string;
  readonly walletDeductionAmount: number;
  readonly status: RechargeTokenStatus;
  readonly revokedReasonCode: TokenRevocationReason;
  readonly activatedAt: string | null;
  readonly activatedTerminalId: string | null;
  readonly activatedAppVersion: string | null;
  readonly revokedAt: string | null;
  readonly revokedBy: string | null;
  readonly revokedReason: string | null;
  readonly priceTokens: number;
  readonly priceCurrency: number;
  readonly generatedBy: string;
  readonly createdAt: string;
}

/** Mirror of `RechargeTokenDetailDto`. */
export interface RechargeTokenDetailApi extends RechargeTokenApi {
  readonly gracePolicyDays: string | null;
  /** V3 Base64(UTF8(JSON)) encoded token (source of truth). */
  readonly encodedToken: string;
  /** QR code of EncodedToken. */
  readonly qrCodeBase64: string | null;
}

/** Mirror of `GenerateRechargeTokenDto`. */
export interface GenerateRechargeTokenPayload {
  readonly merchantId: string;
  readonly plan: PlanType;
  readonly validityDays: number;
  readonly validFromDate: string;
  readonly validToDate: string;
  readonly gracePolicyDays?: string | null;
  readonly limitsOverride?: Record<string, number> | null;
  readonly featuresOverride?: Record<string, boolean> | null;
}

/** Mirror of `BulkTokenGenerationDto`. */
export interface BulkTokenGenerationPayload {
  readonly merchantId: string;
  readonly plan: PlanType;
  readonly validityDays: number;
  readonly validFromDate: string;
  readonly validToDate: string;
  readonly gracePolicyDays?: string | null;
  readonly quantity: number;
  readonly terminalBindings?: readonly string[] | null;
}

/** Mirror of `BulkTokenResultDto`. */
export interface BulkTokenResult {
  readonly totalGenerated: number;
  readonly tokens: readonly RechargeTokenApi[];
}

/** Mirror of `TokenPricingDto`. */
export interface TokenPricing {
  readonly unitPrice: number;
  readonly discount: number;
  readonly total: number;
  readonly currencyCode: string;
  readonly totalTokens: number;
}

/** Mirror of `LimitEnforcementDto`. */
export interface LimitEnforcementApi {
  readonly enforcementId: string;
  readonly merchantId: string;
  readonly limitsPayload: string;
  readonly expiryDate: string | null;
  readonly gracePolicyDays: string | null;
  readonly source: string;            // LimitSource enum
  readonly status: string;            // LimitEnforcementStatus enum
  readonly overrideReason: string | null;
  readonly issuedAt: string;
  readonly appliedAt: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly rowVersion: number;
  readonly isActive: boolean;
  readonly isSystemDefined: boolean;
}

/** Round_16 Pass 2 audit C-12: explicit revoke request. */
export interface RevokeTokenRequest {
  readonly reason: string;
}
