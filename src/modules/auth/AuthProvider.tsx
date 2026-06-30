import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCredentials, logout, setInitialized, selectIsInitialized } from './slices/authSlice';
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
        // Restore the session via the backend refresh cookie; access tokens stay in Redux only.
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

