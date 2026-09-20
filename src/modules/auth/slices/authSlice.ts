import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { deriveModulePermissions, toPlatformRole } from '@/lib/utils/permissions';

export interface ModulePermission {
  module: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface UserClaims {
  sub: string;
  email: string;
  role: string;
  roleId: string;
}

export interface AuthState {
  user: any; // User details from API
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  permissions: ModulePermission[];
  permissionCodes: string[]; // Seeded permission codes (strings) for compatibility
  roleVersion: number;
  isLoading: boolean;
  isInitialized: boolean;
  mfaSetupRequired: boolean;
  mustChangePassword: boolean;
  mfaPending: boolean;
  mfaChallengeToken: string | null;
  tokenExpiresAt: string | null;
}

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// 2026-08-30: the API user carries `roleName` only, while permission checks read
// `user.role` (canAccess callers). The refresh interceptor already normalizes both keys;
// the login path and saved sessions didn't — a fresh Admin login was denied on
// permission-gated screens until the first token refresh. Normalize at every boundary.
/**
 * 2026-09-04: `role` is the portal's canonical PlatformRole ('OperationsManager'), folded
 * from whichever spelling the API sent ("Operations Manager" display name, or the seed key).
 * `roleName` keeps the API's display string for labels. Before this, `role` was the raw
 * display name and the dashboard switch / Admin check compared it to 'OperationsManager'.
 */
const normalizeUserRole = <T extends { role?: string; roleName?: string } | null>(user: T): T => {
  if (!user) return user;
  const raw = user.role ?? user.roleName;
  return { ...user, role: toPlatformRole(raw) ?? raw, roleName: user.roleName ?? raw };
};

const loadSavedAuth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const rawUser = localStorage.getItem('authUser');
    const user = normalizeUserRole(rawUser ? JSON.parse(rawUser) : null);
    
    // Check if there are saved token details from old Zustand store
    const rawZustand = localStorage.getItem('quantix-platform-auth');
    if (rawZustand) {
      const parsed = JSON.parse(rawZustand);
      const zUser = parsed?.state?.user;
      const zAuth = parsed?.state?.isAuthenticated;
      const zToken = parsed?.state?.token;
      const zExpiresAt = parsed?.state?.tokenExpiresAt;
      const zPermissions = parsed?.state?.permissions;
      if (zUser || zAuth) {
        return {
          accessToken: accessToken || zToken || 'persisted-session-token',
          refreshToken,
          user: user || normalizeUserRole(zUser),
          tokenExpiresAt: zExpiresAt || null,
          permissionCodes: zPermissions || [],
        };
      }
    }

