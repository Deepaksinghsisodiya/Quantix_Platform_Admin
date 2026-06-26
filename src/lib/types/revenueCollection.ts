/**
 * 2026-05-17 (Pass 35 Phase F): TS shape of MerchantRevenueCollection (Platform-pull revenue snapshot).
 */
export interface MerchantRevenueCollection {
  readonly collectionId: string;
  readonly merchantId: string;
  readonly merchantName: string | null;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly revenueAmount: number;
  readonly currencyCode: string;
  readonly collectedAt: string;
  readonly triggeredBy: string;
  readonly acknowledgedByCloud: boolean;
  readonly acknowledgedAt: string | null;
  // Charge-cycle outputs
  readonly commissionRateApplied: number | null;
  readonly commissionAmount: number | null;
  readonly taxAmount: number | null;
  readonly chargeTotalCurrency: number | null;
  readonly chargeTotalTokens: number | null;
  readonly exchangeRateUsed: number | null;
  readonly chargedAt: string | null;
  readonly walletTransactionId: string | null;
  // Invoice-cycle outputs
  readonly invoicedAt: string | null;
  readonly invoiceId: string | null;
}

export interface CycleRunResult {
  readonly merchantsProcessed: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly skippedCount: number;
  readonly failureSummary: string | null;
}
