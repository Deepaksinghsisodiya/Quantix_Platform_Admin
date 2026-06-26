import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { usePermission } from '../../shared/hooks/usePermission';
import { Sidebar } from './Sidebar';
import { navGroups } from './navConfig';

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const SidebarWrapper: React.FC<Props> = ({ mobileOpen, onClose, isCollapsed, onCollapseToggle }) => {
  const user = useAppSelector(selectCurrentUser);
  const { hasPermission, isAdmin } = usePermission();

  const filteredGroups = navGroups
    .map(group => {
      // Filter items within the group based on permissions
      const accessibleItems = group.items.filter(item => 
        !item.permission || hasPermission(item.permission, 'view')
      );

      // A group is visible if:
      // 1. It has at least one accessible item AND
      // 2. (It's not admin-only OR user is Admin OR user is HR)
      // Note: If a user has specific permission to an item in an admin-only group, 
      // but is NOT Admin/HR, they still won't see the group unless we change this.
      // For now, let's allow it if they have specific permissions.
      const isVisible = accessibleItems.length > 0 && (
        !group.adminOnly || 
        isAdmin || 
        user?.roleName?.toLowerCase() === 'hr' || 
        accessibleItems.some(i => !!i.permission)
      );

      return isVisible ? { ...group, items: accessibleItems } : null;
    })
    .filter((g): g is typeof navGroups[0] => g !== null);

  return (
    <Sidebar 
      groups={filteredGroups} 
      mobileOpen={mobileOpen} 
      onClose={onClose} 
      isCollapsed={isCollapsed}
      onCollapseToggle={onCollapseToggle}
    />
  );
};
