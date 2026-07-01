import { useRefreshTokenMutation } from '../services/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials, logout } from '../slices/authSlice';

export const useTokenRefresh = () => {
  const [refreshTokenMutation, { isLoading }] = useRefreshTokenMutation();
  const dispatch = useAppDispatch();

  const triggerRefresh = async () => {
    try {
      const response = await refreshTokenMutation().unwrap();
      if (response.success && response.data) {
        dispatch(setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
        }));
        return response.data.accessToken;
      } else {
        dispatch(logout());
        return null;
      }
    } catch (err) {
      dispatch(logout());
      return null;
    }
  };

  return {
    triggerRefresh,
    isLoading,
  };
};

export default useTokenRefresh;
