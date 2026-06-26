import type { MerchantType, MerchantStatus } from './common';

/** Core merchant (merchant) record on the platform. */
export interface Merchant {
  readonly id: string;
  readonly businessName: string;
  readonly merchantType: MerchantType;
  /**
   * FRS-SAP-309 (Pass 25 rename): free-text descriptor of what the merchant does
   * ("Restaurant", "Pharmacy + Cafe", etc.). No taxonomy, no enum. Replaces the
   * pre-Pass-25 `businessNature: 'Restaurant' | 'Retail' | 'Both'` selector.
   */
  readonly businessNature?: string | null;
  readonly status: MerchantStatus;
  readonly plan: string;
  readonly tier: string;
  readonly contactPerson: string;
  readonly email: string;
  readonly phone: string;
  readonly country: string;
  readonly signupDate: string;
  readonly lastActivityDate: string | null;
  readonly locationCount: number;
  readonly terminalCount: number;
  /** Monthly recurring revenue (Enterprise only). */
  readonly mrr?: number;
  /** Remaining token balance (Standalone only). */
  readonly tokenBalance?: number;
  readonly onboardingChecklist: OnboardingChecklist;
  readonly tags: readonly string[];
  readonly notes: readonly MerchantNote[];
}

/** Tracks merchant onboarding progress. */
export interface OnboardingChecklist {
  readonly accountVerified: boolean;
  readonly profileCompleted: boolean;
  readonly firstLocationAdded: boolean;
  readonly firstTerminalActivated: boolean;
  readonly firstTransactionCompleted: boolean;
  readonly paymentMethodConfigured: boolean;
  readonly completedAt: string | null;
}

/** Database engine options for Enterprise merchants (FRS-SAP-303). */
export type DbEngine = 'SQLite' | 'PostgreSQL' | 'MySQL' | 'SQLServer';

/** Billing frequency options for Enterprise merchants (FRS-SAP-302). */
export type BillingFrequency = 'Monthly' | 'Quarterly' | 'Annual';

/** Preferred payment method options (FRS-SAP-302). */
export type PreferredPaymentMethod = 'CreditCard' | 'BankTransfer' | 'Invoice';

/** Feature flags for an Enterprise merchant (FRS-SAP-305). */
export interface MerchantFeatureFlags {
  readonly multiLocation: boolean;
  readonly apiAccess: boolean;
  readonly webhooks: boolean;
  readonly whiteLabel: boolean;
  readonly customDomain: boolean;
}

/** Operational limits for an Enterprise merchant (FRS-SAP-305). */
export interface MerchantOperationalLimits {
  readonly maxLocations: number;
  readonly maxTerminals: number;
  readonly maxProducts: number;
  readonly maxUsers: number;
  readonly apiRateLimit: number;
}

/** Payload to create an Enterprise merchant. */
export interface MerchantCreateEnterprise {
  readonly businessName: string;
  readonly businessNature?: string;
  readonly contactPerson: string;
  readonly email: string;
  readonly phone: string;
  readonly country: string;
  readonly plan: string;
  readonly tier: string;
  readonly billingFrequency: BillingFrequency;
  readonly preferredPaymentMethod: PreferredPaymentMethod;
  readonly dbEngine: DbEngine;
  readonly featureFlags: MerchantFeatureFlags;
  readonly limits: MerchantOperationalLimits;
}

/** Payload to create a Standalone merchant. */
export interface MerchantCreateStandalone {
  readonly businessName: string;
  readonly businessNature?: string;
  readonly contactPerson: string;
  readonly email: string;
  readonly phone: string;
  readonly country: string;
  readonly initialTokenTier: string;
  readonly initialTokenValidityDays: number;
}

/** Filter criteria for merchant list queries. */
export interface MerchantFilter {
  readonly search?: string;
  readonly merchantType?: MerchantType;
  readonly businessNature?: string;
  readonly status?: MerchantStatus;
  readonly country?: string;
  readonly plan?: string;
  readonly tier?: string;
  readonly signupDateFrom?: string;
  readonly signupDateTo?: string;
  readonly tags?: readonly string[];
}

/** An internal note attached to a merchant record. */
export interface MerchantNote {
  readonly id: string;
  readonly merchantId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
}

/** Tag for categorising merchants. */
export interface MerchantTag {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly merchantCount: number;
}
