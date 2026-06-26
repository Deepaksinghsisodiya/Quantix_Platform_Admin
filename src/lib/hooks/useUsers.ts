import { useCallback } from 'react';
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetUserActivityQuery,
  useGetActiveSessionsQuery,
  useGetSessionPolicyQuery,
  useUpdateSessionPolicyMutation,
  useTerminateSessionMutation,
  useTerminateAllSessionsForUserMutation,
} from '@/modules/users/services/userApi';
import type { UserListParams, SessionPolicy } from '@/lib/api/users';
import type { CreateUserDto, UpdateUserDto, PlatformUser } from '@/lib/types/user';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const userKeys = {
  all: ['users'] as const,
  list: (params?: UserListParams) => [...userKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  activity: (id: string) => [...userKeys.all, 'activity', id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
  sessions: () => [...userKeys.all, 'sessions'] as const,
  sessionPolicy: () => [...userKeys.all, 'sessionPolicy'] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** FRS-SAP-201: paginated user list with optional search / role / status filters. */
export function useUsers(params: UserListParams) {
  return useGetUsersQuery(params);
}

/** FRS-SAP-201: single user detail. */
export function useUser(id: string | undefined) {
  return useGetUserByIdQuery(id ?? '', {
    skip: !id,
  });
}

/** FRS-SAP-202: role catalogue (used to populate role dropdowns). */
export function useRoles() {
  return useGetRolesQuery();
}

/** FRS-SAP-206: per-user activity timeline. */
export function useUserActivity(id: string | undefined) {
  return useGetUserActivityQuery(id ?? '', {
    skip: !id,
  });
}

/** FRS-SAP-205: live session list (all users). */
export function useActiveSessions() {
  return useGetActiveSessionsQuery(undefined, {
    pollingInterval: 60_000, // refresh every minute so the page reflects new logins
  });
}

/** FRS-SAP-205: read the platform-wide session policy. */
export function useSessionPolicy() {
  return useGetSessionPolicyQuery();
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateUser() {
  const [trigger, result] = useCreateUserMutation();
  return wrapMutation(trigger, result);
}

export function useUpdateUser(id: string) {
  const [trigger, result] = useUpdateUserMutation();
  const adaptedTrigger = useCallback(
    (data: UpdateUserDto) => {
      return trigger({ id, data });
    },
    [id, trigger]
  );
  return wrapMutation(adaptedTrigger as any, result);
}

export function useDeleteUser() {
  const [trigger, result] = useDeleteUserMutation();
  return wrapMutation(trigger, result);
}

export function useTerminateSession() {
  const [trigger, result] = useTerminateSessionMutation();
  return wrapMutation(trigger, result);
}

export function useTerminateAllSessionsForUser() {
  const [trigger, result] = useTerminateAllSessionsForUserMutation();
  return wrapMutation(trigger, result);
}

export function useUpdateSessionPolicy() {
  const [trigger, result] = useUpdateSessionPolicyMutation();
  return wrapMutation(trigger, result);
}

/** Convenience: filter the user list locally by name/email. The API also
 *  supports a `search` param; this hook returns helpers for both modes. */
export function filterUsersByQuery(users: readonly PlatformUser[], q: string): PlatformUser[] {
  if (!q.trim()) return [...users];
  const needle = q.toLowerCase();
  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(needle) ||
      u.email.toLowerCase().includes(needle) ||
      (u.department ?? '').toLowerCase().includes(needle),
  );
}
