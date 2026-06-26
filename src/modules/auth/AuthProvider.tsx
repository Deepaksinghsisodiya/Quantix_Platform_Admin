import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials, logout, setInitialized, selectIsInitialized, parseJwt } from './slices/authSlice';
import { useRefreshTokenMutation } from './services/authApi';
import { ATMPageLoader } from '../../shared/ui';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check if we already restored a valid token from localStorage in initial state
        const token = localStorage.getItem('auth_token');
        if (token) {
          const decoded = parseJwt(token);
          if (decoded && decoded.exp) {
            const currentTime = Date.now() / 1000;
            // If the token is still valid for at least another 30 seconds, bypass refresh
            if (decoded.exp > currentTime + 30) {
              const userStr = localStorage.getItem('auth_user');
              if (userStr) {
                try {
                  const user = JSON.parse(userStr);
                  dispatch(setCredentials({
                    user,
                    accessToken: token,
                  }));
                } catch (e) {}
              }
              dispatch(setInitialized());
              return;
            }
          }
        }

        // 2. Otherwise try using cookie refresh token to restore session
        const response = await refreshToken().unwrap();
        
        if (response.success && response.data) {
          dispatch(setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken
          }));
        } else {
          dispatch(logout());
        }
      } catch (error: any) {
        // 401 on refresh just means no active session, which is fine
        dispatch(logout());
      } finally {
        dispatch(setInitialized());
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [dispatch, isInitialized, refreshToken]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <ATMPageLoader message="Verifying secure session..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
