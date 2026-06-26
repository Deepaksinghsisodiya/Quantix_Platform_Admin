import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectPermissions, selectIsAdmin, selectCurrentUser } from '@/modules/auth/slices/authSlice';
import { PermissionAction } from '@/types/permissions';

/**
 * Custom hook to manage and check user permissions across the application.
 * Supports granular module-based checks and automatic Admin bypass.
 */
export const usePermission = () => {
  const permissions = useSelector(selectPermissions);
  const isAdminUser = useSelector(selectIsAdmin);
  const currentUser = useSelector(selectCurrentUser);
  const isClientUser = currentUser?.roleName?.toLowerCase() === 'client';

  /**
   * Checks if the user has a specific permission for a module.
   */
  const hasPermission = useCallback(
    (module: string, action: PermissionAction): boolean => {
      // Admin bypass: Administrators have all permissions by default.
      if (isAdminUser) return true;

      // Client bypass: Client role has full access to Tickets and Projects
      if (isClientUser) {
        const clientModules = ['tickets', 'projects'];
        if (clientModules.includes(module.toLowerCase())) {
          return true;
        }
      }

      const modPerm = permissions.find(
        (p) => p.module.toLowerCase() === module.toLowerCase()
      );

      if (!modPerm) return false;

      switch (action) {
        case 'view': return modPerm.canView;
        case 'add': return modPerm.canAdd;
        case 'edit': return modPerm.canEdit;
        case 'delete': return modPerm.canDelete;
        default: return false;
      }
    },
    [permissions, isAdminUser, isClientUser]
  );

  /** Shorthand for 'view' permission. */
  const canAccess = useCallback((module: string) => hasPermission(module, 'view'), [hasPermission]);
  
  /** Shorthand for 'add' permission. */
  const canAdd = useCallback((module: string) => hasPermission(module, 'add'), [hasPermission]);
  
  /** Shorthand for 'edit' permission. */
  const canEdit = useCallback((module: string) => hasPermission(module, 'edit'), [hasPermission]);
  
  /** Shorthand for 'delete' permission. */
  const canDelete = useCallback((module: string) => hasPermission(module, 'delete'), [hasPermission]);

  return {
    hasPermission,
    canAccess,
    canAdd,
    canEdit,
    canDelete,
    isAdmin: isAdminUser,
  };
};
