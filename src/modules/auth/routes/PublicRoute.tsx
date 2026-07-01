import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  selectIsAuthenticated,
  selectMfaSetupRequired,
  selectMustChangePassword,
  selectCurrentUser,
} from '../slices/authSlice';

export const PublicRoute: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mfaSetupRequired = useAppSelector(selectMfaSetupRequired);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const user = useAppSelector(selectCurrentUser);

  if (isAuthenticated) {
    if (mustChangePassword) {
      return <Navigate to="/change-password" replace />;
    }
    if (mfaSetupRequired) {
      return <Navigate to="/mfa-setup" replace />;
    }
    const role = user?.roleName || user?.role;
    const target = role === 'Merchant' ? '/merchant/dashboard' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
