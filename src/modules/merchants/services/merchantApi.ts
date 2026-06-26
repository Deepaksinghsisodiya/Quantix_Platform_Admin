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
    // --- Merchants ---
    getMerchants: builder.query<ApiListResponse<Merchant>, Record<string, any>>({
      query: (params) => ({
        url: '/api/v1/merchants',
        method: 'GET',
        params,
      }),
      transformResponse: (response: ApiListResponse<any>) => ({
        ...response,
        data: response.data?.map(mapMerchantResponse) ?? [],
      }),
      providesTags: ['Merchants'],
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
      query: (id) => ({
        url: `/api/v1/merchants/${id}/activate`,
        method: 'POST',
      }),
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

    cancelMerchant: builder.mutation<ApiResponse<Merchant>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/v1/merchants/${id}/deactivate`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    deleteMerchant: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Merchants'],
    }),

    retryProvisioning: builder.mutation<ApiResponse<Merchant>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/retry-provisioning`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    exportMerchantData: builder.mutation<ApiResponse<unknown>, string>({
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

    changePlan: builder.mutation<ApiResponse<Merchant>, { id: string; plan: string }>({
      query: ({ id, plan }) => ({
        url: `/api/v1/merchants/${id}/change-plan`,
        method: 'POST',
        data: { plan },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    changeTier: builder.mutation<ApiResponse<Merchant>, { id: string; tier: string }>({
      query: ({ id, tier }) => ({
        url: `/api/v1/merchants/${id}/change-tier`,
        method: 'POST',
        data: { tier },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Merchants', id }, 'Merchants'],
    }),

    impersonateMerchant: builder.mutation<ApiResponse<{ sessionUrl: string; expiresAt: string }>, string>({
      query: (id) => ({
        url: `/api/v1/merchants/${id}/impersonate`,
        method: 'POST',
      }),
    }),

    // --- Registration ---
    registerEnterprise: builder.mutation<ApiResponse<Merchant>, MerchantCreateEnterprise>({
      query: (data) => {
        const planIdMap: Record<string, string> = {
          starter: '20000002-0000-0000-0000-000000000002',
          professional: '20000002-0000-0000-0000-000000000003',
          business: '20000002-0000-0000-0000-000000000003',
          enterprise: '20000002-0000-0000-0000-000000000004',
        };
        const mappedPlanId = planIdMap[data.plan?.toLowerCase() || ''] || planIdMap[data.tier?.toLowerCase() || ''] || planIdMap['professional'];

        let mappedBillingCycle = 'Monthly';
        if (data.billingFrequency === 'Annual') {
          mappedBillingCycle = 'Annual';
        }

        return {
          url: '/api/v1/registration/manual',
          method: 'POST',
          data: {
            merchantType: 'Enterprise',
            companyName: data.businessName,
            displayName: data.businessName,
            contactName: data.contactPerson,
            contactEmail: data.email,
            contactPhone: data.phone,
            country: data.country,
            databaseEngine: data.dbEngine || 'PostgreSQL',
            planId: mappedPlanId,
            billingCycle: mappedBillingCycle,
          },
        };
      },
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapMerchantResponse(response.data),
      }),
      invalidatesTags: ['Merchants', 'SignupQueue'],
    }),

    registerStandalone: builder.mutation<ApiResponse<Merchant>, MerchantCreateStandalone>({
      query: (data) => {
        const tierIdMap: Record<string, string> = {
          basic: '20000002-0000-0000-0000-000000000002',
          standard: '20000002-0000-0000-0000-000000000003',
          advance: '20000002-0000-0000-0000-000000000003',
          premium: '20000002-0000-0000-0000-000000000004',
        };
        const mappedPlanId = tierIdMap[data.initialTokenTier?.toLowerCase() || ''] || null;

        return {
          url: '/api/v1/registration/manual',
          method: 'POST',
          data: {
            merchantType: 'Standalone',
            companyName: data.businessName,
            displayName: data.businessName,
            contactName: data.contactPerson,
            contactEmail: data.email,
            contactPhone: data.phone,
            country: data.country,
            databaseEngine: null,
            planId: mappedPlanId,
            billingCycle: 'Monthly',
          },
        };
      },
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapMerchantResponse(response.data),
      }),
      invalidatesTags: ['Merchants', 'SignupQueue'],
    }),

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
    getTerminalsByMerchant: builder.query<ApiResponse<MerchantTerminal[]>, string>({
      query: (merchantId) => ({
        url: `/api/v1/terminals/by-merchant/${merchantId}`,
        method: 'GET',
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
  useUpdateMerchantMutation,
  useActivateMerchantMutation,
  useSuspendMerchantMutation,
  useReactivateMerchantMutation,
  useReactivateMerchantWithResolutionMutation,
  useCancelMerchantMutation,
  useDeleteMerchantMutation,
  useRetryProvisioningMutation,
  useExportMerchantDataMutation,
  useGetMerchantNotesQuery,
  useAddMerchantNoteMutation,
  useGetMerchantTimelineQuery,
  useChangePlanMutation,
  useChangeTierMutation,
  useImpersonateMerchantMutation,
  useRegisterEnterpriseMutation,
  useRegisterStandaloneMutation,
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
  useGetTerminalsByMerchantQuery,
  useCreateTerminalMutation,
  useUpdateTerminalMutation,
  useDeactivateTerminalMutation,
  useIssuePairingCodeMutation,
} = merchantApi;
