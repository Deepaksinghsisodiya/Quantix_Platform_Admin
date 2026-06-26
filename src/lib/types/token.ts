/**
 * Recharge Token types — FRS-SAP-14xx
 */

import type { BusinessType } from './common';

/** Recharge token status lifecycle. */
export type TokenStatus = 'Active' | 'Expired' | 'Consumed' | 'Revoked';

/** Token tier controlling feature access. */
export type TokenTier = 'Basic' | 'Standard' | 'Advance' | 'Premium';

/** Hardware/location binding for a recharge token. FRS-SAP-1401/1402 */
export interface TokenBinding {
  readonly merchantId: string;
  readonly businessId: string;
  readonly locationId: string | null;
  /** Specific terminal binding, or null for wildcard (multi-terminal). */
  readonly terminalId: string | null;
}

/** A single recharge token issued to a Standalone merchant. FRS-SAP-1402 */
export interface RechargeToken {
  readonly id: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly tier: TokenTier;
  /** FRS-SAP-1410: Business type determines which POS features are included. */
  readonly businessNature: BusinessType;
  readonly validFrom: string;
  readonly validTo: string;
  readonly validityDays: number;
  readonly status: TokenStatus;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly tokenString: string;
  readonly qrCodeData: string;
  readonly binding: TokenBinding;
  /** FRS-SAP-1402: Token version for backward compatibility. */
  readonly tokenVersion: number;
  /** JSON-encoded limits payload (MaxLocations, MaxTerminals, MaxUsers, MaxProducts, etc.). */
  readonly limitsPayload: Record<string, number>;
  /** Feature availability map keyed by feature name. */
  readonly featureMap: Record<string, boolean>;
  /** Grace period policy applied when this token expires. */
  readonly gracePolicy: TokenGracePolicy;
  /** FRS-SAP-1406: Price of this token at generation time. */
  readonly priceAtGeneration: number | null;
  /** FRS-SAP-1406: Currency of the price. */
  readonly priceCurrency: string | null;
}

/** Grace period rules applied after token expiry. FRS-SAP-1402 */
export interface TokenGracePolicy {
  readonly gracePeriodDays: number;
  /** Per-phase durations: Warning, Degraded, Restricted, Suspended. */
  readonly warningDays: number;
  readonly degradedDays: number;
  readonly restrictedDays: number;
  readonly readOnlyDuringGrace: boolean;
  readonly notifyDaysBeforeExpiry: readonly number[];
}

/** Reusable template for generating tokens. FRS-SAP-1408 */
export interface TokenTemplate {
  readonly id: string;
  readonly name: string;
  readonly tier: TokenTier;
  /** FRS-SAP-1410: Template differentiated by business type. */
  readonly businessNature: BusinessType;
  readonly validityDays: number;
  readonly limitsPayload: Record<string, number>;
  readonly featureMap: Record<string, boolean>;
  readonly gracePolicy: TokenGracePolicy;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Request to generate a single token. FRS-SAP-1401 */
export interface TokenGenerateRequest {
  readonly merchantId: string;
  readonly templateId?: string;
  readonly tier: TokenTier;
  readonly businessNature: BusinessType;
  readonly validityDays: number;
  readonly binding: TokenBinding;
  readonly limitsPayload?: Record<string, number>;
  readonly featureMap?: Record<string, boolean>;
  readonly gracePolicy?: Partial<TokenGracePolicy>;
  /** FRS-SAP-1406: Generate invoice immediately or add to next billing. */
  readonly invoiceOption?: 'immediate' | 'next-billing';
}

/** Request to generate tokens in bulk. FRS-SAP-1405 */
export interface BulkTokenRequest {
  readonly merchantIds: readonly string[];
  readonly templateId: string;
  readonly overrides?: {
    readonly validityDays?: number;
    readonly tier?: TokenTier;
  };
  /** FRS-SAP-1406: Invoice option for bulk generation. */
  readonly invoiceOption?: 'immediate' | 'next-billing';
}

/** Filter criteria for token list queries. */
export interface TokenFilter {
  readonly search?: string;
  readonly merchantId?: string;
  readonly tier?: TokenTier;
  readonly status?: TokenStatus;
  readonly businessNature?: BusinessType;
  readonly generatedFrom?: string;
  readonly generatedTo?: string;
  readonly expiringBefore?: string;
}
