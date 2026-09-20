import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '../types/merchant.types';
import type {
  WizardState,
  WizardBasicInfoInput,
  WizardTypePlanInput,
  WizardKycInput,
  WizardPaymentInput,
  ProvisionConnectionFields,
} from './wizard.types';

/** Mirror of ChargeOnboardingCardDto — the opaque client token, never card data. */
export interface WizardChargeCardInput {
  readonly periodDays: number;
  readonly securityDepositAmount: number;
  readonly rechargeAmount: number;
  readonly paymentToken: string;
  readonly cardBrand?: string;
  readonly cardLast4?: string;
  readonly cardholderName?: string;
  readonly idempotencyKey: string;
}

/** Mirror of CardChargeResultDto (same shape the token wizard consumes). */
export interface WizardCardChargeResult {
  readonly cardChargeId: string;
  readonly status: 'Succeeded' | 'Declined';
  readonly gatewayTransactionId: string | null;
  readonly amount: number;
  readonly currencyCode: string;
  readonly provider: string;
  readonly cardBrand: string | null;
  readonly cardLast4: string | null;
  readonly gatewayMessage: string | null;
  readonly declineReason: string | null;
}

/**
 * 2026-08-06: unified admin onboarding wizard endpoints. Every mutation returns the
 * full derived WizardState so the SPA always renders from server truth.
 */
export const onboardingWizardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWizardState: builder.query<ApiResponse<WizardState>, string>({
      query: (merchantId) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}`,
        method: 'GET',
      }),
      providesTags: (_r, _e, id) => [{ type: 'Merchants', id: `wizard-${id}` }],
    }),

    getWizardInProgress: builder.query<ApiResponse<WizardState[]>, void>({
      query: () => ({
        url: '/api/v1/onboarding-wizard/in-progress',
        method: 'GET',
      }),
      providesTags: ['Merchants'],
    }),

    // 2026-08-07: single-country deployment — the wizard displays platform.country read-only.
    getPlatformCountry: builder.query<ApiResponse<{ settingValue: string }>, void>({
      query: () => ({
        url: '/api/v1/settings/platform.country',
        method: 'GET',
      }),
    }),

    wizardCreateBasic: builder.mutation<ApiResponse<WizardState>, WizardBasicInfoInput>({
      query: (body) => ({
        url: '/api/v1/onboarding-wizard/basic-info',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Merchants'],
    }),

    // 2026-08-12 (queue = decision inbox): reject an in-flight signup (reason required).
    wizardReject: builder.mutation<ApiResponse<boolean>, { merchantId: string; reason: string }>({
      query: ({ merchantId, reason }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/reject`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: ['Merchants'],
    }),

    wizardUpdateBasic: builder.mutation<ApiResponse<WizardState>, { merchantId: string; body: WizardBasicInfoInput }>({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/basic-info`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    wizardSetTypePlan: builder.mutation<ApiResponse<WizardState>, { merchantId: string; body: WizardTypePlanInput }>({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/type-plan`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    // 2026-08-12: remove a wrongly-added KYC document (soft-delete; file kept for audit).
    wizardRemoveKyc: builder.mutation<ApiResponse<WizardState>, { merchantId: string; docId: string }>({
      query: ({ merchantId, docId }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/kyc/${docId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    wizardRecordKyc: builder.mutation<ApiResponse<WizardState>, { merchantId: string; body: WizardKycInput }>({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/kyc`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    // 2026-08-30 (user directive: "just we did for tokens"): Step 4 card checkout — the
    // client-tokenized card is charged server-side (amount computed from the plan) and,
    // on success, the payment records itself with the gateway txn as the reference.
    wizardChargeCard: builder.mutation<
      ApiResponse<WizardCardChargeResult>,
      { merchantId: string; body: WizardChargeCardInput }
    >({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/charge-card`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    // 2026-08-30 (user bug report): "Continue to Payment" must PERSIST the KYC review —
    // it was client-side navigation only, so a reopened wizard resumed at KYC.
    wizardCompleteKyc: builder.mutation<ApiResponse<WizardState>, { merchantId: string }>({
      query: ({ merchantId }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/kyc/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    // 2026-08-12: online payment via gateway-hosted link.
    wizardCreatePaymentLink: builder.mutation<ApiResponse<WizardState>, { merchantId: string; body: { periodDays: number; securityDepositAmount: number; rechargeAmount: number } }>({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/payment/link`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),
    wizardConfirmPaymentLink: builder.mutation<ApiResponse<WizardState>, { merchantId: string }>({
      query: ({ merchantId }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/payment/link/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    wizardRecordPayment: builder.mutation<ApiResponse<WizardState>, { merchantId: string; body: WizardPaymentInput }>({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/payment`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    wizardFund: builder.mutation<ApiResponse<WizardState>, string>({
      query: (merchantId) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/fund`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, merchantId) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    // 2026-08-30 (provision drift fix): body carries the optional manager-entered
    // connection fields; ALWAYS send an object ({} ⇒ derived/template settings) — the
    // endpoint takes a required JSON body.
    wizardProvision: builder.mutation<ApiResponse<WizardState>, { merchantId: string; body?: ProvisionConnectionFields }>({
      query: ({ merchantId, body }) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/provision`,
        method: 'POST',
        data: body ?? {},
      }),
      invalidatesTags: (_r, _e, { merchantId }) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),

    wizardActivate: builder.mutation<ApiResponse<WizardState>, string>({
      query: (merchantId) => ({
        url: `/api/v1/onboarding-wizard/${merchantId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, merchantId) => ['Merchants', { type: 'Merchants', id: `wizard-${merchantId}` }],
    }),
  }),
});

export const {
  useGetWizardStateQuery,
  useGetWizardInProgressQuery,
  useGetPlatformCountryQuery,
  useWizardCreateBasicMutation,
  useWizardUpdateBasicMutation,
  useWizardRejectMutation,
  useWizardSetTypePlanMutation,
  useWizardRecordKycMutation,
  useWizardRemoveKycMutation,
  useWizardCompleteKycMutation,
  useWizardRecordPaymentMutation,
  useWizardChargeCardMutation,
  useWizardCreatePaymentLinkMutation,
  useWizardConfirmPaymentLinkMutation,
  useWizardFundMutation,
  useWizardProvisionMutation,
  useWizardActivateMutation,
} = onboardingWizardApi;
