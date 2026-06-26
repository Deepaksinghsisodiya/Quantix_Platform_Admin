import React, { useMemo } from 'react';
import { Pencil, UserX } from 'lucide-react';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMAvatar } from '@/shared/ui/ATMAvatar';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import type { PlatformUser, PlatformRole, UserStatus } from '../types/user.types';

// ---------------------------------------------------------------------------
// Constants for Filter Options
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<PlatformRole, string> = {
  Admin: 'Admin',
  OperationsManager: 'Operations Manager',
  FinanceManager: 'Finance Manager',
  ContentManager: 'Content Manager',
  Operator: 'Operator',
  Merchant: 'Merchant',
};

const ROLE_COLOR: Record<PlatformRole, 'purple' | 'primary' | 'success' | 'warning' | 'gray' | 'muted'> = {
  Admin: 'purple',
  OperationsManager: 'primary',
  FinanceManager: 'success',
  ContentManager: 'warning',
  Operator: 'gray',
  Merchant: 'muted',
};

const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ label, value })),
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Locked', value: 'Locked' },
];

const DEPT_OPTIONS = [
  { label: 'All Departments', value: 'all' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Customer Success', value: 'Customer Success' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Support', value: 'Support' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Management', value: 'Management' },
  { label: 'Sales', value: 'Sales' },
];

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UserListProps {
  data: PlatformUser[];
  isLoading: boolean;
  isFetching: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  searchValue: string;
  onSearchChange: (s: string) => void;
  sortBy?: string;
  sortDescending?: boolean;
  onSort: (field: string) => void;
  onRowClick?: (row: PlatformUser) => void;
  onDeactivateClick: (id: string) => void;
  canCreate: boolean;
  canDeactivate: boolean;
  onCreateClick: () => void;
  onRefetch: () => void;
  filterValues: {
    role: string;
    status: string;
    department: string;
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
  canCreate,
  canDeactivate,
  filterValues,
  onFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Object.values(filterValues).some(
    (val) => val && val !== 'all' && val !== ''
  );

  // Column definitions
  const columns: ATMTableColumn<PlatformUser>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'User',
        sortable: true,
        renderCell: (_val, row) => (
          <div className="flex items-center gap-4 py-2">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center border border-accent-100 dark:border-accent-900/30 overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover:scale-105 duration-300">
                <ATMAvatar
                  name={row.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {row.status === 'Active' && (
                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full shadow-sm" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                {row.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 leading-none">{row.email}</p>
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
            color={ROLE_COLOR[row.role] ?? 'muted'}
            label={ROLE_LABELS[row.role] ?? row.role}
          />
        ),
      },
      {
        key: 'department',
        header: 'Department',
        sortable: true,
        renderCell: (_val, row) => (
          <span className="text-gray-600 dark:text-gray-400 font-bold">
            {row.department || '—'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        renderCell: (_val, row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'lastLogin',
        header: 'Last Login',
        sortable: true,
        renderCell: (_val, row) => (
          <span className="text-gray-500 dark:text-gray-400 font-bold tabular-nums">
            {relativeTime(row.lastLogin)}
          </span>
        ),
      },
      {
        key: 'mfaEnabled',
        header: 'MFA',
        renderCell: (_val, row) => (
          <StatusBadge
            status={row.mfaEnabled ? 'Verified' : 'Inactive'}
            label={row.mfaEnabled ? 'Enabled' : 'Disabled'}
          />
        ),
      },
    ],
    []
  );

  // Row actions
  const rowActions = useMemo(
    () =>
      (row: PlatformUser): RowAction<PlatformUser>[] => {
        const actions: RowAction<PlatformUser>[] = [
          {
            label: 'View / Edit',
            icon: Pencil,
            onClick: (r) => onRowClick?.(r),
          },
        ];
        if (canDeactivate && row.status === 'Active') {
          actions.push({
            label: 'Deactivate',
            icon: UserX,
            variant: 'danger',
            onClick: (r) => onDeactivateClick(r.id),
          });
        }
        return actions;
      },
    [canDeactivate, onRowClick, onDeactivateClick]
  );

  return (
    <ATMTable<PlatformUser>
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      rowActions={rowActions}
      onRowClick={onRowClick}
      density="compact"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search users by name, email, or department..."
      sortBy={sortBy}
      sortDesc={sortDescending}
      onSort={onSort}
      pagination={{
        page,
        pageSize,
        totalCount,
        onPageChange,
        onPageSizeChange,
      }}
      filterConfig={{
        fields: [
          {
            key: 'role',
            label: 'User Role',
            type: 'select',
            options: ROLE_OPTIONS,
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: STATUS_OPTIONS,
          },
          {
            key: 'department',
            label: 'Department',
            type: 'select',
            options: DEPT_OPTIONS,
          },
        ],
        values: filterValues,
        onChange: onFilterChange,
        onReset: onResetFilters,
      }}
      emptyMessage={
        hasActiveFilters || searchValue
          ? 'No users match your filters. Try adjusting search or filters.'
          : 'No platform users found.'
      }
    />
  );
};

export default UserList;
