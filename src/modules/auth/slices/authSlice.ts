import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { useAuthStore } from '@/lib/store/authStore';

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
  roleVersion: number;
  isLoading: boolean;
  isInitialized: boolean;
  mfaSetupRequired: boolean;
  mustChangePassword: boolean;
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

const loadSavedAuth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const rawUser = localStorage.getItem('authUser');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (accessToken || user) {
      return { accessToken, refreshToken, user };
    }

    // Fallback to Zustand persisted state ('quantix-platform-auth')
    const rawZustand = localStorage.getItem('quantix-platform-auth');
    if (rawZustand) {
      const parsed = JSON.parse(rawZustand);
      const zUser = parsed?.state?.user;
      const zAuth = parsed?.state?.isAuthenticated;
      if (zUser || zAuth) {
        return {
          accessToken: localStorage.getItem('accessToken') || 'persisted-session-token',
          refreshToken,
          user: zUser,
        };
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
};

const savedAuth = loadSavedAuth();

const initialState: AuthState = {
  user: savedAuth?.user || null,
  accessToken: savedAuth?.accessToken || null,
  refreshToken: savedAuth?.refreshToken || null,
  isAuthenticated: !!(savedAuth?.accessToken && savedAuth?.user),
  permissions: savedAuth?.user?.permissions || [],
  roleVersion: savedAuth?.user?.permissionsVersion || 0,
  isLoading: false,
  isInitialized: true,
  mfaSetupRequired: false,
  mustChangePassword: false,
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
      const { user, accessToken, refreshToken, mfaSetupRequired, mustChangePassword } = action.payload;
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

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(user));
        const activeRefreshToken = refreshToken || user?.refreshToken || state.refreshToken;
        if (activeRefreshToken) {
          state.refreshToken = activeRefreshToken;
          localStorage.setItem('refreshToken', activeRefreshToken);
        }
      }

      let permissionsList: string[] = [];
      if (decoded) {
        if (Array.isArray(decoded.permissions)) {
          state.permissions = decoded.permissions;
          permissionsList = decoded.permissions;
        } else if (typeof decoded.permissions === 'string') {
          try {
            state.permissions = JSON.parse(decoded.permissions);
            permissionsList = state.permissions as unknown as string[];
          } catch (e) {
            state.permissions = [];
          }
        } else {
          state.permissions = [];
        }
        state.roleVersion = parseInt(decoded.role_v || '0');
      } else {
        // Fallback to user object if decode fails
        state.permissions = user?.permissions || [];
        permissionsList = user?.permissions || [];
        state.roleVersion = user?.permissionsVersion || 0;
      }

      // Sync to Zustand store
      try {
        if (user) {
          useAuthStore.getState().setUser(user);
        }
        if (accessToken) {
          const expiresAt = decoded?.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          useAuthStore.getState().setToken(accessToken, expiresAt);
        }
        useAuthStore.getState().setPermissions(permissionsList);
        useAuthStore.getState().setMfaSetupRequired(finalMfaSetupRequired);
        useAuthStore.getState().setMustChangePassword(finalMustChangePassword);
      } catch (e) {
        console.error('Error syncing credentials to Zustand:', e);
      }
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.roleVersion = 0;
      state.isLoading = false;
      state.isInitialized = true;
      state.mfaSetupRequired = false;
      state.mustChangePassword = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
      }

      // Sync to Zustand store
      try {
        useAuthStore.getState().logout();
      } catch (e) {
        console.error('Error syncing logout to Zustand:', e);
      }
    },

    updatePermissions: (state, action: PayloadAction<{ permissions: ModulePermission[], roleVersion: number }>) => {
      state.permissions = action.payload.permissions;
      state.roleVersion = action.payload.roleVersion;

      // Sync to Zustand store
      try {
        const mapped = action.payload.permissions.flatMap((p: any) => {
          const list = [];
          if (p.canView) list.push(`${p.module}.view`);
          if (p.canAdd) list.push(`${p.module}.create`, `${p.module}.add`);
          if (p.canEdit) list.push(`${p.module}.edit`);
          if (p.canDelete) list.push(`${p.module}.delete`);
          return list;
        });
        useAuthStore.getState().setPermissions(mapped);
      } catch (e) {
        console.error('Error syncing permissions to Zustand:', e);
      }
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

      // Sync to Zustand store
      try {
        useAuthStore.getState().clearMustChangePassword();
        if (state.user) {
          useAuthStore.getState().setUser(JSON.parse(JSON.stringify(state.user)));
        }
      } catch (e) {
        console.error('Error syncing password change to Zustand:', e);
      }
    },

    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };

      // Sync to Zustand store
      try {
        useAuthStore.getState().setUser(JSON.parse(JSON.stringify(state.user)));
      } catch (e) {
        console.error('Error syncing user update to Zustand:', e);
      }
    },

    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePictureUrl = action.payload;
        state.user.profilePicture = action.payload;  // keep both in sync so sidebar & topbar update instantly
      }

      // Sync to Zustand store
      try {
        if (state.user) {
          useAuthStore.getState().setUser(JSON.parse(JSON.stringify(state.user)));
        }
      } catch (e) {
        console.error('Error syncing profile picture to Zustand:', e);
      }
    },

    setMfaSetupRequired: (state, action: PayloadAction<boolean>) => {
      state.mfaSetupRequired = action.payload;
 
      // Sync to Zustand store
      try {
        useAuthStore.getState().setMfaSetupRequired(action.payload);
      } catch (e) {
        console.error('Error syncing mfa setup requirement to Zustand:', e);
      }
    },
 
    setMustChangePassword: (state, action: PayloadAction<boolean>) => {
      state.mustChangePassword = action.payload;
 
      // Sync to Zustand store
      try {
        useAuthStore.getState().setMustChangePassword(action.payload);
      } catch (e) {
        console.error('Error syncing must change password flag to Zustand:', e);
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
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectRoleVersion = (state: RootState) => state.auth.roleVersion;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export const selectMfaSetupRequired = (state: RootState) => state.auth.mfaSetupRequired;
export const selectMustChangePassword = (state: RootState) => state.auth.mustChangePassword;
export const selectIsAdmin = (state: RootState) => {
  const role = state.auth.user?.roleName?.toLowerCase() || state.auth.user?.role?.toLowerCase();
  return role === 'admin' || role === 'superadmin' || role === 'administrator' || role === 'opsmanager';
};
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;

