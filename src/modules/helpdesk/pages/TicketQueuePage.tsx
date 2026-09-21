import React, { useState, useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPagination } from '@/shared/components/Pagination/ATMPagination';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LifeBuoy,
  LayoutGrid,
  List,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Archive,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useTickets, useTicketMetrics } from '@/lib/hooks/useHelpdesk';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { PRIORITY_CONFIG, STATUS_CONFIG, slaTimeRemaining } from '../ticketPresentation';
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  type TicketListItem,
  type TicketStatus,
  type TicketPriority,
} from '@/lib/types/helpdesk';
import type { MerchantType } from '@/lib/types/common';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** Board columns — every state that still needs someone, plus Resolved for hand-off. */
const KANBAN_COLUMNS: readonly TicketStatus[] = [
  'New', 'Open', 'InProgress', 'WaitingOnCustomer', 'WaitingOnInternal', 'Reopened', 'Resolved',
];

const TYPE_OPTIONS: readonly MerchantType[] = ['Enterprise', 'Standalone'];

type ViewMode = 'table' | 'kanban';

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * 2026-09-04: rebuilt on the API's real contract. The page used to read `id`, `merchantName`
 * and `agentName` from rows that carry `ticketNumber`, `handledBy`… (a crash on the first
 * row), showed a total of 0 on every page, offered category / agent-name / date filters the
 * API does not implement, and a "Create Ticket" button that did nothing. Title matches the
 * sidebar entry ("Support Queue"). Tickets are not assigned to users: the "Handled by"
 * column is the name recorded on the ticket, and "Escalated" marks tickets handed to the
 * Operations Managers (`?escalated=1` opens the queue pre-filtered to them).
 */
function TicketQueuePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ---- Local state ---- */
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: string; desc: boolean } | null>(null);
  const [showFilters, setShowFilters] = useState(() => searchParams.get('escalated') === '1');

  const [filterStatus, setFilterStatus] = useState<TicketStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | ''>('');
  const [filterMerchantType, setFilterMerchantType] = useState<MerchantType | ''>('');
  const [filterEscalated, setFilterEscalated] = useState(() => searchParams.get('escalated') === '1');

  /* ---- API calls ---- */
  const ticketsQuery = useTickets({
    page,
    pageSize,
    search: search || undefined,
    status: filterStatus || undefined,
    priority: filterPriority || undefined,
    merchantType: filterMerchantType || undefined,
    escalated: filterEscalated || undefined,
  });

  const metricsQuery = useTicketMetrics();

  const tickets: readonly TicketListItem[] = ticketsQuery.data?.data ?? [];
  const totalCount = ticketsQuery.data?.totalCount ?? 0;
  const metrics = metricsQuery.data?.data;
  const isLoading = ticketsQuery.isLoading;

  const activeFilterCount = [filterStatus, filterPriority, filterMerchantType, filterEscalated].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterMerchantType('');
    setFilterEscalated(false);
    setPage(1);
  };

  /* ---- Table columns ---- */
  const columns = useMemo<ATMTableColumn<TicketListItem>[]>(
    () => [
      {
        key: 'ticketNumber',
        header: 'Ticket',
        width: '110px',
        sortable: true,
        renderCell: (_v) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{_v as string}</span>
        ),
      },
      {
        key: 'merchantName',
        header: 'Merchant',
        sortable: true,
        renderCell: (_v, row) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100">{row.merchantName || '—'}</span>
            <ATMBadge variant={row.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
              {row.merchantType}
            </ATMBadge>
          </div>
        ),
      },
      {
        key: 'subject',
        header: 'Subject',
        sortable: true,
        renderCell: (_v) => (
          <span className="max-w-xs truncate text-slate-900 dark:text-slate-100">{_v as string}</span>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        width: '100px',
        sortable: true,
        renderCell: (_v) => {
          const category = _v as string;
          return category ? <ATMBadge variant="outline" size="sm">{category}</ATMBadge> : <span className="text-xs text-slate-400">—</span>;
        },
      },
      {
        key: 'priority',
        header: 'Priority',
        width: '110px',
        sortable: true,
        renderCell: (_v) => {
          const cfg = PRIORITY_CONFIG[_v as TicketPriority];
          return <ATMBadge variant={cfg.variant} size="sm" dot>{cfg.label}</ATMBadge>;
        },
      },
      {
        key: 'status',
        header: 'Status',
        width: '160px',
        sortable: true,
        renderCell: (_v, row) => {
          const cfg = STATUS_CONFIG[row.status];
          return (
            <div className="flex items-center gap-1.5">
              <ATMBadge variant={cfg.variant} size="sm">{cfg.label}</ATMBadge>
              {row.isEscalated && (
                <ATMBadge variant="danger" size="sm" dot>Escalated</ATMBadge>
              )}
            </div>
          );
        },
      },
      {
        key: 'handledBy',
        header: 'Handled by',
        width: '130px',
        sortable: true,
        renderCell: (_v) => (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {(_v as string | null | undefined) || '—'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        width: '110px',
        sortable: true,
        renderCell: (_v) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {formatRelativeTime(_v as string)}
          </span>
        ),
      },
      {
        key: 'slaDeadline',
        header: 'SLA',
        width: '110px',
        sortable: true,
        renderCell: (_v) => {
          const sla = slaTimeRemaining(_v as string | null | undefined);
          return (
            <span className={cn('text-sm font-medium tabular-nums', sla.breached ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400')}>
              {sla.breached && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
              {sla.text}
            </span>
          );
        },
      },
    ],
    [],
  );

  /** Replicates the previous TanStack single-column toggle for ATMTable's onSort. */
  const handleSort = (field: string) => {
    setSort((prev) => {
      if (!prev) return { field, desc: false };
      if (prev.field === field) return prev.desc ? null : { field, desc: true };
      return { field, desc: false };
    });
  };

  const valueAt = (row: TicketListItem, field: string): unknown =>
    (row as unknown as Record<string, unknown>)[field];

  const compareValues = (a: unknown, b: unknown): number => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  };

  /** Sorted copy of the current page — same client-side behaviour the old table had. */
  const sortedTickets = useMemo(() => {
    if (!sort) return [...tickets];
    const list = [...tickets];
    list.sort((a, b) => {
      const r = compareValues(valueAt(a, sort.field), valueAt(b, sort.field));
      return sort.desc ? -r : r;
    });
    return list;
  }, [tickets, sort]);

  /* ---- Kanban helpers ---- */
  const ticketsByStatus = useMemo(() => {
    const map = new Map<TicketStatus, TicketListItem[]>();
    for (const col of KANBAN_COLUMNS) map.set(col, []);
    for (const t of tickets) {
      // A legacy "Assigned" ticket shows in the Open column; nothing creates that state now.
      const col = t.status === 'Assigned' ? 'Open' : t.status;
      map.get(col)?.push(t);
    }
    return map;
  }, [tickets]);

  /* ---- Quick stats (the API's 30-day window) ---- */
  function renderQuickStats() {
    if (metricsQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ATMSkeleton key={i} variant="card" height="118px" />
          ))}
        </div>
      );
    }

    if (metricsQuery.isError) {
      return (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/40">
          <span className="text-sm text-rose-700 dark:text-rose-300">Ticket metrics could not be loaded.</span>
          <ATMButton variant="ghost" size="sm" onClick={() => { void metricsQuery.refetch(); }}>Retry</ATMButton>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ATMStatsCard
          label="Open (30 days)"
          value={(metrics?.openTickets ?? 0).toLocaleString()}
          icon={Clock}
          variant="accent"
          description="Tickets in flight this window"
        />
        <ATMStatsCard
          label="Resolved (30 days)"
          value={(metrics?.resolvedTickets ?? 0).toLocaleString()}
          icon={CheckCircle2}
          variant="emerald"
          description="Marked resolved this window"
        />
        <ATMStatsCard
          label="Closed (30 days)"
          value={(metrics?.closedTickets ?? 0).toLocaleString()}
          icon={Archive}
          variant="slate"
          description="Closed out this window"
        />
        <ATMStatsCard
          label="Avg Resolution"
          value={`${(metrics?.avgResolutionHours ?? 0).toFixed(1)}h`}
          icon={AlertTriangle}
          variant="amber"
          description="Mean time to resolve"
        />
      </div>
    );
  }

  /* ---- Filter row ---- */
  const selectClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';

  function renderFilters() {
    if (!showFilters) return null;

    return (
      <ATMCard padding="md" className="animate-fade-in">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as TicketStatus | ''); setPage(1); }} className={selectClass}>
              <option value="">All</option>
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority</label>
            <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value as TicketPriority | ''); setPage(1); }} className={selectClass}>
              <option value="">All</option>
              {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Merchant Type</label>
            <select value={filterMerchantType} onChange={(e) => { setFilterMerchantType(e.target.value as MerchantType | ''); setPage(1); }} className={selectClass}>
              <option value="">All</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-1.5">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filterEscalated}
                onChange={(e) => { setFilterEscalated(e.target.checked); setPage(1); }}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Escalated only
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">With the Operations Managers and still open</span>
          </div>
          <div className="flex items-end">
            <ATMButton variant="ghost" size="sm" onClick={clearFilters}>Clear All</ATMButton>
          </div>
        </div>
      </ATMCard>
    );
  }

  /* ---- Load failure ---- */
  const header = (
    <ATMPageHeader
      icon={LifeBuoy}
      iconColor="theme"
      title="Support Queue"
      subtitle="Work, escalate and resolve merchant support tickets"
    />
  );

  if (ticketsQuery.isError) {
    return (
      <div className="w-full space-y-6 animate-fade-in">
        {header}
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/40">
          <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <span>The support queue could not be loaded.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void ticketsQuery.refetch(); }}>Retry</ATMButton>
        </div>
      </div>
    );
  }

  /* ---- Table view ---- */
  function renderTableView() {
    const emptyMessage =
      activeFilterCount > 0 || search
        ? 'No tickets match your search.'
        : 'No merchant has raised a ticket yet.';

    return (
      <ATMCard padding="none" className="overflow-hidden">
        <ATMTable
          columns={columns}
          data={sortedTickets}
          sortBy={sort?.field}
          sortDesc={sort?.desc}
          onSort={handleSort}
          onRowClick={(row) => navigate(`/support/${row.ticketId}`)}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
        <div className="border-t border-slate-200/80 dark:border-slate-800">
          <ATMPagination
            page={page}
            total={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        </div>
      </ATMCard>
    );
  }

  /* ---- Kanban view ---- */
  function renderKanbanView() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
              <ATMSkeleton variant="text" width="60%" />
              <div className="mt-3 space-y-3">
                <ATMSkeleton variant="card" height="6rem" count={3} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KANBAN_COLUMNS.map((col) => {
          const cfg = STATUS_CONFIG[col];
          const items = ticketsByStatus.get(col) ?? [];
          return (
            <div key={col} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ATMBadge variant={cfg.variant} size="sm">{cfg.label}</ATMBadge>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{items.length}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2 overflow-y-auto max-h-[60vh]">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">No tickets</p>
                )}
                {items.map((ticket) => {
                  const priCfg = PRIORITY_CONFIG[ticket.priority];
                  const sla = slaTimeRemaining(ticket.slaDeadline);
                  return (
                    <button
                      key={ticket.ticketId}
                      type="button"
                      onClick={() => navigate(`/support/${ticket.ticketId}`)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-[#13151a]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
                          {ticket.subject}
                        </span>
                        <ATMBadge variant={priCfg.variant} size="sm">{priCfg.label}</ATMBadge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <ATMBadge variant={ticket.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
                          {ticket.merchantType.charAt(0)}
                        </ATMBadge>
                        <span className="truncate">{ticket.merchantName || ticket.ticketNumber}</span>
                        {ticket.isEscalated && (
                          <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                            <ArrowUpRight className="h-3 w-3" /> Escalated
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400 dark:text-slate-500">{formatRelativeTime(ticket.createdAt)}</span>
                        {ticket.slaDeadline && (
                          <span className={cn('font-medium tabular-nums', sla.breached ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400')}>
                            {sla.text}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <div className="w-full space-y-6 animate-fade-in">
      {header}

      {renderQuickStats()}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ticket number or subject..."
            className="input-base w-full h-9 pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <ATMButton
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            className="h-9"
            leftIcon={<Filter className="h-3.5 w-3.5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </ATMButton>
          <div className="inline-flex items-center rounded-lg bg-slate-100/80 p-1 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
          </div>
        </div>
      </div>

      {renderFilters()}

      {viewMode === 'table' ? renderTableView() : renderKanbanView()}
    </div>
  );
}

export default TicketQueuePage;