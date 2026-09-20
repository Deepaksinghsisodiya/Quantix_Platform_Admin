import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type {
  GlobalSettings,
  EmailTemplate,
  CommissionConfig,
  GracePeriodConfig,
} from '@/lib/types';
import { 
  SystemSetting, 
  SettingsGrouped, 
  PublicSettings, 
  UpdateSettingRequest, 
  BulkUpdateSettingsRequest 
} from '../types/settings';

/** 2026-08-30: mirrors SetupCountryOptionDto — one supported deployment country. */
export interface SetupCountryOption {
  readonly code: string;
  readonly currency: string;
  readonly timezones: readonly string[];
}

/** 2026-08-07: first-run platform setup gate — mirrors PlatformSetupStatusDto. */
export interface PlatformSetupStatus {
  isConfigured: boolean;
  country: string;
  currency: string;
  timezone: string;
  language: string;
  dbaName: string;
  supportEmail: string;
  platformName: string;
  /** 2026-08-10 integration toggles — merchant dialogs hide online payment when off. */
  onlinePaymentEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  /** 2026-08-29 (card checkout): configured gateway provider key ("Mock" in dev) —
   * the card form picks its client-side tokenizer by this. */
  paymentProvider: string;
}

export interface CompletePlatformSetupInput {
  country: string;
  timezone: string;
  supportEmail: string;
  dbaName?: string;
  language?: string;
}

/** 2026-08-08 grace redesign: per-plan-type policy — anchors from token expiry. */
export interface GracePeriodPolicy {
  standardGracePeriodId: string;
  planType: 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';
  warningDays: number;
  degradedAfterDays: number;
  restrictedAfterDays: number;
  suspendedAfterDays: number;
}

/** 2026-08-29 (Pass 44): mirror of PaymentMethodDto — platform-wide tender catalog. */
export interface PlatformPaymentMethod {
  paymentMethodId: string;
  methodType: string;
  displayName: string;
  isEnabled: boolean;
  sortOrder: number;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<ApiResponse<PlatformPaymentMethod[]>, { enabledOnly?: boolean } | void>({
      query: (params) => ({
        url: '/api/v1/payment-methods',
        method: 'GET',
        params: params && params.enabledOnly ? { enabledOnly: true } : undefined,
      }),
      providesTags: ['Settings' as any],
    }),
    setPaymentMethodEnabled: builder.mutation<ApiResponse<PlatformPaymentMethod>, { methodType: string; isEnabled: boolean }>({
      query: ({ methodType, isEnabled }) => ({
        url: `/api/v1/payment-methods/${methodType}`,
        method: 'PUT',
        data: { isEnabled },
      }),
      invalidatesTags: ['Settings' as any],
    }),
    /** 2026-09-04: the feature catalog (code → name/class). Source of truth for download
     *  package feature gates; nothing in the portal hardcodes feature codes. */
    getFeatureCatalog: builder.query<ApiResponse<readonly FeatureCatalogEntry[]>, void>({
      query: () => ({
        url: '/api/v1/catalogs/features',
        method: 'GET',
      }),
      providesTags: ['FeatureCatalog'],
    }),
    getGracePeriods: builder.query<ApiResponse<readonly GracePeriodPolicy[]>, void>({
      query: () => ({
        url: '/api/v1/catalogs/grace-periods',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    updateGracePeriod: builder.mutation<
      ApiResponse<GracePeriodPolicy>,
      { planType: string; warningDays: number; degradedAfterDays: number; restrictedAfterDays: number; suspendedAfterDays: number }
    >({
      query: ({ planType, ...body }) => ({
        url: `/api/v1/catalogs/grace-periods/${planType}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    getSetupStatus: builder.query<ApiResponse<PlatformSetupStatus>, void>({
      query: () => ({
        url: '/api/v1/settings/setup-status',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    /** 2026-08-30: supported deployment countries (code/currency/timezones) from the
     *  server CountryCatalog — replaces the three hardcoded setup-screen maps. */
    getSetupCatalog: builder.query<ApiResponse<readonly SetupCountryOption[]>, void>({
      query: () => ({
        url: '/api/v1/settings/setup-catalog',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    completePlatformSetup: builder.mutation<ApiResponse<PlatformSetupStatus>, CompletePlatformSetupInput>({
      query: (body) => ({
        url: '/api/v1/settings/setup',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    getPublicSettings: builder.query<PublicSettings, void>({
      query: () => ({
        url: '/api/v1/settings/public',
        method: 'GET'
      }),
      providesTags: ['Settings' as any],
    }),
    getAllSettings: builder.query<SettingsGrouped, void>({
      query: () => ({
        url: '/api/v1/settings',
        method: 'GET'
      }),
      providesTags: ['Settings' as any],
    }),
    updateSetting: builder.mutation<SystemSetting, { key: string; body: UpdateSettingRequest }>({
      query: ({ key, body }) => ({
        url: `/api/v1/settings/${key}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    bulkUpdateSettings: builder.mutation<SystemSetting[], BulkUpdateSettingsRequest>({
      query: (body) => ({
        url: '/api/v1/settings/bulk',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    initializeDefaults: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/v1/settings/initialize',
        method: 'POST',
      }),
      invalidatesTags: ['Settings' as any],
    }),
    testSmtp: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/v1/settings/smtp/test',
        method: 'POST',
      }),
    }),
    testGoogleMeet: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/v1/settings/google-meet/test',
        method: 'POST',
      }),
    }),

