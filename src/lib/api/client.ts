/**
 * Quantix Platform Admin API — typed fetch wrapper.
 *
 * Reads the JWT from the Zustand auth store persisted in localStorage
 * under the key `platform-auth`.  Attaches it as a Bearer token on
 * every request and normalises error responses into {@link ApiError}.
 */

import type { ApiListResponse, ApiErrorBody } from './types';
import { useAuthStore } from '@/lib/store/authStore';

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

/** Structured error thrown by the API client on non-2xx responses. */
export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string;
  readonly details: Record<string, readonly string[]> | undefined;

  constructor(status: number, message: string, errorCode: string, details?: Record<string, readonly string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  // Runtime config (window.__QUANTIX_CONFIG__) wins over the build-time
  // VITE_API_URL. The operator can edit /config.js in the published dist/
  // to retarget the SPA at a different API without rebuilding. See
  // public/config.js for the full runtime-config shape.
  if (typeof window !== 'undefined' && window.__QUANTIX_CONFIG__?.apiBaseUrl) {
    return window.__QUANTIX_CONFIG__.apiBaseUrl;
  }
  return import.meta.env.VITE_API_URL ?? '';
}

// Round_16 audit C9: import the canonical key from the store so client and store cannot drift.
// (Avoids a static import-cycle by reading the key as a string constant.)
const AUTH_STORAGE_KEY = 'quantix-platform-auth';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'state' in parsed &&
      typeof (parsed as Record<string, unknown>)['state'] === 'object'
    ) {
      const state = (parsed as { state: Record<string, unknown> }).state;
      if (typeof state['token'] === 'string') {
        return state['token'];
      }
    }
    return null;
  } catch {
    return null;
  }
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const base = `${getBaseUrl()}${path}`;
  if (!params) return base;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      qs.set(key, String(value));
    }
  }
  const qsStr = qs.toString();
  return qsStr ? `${base}?${qsStr}` : base;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorCode = 'UNKNOWN_ERROR';
    let message = `HTTP ${response.status}`;
    let details: Record<string, readonly string[]> | undefined;

    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null) {
        const err = body as Record<string, unknown>;
        if (typeof err['errorCode'] === 'string') errorCode = err['errorCode'];
        if (typeof err['error'] === 'string') message = err['error'];
        if (typeof err['message'] === 'string') message = err['message'];
        if (err['details'] && typeof err['details'] === 'object') {
          details = err['details'] as Record<string, readonly string[]>;
        }
      }
    } catch {
      // response body was not JSON — keep defaults
    }

    throw new ApiError(response.status, message, errorCode, details);
  }

  return (await response.json()) as T;
}

async function request<T>(path: string, options: RequestInit, params?: QueryParams): Promise<T> {
  const url = buildUrl(path, params);
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...buildHeaders(),
    },
  });

  if (response.status === 401) {
    const isLoginOrVerify =
      response.url &&
      (response.url.includes('/api/v1/auth/login') ||
        response.url.includes('/api/v1/auth/mfa/verify') ||
        response.url.includes('/api/v1/auth/refresh'));

    if (!isLoginOrVerify) {
      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh(async (newToken) => {
            try {
              const retryResponse = await fetch(url, {
                ...options,
                headers: {
                  ...options.headers,
                  ...buildHeaders(),
                },
              });
              resolve(await handleResponse<T>(retryResponse));
            } catch (err) {
              reject(err);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshUrl = `${getBaseUrl()}/api/v1/auth/refresh`;
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ refreshToken: null }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh failed');
        }

        const refreshData = await refreshResponse.json();
        const newToken = refreshData?.data?.token || refreshData?.data?.accessToken;
        
        let existingUser: any = null;
        try {
          const rawUser = localStorage.getItem('auth_user');
          if (rawUser) {
            existingUser = JSON.parse(rawUser);
          }
        } catch (e) {
          console.error('Failed to parse existing auth_user from localStorage', e);
        }

        const newUser = refreshData?.data?.user || {
          ...(existingUser || {}),
          userId: refreshData?.data?.userId || existingUser?.userId || existingUser?.id,
          id: refreshData?.data?.userId || existingUser?.id || existingUser?.userId,
          username: refreshData?.data?.userName || existingUser?.username || existingUser?.email,
          email: refreshData?.data?.userName || existingUser?.email || existingUser?.username,
          roleName: refreshData?.data?.roleName || existingUser?.roleName || existingUser?.role,
          role: refreshData?.data?.roleName || existingUser?.role || existingUser?.roleName,
          permissions: refreshData?.data?.permissions || existingUser?.permissions || [],
        };

        if (!newToken) {
          throw new Error('Invalid refresh response: missing token');
        }

        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));

        const decoded = parseJwt(newToken);
        let permissionsList: string[] = [];
        if (decoded) {
          if (Array.isArray(decoded.permissions)) {
            permissionsList = decoded.permissions;
          } else if (typeof decoded.permissions === 'string') {
            try {
              permissionsList = JSON.parse(decoded.permissions);
            } catch (e) {}
          }
        } else {
          permissionsList = newUser.permissions || [];
        }

        const expiresAt = decoded?.exp
          ? new Date(decoded.exp * 1000).toISOString()
          : new Date(Date.now() + 30 * 60 * 1000).toISOString();

        useAuthStore.getState().setToken(newToken, expiresAt);
        useAuthStore.getState().setUser(newUser);
        useAuthStore.getState().setPermissions(permissionsList);

        try {
          const { store } = await import('@/app/store');
          const { setCredentials } = await import('@/modules/auth/slices/authSlice');
          store.dispatch(
            setCredentials({
              user: newUser,
              accessToken: newToken,
            })
          );
        } catch (reduxError) {
          console.error('Failed to sync refreshed credentials to Redux:', reduxError);
        }

        onTokenRefreshed(newToken);

        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...buildHeaders(),
          },
        });
        return await handleResponse<T>(retryResponse);
      } catch (refreshError) {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_must_change_password');
          localStorage.removeItem('auth_mfa_setup_required');
          localStorage.removeItem('quantix-platform-auth');
        } catch {}

        try {
          useAuthStore.getState().logout();
        } catch {}

        try {
          const { store } = await import('@/app/store');
          const { logout } = await import('@/modules/auth/slices/authSlice');
          store.dispatch(logout());
        } catch {}

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = `/login?reason=session_expired&redirect=${window.location.pathname}`;
        }
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
  }

  return await handleResponse<T>(response);
}

// ---------------------------------------------------------------------------
// Public API client
// ---------------------------------------------------------------------------

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export async function get<T>(path: string, params?: QueryParams): Promise<T> {
  return request<T>(path, { method: 'GET' }, params);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// Convenience re-exports so modules can import everything from client.
export type { ApiResponse } from '@/lib/types/common';
export type { ApiListResponse, ApiErrorBody } from './types';
