import React, { useState, useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMEmptyState, ATMSkeleton } from '@/shared/ui';
import { ATMPagination } from '@/shared/components/Pagination/ATMPagination';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  LayoutGrid,
  List,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Archive,
  ArrowUpDown,
  ArrowUpRight,
  ChevronRight,
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
  const [sorting, setSorting] = useState<SortingState>([]);
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
  const columns = useMemo<ColumnDef<TicketListItem>[]>(
    () => [
      {
        accessorKey: 'ticketNumber',
        header: 'Ticket',
        size: 110,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'merchantName',
        header: 'Merchant',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.merchantName || '—'}</span>
            <ATMBadge variant={row.original.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
              {row.original.merchantType}
            </ATMBadge>
          </div>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate text-gray-900 dark:text-gray-100">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 100,
        cell: ({ getValue }) => {
          const category = getValue() as string;
          return category ? <ATMBadge variant="outline" size="sm">{category}</ATMBadge> : <span className="text-xs text-gray-400">—</span>;
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 100,
        cell: ({ getValue }) => {
          const cfg = PRIORITY_CONFIG[getValue() as TicketPriority];
          return <ATMBadge variant={cfg.variant} size="sm" dot>{cfg.label}</ATMBadge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status];
          return (
            <div className="flex items-center gap-1.5">
              <ATMBadge variant={cfg.variant} size="sm">{cfg.label}</ATMBadge>
              {row.original.isEscalated && (
                <ATMBadge variant="danger" size="sm" dot>Escalated</ATMBadge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'handledBy',
        header: 'Handled by',
        size: 130,
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(getValue() as string | null | undefined) || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        size: 110,
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatRelativeTime(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'slaDeadline',
        header: 'SLA',
        size: 100,
        cell: ({ getValue }) => {
          const sla = slaTimeRemaining(getValue() as string | null | undefined);
          return (
            <span className={cn('text-sm font-medium tabular-nums', sla.breached ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400')}>
              {sla.breached && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
              {sla.text}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 40,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/support/${row.original.ticketId}`)}
            className="rounded p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            aria-label="View ticket"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [navigate],
  );

  const table = useReactTable({
    data: tickets as TicketListItem[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
  });

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <ATMSkeleton variant="text" width="60%" />
              <ATMSkeleton variant="text" width="40%" height="28px" className="mt-2" />
            </div>
          ))}
        </div>
      );
    }

    if (metricsQuery.isError) {
      return (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <span className="text-sm text-red-700 dark:text-red-300">Ticket metrics could not be loaded.</span>
          <ATMButton variant="ghost" size="sm" onClick={() => { void metricsQuery.refetch(); }}>Retry</ATMButton>
        </div>
      );
    }

    const stats = [
      { label: 'Open (30 days)', value: metrics?.openTickets ?? 0, icon: <Clock className="h-5 w-5 text-blue-500" />, color: 'text-blue-600 dark:text-blue-400' },
      { label: 'Resolved (30 days)', value: metrics?.resolvedTickets ?? 0, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Closed (30 days)', value: metrics?.closedTickets ?? 0, icon: <Archive className="h-5 w-5 text-gray-500" />, color: 'text-gray-700 dark:text-gray-300' },
      { label: 'Avg Resolution', value: `${(metrics?.avgResolutionHours ?? 0).toFixed(1)}h`, icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, color: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
              {s.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className={cn('text-xl font-bold tabular-nums', s.color)}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---- Filter row ---- */
  function renderFilters() {
    if (!showFilters) return null;

    return (
      <ATMCard padding="md" className="animate-fade-in">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as TicketStatus | ''); setPage(1); }} className="input-select">
              <option value="">All</option>
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
            <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value as TicketPriority | ''); setPage(1); }} className="input-select">
              <option value="">All</option>
              {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant Type</label>
            <select value={filterMerchantType} onChange={(e) => { setFilterMerchantType(e.target.value as MerchantType | ''); setPage(1); }} className="input-select">
              <option value="">All</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-1.5">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={filterEscalated}
                onChange={(e) => { setFilterEscalated(e.target.checked); setPage(1); }}
                className="h-4 w-4 rounded border-gray-300"
              />
              Escalated only
            </label>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">With the Operations Managers and still open</span>
          </div>
          <div className="flex items-end">
            <ATMButton variant="ghost" size="sm" onClick={clearFilters}>Clear All</ATMButton>
          </div>
        </div>
      </ATMCard>
    );
  }

  /* ---- Load failure ---- */
  if (ticketsQuery.isError) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Queue</h1>
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
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
    if (isLoading) {
      return (
        <ATMCard padding="none">
          <div className="space-y-3 p-5">
            <ATMSkeleton variant="table-row" count={8} />
          </div>
        </ATMCard>
      );
    }

    if (!tickets.length) {
      return (
        <ATMCard padding="none">
          <ATMEmptyState
            icon={Search}
            title="No tickets found"
            description={activeFilterCount > 0 || search ? 'Try adjusting your search or filters.' : 'No merchant has raised a ticket yet.'}
          />
        </ATMCard>
      );
    }

    return (
      <ATMCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={cn('inline-flex items-center gap-1', header.column.getCanSort() && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200')}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  onClick={() => navigate(`/support/${row.original.ticketId}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
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
            <div key={col} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/30">
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
            <div key={col} className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
              <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2.5 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ATMBadge variant={cfg.variant} size="sm">{cfg.label}</ATMBadge>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{items.length}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2 overflow-y-auto max-h-[60vh]">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">No tickets</p>
                )}
                {items.map((ticket) => {
                  const priCfg = PRIORITY_CONFIG[ticket.priority];
                  const sla = slaTimeRemaining(ticket.slaDeadline);
                  return (
                    <button
                      key={ticket.ticketId}
                      type="button"
                      onClick={() => navigate(`/support/${ticket.ticketId}`)}
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                          {ticket.subject}
                        </span>
                        <ATMBadge variant={priCfg.variant} size="sm">{priCfg.label}</ATMBadge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <ATMBadge variant={ticket.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
                          {ticket.merchantType.charAt(0)}
                        </ATMBadge>
                        <span className="truncate">{ticket.merchantName || ticket.ticketNumber}</span>
                        {ticket.isEscalated && (
                          <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400">
                            <ArrowUpRight className="h-3 w-3" /> Escalated
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{formatRelativeTime(ticket.createdAt)}</span>
                        {ticket.slaDeadline && (
                          <span className={cn('font-medium tabular-nums', sla.breached ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>
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
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Queue</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Work, escalate and resolve merchant support tickets
          </p>
        </div>
      </div>

      {renderQuickStats()}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ticket number or subject..."
            className="input-base w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <ATMButton
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
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
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
              )}
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
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
