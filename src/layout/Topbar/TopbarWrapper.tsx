import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { useLogoutMutation } from '../../modules/auth/services/authApi';
import { Topbar } from './Topbar';
import ChangePasswordModal from '../../modules/auth/components/ChangePasswordModal';

interface Props {
  onMenuToggle: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const TopbarWrapper: React.FC<Props> = ({ onMenuToggle, isCollapsed, onCollapseToggle }) => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      dispatch(logout());
      navigate('/login');
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
      />
      
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </>
  );
};
