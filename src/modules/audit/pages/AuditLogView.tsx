import React from 'react';
import { Shield, Download, FileText } from 'lucide-react';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import type { AuditRow } from './AuditLogWrapper';

interface AuditLogViewProps {
  search: string;
  setSearch: (val: string) => void;
  filterUser: string;
  setFilterUser: (val: string) => void;
  filterAction: string;
  setFilterAction: (val: string) => void;
  filterEntity: string;
  setFilterEntity: (val: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (val: string) => void;
  filterDateTo: string;
  setFilterDateTo: (val: string) => void;
  users: readonly string[];
  entityTypes: readonly string[];
  actions: readonly string[];
  rows: readonly AuditRow[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasFilters: boolean;
  clearFilters: () => void;
  onExport: (format: 'CSV' | 'JSON') => void;
}

const ACTION_VARIANT: Record<string, BadgeColor> = {
  Create: 'success',
  Update: 'primary',
  Delete: 'danger',
  Login: 'muted',
  Logout: 'muted',
  ConfigChange: 'warning',
  PermissionChange: 'warning',
  TokenGenerate: 'primary',
  CommissionApproval: 'success',
  View: 'muted',
};

function formatTimestamp(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function UserAvatarCell({ avatar, name }: { avatar: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-bold text-accent-700 dark:bg-accent-950/40 dark:text-accent-300">
        {avatar}
      </div>
      <span className="text-gray-900 dark:text-gray-100 font-bold">{name}</span>
    </div>
  );
}

const COLUMNS: ATMTableColumn<AuditRow>[] = [
  {
    key: 'timestamp',
    header: 'Timestamp',
    renderCell: (_val, row) => (
      <span className="whitespace-nowrap tabular-nums text-gray-500 dark:text-gray-400 font-semibold">
        {formatTimestamp(row.timestamp)}
      </span>
    ),
    width: '150px',
  },
  {
    key: 'userName',
    header: 'User',
    renderCell: (_val, row) => (
      <UserAvatarCell avatar={row.userAvatar} name={row.userName} />
    ),
  },
  {
    key: 'action',
    header: 'Action',
    renderCell: (_val, row) => (
      <ATMBadge color={ACTION_VARIANT[row.action] ?? 'muted'} size="sm" label={row.action} />
    ),
    width: '130px',
  },
  {
    key: 'entityType',
    header: 'Entity Type',
    renderCell: (_val, row) => (
      <span className="text-gray-600 dark:text-gray-400 font-semibold">{row.entityType || '—'}</span>
    ),
    width: '130px',
  },
  {
    key: 'entityId',
    header: 'Entity ID',
    renderCell: (_val, row) => (
      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.entityId || '—'}</span>
    ),
    width: '200px',
  },
  {
    key: 'details',
    header: 'Details',
    renderCell: (_val, row) => (
      <span className="max-w-xs truncate block text-gray-600 dark:text-gray-400 font-semibold">
        {row.details || '—'}
      </span>
    ),
  },
  {
    key: 'ipAddress',
    header: 'IP Address',
    renderCell: (_val, row) => (
      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.ipAddress || '—'}</span>
    ),
    width: '140px',
  },
];

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  search,
  setSearch,
  filterUser,
  setFilterUser,
  filterAction,
  setFilterAction,
  filterEntity,
  setFilterEntity,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  users,
  entityTypes,
  actions,
  rows,
  totalCount,
  isLoading,
  error,
  hasFilters,
  clearFilters,
  onExport,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <ATMPageHeader
        title="Audit Log"
        subtitle={
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <span>7-year retention policy. All actions are immutable and non-deletable.</span>
          </div>
        }
        extraActions={
          <div className="flex flex-wrap gap-2">
            <ATMButton variant="secondary" size="sm" icon={Download} onClick={() => onExport('CSV')}>
              Export CSV
            </ATMButton>
            <ATMButton variant="secondary" size="sm" icon={FileText} onClick={() => onExport('JSON')}>
              Export JSON
            </ATMButton>
          </div>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 items-end">
        <div className="lg:col-span-1">
          <ATMTextField
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search details..."
            size="sm"
          />
        </div>
        <div>
          <ATMSelectField
            name="filterUser"
            value={filterUser}
            onChange={(val) => setFilterUser(val ? String(val) : '')}
            options={[{ label: 'All Users', value: '' }, ...users.map((u) => ({ label: u, value: u }))]}
            size="sm"
          />
        </div>
        <div>
          <ATMSelectField
            name="filterAction"
            value={filterAction}
            onChange={(val) => setFilterAction(val ? String(val) : '')}
            options={[{ label: 'All Actions', value: '' }, ...actions.map((a) => ({ label: a, value: a }))]}
            size="sm"
          />
        </div>
        <div>
          <ATMSelectField
            name="filterEntity"
            value={filterEntity}
            onChange={(val) => setFilterEntity(val ? String(val) : '')}
            options={[{ label: 'All Entities', value: '' }, ...entityTypes.map((e) => ({ label: e, value: e }))]}
            size="sm"
          />
        </div>
        <div>
          <ATMTextField
            name="filterDateFrom"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            size="sm"
          />
        </div>
        <div>
          <ATMTextField
            name="filterDateTo"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            size="sm"
          />
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span>Showing {rows.length} of {totalCount} entries</span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-accent-600 hover:text-accent-700 dark:text-accent-400 font-bold"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ATMTable */}
      <ATMCard padding="none" className="overflow-hidden">
        <ATMTable<AuditRow>
          columns={COLUMNS}
          data={rows}
          isLoading={isLoading}
          emptyMessage="No audit entries match your filters."
        />
      </ATMCard>
    </div>
  );
};
