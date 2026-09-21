import React, { useMemo } from 'react';
import { Pencil, UserX } from 'lucide-react';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMAvatar } from '@/shared/ui/ATMAvatar';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import type { PlatformUser, PlatformRole } from '../types/user.types';

/**
 * 2026-08-11: Department column + filter removed with the Department concept (nothing in
 * the platform ever routed, filtered or reported by it).
 */

// ---------------------------------------------------------------------------
// Constants for Filter Options
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Admin',
  OperationsManager: 'Operations Manager',
  FinanceManager: 'Finance Manager',
  ContentManager: 'Content Manager',
  Operator: 'Operator',
  Merchant: 'Merchant',
};

const ROLE_COLOR: Record<string, 'primary' | 'purple' | 'success' | 'warning' | 'muted' | 'gray'> = {
  Admin: 'primary',
  OperationsManager: 'purple',
  FinanceManager: 'success',
  ContentManager: 'warning',
  Operator: 'muted',
  Merchant: 'gray',
};

const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Operations Manager', value: 'OperationsManager' },
  { label: 'Finance Manager', value: 'FinanceManager' },
  { label: 'Content Manager', value: 'ContentManager' },
  { label: 'Operator', value: 'Operator' },
  { label: 'Merchant', value: 'Merchant' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Locked', value: 'Locked' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UserListProps {
  data: readonly PlatformUser[];
  isLoading: boolean;
  isFetching: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchValue?: string;
  onSearchChange: (val: string) => void;
  sortBy?: string;
  sortDescending?: boolean;
  onSort: (field: string) => void;
  onRowClick: (row: PlatformUser) => void;
  onDeactivateClick: (id: string) => void;
  canCreate: boolean;
  canDeactivate: boolean;
  onCreateClick: () => void;
  onRefetch: () => void;
  filterValues: {
    role: string;
    status: string;
  };
  onFilterChange: (key: string, val: any) => void;
  onResetFilters: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const UserList: React.FC<UserListProps> = ({
  data,
  isLoading,
  isFetching,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  sortBy,
  sortDescending,
  onSort,
  onRowClick,
  onDeactivateClick,
  canDeactivate,
  onCreateClick,
  filterValues,
  onFilterChange,
  onResetFilters,
}) => {
  const columns = useMemo<ATMTableColumn<PlatformUser>[]>(
    () => [
      {
        key: 'name',
        header: 'User',
        sortable: true,
        renderCell: (_val, row) => (
          <div className="flex items-center gap-3">
            <ATMAvatar name={row.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900 dark:text-slate-100">{row.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400 font-semibold">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        renderCell: (_val, row) => (
          <ATMBadge
            size="sm"
            color={ROLE_COLOR[row.role as PlatformRole] ?? 'muted'}
            label={ROLE_LABELS[row.role as PlatformRole] ?? row.role}
          />
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        renderCell: (_val, row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'mfaEnabled',
        header: 'MFA',
        renderCell: (_val, row) => (
          <ATMBadge
            size="sm"
            color={row.mfaEnabled ? 'success' : 'muted'}
            label={row.mfaEnabled ? 'Enabled' : 'Not set'}
          />
        ),
      },
      {
        key: 'lastLogin',
        header: 'Last Login',
        sortable: true,
        renderCell: (_val, row) => (
          <span className="text-slate-600 dark:text-slate-300 font-bold">
            {row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never'}
          </span>
        ),
      },
    ],
    [],
  );

  const rowActions = useMemo(
    () => (row: PlatformUser): RowAction<PlatformUser>[] => [
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (r) => onRowClick(r),
      },
      {
        label: 'Deactivate',
        icon: UserX,
        variant: 'danger',
        hidden: () => !canDeactivate || row.status !== 'Active',
        onClick: (r) => onDeactivateClick(r.id),
      },
    ],
    [canDeactivate, onDeactivateClick, onRowClick],
  );

  return (
    <ATMCard padding="none" className="overflow-hidden rounded-2xl">
      <ATMTable<PlatformUser>
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name or email…"
        filterConfig={{
          fields: [
            { key: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS },
            { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
          ],
          values: filterValues,
          onChange: onFilterChange,
          onReset: onResetFilters,
        }}
        pagination={{
          page,
          pageSize,
          totalCount,
          onPageChange,
          onPageSizeChange,
        }}
        sortBy={sortBy}
        sortDesc={sortDescending}
        onSort={onSort}
        onRowClick={onRowClick}
        rowActions={rowActions}
        emptyMessage="No platform users match the current filters."
        onEmptyAction={onCreateClick}
        emptyActionLabel="Create User"
      />
    </ATMCard>
  );
};

export default UserList;
