import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePermission } from '@/shared/hooks/usePermission';
import { useGetUsersQuery, useDeleteUserMutation } from '../services/userApi';
import type { PlatformUser, PlatformRole, UserStatus } from '../types/user.types';
import UserList from './UserList';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { usePagination } from '@/shared/hooks/usePagination';
import { useGetAll } from '@/shared/hooks/useGetAll';
import { Users as UsersIcon, UserCheck, ShieldAlert, Shield } from 'lucide-react';

export const UserListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { canAdd, canDelete } = usePermission();

  const canCreate = canAdd('users');
  const canDeactivate = canDelete('users');

  // 1. Manage State & URL using TimeForge's usePagination hook
  const {
    params,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSort,
    onFilterChange,
  } = usePagination({
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortDescending: false,
    role: 'all',
    status: 'all',
    department: 'all',
  });

  // Intercept and translate query parameters for the backend API
  const useGetUsersTranslatedQuery = (queryParams: any) => {
    const translatedParams = useMemo(() => {
      const { sortDescending, ...rest } = queryParams;

      // Clean 'all' filter values as required by backend
      const cleaned: Record<string, any> = { ...rest };
      Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === 'all') {
          delete cleaned[key];
        }
      });

      return {
        ...cleaned,
        sortDirection: rest.sortBy ? (sortDescending ? 'Desc' : 'Asc') : undefined,
      };
    }, [queryParams]);

    return useGetUsersQuery(translatedParams);
  };

  // 2. Fetch Data using TimeForge's useGetAll hook
  const {
    items: users,
    totalCount,
    isLoading,
    isFetching,
    refetch,
  } = useGetAll<PlatformUser>(useGetUsersTranslatedQuery, params);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);

  const onResetFilters = () => {
    onFilterChange('role', 'all');
    onFilterChange('status', 'all');
    onFilterChange('department', 'all');
    onSearchChange('');
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivateId) return;
    const user = users.find((u) => u.id === confirmDeactivateId);
    if (!user) return;

    try {
      await deleteUser(confirmDeactivateId).unwrap();
      toast.success(`${user.name} deactivated. Active sessions revoked.`);
      setConfirmDeactivateId(null);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Deactivate failed.';
      toast.error(msg);
    }
  };

  const selectedDeactivateUser = users.find((u) => u.id === confirmDeactivateId);

  const filterValues = useMemo(() => {
    return {
      role: params.role || 'all',
      status: params.status || 'all',
      department: params.department || 'all',
    };
  }, [params]);

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      {/* Page Header and Stats Cards */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <ATMPageHeader
          title="Platform Users"
          subtitle="Manage admin portal user accounts and permissions. Separate from merchant users."
          icon={UsersIcon}
          action={
            canCreate
              ? {
                  label: 'Create User',
                  onClick: () => navigate('/users/create'),
                }
              : undefined
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <ATMStatsCard
            label="Total Users"
            value={totalCount}
            icon={UsersIcon}
            variant="accent"
          />
          <ATMStatsCard
            label="Active Users"
            value={users.filter((u) => u.status === 'Active').length}
            icon={UserCheck}
            variant="emerald"
          />
          <ATMStatsCard
            label="Locked Accounts"
            value={users.filter((u) => u.status === 'Locked').length}
            icon={ShieldAlert}
            variant="rose"
          />
          <ATMStatsCard
            label="Operators"
            value={users.filter((u) => u.role === 'Operator').length}
            icon={Shield}
            variant="purple"
          />
        </div>
      </div>

      {/* Main Table view container */}
      <div className="flex-1 overflow-hidden w-full bg-slate-50/10 dark:bg-gray-900/10">
        <UserList
          data={users}
          isLoading={isLoading}
          isFetching={isFetching}
          totalCount={totalCount}
          page={params.page}
          pageSize={params.pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          searchValue={params.search}
          onSearchChange={onSearchChange}
          sortBy={params.sortBy}
          sortDescending={params.sortDescending}
          onSort={onSort}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
          onDeactivateClick={setConfirmDeactivateId}
          canCreate={canCreate}
          canDeactivate={canDeactivate}
          onCreateClick={() => navigate('/users/create')}
          onRefetch={refetch}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      </div>

      {/* Deactivation confirmation dialog */}
      <ATMConfirmModal
        isOpen={!!confirmDeactivateId}
        onCancel={() => setConfirmDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate User"
        description={
          selectedDeactivateUser ? (
            <div className="flex flex-col gap-4 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to deactivate <strong>{selectedDeactivateUser.name}</strong>? This will:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  Block the user from signing in
                </li>
                <li className="flex items-center gap-2 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  Revoke role-based access
                </li>
                <li className="flex items-center gap-2 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  Log this action in the audit trail
                </li>
              </ul>
            </div>
          ) : (
            ''
          )
        }
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default UserListWrapper;
