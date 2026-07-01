import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { usePermission } from '../../shared/hooks/usePermission';
import { Sidebar } from './Sidebar';
import { navItems, NavItem } from './navConfig';

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const SidebarWrapper: React.FC<Props> = ({ mobileOpen, onClose, isCollapsed, onCollapseToggle }) => {
  const user = useAppSelector(selectCurrentUser);
  const { hasPermission, isAdmin } = usePermission();

  const filterItem = (item: NavItem): NavItem | null => {
    const hasItemPermission = !item.permission || hasPermission(item.permission, 'view');
    const isItemVisible = hasItemPermission && (
      !item.adminOnly ||
      isAdmin ||
      user?.roleName?.toLowerCase() === 'hr'
    );

    if (!item.children?.length) {
      return isItemVisible ? item : null;
    }

    const accessibleChildren = item.children
      .map((child) => filterItem(child))
      .filter((child): child is NavItem => child !== null);

    if (accessibleChildren.length === 0) return null;

    return { ...item, children: accessibleChildren };
  };

  const filteredItems = navItems
    .map((item) => filterItem(item))
    .filter((item): item is NavItem => item !== null);

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