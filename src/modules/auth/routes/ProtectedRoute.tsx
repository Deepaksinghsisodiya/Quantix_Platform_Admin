import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  selectIsAuthenticated,
  selectMfaSetupRequired,
  selectMustChangePassword,
} from '../slices/authSlice';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mfaSetupRequired = useAppSelector(selectMfaSetupRequired);
  const mustChangePassword = useAppSelector(selectMustChangePassword);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (mfaSetupRequired) {
    return <Navigate to="/mfa-setup" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
