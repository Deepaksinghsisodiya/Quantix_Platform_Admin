import axios, { type AxiosInstance } from 'axios';
import { logout, setCredentials, updateUser } from '../slices/authSlice';
import { toast } from 'sonner';

let isRefreshing = false;
let isSyncing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

/**
 * Quietly refreshes permissions in the background without interrupting the user.
 * Uses a lock to prevent concurrent sync calls.
 */
async function refreshPermissionsQuietly(store: any) {
  if (isSyncing || isRefreshing) return;
  isSyncing = true;
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth/refresh`,
      { refreshToken: null },
      { withCredentials: true }
    );
    const { data } = response.data;
    if (data) {
      const existingUser = store?.getState()?.auth?.user;
      const newToken = data.token || data.accessToken;
      const newUser = data.user || {
        ...(existingUser || {}),
        userId: data.userId || existingUser?.userId || existingUser?.id,
        id: data.userId || existingUser?.id || existingUser?.userId,
        username: data.userName || existingUser?.username || existingUser?.email,
        email: data.userName || existingUser?.email || existingUser?.username,
        roleName: data.roleName || existingUser?.roleName || existingUser?.role,
        role: data.roleName || existingUser?.role || existingUser?.roleName,
        permissions: data.permissions || existingUser?.permissions || [],
      };
      store.dispatch(setCredentials({
        user: newUser,
        accessToken: newToken
      }));
    }
  } catch (err) {
    // Ignore silent sync errors
  } finally {
    isSyncing = false;
  }
}

export const setupAuthInterceptor = (axiosInstance: AxiosInstance, store: any) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use((config) => {
    const token = store?.getState()?.auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      // Detect Permission Sync signal from backend
      const syncHeader = response.headers?.['x-permissions-sync'];
      if (syncHeader === 'Refresh-Needed') {
        void refreshPermissionsQuietly(store);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      // Handle 403 Forbidden
      if (status === 403) {
        const errorData = error.response?.data;
        if (errorData?.error === 'PasswordChangeRequired') {
          // Sync the local Redux/localStorage state to match the server requirement
          store.dispatch(updateUser({ isPasswordChanged: false }));
        } else {
          toast.error(errorData?.message || 'Access denied. You do not have permission to perform this action.');
        }
      }

      // Handle 401 Unauthorized (Token Refresh)
      if (
        status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('login') &&
        !originalRequest.url?.includes('/auth/mfa/verify')
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth/refresh`,
            { refreshToken: null },
            { withCredentials: true }
          );
          const { data } = response.data;
          const existingUser = store?.getState()?.auth?.user;
          const newToken = data?.token || data?.accessToken;
          const newUser = data?.user || {
            ...(existingUser || {}),
            userId: data?.userId || existingUser?.userId || existingUser?.id,
            id: data?.userId || existingUser?.id || existingUser?.userId,
            username: data?.userName || existingUser?.username || existingUser?.email,
            email: data?.userName || existingUser?.email || existingUser?.username,
            roleName: data?.roleName || existingUser?.roleName || existingUser?.role,
            role: data?.roleName || existingUser?.role || existingUser?.roleName,
            permissions: data?.permissions || existingUser?.permissions || [],
          };

          if (!newToken) {
            throw new Error('Invalid refresh response: missing token');
          }

          store.dispatch(setCredentials({
            user: newUser,
            accessToken: newToken,
          }));

          onTokenRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          if (!window.location.pathname.includes('/login')) {
            window.location.href = `/login?reason=session_expired&redirect=${window.location.pathname}`;
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Global Error Toasts for unhandled errors
      if (status >= 500) {
        toast.error('A server error occurred. Please try again later.');
      } else if (status === 400 || status === 404) {
        const errorData = error.response?.data;
        // Suppress expected 400s: auth/refresh (no session), deboarding not-found
        const isSilent =
          originalRequest.url?.includes('/auth/refresh') ||
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('login') ||
          errorData?.errorCode === 'DEBOARDING_NOT_FOUND';
        if (errorData?.message && !isSilent) {
          toast.error(errorData.message);
        }
      }

      return Promise.reject(error);
    }
  );
};
