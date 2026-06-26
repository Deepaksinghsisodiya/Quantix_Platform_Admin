/**
 * Compliance API module.
 */

import { get, post } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComplianceDashboard {
  readonly totalDataRequests: number;
  readonly pendingRequests: number;
  readonly completedRequests: number;
  readonly averageResolutionDays: number;
  readonly consentCoverage: number;
  readonly retentionPoliciesActive: number;
  readonly upcomingDeadlines: readonly ComplianceDeadline[];
}

export interface ComplianceDeadline {
  readonly id: string;
  readonly type: string;
  readonly description: string;
  readonly dueDate: string;
  readonly merchantId: string | null;
  readonly merchantName: string | null;
}

export interface DataRequest {
  readonly id: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly type: 'Export' | 'Deletion' | 'Rectification' | 'Restriction';
  readonly status: 'Pending' | 'InProgress' | 'Completed' | 'Rejected';
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly completedAt: string | null;
  readonly notes: string | null;
}

export interface DataRequestListParams extends PaginationParams {
  readonly search?: string;
  readonly type?: string;
  readonly status?: string;
  readonly merchantId?: string;
}

export interface DataRequestCreate {
  readonly merchantId: string;
  readonly type: 'Export' | 'Deletion' | 'Rectification' | 'Restriction';
  readonly reason: string;
  readonly requestedBy: string;
}

export interface ConsentRecord {
  readonly id: string;
  readonly merchantId: string;
  readonly consentType: string;
  readonly granted: boolean;
  readonly grantedAt: string;
  readonly revokedAt: string | null;
  readonly ipAddress: string;
  readonly userAgent: string;
}

