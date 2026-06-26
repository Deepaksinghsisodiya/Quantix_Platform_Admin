/**
 * Platform Users API module.
 */

import { get, post, put, del } from './client';
import type { ApiResponse } from '@/lib/types/common';
import type { ApiListResponse } from './types';
import type { PaginationParams } from '@/lib/types/common';
import type {
  PlatformUser,
  PlatformRole,
  CreateUserDto,
  UpdateUserDto,
} from '@/lib/types/user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserListParams extends PaginationParams {
  readonly search?: string;
  readonly role?: PlatformRole;
  readonly status?: 'Active' | 'Inactive' | 'Locked';
}

export interface UserActivity {
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly resource: string;
  readonly details: string;
  readonly ipAddress: string;
  readonly timestamp: string;
}

export interface RoleDefinition {
  readonly id: string;
  readonly name: PlatformRole;
  readonly description: string;
  readonly permissions: readonly string[];
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getUsers(params: UserListParams): Promise<ApiListResponse<PlatformUser>> {
  return get<ApiListResponse<PlatformUser>>('/api/v1/users', params as unknown as Record<string, string | number>);
}

export function getUser(id: string): Promise<ApiResponse<PlatformUser>> {
  return get<ApiResponse<PlatformUser>>(`/api/v1/users/${id}`);
}

export function createUser(data: CreateUserDto): Promise<ApiResponse<PlatformUser>> {
  return post<ApiResponse<PlatformUser>>('/api/v1/users', data);
}

export function updateUser(id: string, data: UpdateUserDto): Promise<ApiResponse<PlatformUser>> {
  return put<ApiResponse<PlatformUser>>(`/api/v1/users/${id}`, data);
}

export function deleteUser(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/users/${id}`);
}

export function getRoles(): Promise<ApiResponse<readonly RoleDefinition[]>> {
  return get<ApiResponse<readonly RoleDefinition[]>>('/api/v1/users/roles');
}

export function getUserActivity(id: string): Promise<ApiResponse<readonly UserActivity[]>> {
  return get<ApiResponse<readonly UserActivity[]>>(`/api/v1/users/${id}/activity`);
}

// ---------------------------------------------------------------------------
// FRS-SAP-205: Session Security
// ---------------------------------------------------------------------------

/**
 * FRS-SAP-205: shape mirrors server-side `SessionDto` 1:1 (camelCase via
 * System.Text.Json default policy). Pre-2026-05-07 the SPA had invented
 * `browser`, `os`, `location`, `isCurrent` fields the server never produced.
 * UserAgent (raw) is what's stored; the page parses browser+os for display.
 */
export interface ActiveSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly username: string;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly lastActivityAt: string | null;
  readonly isRevoked: boolean;
}

/**
 * FRS-SAP-205: roll-up of platform-wide session security settings.
 * Mirrors the server-side `SessionPolicyDto`.
 *
 * Note: per-user IP allowlist is on the user-detail page (UserDto.ipAllowlist),
 * not on this object. This rollup only carries the global toggles.
 */
export interface SessionPolicy {
  readonly timeoutMinutes: number;
  readonly maxConcurrentSessions: number;
  readonly forceLogoutOnPasswordChange: boolean;
}

export function getActiveSessions(): Promise<ApiResponse<readonly ActiveSession[]>> {
  return get<ApiResponse<readonly ActiveSession[]>>('/api/v1/sessions');
}

export function terminateSession(sessionId: string): Promise<ApiResponse<{ terminated: boolean }>> {
  return del<ApiResponse<{ terminated: boolean }>>(`/api/v1/sessions/${sessionId}`);
}

export function terminateAllSessionsForUser(userId: string): Promise<ApiResponse<{ terminated: boolean }>> {
  return del<ApiResponse<{ terminated: boolean }>>(`/api/v1/sessions/user/${userId}`);
}

export function getSessionPolicy(): Promise<ApiResponse<SessionPolicy>> {
  return get<ApiResponse<SessionPolicy>>('/api/v1/sessions/policy');
}

export function updateSessionPolicy(policy: SessionPolicy): Promise<ApiResponse<SessionPolicy>> {
  return put<ApiResponse<SessionPolicy>>('/api/v1/sessions/policy', policy);
}
