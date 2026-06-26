import React, { useState, useMemo, useEffect } from 'react';
import { Shield, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { getAuditLogs, exportAuditLogs, type ActivityLog } from '@/lib/api/audit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuditAction =
  | 'Create' | 'Update' | 'Delete'
  | 'Login' | 'Logout'
  | 'ConfigChange' | 'PermissionChange'
  | 'TokenGenerate' | 'CommissionApproval' | 'View'
  | string;

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

interface AuditRow {
  id: string;
  timestamp: string;
  userName: string;
  userAvatar: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

function adapt(log: ActivityLog): AuditRow {
  const userName = log.userName ?? log.userId ?? 'system';
  const initials = userName
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SY';
  return {
    id: log.logId,
    timestamp: log.createdAt,
    userName,
    userAvatar: initials,
    action: log.action,
    entityType: log.entityType ?? '',
    entityId: log.entityId ?? '',
    details: log.details ?? '',
    ipAddress: log.ipAddress ?? '',
  };
}

// ---------------------------------------------------------------------------
// Timestamp formatter
// ---------------------------------------------------------------------------

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// User avatar cell
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Column definitions (outside component to avoid re-creation)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [rows, setRows] = useState<readonly AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAuditLogs({
      page: 1,
      pageSize: 200,
      fromDate: filterDateFrom || undefined,
      toDate: filterDateTo ? `${filterDateTo}T23:59:59Z` : undefined,
      action: filterAction || undefined,
      entityType: filterEntity || undefined,
      userId: filterUser || undefined,
    })
      .then((res) => {
        if (!active) return;
        if (res.success) {
          setRows((res.data ?? []).map(adapt));
        } else {
          setError((res as { error?: string }).error ?? 'Failed to load audit log.');
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message ?? 'Failed to load audit log.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filterAction, filterEntity, filterUser, filterDateFrom, filterDateTo]);

  // ---------------------------------------------------------------------------
  // Derived options
  // ---------------------------------------------------------------------------

  const users = useMemo(() => Array.from(new Set(rows.map((r) => r.userName))).sort(), [rows]);
  const entityTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.entityType))).filter(Boolean).sort(), [rows]);
  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);

  // Client-side text search filter
  const filtered = useMemo(() => {
    if (!search) return rows as AuditRow[];
    const q = search.toLowerCase();
    return (rows as AuditRow[]).filter(
      (e) =>
        e.entityId.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const hasFilters = !!(filterUser || filterAction || filterEntity || filterDateFrom || filterDateTo || search);

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const onExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const res = await exportAuditLogs(
        {
          fromDate: filterDateFrom || undefined,
          toDate: filterDateTo ? `${filterDateTo}T23:59:59Z` : undefined,
          action: filterAction || undefined,
          entityType: filterEntity || undefined,
          userId: filterUser || undefined,
        },
        format,
      );
      if (res.success && res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer');
        toast.success(`${format.toUpperCase()} export ready`);
      } else {
        toast.error((res as { error?: string }).error ?? `Export ${format.toUpperCase()} failed`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      toast.error(msg);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterUser('');
    setFilterAction('');
    setFilterEntity('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            <ATMButton variant="secondary" size="sm" icon={Download} onClick={() => onExport('csv')}>
              Export CSV
            </ATMButton>
            <ATMButton variant="secondary" size="sm" icon={FileText} onClick={() => onExport('pdf')}>
              Export PDF
            </ATMButton>
            <ATMButton variant="secondary" size="sm" onClick={() => onExport('json')}>
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
        <span>Showing {filtered.length} of {rows.length} entries</span>
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
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ATMTable */}
      <ATMCard padding="none" className="overflow-hidden">
        <ATMTable<AuditRow>
          columns={COLUMNS}
          data={filtered}
          isLoading={loading}
          emptyMessage="No audit entries match your filters."
        />
      </ATMCard>
    </div>
  );
}

export default AuditLogPage;
