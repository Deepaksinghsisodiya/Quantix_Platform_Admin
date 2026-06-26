/**
 * Platform-level user roles.
 *
 * 2026-05-18 (Pass 38): 5 staff roles locked.
 * 2026-05-24 (Pass 40): added 6th role `Merchant` for post-onboarding customer login.
 * Aligns with Tier-2 Foundation `PlatformRole` enum + Tier-2 `RoleSeedData`:
 *   - Admin              â€” top tier, every permission, grants overlay activities.
 *   - OperationsManager  â€” merchant lifecycle (onboard / deboard), tokens, plans.
 *   - FinanceManager     â€” wallet / invoice / commission / withdrawal / tax / billing.
 *   - ContentManager     â€” Public Website content + CRM (leads / contacts).
 *   - Operator           â€” helpdesk by default; Admin grants overlay activities per user.
 *   - Merchant           â€” scoped-down customer; sees only their own data via merchant_id claim.
 *
 * Dropped Pass 38: TokenManager (â†’ OperationsManager), ReadOnly (â†’ per-user activity grants),
 * SupportAgent (renamed Operator), PlatformAdmin (renamed Admin).
 */
export type PlatformRole =
  | 'Admin'
  | 'OperationsManager'
  | 'FinanceManager'
  | 'ContentManager'
  | 'Operator'
  | 'Merchant';

export type UserStatus = 'Active' | 'Inactive' | 'Locked';

/** A user of the Platform Admin Portal. */
export interface PlatformUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: PlatformRole;
  readonly department: string;
  readonly status: UserStatus;
  readonly lastLogin: string | null;
  readonly mfaEnabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly permissions: readonly UserPermission[];
  /** FRS-SAP-205: per-user IP allowlist (comma-separated CIDRs/IPs); null/empty = no restriction. */
  readonly ipAllowlist?: string | null;
  /** Pass 40 (2026-05-24): non-null for Merchant role; merchant's MerchantId from JWT claim. */
  readonly merchantId?: string | null;
  /** Pass 40 (2026-05-24): true on first login after OpsMgr-issued temp password.
   *  ProtectedRoute redirects to /change-password until cleared. */
  readonly mustChangePassword?: boolean;
}

/** Granular permission entry for platform users. */
export interface UserPermission {
  readonly id: string;
  readonly resource: string;
  readonly action: 'Read' | 'Write' | 'Delete' | 'Admin';
  readonly granted: boolean;
}

/** Payload for creating a new platform user. */
export interface CreateUserDto {
  readonly username?: string | null;
  readonly email?: string | null;
  readonly password?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly displayName?: string | null;
  readonly roleId: string;
  readonly department?: string | null;
  readonly merchantId?: string | null;
}

/** Payload for updating an existing platform user. */
export interface UpdateUserDto {
  readonly email?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly displayName?: string | null;
  readonly roleId: string;
  readonly isActive?: boolean;
  readonly department?: string | null;
  readonly ipAllowlist?: string | null;
}
