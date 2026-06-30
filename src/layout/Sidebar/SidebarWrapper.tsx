import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { usePermission } from '../../shared/hooks/usePermission';
import { Sidebar } from './Sidebar';
import { navGroups, NavItem } from './navConfig';

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const SidebarWrapper: React.FC<Props> = ({ mobileOpen, onClose, isCollapsed, onCollapseToggle }) => {
  const user = useAppSelector(selectCurrentUser);
  const { hasPermission, isAdmin } = usePermission();

  const canView = (item: NavItem) => !item.permission || hasPermission(item.permission, 'view');

  /**
   * Filters a single nav item by permission, recursing into children.
   * A parent with children (e.g. "Token Management") stays visible if it has its
   * own permission OR at least one accessible child — and only its accessible
   * children are kept.
   */
  const filterItem = (item: NavItem): NavItem | null => {
    if (!item.children?.length) {
      return canView(item) ? item : null;
    }

    const accessibleChildren = item.children
      .map((child) => filterItem(child))
      .filter((child): child is NavItem => child !== null);

    if (accessibleChildren.length === 0) return null;

    return { ...item, children: accessibleChildren };
  };

  const filteredGroups = navGroups
    .map((group) => {
      const accessibleItems = group.items
        .map((item) => filterItem(item))
        .filter((item): item is NavItem => item !== null);

      // A group is visible if it has at least one accessible item AND
      // (it's not admin-only OR user is Admin/HR OR they hold a specific permission on an item).
      const isVisible = accessibleItems.length > 0 && (
        !group.adminOnly ||
        isAdmin ||
        user?.roleName?.toLowerCase() === 'hr' ||
        accessibleItems.some((i) => !!i.permission)
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