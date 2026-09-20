import type { MerchantType } from './common';

/**
 * Compliance types — 2026-09-08: realigned 1:1 to the API
 * (`Quantix.PlatformBusiness.DTOs.Compliance` + `Quantix.Foundation.Enums.Platform`).
 *
 * The previous shapes described a product that does not exist: a `regulation` (GDPR / CCPA /
 * LGPD) and `region` per request, a `deadline`, export-package and deletion-certificate URLs,
 * `Rectification` / `Restriction` request types, and a `ComplianceMetrics` with a consent rate
 * and per-region map. None of it was on the wire, so the pages mapped every request to "GDPR"
 * and rendered invented region cards. This is a single-country deployment; there is no
 * regulation axis. The API has three request types, four statuses, and a response window.
 */

/** Mirrors Foundation `ComplianceRequestType`. */
export type ComplianceRequestType = 'DataExport' | 'RightToDelete' | 'ConsentWithdrawal';

export const COMPLIANCE_REQUEST_TYPES: readonly ComplianceRequestType[] = ['DataExport', 'RightToDelete', 'ConsentWithdrawal'];

export const COMPLIANCE_TYPE_LABEL: Readonly<Record<ComplianceRequestType, string>> = {
  DataExport: 'Data Export',
  RightToDelete: 'Deletion',
  ConsentWithdrawal: 'Consent Withdrawal',
};

/** Mirrors Foundation `ComplianceStatus`. */
export type ComplianceStatus = 'Pending' | 'InProgress' | 'Completed' | 'Rejected';

export const COMPLIANCE_STATUSES: readonly ComplianceStatus[] = ['Pending', 'InProgress', 'Completed', 'Rejected'];

export const COMPLIANCE_STATUS_LABEL: Readonly<Record<ComplianceStatus, string>> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Rejected: 'Rejected',
};

/** Mirrors `ComplianceDataScope` — what a request covers. */
export type ComplianceDataScope =
  | 'AllData'
  | 'PersonalDataOnly'
  | 'BusinessDataOnly'
  | 'OrdersOnly'
  | 'PaymentsOnly'
  | 'AnalyticsOnly'
  | 'Other';

export const COMPLIANCE_DATA_SCOPES: readonly ComplianceDataScope[] = [
  'AllData', 'PersonalDataOnly', 'BusinessDataOnly', 'OrdersOnly', 'PaymentsOnly', 'AnalyticsOnly', 'Other',
];

/** One row of GET /compliance — mirrors `ComplianceRequestDto`. Nullable API fields are optional (the API omits nulls). */
export interface ComplianceRequest {
  readonly requestId: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly merchantType?: MerchantType | null;
  readonly requestType: ComplianceRequestType;
  readonly status: ComplianceStatus;
  readonly requestedBy: string;
  readonly approvedBy?: string | null;
  readonly completedAt?: string | null;
  readonly dataScope?: string | null;
  readonly notes?: string | null;
  readonly createdAt: string;
  /** CreatedAt plus the operator's response window. */
  readonly dueAt: string;
  /** Still open and past dueAt. */
  readonly isOverdue: boolean;
  readonly updatedAt?: string | null;
}

/** POST /compliance — mirrors `CreateComplianceRequestDto`. */
export interface CreateComplianceRequest {
  readonly merchantId: string;
  readonly requestType: ComplianceRequestType;
  readonly requestedBy: string;
  readonly dataScope?: ComplianceDataScope;
  readonly notes?: string;
}

/** GET /compliance/dashboard — mirrors `ComplianceDashboardDto`. */
export interface ComplianceDashboard {
  readonly pendingRequests: number;
  readonly inProgressRequests: number;
  readonly rejectedRequests: number;
  readonly completedRequests: number;
  readonly overdueRequests: number;
  readonly responseWindowDays: number;
  readonly byType: readonly { readonly key: string; readonly count: number }[];
}

/** GET /compliance/consents — mirrors `ConsentRecordDto`. */
export interface ConsentRecord {
  readonly consentId: string;
  readonly merchantId: string;
  readonly consentType: string;
  readonly isGranted: boolean;
  readonly grantedAt: string;
  readonly revokedAt?: string | null;
  readonly ipAddress?: string | null;
}
