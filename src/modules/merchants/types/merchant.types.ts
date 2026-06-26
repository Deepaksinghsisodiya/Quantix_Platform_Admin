import type {
  Merchant,
  OnboardingChecklist,
  DbEngine,
  BillingFrequency,
  PreferredPaymentMethod,
  MerchantFeatureFlags,
  MerchantOperationalLimits,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
  MerchantFilter,
  MerchantNote,
  MerchantTag,
} from '@/lib/types/merchant';

import type {
  SignupQueueParams,
  SignupQueueEntry,
} from '@/lib/api/registration';

import type {
  DeboardingStatus,
  DeboardingStepKey,
  DeboardingStepStatus,
  MerchantDeboardingStep,
  MerchantDeboarding,
  GiveConsentDto,
  AskMerchantToRechargeDto,
  IssueRefundDto,
  CancelDeboardingDto,
  DeboardingFilter,
} from '@/lib/api/deboarding';

import type {
  MerchantTerminal,
  CreateMerchantTerminalDto,
  UpdateMerchantTerminalDto,
  PlatformPairingCode,
} from '@/lib/api/terminals';

import type { MerchantType, MerchantStatus } from '@/lib/types/common';
import type { MerchantTimelineEntry } from '@/lib/api/merchants';

export type {
  Merchant,
  OnboardingChecklist,
  DbEngine,
  BillingFrequency,
  PreferredPaymentMethod,
  MerchantFeatureFlags,
  MerchantOperationalLimits,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
  MerchantFilter,
  MerchantNote,
  MerchantTag,
  SignupQueueParams,
  SignupQueueEntry,
  DeboardingStatus,
  DeboardingStepKey,
  DeboardingStepStatus,
  MerchantDeboardingStep,
  MerchantDeboarding,
  GiveConsentDto,
  AskMerchantToRechargeDto,
  IssueRefundDto,
  CancelDeboardingDto,
  DeboardingFilter,
  MerchantTerminal,
  CreateMerchantTerminalDto,
  UpdateMerchantTerminalDto,
  PlatformPairingCode,
  MerchantType,
  MerchantStatus,
  MerchantTimelineEntry
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}
