import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useGetAuditLogsQuery, useExportAuditLogsMutation } from '../services/auditApi';
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

  const [exportTrigger] = useExportAuditLogsMutation();

  // 2. Adapt the fetched entries
  const rows: readonly AuditRow[] = useMemo(() => {
    const rawData = response?.data;
    const items = rawData && 'items' in rawData && Array.isArray((rawData as any).items) 
      ? (rawData as any).items 
      : Array.isArray(rawData) ? rawData : [];

    return items.map((log: any) => {
      const userName = log.userName ?? log.userId ?? 'system';
      const initials = userName
        .split(' ')
        .map((s: string) => s[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'SY';

      return {
        id: log.logId || log.id || '',
        timestamp: log.createdAt || log.timestamp || '',
        userName,
        userAvatar: initials,
        action: log.action || '',
        entityType: log.entityType || log.resource || '',
        entityId: log.entityId || log.resourceId || '',
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

  const onExport = async (format: 'CSV' | 'JSON') => {
    try {
      const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
      const defaultTo = new Date().toISOString().split('T')[0] || '';
      const res = await exportTrigger({
        from: filterDateFrom || defaultFrom,
        to: filterDateTo || defaultTo,
        format,
        action: filterAction || undefined,
        userId: filterUser || undefined,
        resource: filterEntity || undefined,
      }).unwrap();


      if (res.success && res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer');
        toast.success(`${format} export ready`);
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