    // 2026-09-08: getAuditLogs REMOVED. It was a second endpoint of the SAME NAME as the audit
    // module's, pointing at /settings/audit (a route that does not exist - it fell into the
    // {key} setting lookup and 400'd). RTK keeps the first injection of a name, so the Audit
    // Trail page and the consent audit trail were silently sent here instead of /audit/logs.
    getDatabaseHealth: builder.query<any, void>({
      query: () => ({
        url: '/api/v1/database/health',
        method: 'GET'
      }),
      providesTags: ['Settings' as any],
    }),
    triggerDatabaseBackup: builder.mutation<any, void>({
      query: () => ({
        url: '/api/v1/database/backup',
        method: 'POST'
      }),
      invalidatesTags: ['Settings' as any],
    }),
    triggerDatabaseReset: builder.mutation<any, void>({
      query: () => ({
        url: '/api/v1/database/reset',
        method: 'POST'
      }),
      invalidatesTags: ['Settings' as any],
    }),

    getGlobalSettings: builder.query<ApiResponse<GlobalSettings>, void>({
      query: () => ({
        url: '/api/v1/settings',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    updateGlobalSettings: builder.mutation<ApiResponse<GlobalSettings>, Partial<GlobalSettings>>({
      query: (data) => ({
        url: '/api/v1/settings',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    getEmailTemplates: builder.query<ApiResponse<readonly EmailTemplate[]>, void>({
      query: () => ({
        url: '/api/v1/settings/email-templates',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    getCommissionConfig: builder.query<ApiResponse<CommissionConfig>, void>({
      query: () => ({
        url: '/api/v1/settings/commission-config',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    getGracePeriodConfig: builder.query<ApiResponse<GracePeriodConfig>, void>({
      query: () => ({
        url: '/api/v1/settings/grace-period-config',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),

    getTaxDefinitions: builder.query<ApiResponse<readonly any[]>, void>({
      query: () => ({
        url: '/api/v1/tax/definitions',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    createTaxDefinition: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/api/v1/tax/definitions',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    deleteTaxDefinition: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/tax/definitions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings' as any],
    }),

    getTaxGroups: builder.query<ApiResponse<readonly any[]>, void>({
      query: () => ({
        url: '/api/v1/tax/groups',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    createTaxGroup: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/api/v1/tax/groups',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    deleteTaxGroup: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/tax/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings' as any],
    }),

    getTaxAssociations: builder.query<ApiResponse<readonly any[]>, { merchantId?: string; planId?: string } | void>({
      query: (params) => ({
        url: '/api/v1/tax/associations',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Settings' as any],
    }),
    createTaxAssociation: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/api/v1/tax/associations',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Settings' as any],
    }),
    deleteTaxAssociation: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/tax/associations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings' as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPaymentMethodsQuery,
  useSetPaymentMethodEnabledMutation,
  useGetGracePeriodsQuery,
  useUpdateGracePeriodMutation,
  useGetSetupStatusQuery,
  useGetSetupCatalogQuery,
  useGetFeatureCatalogQuery,
  useCompletePlatformSetupMutation,
  useGetPublicSettingsQuery,
  useGetAllSettingsQuery,
  useUpdateSettingMutation,
  useBulkUpdateSettingsMutation,
  useInitializeDefaultsMutation,
  useTestSmtpMutation,
  useTestGoogleMeetMutation,
  useGetDatabaseHealthQuery,
  useTriggerDatabaseBackupMutation,
  useTriggerDatabaseResetMutation,
  useGetGlobalSettingsQuery,
  useUpdateGlobalSettingsMutation,
  useGetEmailTemplatesQuery,
  useGetCommissionConfigQuery,
  useGetGracePeriodConfigQuery,
  useGetTaxDefinitionsQuery,
  useCreateTaxDefinitionMutation,
  useDeleteTaxDefinitionMutation,
  useGetTaxGroupsQuery,
  useCreateTaxGroupMutation,
  useDeleteTaxGroupMutation,
  useGetTaxAssociationsQuery,
  useCreateTaxAssociationMutation,
  useDeleteTaxAssociationMutation,
} = settingsApi;

/** Mirror of FeatureCatalogDto (PlatformBusiness/DTOs/Catalog/CatalogDtos.cs). */
export interface FeatureCatalogEntry {
  readonly featureCode: string;
  readonly featureName: string;
  readonly description: string | null;
  readonly featureClass: 'Basic' | 'Advance' | string;
  readonly unitPricePerDay: number;
  readonly applicableBusiness: string;
  readonly isActive: boolean;
  readonly sortOrder: number;
}
