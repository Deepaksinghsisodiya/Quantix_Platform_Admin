/**
 * Merchants API module.
 */

import { get, post, put, del } from './client';
import type { ApiResponse, PaginationParams, MerchantType, BusinessType } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type { Merchant, MerchantNote } from '@/lib/types/merchant';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MerchantListParams extends PaginationParams {
  readonly search?: string;
  readonly merchantType?: MerchantType;
  readonly businessNature?: BusinessType;
  readonly status?: string;
  readonly country?: string;
  readonly plan?: string;
  readonly tier?: string;
}

export interface MerchantUpdateDto {
  readonly businessName?: string;
  readonly contactPerson?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly country?: string;
  readonly plan?: string;
  readonly tier?: string;
  readonly tags?: readonly string[];
}

export interface MerchantNoteCreate {
  readonly content: string;
}

export interface MerchantTimelineEntry {
  readonly id: string;
  readonly merchantId: string;
  readonly event: string;
  readonly description: string;
  readonly performedBy: string;
  readonly timestamp: string;
  readonly metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getMerchants(params: MerchantListParams): Promise<ApiListResponse<Merchant>> {
  return get<ApiListResponse<Merchant>>('/api/v1/merchants', params as unknown as Record<string, string | number>);
}

export function getMerchant(id: string): Promise<ApiResponse<Merchant>> {
  return get<ApiResponse<Merchant>>(`/api/v1/merchants/${id}`);
}

export function updateMerchant(id: string, data: MerchantUpdateDto): Promise<ApiResponse<Merchant>> {
  return put<ApiResponse<Merchant>>(`/api/v1/merchants/${id}`, data);
}

export function activateMerchant(id: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/activate`);
}

export function suspendMerchant(id: string, reason: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/suspend`, { reason });
}

export function reactivateMerchant(id: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/reactivate`);
}

export function cancelMerchant(id: string, reason: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/cancel`, { reason });
}

/** FRS-SAP-404: Reactivate with resolution reason (FRS-SAP-405). */
export function reactivateMerchantWithResolution(
  id: string,
  resolution: string,
): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/reactivate`, { resolution });
}

/** Compliance-only: Delete a Cancelled merchant after 90-day retention (FRS-SAP-1003). */
export function deleteMerchant(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/merchants/${id}`);
}

/** Enterprise only: Retry provisioning for a Failed merchant. */
export function retryProvisioning(id: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/retry-provisioning`);
}

/**
 * FRS-SAP-408 (Pass 26 fixup): the server streams the export bytes inline as
 * `application/json` (with `X-Quantix-Export-Sha256` integrity header). The
 * pre-Pass-26 type pretended this was a `{ downloadUrl }` two-step async
 * download — wrong. The real shape: the response body IS the export. Browsers
 * can pipe straight to a Blob; the SPA detail page dispatches via the fetch
 * primitive directly when it needs the bytes.
 *
 * The `unknown` return is intentional — the parsed JSON envelope is the export
 * payload, but its inner shape varies per merchant (11 platform tables aggregated).
 * Callers that only need the integrity-stamped envelope can ignore `data`.
 */
export function exportMerchantData(id: string): Promise<ApiResponse<unknown>> {
  return post<ApiResponse<unknown>>(`/api/v1/merchants/${id}/export`);
}

export function getMerchantNotes(id: string): Promise<ApiResponse<readonly MerchantNote[]>> {
  return get<ApiResponse<readonly MerchantNote[]>>(`/api/v1/merchants/${id}/notes`);
}

export function addMerchantNote(id: string, data: MerchantNoteCreate): Promise<ApiResponse<MerchantNote>> {
  return post<ApiResponse<MerchantNote>>(`/api/v1/merchants/${id}/notes`, data);
}

export function getMerchantTimeline(id: string): Promise<ApiResponse<readonly MerchantTimelineEntry[]>> {
  return get<ApiResponse<readonly MerchantTimelineEntry[]>>(`/api/v1/merchants/${id}/timeline`);
}

// ---------------------------------------------------------------------------
// FRS-SAP-406: Plan/Tier Change
// ---------------------------------------------------------------------------

export function changePlan(id: string, newPlan: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/change-plan`, { plan: newPlan });
}

export function changeTier(id: string, newTier: string): Promise<ApiResponse<Merchant>> {
  return post<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/change-tier`, { tier: newTier });
}

// ---------------------------------------------------------------------------
// FRS-SAP-409: Tag Management
// ---------------------------------------------------------------------------

export function addMerchantTag(id: string, tags: string[]): Promise<ApiResponse<Merchant>> {
  return put<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/tags`, { tags });
}

export function removeMerchantTag(id: string, tags: string[]): Promise<ApiResponse<Merchant>> {
  return put<ApiResponse<Merchant>>(`/api/v1/merchants/${id}/tags`, { tags });
}

// ---------------------------------------------------------------------------
// FRS-SAP-410: Impersonation (Enterprise only)
// ---------------------------------------------------------------------------

export function impersonateMerchant(id: string): Promise<ApiResponse<{ sessionUrl: string; expiresAt: string }>> {
  return post<ApiResponse<{ sessionUrl: string; expiresAt: string }>>(`/api/v1/merchants/${id}/impersonate`);
}
