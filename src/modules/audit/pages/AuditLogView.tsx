import React from 'react';
import { Shield, Download, FileText, Search as SearchIcon, X } from 'lucide-react';
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
      <span className="text-slate-900 dark:text-slate-100 font-bold">{name}</span>
    </div>
  );
}

const COLUMNS: ATMTableColumn<AuditRow>[] = [
  {
    key: 'timestamp',
    header: 'Timestamp',
    renderCell: (_val, row) => (
      <span className="whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400 font-semibold">
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
      <span className="text-slate-600 dark:text-slate-400 font-semibold">{row.entityType || '—'}</span>
    ),
    width: '130px',
  },
  {
    key: 'entityId',
    header: 'Entity ID',
    renderCell: (_val, row) => (
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.entityId || '—'}</span>
    ),
    width: '200px',
  },
  {
    key: 'details',
    header: 'Details',
    renderCell: (_val, row) => (
      <span className="max-w-xs truncate block text-slate-600 dark:text-slate-400 font-semibold">
        {row.details || '—'}
      </span>
    ),
  },
  {
    key: 'ipAddress',
    header: 'IP Address',
    renderCell: (_val, row) => (
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.ipAddress || '—'}</span>
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
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        icon={Shield}
        iconColor="theme"
        title="Audit Log"
        subtitle="7-year retention policy. All actions are immutable and non-deletable."
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
      <ATMCard padding="md">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Filters
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-4">
          <ATMTextField
            name="search"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit log…"
            size="md"
            prefix={<SearchIcon size={16} className="text-slate-400" />}
            className="max-w-2xl"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ATMSelectField
              name="filterUser"
              label="User"
              value={filterUser}
              onChange={(val) => setFilterUser(val ? String(val) : '')}
              options={[{ label: 'All Users', value: '' }, ...users.map((u) => ({ label: u, value: u }))]}
              size="md"
            />
            <ATMSelectField
              name="filterAction"
              label="Action"
              value={filterAction}
              onChange={(val) => setFilterAction(val ? String(val) : '')}
              options={[{ label: 'All Actions', value: '' }, ...actions.map((a) => ({ label: a, value: a }))]}
              size="md"
            />
            <ATMSelectField
              name="filterEntity"
              label="Entity"
              value={filterEntity}
              onChange={(val) => setFilterEntity(val ? String(val) : '')}
              options={[{ label: 'All Entities', value: '' }, ...entityTypes.map((e) => ({ label: e, value: e }))]}
              size="md"
            />
            <ATMTextField
              name="filterDateFrom"
              label="From"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              size="md"
            />
            <ATMTextField
              name="filterDateTo"
              label="To"
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              size="md"
            />
          </div>
        </div>
      </ATMCard>

      {/* Result count */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>Showing {rows.length} of {totalCount} entries</span>
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