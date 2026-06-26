import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useGetUserByIdQuery,
  useGetUserActivityQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useTerminateAllSessionsForUserMutation,
  useResetUserPasswordMutation,
} from '../services/userApi';
import type { PlatformRole } from '../types/user.types';
import UserDetailPage from './UserDetailPage';
import { Loader2, AlertCircle } from 'lucide-react';
import { ATMButton } from '@/shared/ui';

export const UserDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermission();

  const canUpdate = canEdit('users');
  const canDeactivate = canDelete('users');

  const { data: userResponse, isLoading: isUserLoading, isError: isUserError, refetch: refetchUser } = useGetUserByIdQuery(id ?? '', { skip: !id });
  const { data: activityResponse, isLoading: isActivityLoading, isError: isActivityError, refetch: refetchActivity } = useGetUserActivityQuery(id ?? '', { skip: !id });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeactivating }] = useDeleteUserMutation();
  const [terminateAllSessions, { isLoading: isTerminating }] = useTerminateAllSessionsForUserMutation();
  const [resetUserPassword, { isLoading: isResettingPassword }] = useResetUserPasswordMutation();

  const user = userResponse?.data;
  const activity = activityResponse?.data ?? [];

  const handleForceLogout = async () => {
    if (!id || !user) return;
    try {
      await terminateAllSessions(id).unwrap();
      toast.success(`All active sessions for ${user.name} revoked.`);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Force logout failed.';
      toast.error(msg);
    }
  };

  const handleDeactivate = async () => {
    if (!id || !user) return;
    const isCurrentlyActive = user.status === 'Active';

    try {
      if (isCurrentlyActive) {
        await deleteUser(id).unwrap();
        toast.success(`${user.name} deactivated.`);
      } else {
        const roleIdMap: Record<PlatformRole, string> = {
          Admin: '30000003-0000-0000-0000-000000000002',
          Operator: '30000003-0000-0000-0000-000000000003',
          FinanceManager: '30000003-0000-0000-0000-000000000004',
          ContentManager: '30000003-0000-0000-0000-000000000007',
          OperationsManager: '30000003-0000-0000-0000-000000000008',
          Merchant: '30000003-0000-0000-0000-000000000009',
        };
        const mappedRoleId = roleIdMap[user.role];
        await updateUser({
          id,
          data: {
            email: user.email,
            displayName: user.name,
            roleId: mappedRoleId,
            isActive: true,
            department: user.department,
            ipAllowlist: user.ipAllowlist || null,
          },
        }).unwrap();
        toast.success(`${user.name} reactivated.`);
      }
      refetchUser();
    } catch (err: any) {
      const action = isCurrentlyActive ? 'Deactivate' : 'Reactivate';
      const msg = err?.data?.message || err?.message || `${action} failed.`;
      toast.error(msg);
    }
  };

  const handleResetPassword = async () => {
    if (!id || !user) return;
    try {
      await resetUserPassword(id).unwrap();
      toast.success(`Password reset invitation sent to ${user.email}`);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Password reset failed.';
      toast.error(msg);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="rounded-2xl border border-red-150 bg-red-50/50 p-8 text-center text-red-700 dark:border-red-950/30 dark:bg-red-950/20 max-w-md mx-auto mt-12">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="font-bold text-lg mb-2">Failed to load user details.</p>
        <p className="text-sm text-red-500/80 mb-6">The requested user could not be found or there was an issue communicating with the backend.</p>
        <ATMButton type="button" onClick={() => void refetchUser()} className="mx-auto">
          Retry Loading
        </ATMButton>
      </div>
    );
  }

  return (
    <UserDetailPage
      user={user}
      activity={activity}
      isActivityLoading={isActivityLoading}
      isActivityError={isActivityError}
      refetchActivity={refetchActivity}
      isDeactivating={isDeactivating || isUpdating}
      isTerminating={isTerminating}
      isResettingPassword={isResettingPassword}
      canUpdate={canUpdate}
      canDeactivate={canDeactivate}
      onEdit={() => navigate(`/users/${id}/edit`)}
      onForceLogout={handleForceLogout}
      onDeactivate={handleDeactivate}
      onResetPassword={handleResetPassword}
    />
  );
};

export default UserDetailWrapper;
