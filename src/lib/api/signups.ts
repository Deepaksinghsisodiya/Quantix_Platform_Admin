/**
 * Signups API module — signup queue management with manual intervention.
 */

import { get, post } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignupEntry {
  readonly id: string;
  readonly businessName: string;
  readonly contactPerson: string;
  readonly email: string;
  readonly phone: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly businessNature: 'Restaurant' | 'Retail' | 'Both';
  readonly status: 'Pending' | 'Verified' | 'Provisioning' | 'Failed' | 'Completed' | 'Intervened';
  readonly step: string;
  readonly error: string | null;
  readonly submittedAt: string;
  readonly completedAt: string | null;
  readonly interventionNote: string | null;
}

export interface SignupListParams extends PaginationParams {
  readonly search?: string;
  readonly status?: string;
  readonly merchantType?: string;
  readonly submittedFrom?: string;
  readonly submittedTo?: string;
}

export type SignupAction = 'approve' | 'reject' | 'retry' | 'escalate';

export interface SignupIntervention {
  readonly action: SignupAction;
  readonly note: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getSignupQueue(params: SignupListParams): Promise<ApiListResponse<SignupEntry>> {
  return get<ApiListResponse<SignupEntry>>('/api/v1/signups', params as unknown as Record<string, string | number>);
}

export function getSignup(id: string): Promise<ApiResponse<SignupEntry>> {
  return get<ApiResponse<SignupEntry>>(`/api/v1/signups/${id}`);
}

export function interveneSignup(id: string, data: SignupIntervention): Promise<ApiResponse<SignupEntry>> {
  return post<ApiResponse<SignupEntry>>(`/api/v1/signups/${id}/intervene`, data);
}
