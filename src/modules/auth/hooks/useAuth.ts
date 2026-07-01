import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectPermissions,
  selectMfaSetupRequired,
  selectMustChangePassword,
  selectIsAdmin,
  logout as logoutAction,
  setCredentials,
} from '../slices/authSlice';
import { useLogoutMutation } from '../services/authApi';
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
      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  }, [logoutMutation, dispatch, navigate]);

  const completeLogin = useCallback((payload: {
    user: any;
    accessToken: string;
    mfaSetupRequired?: boolean;
    mustChangePassword?: boolean;
  }) => {
    dispatch(setCredentials(payload));
  }, [dispatch]);

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
    completeLogin,
    role: userRole,
    isAdmin,
    isMerchant: normalizedRole === 'merchant',
    isSuperAdmin: normalizedRole === 'superadmin',
    isOpsManager: normalizedRole === 'opsmanager',
    isSupport: normalizedRole === 'support' || normalizedRole === 'helpdesk',
  };
};

export default useAuth;
