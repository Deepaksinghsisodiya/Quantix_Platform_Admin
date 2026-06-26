import type { PlatformRole } from '@/lib/types';

// ---------------------------------------------------------------------------
// Module & action types
// ---------------------------------------------------------------------------

export type PermissionModule =
  | 'dashboard'
  | 'merchants'
  | 'billing'
  | 'tokens'
  | 'commission'
  | 'support'
  | 'content'
  | 'settings'
  | 'reports'
  | 'compliance'
  | 'audit'
  | 'users'
  | 'downloads';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'admin';

// ---------------------------------------------------------------------------
// Role permission map
// ---------------------------------------------------------------------------

type RolePermissionMap = Record<PlatformRole, Record<PermissionModule, readonly PermissionAction[]>>;

const ALL_ACTIONS: readonly PermissionAction[] = ['view', 'create', 'edit', 'delete', 'admin'] as const;
const CRUD: readonly PermissionAction[] = ['view', 'create', 'edit', 'delete'] as const;
const VIEW_ONLY: readonly PermissionAction[] = ['view'] as const;
const NONE: readonly PermissionAction[] = [] as const;

const allModulesFull = (): Record<PermissionModule, readonly PermissionAction[]> => ({
  dashboard: ALL_ACTIONS,
  merchants: ALL_ACTIONS,
  billing: ALL_ACTIONS,
  tokens: ALL_ACTIONS,
  commission: ALL_ACTIONS,
  support: ALL_ACTIONS,
  content: ALL_ACTIONS,
  settings: ALL_ACTIONS,
  reports: ALL_ACTIONS,
  compliance: ALL_ACTIONS,
  audit: ALL_ACTIONS,
  users: ALL_ACTIONS,
  downloads: ALL_ACTIONS,
});

// 2026-05-18 (Pass 38): role matrix realigned to the locked 5-role model.
// Server-issued permission codes remain the authoritative gate; this matrix is the
// pre-migration fallback for callers that haven't switched to canAccess(permissions) yet.
export const ROLE_PERMISSIONS: RolePermissionMap = {
  Admin: allModulesFull(),

  OperationsManager: {
    dashboard: VIEW_ONLY,
    merchants: ALL_ACTIONS,        // lifecycle: onboard / deboard / suspend / reactivate / terminate
    billing: VIEW_ONLY,
    tokens: ALL_ACTIONS,           // token activities folded in from retired token_manager role
    commission: VIEW_ONLY,
    support: NONE,
    content: NONE,
    settings: VIEW_ONLY,
    reports: ['view', 'create'],
    compliance: CRUD,
    audit: VIEW_ONLY,
    users: NONE,
    downloads: VIEW_ONLY,
  },

  FinanceManager: {
    dashboard: VIEW_ONLY,
    merchants: VIEW_ONLY,
    billing: CRUD,                 // wallet / invoice / commission / tax / cadence
    tokens: VIEW_ONLY,
    commission: CRUD,
    support: NONE,
    content: NONE,
    settings: NONE,
    reports: ['view', 'create'],
    compliance: VIEW_ONLY,
    audit: VIEW_ONLY,
    users: NONE,
    downloads: VIEW_ONLY,
  },

  ContentManager: {
    dashboard: VIEW_ONLY,
    merchants: NONE,
    billing: NONE,
    tokens: NONE,
    commission: NONE,
    support: NONE,
    content: CRUD,                 // pages / blog / FAQ / help + CRM (leads / contacts)
    settings: NONE,
    reports: NONE,
    compliance: NONE,
    audit: NONE,
    users: NONE,
    downloads: NONE,
  },

  Operator: {
    dashboard: VIEW_ONLY,
    merchants: NONE,
    billing: NONE,
    tokens: NONE,
    commission: NONE,
    support: CRUD,                 // helpdesk tickets only
    content: NONE,
    settings: NONE,
    reports: NONE,
    compliance: NONE,
    audit: NONE,
    users: NONE,
    downloads: NONE,
  },

  // Pass 40 (2026-05-24): Merchant role is scoped to /merchant/* via MerchantGuard. None of
  // the staff-side modules are visible to a Merchant; permissions here are NONE across the
  // board so even if a stray staff route is reached the access-denied screen renders.
  Merchant: {
    dashboard: NONE,
    merchants: NONE,
    billing: NONE,
    tokens: NONE,
    commission: NONE,
    support: NONE,
    content: NONE,
    settings: NONE,
    reports: NONE,
    compliance: NONE,
    audit: NONE,
    users: NONE,
    downloads: NONE,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether the given role / server-issued permission set is allowed to perform `action`
 * on `module`.
 *
 * Round_16 Pass 4 audit C-5: prefer the server's permission codes (e.g. `merchants.view`,
 * `token.generate`) when present. The hardcoded `ROLE_PERMISSIONS` matrix above is now a
 * fallback for callers that haven't been migrated yet (e.g. tests, legacy hooks). The
 * server-issued list is authoritative for production paths.
 */
export function canAccess(
  role: PlatformRole,
  module: string,
  action: string,
  permissions?: readonly string[],
): boolean {
  // Server-driven path: check the user's permissions claim first.
  if (permissions && permissions.length > 0) {
    // Wildcard (debug / future top-tier sentinel): always allow.
    if (permissions.includes('*')) return true;
    // Direct permission match: e.g. `merchants.view` or `merchants.admin`.
    if (permissions.includes(`${module}.${action}`)) return true;
    if (permissions.includes(`${module}.admin`)) return true;
    // No matching server permission → deny.
    return false;
  }

  // Legacy fallback: hardcoded ROLE_PERMISSIONS matrix (kept for tests / pre-migration code).
  const modulePerms = ROLE_PERMISSIONS[role]?.[module as PermissionModule];
  if (!modulePerms) return false;
  return modulePerms.includes(action as PermissionAction);
}

/**
 * Return the list of modules the given role has at least `view` access to.
 */
export function getAccessibleModules(role: PlatformRole): string[] {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return [];
  return (Object.keys(perms) as PermissionModule[]).filter(
    (mod) => perms[mod].length > 0,
  );
}
