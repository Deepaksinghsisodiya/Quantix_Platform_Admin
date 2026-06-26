import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  useLoginMutation,
  useVerifyMfaMutation,
  useLogoutMutation,
  useLazyGetCurrentUserQuery,
} from '@/modules/auth/services/authApi';
import {
  logAuditEvent as apiLogAuditEvent,
} from '@/lib/api/auth';
import type { PlatformRole } from '@/lib/types';

/** Default inactivity timeout in milliseconds (30 minutes). */
const DEFAULT_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/** Events that count as "user activity" for session timeout. */
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

export function useAuth() {
  const {
    user,
    token,
    tokenExpiresAt,
    isAuthenticated,
    mfaPending,
    mfaChallengeToken,
    setUser,
    setToken,
    setMfaPending,
    setPermissions,
    logout: storeLogout,
  } = useAuthStore();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loginTrigger, loginResult] = useLoginMutation();
  const [mfaTrigger, mfaResult] = useVerifyMfaMutation();
  const [logoutTrigger] = useLogoutMutation();
  const [triggerGetCurrentUser, { isLoading: isValidating }] = useLazyGetCurrentUserQuery();

  // ---------------------------------------------------------------------------
  // Token validation on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (token && !isAuthenticated) {
      triggerGetCurrentUser()
        .unwrap()
        .then((res: any) => {
          if (res && res.data) {
            setUser(res.data as any);
          } else {
            storeLogout();
          }
        })
        .catch(() => {
          storeLogout();
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Step 4: JWT expiry auto-logout
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!tokenExpiresAt || !isAuthenticated) return;
    const expiryMs = new Date(tokenExpiresAt).getTime() - Date.now();
    if (expiryMs <= 0) {
      storeLogout();
      return;
    }
    const timer = setTimeout(() => {
      storeLogout();
    }, expiryMs);
    return () => clearTimeout(timer);
  }, [tokenExpiresAt, isAuthenticated, storeLogout]);

  // ---------------------------------------------------------------------------
  // Step 5: Inactivity timeout (30 min default)
  // ---------------------------------------------------------------------------
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (!isAuthenticated) return;
    inactivityTimerRef.current = setTimeout(() => {
      logoutTrigger().catch(() => {});
      storeLogout();
    }, DEFAULT_INACTIVITY_TIMEOUT_MS);
  }, [isAuthenticated, storeLogout, logoutTrigger]);

  useEffect(() => {
    if (!isAuthenticated) return;
    resetInactivityTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    }
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetInactivityTimer);
      }
    };
  }, [isAuthenticated, resetInactivityTimer]);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Step 2: Start login (may trigger MFA challenge). */
  const login = async (email: string, password: string): Promise<void> => {
    const res = await loginTrigger({ email, password }).unwrap();
    const data = res.data;
    if (!data) throw new Error('No data returned');
    if (data.mfaRequired && data.mfaChallengeToken) {
      setMfaPending(data.mfaChallengeToken);
    } else {
      setToken(data.token || '', data.expiresAt || '');
      if (data.user) {
        setUser(data.user as any);
        apiLogAuditEvent({ action: 'Login', entityType: 'Session', entityId: data.user.id, details: 'Login successful' }).catch(() => {});
      }
      setPermissions(((data as { permissions?: readonly string[] }).permissions) ?? []);
    }
  };

  /** Step 3: Complete MFA verification. */
  const verifyMfa = async (totpCode: string): Promise<void> => {
    if (!mfaChallengeToken) throw new Error('No MFA challenge pending');
    const res = await mfaTrigger({ mfaToken: mfaChallengeToken, code: totpCode }).unwrap();
    const data = res.data;
    if (!data) throw new Error('No data returned');
    setToken(data.token || '', data.expiresAt || '');
    if (data.user) {
      setUser(data.user as any);
      apiLogAuditEvent({ action: 'Login', entityType: 'Session', entityId: data.user.id, details: 'MFA verified, login complete' }).catch(() => {});
    }
    setPermissions(((data as { permissions?: readonly string[] }).permissions) ?? []);
  };

  /** Step 5: Server-side logout + clear local state. */
  const logout = async (): Promise<void> => {
    if (token) {
      apiLogAuditEvent({ action: 'Logout', entityType: 'Session', entityId: user?.id ?? '', details: 'User logged out' }).catch(() => {});
      await logoutTrigger().unwrap().catch(() => {});
    }
    storeLogout();
  };

  const role: PlatformRole | null = user?.role ?? null;

  return {
    user,
    isAuthenticated,
    mfaPending,
    role,
    login,
    verifyMfa,
    logout,
    isLoading: loginResult.isLoading || mfaResult.isLoading || isValidating,
  } as const;
}
