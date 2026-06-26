// 2026-05-17 (Pass 35): Slimmed types after Platform-pull revenue redesign.
// Removed: CommissionEntry, CommissionEntryStatus, CommissionSettlement, CommissionDispute,
// CommissionStatement, CommissionStatementLine. Phase C/F add MerchantRevenueCollection.

/** Aggregated commission summary for a period. */
export interface CommissionSummary {
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly totalTransactions: number;
  readonly totalTransactionAmount: number;
  readonly totalCommission: number;
  readonly averageRate: number;
  readonly currency: string;
  readonly byMerchant: readonly MerchantCommissionSummary[];
}

export interface MerchantCommissionSummary {
  readonly merchantId: string;
  readonly merchantName: string;
  readonly transactionCount: number;
  readonly transactionAmount: number;
  readonly commissionAmount: number;
  readonly effectiveRate: number;
}

/** Rate rule for calculating commission. */
export interface CommissionRate {
  readonly id: string;
  readonly planId: string | null;
  readonly merchantId: string | null;
  readonly rate: number;
  readonly minTransactionValue: number;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
}

/** Exemption from commission for a specific merchant or period. */
export interface CommissionExemption {
  readonly id: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly reason: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
}
