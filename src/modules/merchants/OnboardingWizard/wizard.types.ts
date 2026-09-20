/**
 * 2026-08-06: unified admin onboarding wizard — TS mirror of the backend WizardStateDto.
 * Step state is server-derived; the SPA renders from this and never keeps its own pointer.
 */

export type WizardStepKey =
  | 'basic_info'
  | 'type_plan'
  | 'kyc'
  | 'payment'
  // 2026-08-29 (Pass 44): Standalone POS only — first terminal before Fund (the first
  // token binds to it). Skipped for Standalone Cloud / Enterprise.
  | 'terminals'
  | 'fund'
  | 'provision'
  | 'activate';

export type WizardStepStatus = 'Complete' | 'Current' | 'Pending' | 'Skipped';

export interface WizardStepState {
  key: WizardStepKey;
  status: WizardStepStatus;
}

export interface WizardBasicInfo {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  country: string;
  businessNature: string | null;
}

export interface WizardPlanSelection {
  merchantType: 'Enterprise' | 'Standalone';
  planId: string;
  planName: string;
  planType: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  dailyPrice: number;
  /** 2026-08-30: chosen engine (Enterprise) — Step 6 renders from server truth on resume. */
  databaseEngine: string | null;
  /** 2026-09-05 (decision B): Enterprise expected MONTHLY revenue, if an estimate was given. */
  expectedMonthlyRevenue: number | null;
  /** The merchant's commission percent (0-100) from the attached subscription. */
  commissionPercent: number;
}

/**
 * 2026-09-05 (decision B): what the Enterprise deposit + first recharge must cover —
 * 30 days of subscription plus the commission the expected revenue implies, or 90 days when
 * no estimate is on record. Mirrors WalletCoverageRequirementDto; all amounts are tokens.
 */
export interface WalletCoverageRequirement {
  minimumTokens: number;
  subscriptionDays: number;
  dailyCharge: number;
  subscriptionComponent: number;
  commissionComponent: number;
  expectedMonthlyRevenue: number | null;
  commissionPercent: number;
  currencyCode: string;
  /** "RevenueBacked" | "NoRevenueEstimate" | "NoSubscription" | "Unavailable" */
  basis: string;
  explanation: string;
}

/** The requirement measured against a balance (current, or after a top-up). */
export interface WalletCoverageStatus {
  requirement: WalletCoverageRequirement;
  balanceTokens: number;
  shortfallTokens: number;
  isMet: boolean;
}

/** 2026-08-30 (provision drift fix): manager-entered database access details for
 *  Enterprise provisioning (Pass-27 model). All optional — SQLite derives its file
 *  path; server engines fall back to the platform's configured template when blank. */
export interface ProvisionConnectionFields {
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  extraParams?: string;
}

export interface WizardKycDoc {
  kycDocumentId: string;
  documentType: string;
  reference: string;
  reviewStatus: string;
  createdAt: string;
  /** 2026-08-12: true when a real file was uploaded (viewable). */
  hasFile: boolean;
  fileSizeBytes: number;
}

export interface WizardPaymentIntent {
  intentId: string;
  paymentLinkUrl: string | null;
  amount: number;
  currencyCode: string;
  periodDays: number;
  status: string;
  provider: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface WizardPaymentRecord {
  amount: number;
  securityDepositAmount: number;
  rechargeAmount: number;
  periodDays: number;
  currencyCode: string;
  paymentMethod: string;
  paymentReference: string | null;
  notes: string | null;
  recordedAt: string;
}

export interface WizardFundSummary {
  kind: 'Wallet' | 'Token';
  walletBalance: number | null;
  securityDeposit: number | null;
  tokenId: string | null;
  encodedToken: string | null;
  validityDays: number | null;
}

export interface WizardState {
  merchantId: string;
  companyName: string;
  merchantType: 'Enterprise' | 'Standalone' | null;
  merchantStatus: string;
  signupSource: string | null;
  createdAt: string;
  currentStep: WizardStepKey;
  steps: WizardStepState[];
  basicInfo: WizardBasicInfo | null;
  planSelection: WizardPlanSelection | null;
  kycDocuments: WizardKycDoc[];
  paymentRecord: WizardPaymentRecord | null;
  /** 2026-08-12: the PENDING online payment link, if one was requested. */
  paymentIntent: WizardPaymentIntent | null;
  fundSummary: WizardFundSummary | null;
  provisioningStatus: string | null;
  provisioningError: string | null;
  /** 2026-09-05 (decision B): the deposit + recharge minimum; null until a plan is attached. */
  coverageRequirement: WalletCoverageRequirement | null;
}

export interface WizardBasicInfoInput {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  country: string;
  businessNature?: string;
}

export interface WizardTypePlanInput {
  merchantType: 'Enterprise' | 'Standalone';
  planId: string;
  dailyPriceOverride?: number;
  databaseEngine?: string;
  /** 2026-09-05 (decision B): Enterprise only, optional. Blank means no estimate. */
  expectedMonthlyRevenue?: number;
}

export interface WizardKycInput {
  documentType: string;
  reference: string;
  notes?: string;
}

export interface WizardPaymentInput {
  amount: number;
  securityDepositAmount: number;
  rechargeAmount: number;
  periodDays: number;
  // 2026-09-05 (user-locked: currency ALWAYS comes from configuration): currencyCode
  // REMOVED — RecordWizardPaymentDto no longer carries one; the API records the payment
  // in platform.currency.
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
}

/** Plan summary as served by GET /billing/plans. */
export interface WizardPlanOption {
  planId: string;
  planCode: string;
  displayName: string;
  planType: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  flavour: string;
  isActive: boolean;
  isDeprecated: boolean;
  planPricePerDay: number;
}
