import { baseApi } from '../../../core/services/baseApi';
import type {
  Merchant,
  MerchantNote,
  MerchantTimelineEntry,
  SignupQueueEntry,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
  MerchantDeboarding,
  GiveConsentDto,
  AskMerchantToRechargeDto,
  IssueRefundDto,
  CancelDeboardingDto,
  MerchantTerminal,
  CreateMerchantTerminalDto,
  UpdateMerchantTerminalDto,
  PlatformPairingCode,
  MerchantDataExportDocument,
  MerchantCommunications,
  ApiResponse,
  ApiListResponse,
} from '../types/merchant.types';

const mapMerchantResponse = (m: any): Merchant => {
  if (!m) return m;
  return {
    ...m,
    id: m.id ?? m.merchantId,
    businessName: m.businessName ?? m.companyName,
    status: m.status ?? m.merchantStatus,
    signupDate: m.signupDate ?? m.createdAt,
    email: m.email ?? m.contactEmail,
    phone: m.phone ?? m.contactPhone,
    contactPerson: m.contactPerson ?? m.contactName,
  };
};

export const merchantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMerchants: builder.query<ApiListResponse<Merchant>, Record<string, any>>({
      query: (rawParams) => {
        const params: Record<string, any> = {};
        if (rawParams) {
          Object.keys(rawParams).forEach((key) => {
            const val = rawParams[key];
            if (val !== undefined && val !== null && val !== '' && val !== 'all') {
              params[key] = val;
            }
          });
        }
        return {
          url: '/api/v1/merchants',
          method: 'GET',
          params,
        };
      },
      transformResponse: (response: ApiListResponse<any>) => ({
        ...response,
        data: response.data?.map(mapMerchantResponse) ?? [],
      }),
      providesTags: ['Merchants'],
    }),

    // FRS-SAP-402 (2026-08-05): rich detail payload — commission summary, bridge health,
    // token history, renewal status, usage rollup. Backs the type-specific detail panels.
    getMerchantDetail: builder.query<ApiResponse<import('../types/merchantDetail.types').MerchantDetailPayload>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/detail`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }],
    }),

    getMerchant: builder.query<ApiResponse<Merchant>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapMerchantResponse(response.data),
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    updateMerchant: builder.mutation<ApiResponse<Merchant>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/api/v1/merchants/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    activateMerchant: builder.mutation<ApiResponse<Merchant>, string>({
      query: (id) => {
        const cleanId = id && id !== 'undefined' ? id : '';
        return {
          url: `/api/v1/merchants/${cleanId}/activate`,
          method: 'POST',
        };
      },
      invalidatesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    suspendMerchant: builder.mutation<ApiResponse<Merchant>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/v1/merchants/${id}/suspend`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    reactivateMerchant: builder.mutation<ApiResponse<Merchant>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/reactivate`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    reactivateMerchantWithResolution: builder.mutation<ApiResponse<Merchant>, { id: string; resolution: string }>({
      query: ({ id, resolution }) => ({
        url: `/api/v1/merchants/${id}/reactivate`,
        method: 'POST',
        data: { resolution },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    // 2026-08-30: cancelMerchant/deleteMerchant endpoints removed — retired Pass-39
    // exits (DELETE /merchants/{id} returns 410 Gone); deboarding is the one exit path.

    retryProvisioning: builder.mutation<ApiResponse<Merchant>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/retry-provisioning`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    // 2026-08-30: typed to what the server actually returns (FRS-SPA-507) — the response
    // BODY is the export document itself, streamed as a JSON attachment (no ApiResponse
    // envelope; integrity hash in the X-Quantix-Export-Sha256 header). Caller downloads it.
    exportMerchantData: builder.mutation<MerchantDataExportDocument, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/export`,
        method: 'POST',
      }),
    }),

    getMerchantNotes: builder.query<ApiResponse<readonly MerchantNote[]>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/notes`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    addMerchantNote: builder.mutation<ApiResponse<MerchantNote>, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/api/v1/merchants/${id}/notes`,
        method: 'POST',
        data: { content },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    getMerchantTimeline: builder.query<ApiResponse<readonly MerchantTimelineEntry[]>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/timeline`,
        method: 'GET',
      }),
    }),

    // 2026-08-31: the merchant's REAL message-delivery record. The Communications panel
    // used to render a hardcoded array with invented "sent" timestamps and Send buttons
    // that never contacted the server.
    getMerchantCommunications: builder.query<ApiResponse<MerchantCommunications>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/communications`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Merchants', id }],
    }),

    resendWelcomeEmail: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/communications/welcome-email/resend`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Merchants', id }],
    }),

    // 2026-08-30: changePlan now sends what PlanChangeDto actually reads — the old body
    // { plan: 'Starter' } mapped to NOTHING server-side, so every plan change failed.
    // changeTier removed entirely: /change-tier returns 410 Gone (tiers don't exist).
    // dailyPriceOverride = the negotiated merchant-specific daily rate (onboarding
    // parity); omitted ⇒ catalog price.
    changePlan: builder.mutation<ApiResponse<boolean>, { id: string; newPlanId: string; dailyPriceOverride?: number; reason?: string }>({
      query: ({ id, newPlanId, dailyPriceOverride, reason }) => ({
        url: `/api/v1/merchants/${id}/change-plan`,
        method: 'POST',
        data: { newPlanId, dailyPriceOverride, reason },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    // 2026-09-04: impersonateMerchant REMOVED. It expected `{ sessionUrl }` from a route that
    // returned an opaque `imp.v2.*` token nothing in the solution could consume; the modal
    // announced a view-only session and opened nothing.

    // Registration mutations REMOVED 2026-08-12 with the retired register wizards —
    // the unified onboarding wizard (/merchants/onboard) is the only creation path.

    getSignupQueue: builder.query<ApiListResponse<SignupQueueEntry>, Record<string, any>>({
      query: (params) => ({
        url: '/api/v1/registration/queue',
        method: 'GET',
        params,
      }),
      providesTags: ['SignupQueue'],
    }),

    resendVerification: builder.mutation<ApiResponse<{ sent: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/registration/${id}/resend-verification`,
        method: 'POST',
      }),
    }),

    bypassPayment: builder.mutation<ApiResponse<{ id: string; status: string }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/api/v1/merchants/${id}/bypass-payment`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    // --- Deboarding ---
    giveDeboardingConsent: builder.mutation<ApiResponse<MerchantDeboarding>, GiveConsentDto>({
      query: (data) => ({
        url: '/api/v1/deboarding/consent',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Deboarding', 'Merchants'],
    }),

    deactivateDeboarding: builder.mutation<ApiResponse<MerchantDeboarding>, string>({
      query: (deboardingId) => ({
        url: `/api/v1/deboarding/${deboardingId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['Deboarding', 'Merchants'],
    }),

    generateFinalInvoice: builder.mutation<ApiResponse<MerchantDeboarding>, string>({
      query: (deboardingId) => ({
        url: `/api/v1/deboarding/${deboardingId}/final-invoice`,
        method: 'POST',
      }),
      invalidatesTags: ['Deboarding'],
    }),

    settleDeboarding: builder.mutation<ApiResponse<MerchantDeboarding>, string>({
      query: (deboardingId) => ({
        url: `/api/v1/deboarding/${deboardingId}/settle`,
        method: 'POST',
      }),
      invalidatesTags: ['Deboarding', 'Merchants'],
    }),

    askRecharge: builder.mutation<ApiResponse<MerchantDeboarding>, AskMerchantToRechargeDto>({
      query: (data) => ({
        url: '/api/v1/deboarding/ask-recharge',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Deboarding'],
    }),

    issueRefund: builder.mutation<ApiResponse<MerchantDeboarding>, IssueRefundDto>({
      query: (data) => ({
        url: '/api/v1/deboarding/refund',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Deboarding'],
    }),

    cancelDeboarding: builder.mutation<ApiResponse<MerchantDeboarding>, CancelDeboardingDto>({
      query: (data) => ({
        url: '/api/v1/deboarding/cancel',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Deboarding', 'Merchants'],
    }),

    retryDeboardingSettle: builder.mutation<ApiResponse<MerchantDeboarding>, string>({
      query: (deboardingId) => ({
        url: `/api/v1/deboarding/${deboardingId}/retry-settle`,
        method: 'POST',
      }),
      invalidatesTags: ['Deboarding'],
    }),

    softDeleteDeboarding: builder.mutation<ApiResponse<MerchantDeboarding>, string>({
      query: (deboardingId) => ({
        url: `/api/v1/deboarding/${deboardingId}/soft-delete`,
        method: 'POST',
      }),
      invalidatesTags: ['Deboarding', 'Merchants'],
    }),

    getDeboardingById: builder.query<ApiResponse<MerchantDeboarding>, string>({
      query: (deboardingId) => ({
        url: `/api/v1/deboarding/${deboardingId}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, deboardingId) => [{ type: 'Deboarding', id: deboardingId }, 'Deboarding'],
    }),

    getDeboardingByMerchant: builder.query<ApiResponse<MerchantDeboarding>, string>({
      query: (merchantId) => ({
        url: `/api/v1/deboarding/by-merchant/${merchantId}`,
        method: 'GET',
      }),
      transformErrorResponse: () => ({
        success: false,
        data: null as any,
      }),
      providesTags: ['Deboarding'],
    }),

    getDeboardingQueue: builder.query<ApiListResponse<MerchantDeboarding>, Record<string, any>>({
      query: (params) => ({
        url: '/api/v1/deboarding',
        method: 'GET',
        params,
      }),
      providesTags: ['Deboarding'],
    }),

    // --- Terminals ---
    // 2026-08-30: the terminal types this merchant may register — server-derived from the
    // active plan (flavour → Restaurant/Retail; Advance Inventory feature → Inventory).
    getAllowedTerminalTypes: builder.query<ApiResponse<string[]>, string>({
      query: (merchantId) => ({
        url: `/api/v1/terminals/allowed-types/by-merchant/${merchantId}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, merchantId) => [{ type: 'Merchants', id: merchantId }],
    }),

    getTerminalsByMerchant: builder.query<ApiResponse<MerchantTerminal[]>, string>({
      query: (merchantId) => ({
        url: `/api/v1/terminals/by-merchant/${merchantId}`,
        method: 'GET',
      }),
      transformErrorResponse: () => ({
        success: true,
        data: [],
      }),
      providesTags: ['Terminals'],
    }),

    createTerminal: builder.mutation<ApiResponse<MerchantTerminal>, CreateMerchantTerminalDto>({
      query: (data) => ({
        url: '/api/v1/terminals',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Terminals'],
    }),

    updateTerminal: builder.mutation<ApiResponse<MerchantTerminal>, { terminalId: string; data: UpdateMerchantTerminalDto }>({
      query: ({ terminalId, data }) => ({
        url: `/api/v1/terminals/${terminalId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Terminals'],
    }),

    deactivateTerminal: builder.mutation<void, string>({
      query: (terminalId) => ({
        url: `/api/v1/terminals/${terminalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Terminals'],
    }),

    issuePairingCode: builder.mutation<ApiResponse<PlatformPairingCode>, { terminalId: string; ttlHours?: number }>({
      query: ({ terminalId, ttlHours }) => ({
        url: `/api/v1/terminals/${terminalId}/issue-pairing-code`,
        method: 'POST',
        data: { ttlHours: ttlHours ?? 24 },
      }),
      invalidatesTags: ['Terminals'],
    }),
  }),
});

export const {
  useGetMerchantsQuery,
  useGetMerchantQuery,
  useGetMerchantDetailQuery,
  useUpdateMerchantMutation,
  useActivateMerchantMutation,
  useSuspendMerchantMutation,
  useReactivateMerchantMutation,
  useReactivateMerchantWithResolutionMutation,
  useRetryProvisioningMutation,
  useExportMerchantDataMutation,
  useGetMerchantNotesQuery,
  useAddMerchantNoteMutation,
  useGetMerchantTimelineQuery,
  useGetMerchantCommunicationsQuery,
  useResendWelcomeEmailMutation,
  useChangePlanMutation,
  useGetSignupQueueQuery,
  useResendVerificationMutation,
  useBypassPaymentMutation,
  useGiveDeboardingConsentMutation,
  useDeactivateDeboardingMutation,
  useGenerateFinalInvoiceMutation,
  useSettleDeboardingMutation,
  useAskRechargeMutation,
  useIssueRefundMutation,
  useCancelDeboardingMutation,
  useRetryDeboardingSettleMutation,
  useSoftDeleteDeboardingMutation,
  useGetDeboardingByIdQuery,
  useGetDeboardingByMerchantQuery,
  useGetDeboardingQueueQuery,
  useGetAllowedTerminalTypesQuery,
  useGetTerminalsByMerchantQuery,
  useCreateTerminalMutation,
  useUpdateTerminalMutation,
  useDeactivateTerminalMutation,
  useIssuePairingCodeMutation,
} = merchantApi;
