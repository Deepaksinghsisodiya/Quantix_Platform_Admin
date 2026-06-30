import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlatformUser, PlatformRole } from '@/lib/types';
import { canAccess } from '@/lib/utils/permissions';

/**
 * Single source of truth for the localStorage key under which the auth state is persisted.
 * Round_16 audit C9: prevent client.ts â‡„ authStore.ts key drift that broke every authenticated
 * request. Import this from any module that needs to read or invalidate the persisted token.
 */
export const AUTH_STORAGE_KEY = 'quantix-platform-auth';

interface AuthState {
  user: PlatformUser | null;
  token: string | null;
  /** ISO 8601 timestamp when the JWT expires (PF-14 Step 4). */
  tokenExpiresAt: string | null;
  isAuthenticated: boolean;
  /** PF-14 Step 3: MFA challenge is pending verification. */
  mfaPending: boolean;
  /** Temporary MFA challenge token (only while mfaPending=true). */
  mfaChallengeToken: string | null;

  /**
   * FRS-SAP-204: True after login if the user has never enabled MFA. Protected
   * routes redirect to /mfa-setup until the user completes EnableMfaAsync; this
   * flag clears when `markMfaEnabled` is called from the setup-success path.
   */
  mfaSetupRequired: boolean;

  /**
   * Pass 40 (2026-05-24): True on first login after OpsMgr-issued temp password.
   * ProtectedRoute redirects to /change-password and blocks all other routes
   * until `clearMustChangePassword` is called from the password-rotation success path.
   */
  mustChangePassword: boolean;

  /**
   * Round_16 Pass 4 audit C-5: server-issued permission codes from `LoginResultDto.Permissions`.
   * Replaces the hardcoded ROLE_PERMISSIONS matrix in `lib/utils/permissions.ts`. The source of
   * truth for what a user can do is now the seeded `RolePermission` rows the server returns at
   * login, not a frontend-side role table that drifted from the seed.
   */
  permissions: readonly string[];

  logout: () => void;
  setUser: (user: PlatformUser) => void;
  setToken: (token: string, expiresAt: string) => void;
  /** Set MFA pending state with challenge token. */
  setMfaPending: (challengeToken: string) => void;
  /** Replace the cached permission codes (called on login / refresh). */
  setPermissions: (permissions: readonly string[]) => void;
  /** FRS-SAP-204: flip the setup-required flag (true on login when MFA never enabled). */
  setMfaSetupRequired: (required: boolean) => void;
  /** FRS-SAP-204: clear the setup-required flag + flip the user's MfaEnabled mirror after enable. */
  markMfaEnabled: () => void;

  /** Pass 40 (2026-05-24): flip the must-change-password flag (true on first login). */
  setMustChangePassword: (required: boolean) => void;

  /** Pass 40 (2026-05-24): clear the must-change flag after successful rotation. */
  clearMustChangePassword: () => void;

  /** Check whether the current user can perform `action` on `module`. */
  hasPermission: (module: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      mfaPending: false,
      mfaChallengeToken: null,
      mfaSetupRequired: false,
      mustChangePassword: false,
      permissions: [],

      logout: () => {
        set({
          user: null, token: null, tokenExpiresAt: null, isAuthenticated: false,
          mfaPending: false, mfaChallengeToken: null, mfaSetupRequired: false,
          mustChangePassword: false,
          permissions: []
        });
      },

      setUser: (user: PlatformUser) => {
        set({ user, isAuthenticated: true, mfaPending: false, mfaChallengeToken: null });
      },

      setToken: (token: string, expiresAt: string) => {
        set({ token, tokenExpiresAt: expiresAt });
      },

      setMfaPending: (challengeToken: string) => {
        set({ mfaPending: true, mfaChallengeToken: challengeToken });
      },

      setPermissions: (permissions: readonly string[]) => {
        set({ permissions });
      },

      setMfaSetupRequired: (required: boolean) => {
        set({ mfaSetupRequired: required });
      },

      markMfaEnabled: () => {
        const { user } = get();
        set({
          mfaSetupRequired: false,
          user: user ? { ...user, mfaEnabled: true } : user,
        });
      },

      setMustChangePassword: (required: boolean) => {
        set({ mustChangePassword: required });
      },

      clearMustChangePassword: () => {
        const { user } = get();
        set({
          mustChangePassword: false,
          user: user ? { ...user, mustChangePassword: false } : user,
        });
      },

      hasPermission: (module: string, action: string): boolean => {
        const { user, permissions } = get();
        if (!user) return false;
        return canAccess(user.role as PlatformRole, module, action, permissions);
      },
    }),
    {
      // Round_16 audit C9: api/client.ts and authStore.ts disagreed on the persist key
      // ('platform-auth' vs 'quantix-platform-auth'). Standardise both on AUTH_STORAGE_KEY.
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        mfaSetupRequired: state.mfaSetupRequired,
        mustChangePassword: state.mustChangePassword,
        permissions: state.permissions,
      }),
    },
  ),
);

