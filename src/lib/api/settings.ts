/**
 * Settings API module.
 */

import { get, put, post } from './client';
import type { ApiResponse } from '@/lib/types/common';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlobalSettings {
  readonly platformName: string;
  readonly supportEmail: string;
  readonly defaultCurrency: string;
  readonly defaultTimezone: string;
  readonly maintenanceMode: boolean;
  readonly signupEnabled: boolean;
  readonly maxMerchantsPerPlan: Record<string, number>;
  readonly defaultTrialDays: number;
}

// MaintenanceWindow interfaces REMOVED 2026-08-10 — invented shapes (scheduledStart /
// affectedServices) that never matched the real MaintenanceWindowDto; nothing imported them.

export interface EmailTemplate {
  readonly id: string;
  readonly name: string;
  readonly subject: string;
  readonly bodyHtml: string;
  readonly bodyText: string;
  readonly variables: readonly string[];
  readonly updatedAt: string;
}

export interface EmailTemplateUpdate {
  readonly subject?: string;
  readonly bodyHtml?: string;
  readonly bodyText?: string;
}

export interface Integration {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly enabled: boolean;
  readonly config: Record<string, string>;
  readonly status: 'Connected' | 'Disconnected' | 'Error';
  readonly lastSyncAt: string | null;
}

export interface IntegrationUpdate {
  readonly enabled?: boolean;
  readonly config?: Record<string, string>;
}

export interface CommissionConfig {
  readonly defaultRate: number;
  readonly minimumTransactionValue: number;
  readonly settlementFrequency: 'Weekly' | 'Biweekly' | 'Monthly';
  readonly autoSettle: boolean;
}

export interface GracePeriodConfig {
  readonly defaultGraceDays: number;
  readonly readOnlyDuringGrace: boolean;
  readonly notificationSchedule: readonly number[];
  readonly autoSuspendAfterGrace: boolean;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getGlobalSettings(): Promise<ApiResponse<GlobalSettings>> {
  return get<ApiResponse<GlobalSettings>>('/api/v1/settings');
}

export function updateGlobalSettings(data: Partial<GlobalSettings>): Promise<ApiResponse<GlobalSettings>> {
  return put<ApiResponse<GlobalSettings>>('/api/v1/settings', data);
}

// getMaintenanceWindows/scheduleMaintenanceWindow REMOVED 2026-08-10 — they targeted
// /settings/maintenance-windows, an endpoint that never existed, and nothing imported them.
// The Maintenance page talks to the real /settings/maintenance/windows endpoints directly.

export function getEmailTemplates(): Promise<ApiResponse<readonly EmailTemplate[]>> {
  return get<ApiResponse<readonly EmailTemplate[]>>('/api/v1/settings/email-templates');
}

export function updateEmailTemplate(id: string, data: EmailTemplateUpdate): Promise<ApiResponse<EmailTemplate>> {
  return put<ApiResponse<EmailTemplate>>(`/api/v1/settings/email-templates/${id}`, data);
}

export function getIntegrations(): Promise<ApiResponse<readonly Integration[]>> {
  return get<ApiResponse<readonly Integration[]>>('/api/v1/settings/integrations');
}

export function updateIntegration(id: string, data: IntegrationUpdate): Promise<ApiResponse<Integration>> {
  return put<ApiResponse<Integration>>(`/api/v1/settings/integrations/${id}`, data);
}

export function getCommissionConfig(): Promise<ApiResponse<CommissionConfig>> {
  return get<ApiResponse<CommissionConfig>>('/api/v1/settings/commission-config');
}

export function updateCommissionConfig(data: Partial<CommissionConfig>): Promise<ApiResponse<CommissionConfig>> {
  return put<ApiResponse<CommissionConfig>>('/api/v1/settings/commission-config', data);
}

export function getGracePeriodConfig(): Promise<ApiResponse<GracePeriodConfig>> {
  return get<ApiResponse<GracePeriodConfig>>('/api/v1/settings/grace-period-config');
}

export function updateGracePeriodConfig(data: Partial<GracePeriodConfig>): Promise<ApiResponse<GracePeriodConfig>> {
  return put<ApiResponse<GracePeriodConfig>>('/api/v1/settings/grace-period-config', data);
}
