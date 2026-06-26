/**
 * Round_16 Pass 2 audit C-1: canonical TS mirrors of `Quantix.PlatformBusiness.DTOs.Merchant.*`
 * (Solution_Rules §9: 1:1 with C# DTOs, camelCase). Use these for any new page or hook that
 * talks to the real PlatformApi. The legacy `merchant.ts` shape lives alongside until each
 * consumer is migrated.
 *
 * Field names mirror `MerchantDtos.cs` exactly — DO NOT add UI-only fields here.
 */

import type { OnboardingMode, MerchantStatus, BillingCycleType, PlanType } from './platform-enums';

/** Mirror of `MerchantDto`. */
export interface MerchantApi {
  readonly merchantId: string;
  readonly merchantCode: string;
  readonly companyName: string;
  readonly displayName: string | null;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly postalCode: string | null;
  readonly country: string;
  readonly databaseEngine: string | null;
  readonly merchantStatus: MerchantStatus;
  readonly onboardingMode: OnboardingMode;
  readonly merchantType: OnboardingMode;
  readonly businessNature: string;
  readonly activatedAt: string | null;
  readonly suspendedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string | null;
}

/** Mirror of `MerchantSummaryDto`. */
export interface MerchantSummaryApi {
  readonly merchantId: string;
  readonly merchantCode: string;
  readonly companyName: string;
  readonly merchantStatus: MerchantStatus;
  readonly onboardingMode: OnboardingMode;
  readonly merchantType: OnboardingMode;
  readonly businessNature: string;
  readonly country: string;
  readonly createdAt: string;
}

/** Mirror of `CreateMerchantDto`. */
export interface CreateMerchantPayload {
  readonly companyName: string;
  readonly displayName?: string | null;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone?: string | null;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly postalCode?: string | null;
  readonly country: string;
  readonly databaseEngine?: string | null;
  readonly onboardingMode: OnboardingMode;
  readonly merchantType: OnboardingMode;
  readonly businessNature: string;
  readonly planId: string;
  readonly billingCycle: BillingCycleType;
  readonly negotiatedTokenPrice: number;
}

/** Mirror of `UpdateMerchantDto`. */
export interface UpdateMerchantPayload {
  readonly displayName?: string | null;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone?: string | null;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly postalCode?: string | null;
}

/** Mirror of `PlanChangeDto`. */
export interface PlanChangePayload {
  readonly merchantId: string;
  readonly newPlanId?: string | null;
  readonly newBillingCycle?: BillingCycleType | null;
  readonly newPlan?: PlanType | null;
  readonly newValidityDays?: number | null;
  readonly reason?: string | null;
}

/** Mirror of `MerchantNoteDto`. */
export interface MerchantNoteApi {
  readonly noteId: string;
  readonly merchantId: string;
  readonly content: string;
  readonly createdBy: string;
  readonly createdAt: string;
}

/** Mirror of `CreateMerchantNoteDto`. */
export interface CreateMerchantNotePayload {
  readonly content: string;
  readonly createdBy: string;
}

/** Mirror of `MerchantTagDto`. */
export interface MerchantTagApi {
  readonly tagId: string;
  readonly merchantId: string;
  readonly tag: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Action requests (Round_16 Pass 1 + Pass 2)
// ---------------------------------------------------------------------------

export interface SuspendMerchantRequest {
  readonly reason: string;
  readonly suspendUntil?: string | null;
}

export interface CancelMerchantRequest { readonly reason: string; }
export interface DeactivateMerchantRequest { readonly reason: string; }
export interface TerminateMerchantRequest { readonly reason: string; }

/** Round_16 Pass 2 audit C-17: explicit Apply → Approve flow. */
export interface ApproveMerchantApplicationRequest {
  readonly notes?: string | null;
}

/** Round_16 Pass 2 audit C-17: explicit Apply → Reject flow with required reason. */
export interface RejectMerchantApplicationRequest {
  readonly reason: string;
}
