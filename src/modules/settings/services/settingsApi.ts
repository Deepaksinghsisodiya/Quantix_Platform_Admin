import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type {
  GlobalSettings,
  FeatureToggle,
  EmailTemplate,
  TokenGenerationConfig,
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

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

    getAuditLogs: builder.query<any, { key?: string; page?: number; pageSize?: number }>({
      query: (params) => ({
        url: '/api/v1/settings/audit',
        method: 'GET',
        params,
      }),
    }),
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
    getFeatureToggles: builder.query<ApiResponse<readonly FeatureToggle[]>, void>({
      query: () => ({
        url: '/api/v1/settings/feature-toggles',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    getEmailTemplates: builder.query<ApiResponse<readonly EmailTemplate[]>, void>({
      query: () => ({
        url: '/api/v1/settings/email-templates',
        method: 'GET',
      }),
      providesTags: ['Settings' as any],
    }),
    getTokenConfig: builder.query<ApiResponse<TokenGenerationConfig>, void>({
      query: () => ({
        url: '/api/v1/settings/token-config',
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
  useGetPublicSettingsQuery,
  useGetAllSettingsQuery,
  useUpdateSettingMutation,
  useBulkUpdateSettingsMutation,
  useInitializeDefaultsMutation,
  useTestSmtpMutation,
  useTestGoogleMeetMutation,
  useGetAuditLogsQuery,
  useGetDatabaseHealthQuery,
  useTriggerDatabaseBackupMutation,
  useTriggerDatabaseResetMutation,
  useGetGlobalSettingsQuery,
  useUpdateGlobalSettingsMutation,
  useGetFeatureTogglesQuery,
  useGetEmailTemplatesQuery,
  useGetTokenConfigQuery,
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
