import { useSelector, useDispatch } from 'react-redux';
import { store } from '@/app/store';
import * as actions from '@/modules/auth/slices/authSlice';
import { canAccess } from '@/lib/utils/permissions';
import type { PlatformRole } from '@/lib/types';

/**
 * Persisted key for token storage.
 */
export const AUTH_STORAGE_KEY = 'quantix-platform-auth';

function getAuthState(state: any) {
  const auth = state.auth;
  return {
    user: auth.user,
    token: auth.accessToken,
    tokenExpiresAt: auth.tokenExpiresAt,
    isAuthenticated: auth.isAuthenticated,
    mfaPending: auth.mfaPending,
    mfaChallengeToken: auth.mfaChallengeToken,
    mfaSetupRequired: auth.mfaSetupRequired,
    mustChangePassword: auth.mustChangePassword,
    permissions: auth.permissionCodes || [],
  };
}

export function useAuthStore<T = any>(selector?: (state: any) => T): T {
  const dispatch = useDispatch();
  const reduxState = useSelector((state: any) => state);
  const authState = getAuthState(reduxState);

  const methods = {
    logout: () => dispatch(actions.logout()),
    setUser: (user: any) => dispatch(actions.updateUser(user)),
    setToken: (token: string, expiresAt: string) => dispatch(actions.setToken({ token, expiresAt })),
    setMfaPending: (challengeToken: string) => dispatch(actions.setMfaPending(challengeToken)),
    setPermissions: (permissions: readonly string[]) => dispatch(actions.setPermissions(permissions)),
    setMfaSetupRequired: (required: boolean) => dispatch(actions.setMfaSetupRequired(required)),
    markMfaEnabled: () => dispatch(actions.markMfaEnabled()),
    setMustChangePassword: (required: boolean) => dispatch(actions.setMustChangePassword(required)),
    clearMustChangePassword: () => dispatch(actions.clearMustChangePassword()),
    hasPermission: (module: string, action: string): boolean => {
      const user = authState.user;
      if (!user) return false;
      return canAccess(user.role as PlatformRole, module, action, authState.permissions);
    },
  };

  const combined = {
    ...authState,
    ...methods,
  };

  if (selector) {
    return selector(combined);
  }
  return combined as any;
}

// Support vanilla JS calls (e.g. useAuthStore.getState().token)
useAuthStore.getState = () => {
  const reduxState = store.getState();
  const authState = getAuthState(reduxState);

  return {
    ...authState,
    logout: () => store.dispatch(actions.logout()),
    setUser: (user: any) => store.dispatch(actions.updateUser(user)),
    setToken: (token: string, expiresAt: string) => store.dispatch(actions.setToken({ token, expiresAt })),
    setMfaPending: (challengeToken: string) => store.dispatch(actions.setMfaPending(challengeToken)),
    setPermissions: (permissions: readonly string[]) => store.dispatch(actions.setPermissions(permissions)),
    setMfaSetupRequired: (required: boolean) => store.dispatch(actions.setMfaSetupRequired(required)),
    markMfaEnabled: () => store.dispatch(actions.markMfaEnabled()),
    setMustChangePassword: (required: boolean) => store.dispatch(actions.setMustChangePassword(required)),
    clearMustChangePassword: () => store.dispatch(actions.clearMustChangePassword()),
    hasPermission: (module: string, action: string): boolean => {
      const user = authState.user;
      if (!user) return false;
      return canAccess(user.role as PlatformRole, module, action, authState.permissions);
    },
  };
};

useAuthStore.setState = (update: any) => {
  if (typeof update === 'function') {
    const nextState = update(useAuthStore.getState());
    if (nextState.user) store.dispatch(actions.updateUser(nextState.user));
    if (nextState.token) store.dispatch(actions.setToken({ token: nextState.token, expiresAt: nextState.tokenExpiresAt || '' }));
  } else {
    if (update.user) store.dispatch(actions.updateUser(update.user));
    if (update.token) store.dispatch(actions.setToken({ token: update.token, expiresAt: update.tokenExpiresAt || '' }));
  }
};
