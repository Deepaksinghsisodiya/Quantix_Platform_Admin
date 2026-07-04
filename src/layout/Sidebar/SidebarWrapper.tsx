import React, { useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../modules/auth/slices/authSlice';
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

  const { hasPermission, isAdmin } = usePermission();

  const filteredItems = useMemo(() => {
    const filterNavigation = (items: NavItem[]): NavItem[] => {
      return items.reduce<NavItem[]>((result, item) => {
        const hasAccess =
          (!item.permission || hasPermission(item.permission, 'view')) &&
          (!item.adminOnly ||
            isAdmin ||
            user?.roleName?.toLowerCase() === 'hr');

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
  }, [user?.roleName, hasPermission, isAdmin]);

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