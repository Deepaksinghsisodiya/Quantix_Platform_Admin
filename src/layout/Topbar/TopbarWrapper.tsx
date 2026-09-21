import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { useLogoutMutation } from '../../modules/auth/services/authApi';
import { Topbar } from './Topbar';
import ChangePasswordModal from '../../modules/auth/components/ChangePasswordModal';
import type { NavItem } from '../Sidebar/navConfig';

interface Props {
  onMenuToggle: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  /** Navigation source for the ⌘K search walk. Defaults to the staff navConfig. */
  items?: NavItem[];
  /** Identity overrides (merchant portal shows the merchant, not the auth user). */
  identity?: { name?: string | null; role?: string | null; avatar?: string | null };
  /** Where the Profile menu item navigates. Default "/profile". */
  profilePath?: string;
  /** Show the notifications bell. Defaults to true; merchant portal hides it. */
  showNotificationBell?: boolean;
}

export const TopbarWrapper: React.FC<Props> = ({
  onMenuToggle,
  isCollapsed,
  onCollapseToggle,
  items,
  identity,
  profilePath,
  showNotificationBell = true,
}) => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      const role = user?.roleName || user?.role;
      dispatch(logout());
      navigate(role === 'Merchant' ? '/merchant/login' : '/login', { replace: true });
    }
  };

  return (
    <>
      <Topbar
        user={user}
        isCollapsed={isCollapsed}
        onCollapseToggle={onCollapseToggle}
        onLogout={handleLogout}
        onMenuToggle={onMenuToggle}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        items={items}
        identity={identity}
        profilePath={profilePath}
        showNotificationBell={showNotificationBell}
      />
      
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </>
  );
};
