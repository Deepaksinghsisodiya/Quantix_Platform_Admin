import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectPermissions,
  selectMfaSetupRequired,
  selectMustChangePassword,
  selectIsAdmin,
  logout as logoutAction,
} from '../../modules/auth/slices/authSlice';
import { useLogoutMutation } from '../../modules/auth/services/authApi';
import { toast } from 'sonner';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const permissions = useAppSelector(selectPermissions);
  const mfaSetupRequired = useAppSelector(selectMfaSetupRequired);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [logoutMutation] = useLogoutMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      // Clear token and user from localStorage as done in LoginFormWrapper
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_must_change_password');
      localStorage.removeItem('auth_mfa_setup_required');

      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  }, [logoutMutation, dispatch, navigate]);

  const userRole = user?.roleName || user?.role || '';
  const normalizedRole = userRole.toLowerCase();

  return {
    user,
    isAuthenticated,
    isLoading,
    permissions,
    mfaSetupRequired,
    mustChangePassword,
    logout,
    role: userRole,
    isAdmin,
    isMerchant: normalizedRole === 'merchant',
    isSuperAdmin: normalizedRole === 'superadmin',
    isOpsManager: normalizedRole === 'opsmanager',
    isSupport: normalizedRole === 'support' || normalizedRole === 'helpdesk',
  };
};

export default useAuth;
