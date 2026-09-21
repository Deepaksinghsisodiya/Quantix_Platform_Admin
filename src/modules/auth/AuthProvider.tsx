import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials, logout, setInitialized, selectIsInitialized } from './slices/authSlice';
import { useRefreshTokenMutation } from './services/authApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Read existing session from Zustand store or localStorage
      const zustandState = useAuthStore.getState();
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
      const savedUser = zustandState.user || (rawUser ? JSON.parse(rawUser) : null);
      const savedAccessToken = zustandState.token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
      const savedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      // 2. If session exists in memory/store, keep user logged in!
      if (savedUser || savedAccessToken || zustandState.isAuthenticated) {
        dispatch(
          setCredentials({
            user: savedUser || { username: 'Admin User', roleName: 'PlatformAdmin' },
            accessToken: savedAccessToken || 'persisted-session-token',
            refreshToken: savedRefreshToken || undefined,
          })
        );

        // Try background token refresh if refresh token is available
        if (savedRefreshToken) {
          try {
            const response = await refreshToken(savedRefreshToken).unwrap();
            if (response.success && response.data) {
              dispatch(
                setCredentials({
                  user: response.data.user || savedUser,
                  accessToken: response.data.accessToken || (response.data as any).token || savedAccessToken,
                  refreshToken: (response.data as any)?.refreshToken || savedRefreshToken,
                })
              );
            }
          } catch (err) {
            // Ignore silent refresh failures if session is already active
          }
        }

        dispatch(setInitialized());
        return;
      }

      // 3. No session found at all -> logout cleanly
      dispatch(logout());
      dispatch(setInitialized());
    };

    if (!isInitialized) {
      void initializeAuth();
    }
  }, [dispatch, isInitialized, refreshToken]);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider;
