import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useGetAuditLogsQuery, useLazyExportAuditLogsQuery } from '../services/auditApi';
import { AuditLogView } from './AuditLogView';

export interface AuditActionVariant {
  variant: 'success' | 'primary' | 'danger' | 'warning' | 'default';
}

export interface AuditRow {
  id: string;
  timestamp: string;
  userName: string;
  userAvatar: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export const AuditLogWrapper: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // 1. Fetch data from RTK Query
  const { data: response, isLoading, isError, error } = useGetAuditLogsQuery({
    page: 1,
    pageSize: 200,
    fromDate: filterDateFrom || undefined,
    toDate: filterDateTo ? `${filterDateTo}T23:59:59Z` : undefined,
    action: filterAction || undefined,
    entityType: filterEntity || undefined,
    userId: filterUser || undefined,
  });

  const [exportTrigger] = useLazyExportAuditLogsQuery();

  // 2. Adapt the fetched entries
  // 2026-09-08: GET /audit/logs answers a plain array of ActivityLogDto.
  const rows: readonly AuditRow[] = useMemo(() => {
    const items = response?.data ?? [];

    return items.map((log) => {
      const userName = log.userName ?? log.userId ?? 'system';
      const initials = userName
        .split(' ')
        .map((s: string) => s[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'SY';

      return {
        id: log.logId,
        timestamp: log.createdAt,
        userName,
        userAvatar: initials,
        action: log.action || '',
        entityType: log.entityType || '',
        entityId: log.entityId || '',
        details: log.details || '',
        ipAddress: log.ipAddress || '',
      };
    });
  }, [response]);

  // 3. Derive unique filter options based on the fetched data
  const users = useMemo(() => Array.from(new Set(rows.map((r) => r.userName))).sort(), [rows]);
  const entityTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.entityType))).filter(Boolean).sort(), [rows]);
  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);

  // Client-side text search filter matching the original functionality
  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (e) =>
        e.entityId.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const hasFilters = !!(filterUser || filterAction || filterEntity || filterDateFrom || filterDateTo || search);

  // 2026-09-08: the API returns the export TEXT (GET /audit/logs/export?format=), not a
  // download link; the old code posted a body and then opened a `downloadUrl` that was never
  // in the response. The same filter as the list is exported, capped at 5,000 rows.
  const onExport = async (format: 'CSV' | 'JSON') => {
    try {
      const res = await exportTrigger({
        format: format === 'CSV' ? 'csv' : 'json',
        page: 1,
        pageSize: 5000,
        fromDate: filterDateFrom || undefined,
        toDate: filterDateTo ? `${filterDateTo}T23:59:59Z` : undefined,
        action: filterAction || undefined,
        entityType: filterEntity || undefined,
        userId: filterUser || undefined,
      }).unwrap();

      if (res.success && typeof res.data === 'string') {
        const blob = new Blob([res.data], { type: format === 'CSV' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(`${format} export downloaded`);
      } else {
        toast.error(`Export ${format} failed`);
      }
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || 'Export failed';
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

  const parsedError = error ? (error as any)?.data?.message || (error as any)?.message || 'Failed to load audit log.' : null;

  return (
    <AuditLogView
      search={search}
      setSearch={setSearch}
      filterUser={filterUser}
      setFilterUser={setFilterUser}
      filterAction={filterAction}
      setFilterAction={setFilterAction}
      filterEntity={filterEntity}
      setFilterEntity={setFilterEntity}
      filterDateFrom={filterDateFrom}
      setFilterDateFrom={setFilterDateFrom}
      filterDateTo={filterDateTo}
      setFilterDateTo={setFilterDateTo}
      users={users}
      entityTypes={entityTypes}
      actions={actions}
      rows={filteredRows}
      totalCount={rows.length}
      isLoading={isLoading}
      error={parsedError}
      hasFilters={hasFilters}
      clearFilters={clearFilters}
      onExport={onExport}
    />
  );
};
