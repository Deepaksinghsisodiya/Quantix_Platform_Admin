import type { PlatformRole } from '@/lib/types';
import type { ModulePermission } from '@/types/permissions';

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

  // 2026-09-04 (user directive): everything except user / role administration.
  OperationsManager: {
    ...allModulesFull(),
    users: NONE,
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
// Role identity
// ---------------------------------------------------------------------------

/**
 * 2026-09-04: the API names a role three ways — the seed key (`operations_manager`), the
 * display name the JWT `role` claim and the user DTO carry ("Operations Manager"), and the
 * portal's own `PlatformRole` ('OperationsManager'). The dashboard switch, the merchant
 * redirects and the Admin check all compared raw strings, so a Finance Manager landed on
 * the Admin dashboard. Every spelling is folded to the portal's canonical value here.
 */
const ROLE_CANON: Readonly<Record<string, PlatformRole>> = {
  admin: 'Admin',
  operationsmanager: 'OperationsManager',
  financemanager: 'FinanceManager',
  contentmanager: 'ContentManager',
  operator: 'Operator',
  merchant: 'Merchant',
};

export function toPlatformRole(raw: string | null | undefined): PlatformRole | undefined {
  if (!raw) return undefined;
  return ROLE_CANON[raw.replace(/[\s_-]/g, '').toLowerCase()];
}

// ---------------------------------------------------------------------------
// Server permission codes → portal modules
// ---------------------------------------------------------------------------

/**
 * 2026-09-04: the JWT carries one server permission CODE per `permissions` claim
 * (`wallet.recharge`, `tickets.view`, …) while the sidebar, RoleGuard and usePermission
 * reason in portal MODULES (`billing`, `support`, …). Until now the raw code strings were
 * stored where module objects were expected, so every non-Admin staff login saw an empty
 * sidebar and "Access Denied" on every screen (Admin never noticed — it bypasses). This map
 * is the ONE place the translation lives. Keys are code prefixes, longest match wins; a
 * prefix may feed more than one module (CRM codes serve the helpdesk and the content desks).
 */
const CODE_PREFIX_TO_MODULES: Readonly<Record<string, readonly PermissionModule[]>> = {
  dashboard: ['dashboard'],
  merchants: ['merchants'],
  onboarding: ['merchants'],
  limits: ['merchants'],
  subscriptions: ['merchants'],
  token: ['tokens'],
  wallet: ['billing'],
  invoices: ['billing'],
  tax: ['billing'],
  billing: ['billing'],
  commission: ['commission'],
  tickets: ['support'],
  crm: ['support', 'content'],
  cms: ['content'],
  blog: ['content'],
  helpcentre: ['content'],
  faq: ['content'],
  settings: ['settings'],
  plans: ['settings'],
  features: ['settings'],
  reports: ['reports'],
  compliance: ['compliance'],
  logs: ['audit'],
  users: ['users'],
  downloads: ['downloads'],
};

/** Actions that only read. Anything else on a module is a mutation. */
const READ_ACTIONS = new Set(['view', 'statement', 'export', 'download', 'list']);
/** Actions that remove or end something. */
const DELETE_ACTIONS = new Set(['delete', 'deactivate', 'void', 'cancel', 'terminate', 'revoke', 'withdraw']);

export function modulesForCode(code: string): readonly PermissionModule[] {
  const parts = code.split('.');
  for (let n = parts.length - 1; n >= 1; n--) {
    const hit = CODE_PREFIX_TO_MODULES[parts.slice(0, n).join('.')];
    if (hit) return hit;
  }
  return [];
}

/** Module flags derived from the server's permission codes — the shape the guards consume. */
export function deriveModulePermissions(codes: readonly string[]): ModulePermission[] {
  const byModule = new Map<string, ModulePermission>();
  const grant = (module: string, action: string) => {
    const p = byModule.get(module) ?? { module, canView: false, canAdd: false, canEdit: false, canDelete: false };
    p.canView = true;
    if (!READ_ACTIONS.has(action)) {
      p.canAdd = true;
      p.canEdit = true;
      if (DELETE_ACTIONS.has(action)) p.canDelete = true;
    }
    byModule.set(module, p);
  };
  for (const code of codes) {
    if (!code) continue;
    if (code === '*') {
      for (const module of Object.keys(allModulesFull())) grant(module, 'admin');
      continue;
    }
    const action = code.slice(code.lastIndexOf('.') + 1);
    for (const module of modulesForCode(code)) grant(module, action);
  }
  return [...byModule.values()];
}

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
  // 2026-08-29 (user-locked rule): Admin bypasses every permission gate unconditionally —
  // UI and server alike. This also prevents a boot-time race where the permissions list
  // is briefly empty and Admin flashed "Access Denied" on permission-gated screens.
  if (role === 'Admin') return true;

  // Server-driven path: the codes are translated through the same map the guards use.
  // 2026-09-04: this used to test `${module}.${action}` literally, which only ever matched
  // the `merchants.*` family — `billing.view` is not a code the server issues.
  if (permissions && permissions.length > 0) {
    if (permissions.includes('*')) return true;
    const derived = deriveModulePermissions(permissions).find((p) => p.module === module);
    if (!derived) return false;
    switch (action) {
      case 'view': return derived.canView;
      case 'create': case 'add': return derived.canAdd;
      case 'edit': return derived.canEdit;
      case 'delete': return derived.canDelete;
      default: return false;
    }
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