    if (accessToken || user) {
      return { accessToken, refreshToken, user, tokenExpiresAt: null, permissionCodes: [] };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
};

const savedAuth = loadSavedAuth();

/**
 * 2026-09-04: a saved session's codes come from the saved JWT itself (one `permissions`
 * claim per code), so the sidebar is correct on a cold reload instead of empty until the
 * first token refresh.
 */
const savedCodes: string[] = (() => {
  const decoded = savedAuth?.accessToken ? parseJwt(savedAuth.accessToken) : null;
  if (Array.isArray(decoded?.permissions)) return decoded.permissions as string[];
  const legacy = (savedAuth as any)?.permissionCodes;
  return Array.isArray(legacy) ? legacy : [];
})();

const initialState: AuthState = {
  user: savedAuth?.user || null,
  accessToken: savedAuth?.accessToken || null,
  refreshToken: savedAuth?.refreshToken || null,
  isAuthenticated: !!(savedAuth?.accessToken && savedAuth?.user),
  permissions: deriveModulePermissions(savedCodes),
  permissionCodes: savedCodes,
  roleVersion: savedAuth?.user?.permissionsVersion || 0,
  isLoading: false,
  isInitialized: true,
  mfaSetupRequired: false,
  mustChangePassword: false,
  mfaPending: false,
  mfaChallengeToken: null,
  tokenExpiresAt: savedAuth?.tokenExpiresAt || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: any;
        accessToken: string;
        refreshToken?: string;
        mfaSetupRequired?: boolean;
        mustChangePassword?: boolean;
      }>
    ) => {
      const { user: rawLoginUser, accessToken, refreshToken, mfaSetupRequired, mustChangePassword } = action.payload;
      const user = normalizeUserRole(rawLoginUser);
      const decoded = parseJwt(accessToken);
      
      const finalMfaSetupRequired = mfaSetupRequired !== undefined
        ? mfaSetupRequired
        : false;
        
      const finalMustChangePassword = mustChangePassword !== undefined
        ? mustChangePassword
        : false;

      state.accessToken = accessToken;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitialized = true;
      state.mfaSetupRequired = finalMfaSetupRequired;
      state.mustChangePassword = finalMustChangePassword;
      state.mfaPending = false;
      state.mfaChallengeToken = null;

      if (decoded?.exp) {
        state.tokenExpiresAt = new Date(decoded.exp * 1000).toISOString();
      } else {
        state.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(user));
        const activeRefreshToken = refreshToken || user?.refreshToken || state.refreshToken;
        if (activeRefreshToken) {
          state.refreshToken = activeRefreshToken;
          localStorage.setItem('refreshToken', activeRefreshToken);
        }
      }

      // 2026-09-04: the JWT carries permission CODES (one `permissions` claim per code —
      // a single-code token arrives as a plain string). They used to be stored straight
      // into `state.permissions`, which usePermission reads as MODULE objects, so every
      // non-Admin staff login saw an empty sidebar. Codes are kept in permissionCodes and
      // the module flags are derived through the one shared map.
      let permissionsList: string[] = [];
      if (decoded) {
        if (Array.isArray(decoded.permissions)) {
          permissionsList = decoded.permissions.filter((p: unknown): p is string => typeof p === 'string');
        } else if (typeof decoded.permissions === 'string') {
          permissionsList = decoded.permissions.includes(';')
            ? decoded.permissions.split(';').filter(Boolean)
            : [decoded.permissions];
        }
        state.roleVersion = parseInt(decoded.role_v || '0');
      } else {
        // Fallback to the login payload if the token cannot be decoded.
        const fromUser = user?.permissions;
        permissionsList = Array.isArray(fromUser) ? fromUser.filter((p: unknown): p is string => typeof p === 'string') : [];
        state.roleVersion = user?.permissionsVersion || 0;
      }
      state.permissionCodes = permissionsList;
      state.permissions = deriveModulePermissions(permissionsList);
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.permissionCodes = [];
      state.roleVersion = 0;
      state.isLoading = false;
      state.isInitialized = true;
      state.mfaSetupRequired = false;
      state.mustChangePassword = false;
      state.mfaPending = false;
      state.mfaChallengeToken = null;
      state.tokenExpiresAt = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
      }
    },

    updatePermissions: (state, action: PayloadAction<{ permissions: ModulePermission[], roleVersion: number }>) => {
      state.permissions = action.payload.permissions;
      state.roleVersion = action.payload.roleVersion;

      state.permissionCodes = action.payload.permissions.flatMap((p: any) => {
        const list = [];
        if (p.canView) list.push(`${p.module}.view`);
        if (p.canAdd) list.push(`${p.module}.create`, `${p.module}.add`);
        if (p.canEdit) list.push(`${p.module}.edit`);
        if (p.canDelete) list.push(`${p.module}.delete`);
        return list;
      });
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },

    markPasswordChanged: (state) => {
      if (state.user) {
        state.user.isPasswordChanged = true;
        state.user.mustChangePassword = false;
      }
      state.mustChangePassword = false;
    },

    updateUser: (state, action: PayloadAction<any>) => {
      // 2026-08-30: callers pass raw API users (`roleName` only, e.g. the /auth/me boot
      // revalidation in useAuth) — normalize like loginSuccess, and mark the session
      // authenticated: a resolved user IS the proof of a valid session on that path.
      state.user = normalizeUserRole({ ...state.user, ...action.payload });
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authUser', JSON.stringify(state.user));
      }
    },

    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePictureUrl = action.payload;
        state.user.profilePicture = action.payload;  // keep both in sync so sidebar & topbar update instantly
      }
    },

    setMfaSetupRequired: (state, action: PayloadAction<boolean>) => {
      state.mfaSetupRequired = action.payload;
    },
 
    setMustChangePassword: (state, action: PayloadAction<boolean>) => {
      state.mustChangePassword = action.payload;
    },

    setMfaPending: (state, action: PayloadAction<string>) => {
      state.mfaPending = true;
      state.mfaChallengeToken = action.payload;
    },

    clearMfaPending: (state) => {
      state.mfaPending = false;
      state.mfaChallengeToken = null;
    },

    setToken: (state, action: PayloadAction<{ token: string, expiresAt: string }>) => {
      state.accessToken = action.payload.token;
      state.tokenExpiresAt = action.payload.expiresAt;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.token);
      }
    },

    setPermissions: (state, action: PayloadAction<readonly string[]>) => {
      state.permissionCodes = [...action.payload];
      // 2026-09-04: a token refresh re-derives the module flags too (it used to leave
      // `permissions` stale while updating only the codes).
      state.permissions = deriveModulePermissions(action.payload);
    },

    markMfaEnabled: (state) => {
      state.mfaSetupRequired = false;
      if (state.user) {
        state.user.mfaEnabled = true;
      }
    },

    clearMustChangePassword: (state) => {
      state.mustChangePassword = false;
      if (state.user) {
        state.user.mustChangePassword = false;
      }
    },
  },
});

export const {
  setCredentials,
  logout,
  updatePermissions,
  setLoading,
  setInitialized,
  markPasswordChanged,
  updateUser,
  updateProfilePicture,
  setMfaSetupRequired,
  setMustChangePassword,
  setMfaPending,
  clearMfaPending,
  setToken,
  setPermissions,
  markMfaEnabled,
  clearMustChangePassword,
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectRoleVersion = (state: RootState) => state.auth.roleVersion;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export const selectMfaSetupRequired = (state: RootState) => state.auth.mfaSetupRequired;
export const selectMustChangePassword = (state: RootState) => state.auth.mustChangePassword;
export const selectMfaPending = (state: RootState) => state.auth.mfaPending;
export const selectMfaChallengeToken = (state: RootState) => state.auth.mfaChallengeToken;
export const selectTokenExpiresAt = (state: RootState) => state.auth.tokenExpiresAt;
export const selectPermissionCodes = (state: RootState) => state.auth.permissionCodes;
// 2026-09-04: Admin is the one role that bypasses every gate. The old check also accepted
// 'superadmin' / 'administrator' (no such roles) and 'opsmanager' — which would have made
// an Operations Manager whose role happened to be spelled that way a full Admin.
export const selectIsAdmin = (state: RootState) =>
  toPlatformRole(state.auth.user?.role ?? state.auth.user?.roleName) === 'Admin';
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;
