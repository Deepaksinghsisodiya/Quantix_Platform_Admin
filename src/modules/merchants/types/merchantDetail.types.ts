/**
 * FRS-SAP-402 (2026-08-05): typed mirror of the backend MerchantDetailDto served by
 * GET /api/v1/merchants/{id}/detail. Replaces the mock data that EnterprisePanels /
 * StandalonePanels previously rendered.
 */

/** Wire enum names for PlanType (deployment mode). */
export type PlanTypeWire = 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';

/* 2026-08-31: validFrom/validToDate are NULLABLE (and omitted from the JSON when null).
   Rule 7: a token's window materialises when the merchant APPLIES it, so an unapplied
   token has no start and no expiry. The server previously sent CreatedAt →
   DateTime.MaxValue for those, which rendered as "valid until 31 Dec 9999". */

export interface DetailActiveToken {
  tokenId: string;
  plan: PlanTypeWire;
  /** Null/absent until the merchant applies the token. */
  validFromDate?: string | null;
  /** Null/absent until the merchant applies the token. */
  validToDate?: string | null;
  /** Purchased duration — meaningful before apply, when there is no window yet. */
  validityDays: number;
  status: string;
  limitsPayload: string;
}

export interface DetailTokenHistoryEntry {
  tokenId: string;
  plan: PlanTypeWire;
  status: string;
  /** Null/absent until the merchant applies the token. */
  validFromDate?: string | null;
  /** Null/absent until the merchant applies the token. */
  validToDate?: string | null;
  validityDays: number;
  createdAt: string;
  activatedAt: string | null;
}

// 2026-08-30: DetailTokenRenewalStatus removed with the Token Validity page — its
// applied-token-expiry math ignored unapplied coverage in hand.

export interface DetailCommissionSummary {
  totalCommissionEarned: number;
  pendingCommission: number;
  lastSettlementAmount: number;
  lastSettlementDate: string | null;
  currentRatePercent: number;
}

export interface DetailBridgeHealth {
  isConnected: boolean;
  lastSyncAt: string | null;
  syncStatus: string | null;
  pendingSyncItems: number;
}

export interface DetailUsageSummary {
  last30DaysApiCalls: number;
  last30DaysTransactions: number;
  latestActiveTerminals: number;
  latestActiveUsers: number;
  latestActiveLocations: number;
  lastReportedAt: string | null;
}

export interface DetailSubscription {
  subscriptionId?: string;
  planId?: string;
  /** 2026-08-30: renamed from planName — the wire field (SubscriptionDto) is planDisplayName; planName never existed on this payload. */
  planDisplayName?: string;
  /** Wire enum name (StandalonePos | StandaloneCloud | EnterpriseCloud) — deployment kind is fixed post-activation, so plan changes filter the catalog by it. */
  planType?: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  status?: string;
  dailySubscriptionPrice?: number;
  /** Per-merchant base daily rate — the onboarding dailyPriceOverride when one was negotiated, else the catalog price snapshot. */
  baseDailyPrice?: number;
  startDate?: string;
  [key: string]: unknown;
}

export interface DetailWallet {
  walletId?: string;
  tokenBalance?: number;
  currencyBalance?: number;
  [key: string]: unknown;
}

/** Subset of MerchantDetailDto the panels consume. Other sections (notes, tickets,
 *  compliance, activity) are already fetched by their own tabs. */
export interface MerchantDetailPayload {
  merchant: Record<string, unknown>;
  activeSubscription: DetailSubscription | null;
  wallet: DetailWallet | null;
  commissionSummary: DetailCommissionSummary | null;
  platformBridgeHealth: DetailBridgeHealth | null;
  activeToken: DetailActiveToken | null;
  tokenHistory: DetailTokenHistoryEntry[] | null;
  /** 2026-08-31: real count of ACTIVE rows in the merchant's terminal registry. The
   *  detail page previously read a `terminalCount` field the wire never carried, so it
   *  always showed "0 active devices". */
  registeredTerminalCount: number;
  usageSummary: DetailUsageSummary | null;
}
