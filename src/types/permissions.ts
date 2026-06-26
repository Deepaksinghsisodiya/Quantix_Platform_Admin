/**
 * Represents the available actions a user can perform on a module.
 */
export type PermissionAction = 'view' | 'add' | 'edit' | 'delete';

export const MODULES = {
  ATTENDANCE: 'Attendance',
  PROJECTS: 'Projects',
  USERS: 'Users',
  PAYROLL: 'Payroll',
  REPORTS: 'Reports',
  LEAVES: 'Leaves',
  SHIFTS: 'Shifts',
  DEPARTMENTS: 'Departments',
  ROLES: 'Roles',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings'
} as const;

/**
 * Represents the granular permissions for a single system module.
 */
export interface ModulePermission {
  module: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Represents the essential user claims extracted from the JWT.
 */
export interface UserClaims {
  sub: string;
  email: string;
  role: string;
  roleId: string;
}

/**
 * The root authentication state structure for Redux.
 */
export interface AuthState {
  accessToken: string | null;
  user: UserClaims | null;
  permissions: ModulePermission[];
  roleVersion: number;
  isAuthenticated: boolean;
}
