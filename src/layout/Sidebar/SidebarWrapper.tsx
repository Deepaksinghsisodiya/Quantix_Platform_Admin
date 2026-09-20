import React, { useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser, selectPermissionCodes } from '../../modules/auth/slices/authSlice';
import { usePermission } from '../../shared/hooks/usePermission';
import { Sidebar } from './Sidebar';
import { navItems, NavItem } from './navConfig';

interface SidebarWrapperProps {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({
  mobileOpen,
  onClose,
  isCollapsed,
  onCollapseToggle,
}) => {
  const user = useAppSelector(selectCurrentUser);
  const permissionCodes = useAppSelector(selectPermissionCodes);

  const { hasPermission, isAdmin } = usePermission();

  const filteredItems = useMemo(() => {
    const filterNavigation = (items: NavItem[]): NavItem[] => {
      return items.reduce<NavItem[]>((result, item) => {
        // 2026-09-04: module view + (optionally) any of the entry's specific codes; Admin
        // bypasses both. The old `adminOnly` / stray `hr` role check is gone.
        const hasAccess =
          isAdmin ||
          ((!item.permission || hasPermission(item.permission, 'view')) &&
            (!item.codes || item.codes.some((code) => permissionCodes.includes(code))));

        if (!hasAccess) {
          return result;
        }

        if (!item.children?.length) {
          result.push(item);
          return result;
        }

        const children = filterNavigation(item.children);

        if (children.length > 0) {
          result.push({
            ...item,
            children,
          });
        }

        return result;
      }, []);
    };

    return filterNavigation(navItems);
  }, [user?.roleName, hasPermission, isAdmin, permissionCodes]);

  return (
    <Sidebar
      items={filteredItems}
      mobileOpen={mobileOpen}
      onClose={onClose}
      isCollapsed={isCollapsed}
      onCollapseToggle={onCollapseToggle}
    />
  );
};

export default SidebarWrapper;