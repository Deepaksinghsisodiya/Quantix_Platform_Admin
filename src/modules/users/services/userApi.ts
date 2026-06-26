import { baseApi } from '../../../core/services/baseApi';
import type { RoleDefinition } from '@/lib/api/users';
import type {
  PlatformUser,
  CreateUserDto,
  UpdateUserDto,
  ActiveSession,
  SessionPolicy,
  UserActivity,
  ApiResponse,
  ApiListResponse,
} from '../types/user.types';

const mapUserResponse = (u: any): PlatformUser => {
  if (!u) return u;

  let status: any = 'Inactive';
  if (u.status) {
    status = u.status;
  } else if (u.isActive || u.isActive === 1) {
    status = 'Active';
  }

  return {
    ...u,
    id: u.id ?? u.userId,
    name: u.name ?? u.displayName ?? `${u.firstName || ''} ${u.lastName || ''}`.trim() ?? u.username,
    email: u.email,
    role: u.role ?? u.roleName,
    department: u.department || '',
    status: status,
    lastLogin: u.lastLogin ?? u.lastLoginAt,
    mfaEnabled: u.mfaEnabled ?? false,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    permissions: u.permissions ?? [],
    ipAllowlist: u.ipAllowlist,
  };
};

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiListResponse<PlatformUser>, Record<string, any>>({
      query: (params) => ({
        url: '/api/v1/users',
        method: 'GET',
        params,
      }),
      transformResponse: (response: ApiListResponse<any>) => ({
        ...response,
        data: response.data?.map(mapUserResponse) ?? [],
      }),
      providesTags: ['Users'],
    }),

    getUserById: builder.query<ApiResponse<PlatformUser>, string>({
      query: (id) => ({
        url: `/api/v1/users/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapUserResponse(response.data),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Users', id }, 'Users'],
    }),

    createUser: builder.mutation<ApiResponse<PlatformUser>, CreateUserDto>({
      query: (data) => ({
        url: '/api/v1/users',
        method: 'POST',
        data,
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapUserResponse(response.data),
      }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<ApiResponse<PlatformUser>, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/api/v1/users/${id}`,
        method: 'PUT',
        data,
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: mapUserResponse(response.data),
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }, 'Users'],
    }),

    deleteUser: builder.mutation<ApiResponse<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: `/api/v1/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    resetUserPassword: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/api/v1/users/${id}/reset-password`,
        method: 'POST',
      }),
    }),

    getRoles: builder.query<ApiResponse<readonly RoleDefinition[]>, void>({
      query: () => ({
        url: '/api/v1/users/roles',
        method: 'GET',
      }),
      providesTags: ['Roles' as any],
    }),

    getUserActivity: builder.query<ApiResponse<readonly UserActivity[]>, string>({
      query: (id) => ({
        url: `/api/v1/users/${id}/activity`,
        method: 'GET',
      }),
    }),

    getActiveSessions: builder.query<ApiResponse<readonly ActiveSession[]>, void>({
      query: () => ({
        url: '/api/v1/sessions',
        method: 'GET',
      }),
      providesTags: ['Sessions'],
    }),

    terminateSession: builder.mutation<ApiResponse<{ terminated: boolean }>, string>({
      query: (sessionId) => ({
        url: `/api/v1/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    terminateAllSessionsForUser: builder.mutation<ApiResponse<{ terminated: boolean }>, string>({
      query: (userId) => ({
        url: `/api/v1/sessions/user/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    getSessionPolicy: builder.query<ApiResponse<SessionPolicy>, void>({
      query: () => ({
        url: '/api/v1/sessions/policy',
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),

    updateSessionPolicy: builder.mutation<ApiResponse<SessionPolicy>, SessionPolicy>({
      query: (policy) => ({
        url: '/api/v1/sessions/policy',
        method: 'PUT',
        data: policy,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useGetRolesQuery,
  useGetUserActivityQuery,
  useGetActiveSessionsQuery,
  useTerminateSessionMutation,
  useTerminateAllSessionsForUserMutation,
  useGetSessionPolicyQuery,
  useUpdateSessionPolicyMutation,
} = userApi;