export interface RetentionPolicy {
  readonly id: string;
  readonly name: string;
  readonly dataCategory: string;
  readonly retentionDays: number;
  readonly action: 'Delete' | 'Anonymize' | 'Archive';
  readonly isActive: boolean;
  readonly lastExecuted: string | null;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getComplianceDashboard(): Promise<ApiResponse<ComplianceDashboard>> {
  return get<ApiResponse<ComplianceDashboard>>('/api/v1/compliance/dashboard');
}

export function getDataRequests(params: DataRequestListParams): Promise<ApiListResponse<DataRequest>> {
  return get<ApiListResponse<DataRequest>>('/api/v1/compliance/data-requests', params as unknown as Record<string, string | number>);
}

export function createDataRequest(data: DataRequestCreate): Promise<ApiResponse<DataRequest>> {
  return post<ApiResponse<DataRequest>>('/api/v1/compliance/data-requests', data);
}

export function processDataRequest(id: string, action: 'approve' | 'reject'): Promise<ApiResponse<DataRequest>> {
  return post<ApiResponse<DataRequest>>(`/api/v1/compliance/data-requests/${id}/${action}`);
}

export function getConsentRecords(merchantId: string): Promise<ApiResponse<readonly ConsentRecord[]>> {
  return get<ApiResponse<readonly ConsentRecord[]>>(`/api/v1/compliance/consent/${merchantId}`);
}

export function getRetentionPolicies(): Promise<ApiResponse<readonly RetentionPolicy[]>> {
  return get<ApiResponse<readonly RetentionPolicy[]>>('/api/v1/compliance/retention-policies');
}

/** FRS-SAP-1003: Get deletion certificate for a completed deletion request. */
export function getDeletionCertificate(requestId: string): Promise<ApiResponse<{ certificateId: string; downloadUrl: string }>> {
  return get<ApiResponse<{ certificateId: string; downloadUrl: string }>>(`/api/v1/compliance/data-requests/${requestId}/certificate`);
}

/** FRS-SAP-1004: Get all consent records (paginated). */
export function getAllConsentRecords(params: DataRequestListParams): Promise<ApiListResponse<ConsentRecord>> {
  return get<ApiListResponse<ConsentRecord>>('/api/v1/compliance/consent', params as unknown as Record<string, string | number>);
}

/** FRS-SAP-1004: Get consent version history for a merchant. */
export function getConsentVersionHistory(merchantId: string): Promise<ApiResponse<readonly { version: string; grantedAt: string; changes: string }[]>> {
  return get<ApiResponse<readonly { version: string; grantedAt: string; changes: string }[]>>(`/api/v1/compliance/consent/${merchantId}/versions`);
}

/** FRS-SAP-1004: Trigger re-consent request for outdated consents. */
export function requestReconsent(merchantIds: readonly string[]): Promise<ApiResponse<{ sent: number }>> {
  return post<ApiResponse<{ sent: number }>>('/api/v1/compliance/consent/request-reconsent', { merchantIds });
}

/** FRS-SAP-1005: Get regional compliance data. */
export function getRegionalCompliance(): Promise<ApiResponse<readonly RegionalCompliance[]>> {
  return get<ApiResponse<readonly RegionalCompliance[]>>('/api/v1/compliance/regions');
}

export interface RegionalCompliance {
  readonly region: string;
  readonly regulation: string;
  readonly status: 'Compliant' | 'Under Review' | 'Non-Compliant';
  readonly merchantCount: number;
  readonly dataResidency: string;
  readonly lastAudit: string;
  readonly checklistComplete: number;
  readonly checklistTotal: number;
}

/** FRS-SAP-1006: Create or update a retention policy. */
export function upsertRetentionPolicy(policy: Omit<RetentionPolicy, 'id' | 'lastExecuted'> & { id?: string }): Promise<ApiResponse<RetentionPolicy>> {
  return post<ApiResponse<RetentionPolicy>>('/api/v1/compliance/retention-policies', policy);
}

/** FRS-SAP-1006: Execute automated purge for a retention policy. */
export function executeRetentionPurge(policyId: string): Promise<ApiResponse<{ recordsPurged: number }>> {
  return post<ApiResponse<{ recordsPurged: number }>>(`/api/v1/compliance/retention-policies/${policyId}/execute`);
}

// ---------------------------------------------------------------------------
// PF-12: Compliance Request Processing — Execution & Audit
// ---------------------------------------------------------------------------

/** PF-12 Step 3: Approve a data request (requires Platform Admin for deletion; Super Admin retired Pass 24). */
export function approveDataRequest(id: string, notes?: string): Promise<ApiResponse<DataRequest>> {
  return post<ApiResponse<DataRequest>>(`/api/v1/compliance/data-requests/${id}/approve`, { notes });
}

/** PF-12 Step 3: Reject a data request with reason. */
export function rejectDataRequest(id: string, reason: string): Promise<ApiResponse<DataRequest>> {
  return post<ApiResponse<DataRequest>>(`/api/v1/compliance/data-requests/${id}/reject`, { reason });
}

/** PF-12 Step 4: Generate data export package for an approved Export request. */
export function generateExportPackage(requestId: string): Promise<ApiResponse<{ downloadUrl: string; sizeBytes: number }>> {
  return post<ApiResponse<{ downloadUrl: string; sizeBytes: number }>>(`/api/v1/compliance/data-requests/${requestId}/generate-export`);
}

/** PF-12 Step 4: Execute anonymization for an approved Deletion request. */
export function executeAnonymization(requestId: string): Promise<ApiResponse<{ anonymizedRecords: number; certificateUrl: string }>> {
  return post<ApiResponse<{ anonymizedRecords: number; certificateUrl: string }>>(`/api/v1/compliance/data-requests/${requestId}/execute-anonymization`);
}

/** PF-12 Step 5: Mark a data request as fulfilled (completed). */
export function fulfillDataRequest(requestId: string): Promise<ApiResponse<DataRequest>> {
  return post<ApiResponse<DataRequest>>(`/api/v1/compliance/data-requests/${requestId}/fulfill`);
}

/** PF-12 Step 5: Get requests approaching or past their compliance deadline. */
export function getDeadlineAlerts(): Promise<ApiResponse<readonly {
  readonly requestId: string;
  readonly merchantName: string;
  readonly type: string;
  readonly deadline: string;
  readonly daysRemaining: number;
  readonly status: string;
}[]>> {
  return get<ApiResponse<readonly {
    readonly requestId: string;
    readonly merchantName: string;
    readonly type: string;
    readonly deadline: string;
    readonly daysRemaining: number;
    readonly status: string;
  }[]>>('/api/v1/compliance/deadline-alerts');
}

/** PF-12 Step 6: Log an immutable audit event for a compliance action. */
export function logComplianceAuditEvent(data: {
  readonly requestId: string;
  readonly action: string;
  readonly performedBy: string;
  readonly details: string;
}): Promise<ApiResponse<{ eventId: string }>> {
  return post<ApiResponse<{ eventId: string }>>('/api/v1/compliance/audit-log', data);
}
