/**
 * Authentication API module — PF-14.
 */

import { get, post } from './client';
import type { ApiResponse } from '@/lib/types/common';
import type { PlatformUser } from '@/lib/types/user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginResponse {
  /** JWT bearer token. */
  readonly token: string;
  /** Token expiry timestamp (ISO 8601). */
  readonly expiresAt: string;
  /** Whether MFA verification is required before full access. */
  readonly mfaRequired: boolean;
  /** Temporary MFA challenge token (only if mfaRequired=true). */
  readonly mfaChallengeToken: string | null;
  /**
   * FRS-SAP-204: True when login succeeded but the user has never set up MFA.
   * The SPA must redirect to /mfa-setup; protected routes are blocked until
   * the user completes EnableMfaAsync. The token IS issued so /auth/mfa/setup
   * + /auth/mfa/enable can be called.
   */
  readonly mfaSetupRequired: boolean;
  /**
   * Pass 40 (2026-05-24): True on first login after OpsMgr-issued temp password.
   * ProtectedRoute redirects to /change-password and blocks all other routes
   * until the user rotates their password.
   */
  readonly mustChangePassword: boolean;
  /** Server-issued permission codes for the JWT bearer. */
  readonly permissions: readonly string[];
  readonly user: PlatformUser;
}

export interface MfaVerifyResponse {
  /** Final JWT after successful MFA verification. */
  readonly token: string;
  readonly expiresAt: string;
  readonly user: PlatformUser;
}

export interface TokenValidationResponse {
  readonly valid: boolean;
  readonly user: PlatformUser;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * Step 2: Authenticate with identifier (email OR username) + password. Returns MFA
 * challenge if required. QA-DEF-2026-001 (Round 19): the backend DTO field is `username`
 * but accepts either an email address or a plain username — `AuthenticateAsync` looks
 * up `PlatformUser.Username` and `PlatformUser.Email` both. The `identifier` parameter
 * is whatever the operator typed.
 */
export function login(identifier: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return post<ApiResponse<LoginResponse>>('/api/v1/auth/login', { username: identifier, password });
}

/** Step 3: Verify TOTP code for MFA challenge (FRS-SAP-204). */
export function verifyMfa(mfaChallengeToken: string, totpCode: string): Promise<ApiResponse<MfaVerifyResponse>> {
  return post<ApiResponse<MfaVerifyResponse>>('/api/v1/auth/mfa/verify', {
    challengeToken: mfaChallengeToken,
    code: totpCode,
  });
}

/** Token validation — check if stored JWT is still valid. */
export function validateToken(): Promise<ApiResponse<TokenValidationResponse>> {
  return get<ApiResponse<TokenValidationResponse>>('/api/v1/auth/me');
}

/** Step 5: Server-side logout — invalidates the JWT on the server. */
export function logout(): Promise<ApiResponse<{ loggedOut: boolean }>> {
  return post<ApiResponse<{ loggedOut: boolean }>>('/api/v1/auth/logout');
}

/** Step 7: Log an action to the immutable audit trail (FRS-SAP-206). */
export function logAuditEvent(data: {
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly details: string;
}): Promise<ApiResponse<{ eventId: string }>> {
  return post<ApiResponse<{ eventId: string }>>('/api/v1/audit', data);
}

// ---------------------------------------------------------------------------
// Round_16 Pass 5 audit C-4: real MFA setup/enable/disable endpoints. Backend implementation
// landed in Pass 4 (`PlatformUserService.SetupMfaAsync` / `EnableMfaAsync`) using RFC 6238 TOTP.
// ---------------------------------------------------------------------------

export interface MfaSetupResponse {
  /** Base32-encoded TOTP secret. Persisted on the user; raw value also returned for QR display. */
  readonly secret: string;
  /** otpauth:// URI for QR encoding. */
  readonly qrCodeUri: string;
  /** Backup codes — returned ONCE at setup time. Server stores hashes only. */
  readonly backupCodes: readonly string[];
}

/** GET /api/v1/auth/mfa/setup — issues a fresh secret + backup codes (one-time response). */
export function setupMfa(): Promise<ApiResponse<MfaSetupResponse>> {
  return get<ApiResponse<MfaSetupResponse>>('/api/v1/auth/mfa/setup');
}

/** POST /api/v1/auth/mfa/enable — verifies the TOTP code and enables MFA on the user. */
export function enableMfa(totpCode: string): Promise<ApiResponse<string>> {
  return post<ApiResponse<string>>('/api/v1/auth/mfa/enable', { totpCode });
}

/** POST /api/v1/auth/mfa/disable — disables MFA after re-authenticating with the user's password. */
export function disableMfa(currentPassword: string): Promise<ApiResponse<string>> {
  return post<ApiResponse<string>>('/api/v1/auth/mfa/disable', { currentPassword });
}

/** Get session info (timeout config, active sessions). */
export function getSessionInfo(): Promise<ApiResponse<{
  readonly sessionTimeoutMinutes: number;
  readonly maxConcurrentSessions: number;
  readonly activeSessions: number;
}>> {
  return get<ApiResponse<{
    readonly sessionTimeoutMinutes: number;
    readonly maxConcurrentSessions: number;
    readonly activeSessions: number;
  }>>('/api/v1/sessions');
}
