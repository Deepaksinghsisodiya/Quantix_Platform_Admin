import { baseApi } from '../../../core/services/baseApi';
import type {
  LoginRequest,
  LoginResponse,
  MFAVerifyResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserSession,
  User,
  ApiResponse,
  MfaSetupResponse,
} from '../types/authTypes';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        data: {
          username: credentials.email,
          password: credentials.password,
        },
      }),
    }),

    verifyMfa: builder.mutation<ApiResponse<MFAVerifyResponse>, { mfaToken: string; code: string }>({
      query: ({ mfaToken, code }) => ({
        url: '/api/v1/auth/mfa/verify',
        method: 'POST',
        data: {
          challengeToken: mfaToken,
          code,
        },
      }),
    }),

    setupMfa: builder.query<ApiResponse<MfaSetupResponse>, void>({
      query: () => ({
        url: '/api/v1/auth/mfa/setup',
        method: 'GET',
      }),
    }),

    enableMfa: builder.mutation<ApiResponse<string>, string>({
      query: (totpCode) => ({
        url: '/api/v1/auth/mfa/enable',
        method: 'POST',
        data: { totpCode },
      }),
    }),

    disableMfa: builder.mutation<ApiResponse<string>, string>({
      query: (currentPassword) => ({
        url: '/api/v1/auth/mfa/disable',
        method: 'POST',
        data: { currentPassword },
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
      }),
    }),

    refreshToken: builder.mutation<ApiResponse<RefreshTokenResponse>, void>({
      query: () => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
      }),
    }),

    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/api/v1/auth/password/reset',
        method: 'POST',
        data,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/api/v1/auth/password/reset/confirm',
        method: 'POST',
        data: {
          token: data.token,
          newPassword: data.newPassword,
        },
      }),
    }),

    changePassword: builder.mutation<ApiResponse<string>, { userId: string; currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/api/v1/auth/me/password',
        method: 'PUT',
        data,
      }),
    }),

    getCurrentUser: builder.query<ApiResponse<User>, void>({
      query: () => ({
        url: '/api/v1/auth/me',
        method: 'GET',
      }),
    }),

    getSessions: builder.query<ApiResponse<UserSession[]>, void>({
      query: () => ({
        url: '/api/v1/auth/sessions',
        method: 'GET',
      }),
      providesTags: ['Sessions'],
    }),

    revokeSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/api/v1/auth/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    revokeAllSessions: builder.mutation<void, void>({
      query: () => ({
        url: '/api/v1/auth/sessions/revoke-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions' as never],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyMfaMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useSetupMfaQuery,
  useLazySetupMfaQuery,
  useEnableMfaMutation,
  useDisableMfaMutation,
} = authApi;
