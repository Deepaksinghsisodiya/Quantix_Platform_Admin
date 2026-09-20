import type { PlatformUser, PlatformRole, UserStatus, UserPermission, CreateUserDto, UpdateUserDto } from '@/lib/types/user';
import type { ActiveSession, SessionPolicy, UserActivity } from '@/lib/api/users';

export type {
  PlatformUser,
  PlatformRole,
  UserStatus,
  UserPermission,
  CreateUserDto,
  UpdateUserDto,
  ActiveSession,
  SessionPolicy,
  UserActivity
};

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

// 2026-08-11: additive per-user permission grants (Admin-only management).
export interface PermissionCatalogItem {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  category: string;
}

export interface UserGrants {
  rolePermissions: string[];
  extraGrants: string[];
}

/** Seeded role ids — single source for the role picker (was copy-pasted in Add + Edit wrappers). */
export const ROLE_ID_MAP: Record<string, string> = {
  Admin: '30000003-0000-0000-0000-000000000002',
  Operator: '30000003-0000-0000-0000-000000000003',
  FinanceManager: '30000003-0000-0000-0000-000000000004',
  ContentManager: '30000003-0000-0000-0000-000000000007',
  OperationsManager: '30000003-0000-0000-0000-000000000008',
  Merchant: '30000003-0000-0000-0000-000000000009',
};
