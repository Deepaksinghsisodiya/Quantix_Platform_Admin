/**
 * Recharge Token types — 2026-08-29 rebuild.
 *
 * The former `TokenTier ('Basic'|'Standard'|'Advance'|'Premium')`, `TokenBinding`,
 * `businessNature`, `validFrom/validTo` and the invoice-option flags were FICTIONAL —
 * none of them exist in the C# DTOs. There are no fixed token tiers: a token derives
 * entirely from the merchant's subscribed Plan (PlanType + daily price), and the sale
 * is invoiced atomically server-side (POST /tokens/issue).
 *
 * These types mirror `Quantix.PlatformBusiness.DTOs.Limit.*` (camelCased on the wire).
 */

import type { PlanType } from './platform-enums';
export type { PlanType };
export { PLAN_TYPE_LABEL } from './platform-enums';

/** Mirror of `RechargeTokenStatus`. Display: Active renders as "Issued" (V4 status model);
 * Superseded = provably dead (higher seq applied first), flagged for review. */
export type TokenStatus = 'Active' | 'Consumed' | 'Expired' | 'Revoked' | 'Superseded';

/** Mirror of `RechargeTokenDto` (list/history rows use TokenListItemDto below). */
export interface RechargeToken {
  readonly tokenId: string;
  readonly merchantId: string;
  readonly tokenHash: string;
  readonly plan: PlanType;
  /** V4: operator-defined plan name carried on the token ("Gold", "Advance"...). */
  readonly planName: string;
  /** JSON-encoded { LimitCode: number } */
  readonly limitsPayload: string;
  /** JSON-encoded { FeatureCode: boolean } */
  readonly featurePayload: string;
  /** Rule 7 (Pass 33a): duration only — window materialises on apply. */
  readonly validityDays: number;
  /** ActivatedAt + ValidityDays; null until the merchant applies the token. */
  readonly expiresAt: string | null;
  readonly walletDeductionAmount: number;
  readonly status: TokenStatus;
  readonly sequence: number;
  readonly activatedAt: string | null;
  readonly activatedTerminalId: string | null;
  readonly activatedAppVersion: string | null;
  readonly revokedAt: string | null;
  readonly revokedBy: string | null;
  readonly revokedReason: string | null;
  readonly priceTokens: number;
  /** Price in platform currency (a decimal amount, not a currency code). */
  readonly priceCurrency: number;
  readonly generatedBy: string;
  readonly createdAt: string;
}

/** Mirror of `TokenListItemDto` — history row with merchant identity. */
export interface TokenListItem extends RechargeToken {
  readonly merchantName: string;
  readonly merchantCode: string;
}

/** Mirror of `RechargeTokenDetailDto`. */
export interface RechargeTokenDetail extends RechargeToken {
  readonly merchantName: string;
  readonly gracePolicyDays: string | null;
  /** V3 Base64(UTF8(JSON)) encoded token — the string the merchant applies. */
  readonly encodedToken: string;
  readonly qrCodeBase64: string | null;
}

/** Mirror of `IssueStandaloneTokenDto` (IssuedBy is stamped server-side from the JWT). */
export interface IssueTokenRequest {
  readonly merchantId: string;
  /** Optional terminal binding (payload.tid). */
  readonly terminalId?: string | null;
  readonly validityDays: number;
  readonly pricePaid: number;
  // 2026-09-05 (user-locked: currency ALWAYS comes from configuration): currencyCode
  // REMOVED — the API books the amount in platform.currency and no longer reads a
  // caller-supplied code.
  readonly paymentReference?: string;
  readonly paymentMethod: string;
  readonly note?: string | null;
}

/** Mirror of `StandaloneTokenIssueResultDto`. */
export interface TokenIssueResult {
  readonly token: RechargeTokenDetail;
  readonly invoiceId: string;
  readonly invoiceNumber: string;
  readonly amountCharged: number;
  readonly currencyCode: string;
}

/** Mirror of `BulkTokenGenerationDto` — plan derives from the merchant's subscription; the batch is PAID up front. */
export interface BulkTokenRequest {
  readonly merchantId: string;
  readonly validityDays: number;
  readonly gracePolicyDays?: string | null;
  readonly quantity: number;
  /** Per-token terminal bindings; length must equal quantity when supplied. */
  readonly terminalBindings?: readonly string[] | null;
  /** Total collected for the whole batch — must cover daily × validity × quantity. */
  readonly pricePaid: number;
  // 2026-09-05: currencyCode REMOVED — see IssueTokenRequest.
  readonly paymentMethod: string;
  /** Mandatory when paymentMethod is External (accounting trail). */
  readonly paymentReference?: string;
  readonly note?: string | null;
}

/** Mirror of `BulkTokenResultDto` — detail rows so encodedToken reaches the CSV. */
export interface BulkTokenResult {
  readonly totalGenerated: number;
  readonly tokens: readonly RechargeTokenDetail[];
  readonly totalCharged: number;
  readonly currencyCode: string;
  readonly invoiceNumbers: readonly string[];
}

/** Client-side filter state for the Token History screen (applied in the browser). */
export interface TokenFilter {
  readonly search?: string;
  readonly merchantId?: string;
  readonly plan?: PlanType;
  readonly status?: TokenStatus;
  readonly generatedFrom?: string;
  readonly generatedTo?: string;
}
