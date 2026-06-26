import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsInitialized } from '@/modules/auth/slices/authSlice';
import { usePermission } from '@/shared/hooks/usePermission';
import { PermissionAction } from '@/types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
  action?: PermissionAction;
}

/**
 * Guard component that protects routes based on authentication and granular permissions.
 * If the user is not authenticated, redirects to /login.
 * If the user lacks the required module permission, redirects to /unauthorized.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  module, 
  action = 'view' 
}) => {
  const isInitialized = useSelector(selectIsInitialized);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { hasPermission } = usePermission();
  const location = useLocation();

  // Show nothing or a global loader while the auth state is being determined
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific module check is requested, verify permissions
  if (module && !hasPermission(module, action)) {
    // Administrators always pass the check via usePermission internal logic
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
