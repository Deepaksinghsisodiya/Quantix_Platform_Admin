/** Top-level platform configuration. FRS-SAP-801 */
export interface GlobalSettings {
  readonly platformName: string;
  readonly supportEmail: string;
  readonly defaultCurrency: string;
  readonly defaultLanguage: string;
  readonly defaultTimezone: string;
  readonly legalEntityName: string;
  readonly maintenanceMode: boolean;
  readonly maxLocationsPerMerchant: number;
  readonly maxTerminalsPerLocation: number;
  readonly passwordPolicy: PasswordPolicy;
  readonly sessionTimeoutMinutes: number;
}

export interface PasswordPolicy {
  readonly minLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireDigit: boolean;
  readonly requireSpecialChar: boolean;
  readonly maxAgeDays: number;
  readonly historyCount: number;
}

/** Feature flag with scoped targeting. FRS-SAP-802 */
/** Scheduled maintenance window. FRS-SAP-803 */
export interface MaintenanceWindow {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly affectedServices: readonly string[];
  readonly preNotificationHours: number;
  readonly notifyMerchants: boolean;
  readonly status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
}

/** Configurable email template for platform notifications. FRS-SAP-806 */
export interface EmailTemplate {
  readonly id: string;
  readonly name: string;
  readonly subject: string;
  readonly bodyHtml: string;
  readonly bodyText: string;
  readonly variables: readonly string[];
  readonly locale: string;
  readonly isActive: boolean;
}

/** External integration configuration. FRS-SAP-807 */
export interface IntegrationConfig {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly enabled: boolean;
  readonly settings: Record<string, string>;
  readonly credentialsEncrypted: boolean;
  readonly lastTestedAt: string | null;
  readonly status: 'Active' | 'Inactive' | 'Error';
}

// 2026-08-29: TokenTierTemplate removed — token tiers never existed; templates are keyed
// on PlanType (see modules/tokens/services/tokenApi TokenTemplate).

/** Platform-wide commission configuration. FRS-SAP-809 */
export interface CommissionConfig {
  readonly defaultRate: number;
  readonly minTransactionValue: number;
  readonly maxCommissionPerTransaction: number;
  readonly commissionableTypes: readonly string[];
  readonly calculationFrequency: 'Daily' | 'Weekly';
  readonly settlementFrequency: 'Monthly' | 'Bi-weekly';
  readonly settlementPaymentMethod: string;
  readonly autoSettle: boolean;
  readonly currency: string;
  /** Per-plan rate overrides. */
  readonly planRates: readonly { readonly plan: string; readonly rate: number }[];
  /** Commission statement email template ID. */
  readonly statementTemplateId: string | null;
}

/** Grace period configuration with per-phase detail. FRS-SAP-810 */
export interface GracePeriodConfig {
  readonly phases: readonly GracePhaseConfig[];
  readonly enterpriseDefaults: GracePeriodDefaults;
  readonly standaloneDefaults: GracePeriodDefaults;
  readonly perPlanOverrides: readonly GracePeriodPlanOverride[];
  readonly perTierOverrides: readonly GracePeriodTierOverride[];
  readonly readOnlyDuringGrace: boolean;
  readonly autoSuspendAfterGrace: boolean;
  readonly reminderSchedule: readonly number[];
}

export interface GracePhaseConfig {
  readonly phase: 'Warning' | 'Degraded' | 'Restricted' | 'Suspended';
  readonly description: string;
  readonly allowedOperations: readonly string[];
}

export interface GracePeriodDefaults {
  readonly warningDays: number;
  readonly degradedDays: number;
  readonly restrictedDays: number;
}

export interface GracePeriodPlanOverride {
  readonly plan: string;
  readonly warningDays: number;
  readonly degradedDays: number;
  readonly restrictedDays: number;
}

export interface GracePeriodTierOverride {
  readonly tier: string;
  readonly warningDays: number;
  readonly degradedDays: number;
  readonly restrictedDays: number;
}
