import React, { useState, useMemo, useCallback } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMEmptyState, ATMSkeleton } from '@/shared/ui';
import { ATMPagination } from '@/shared/components/Pagination/ATMPagination';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { useTickets, useTicketMetrics } from '@/lib/hooks/useHelpdesk';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatDate';
import type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '@/lib/types/helpdesk';
import type { MerchantType } from '@/lib/types/common';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PRIORITY_CONFIG: Record<TicketPriority, { variant: 'danger' | 'warning' | 'default' | 'info'; label: string }> = {
  Urgent: { variant: 'danger', label: 'Critical' },
  High: { variant: 'warning', label: 'High' },
  Medium: { variant: 'info', label: 'Medium' },
  Low: { variant: 'default', label: 'Low' },
};

const STATUS_CONFIG: Record<TicketStatus, { variant: 'info' | 'warning' | 'success' | 'default' | 'danger'; label: string }> = {
  New: { variant: 'info', label: 'New' },
  Open: { variant: 'info', label: 'Open' },
  InProgress: { variant: 'warning', label: 'In Progress' },
  WaitingOnCustomer: { variant: 'default', label: 'Waiting' },
  Resolved: { variant: 'success', label: 'Resolved' },
  Closed: { variant: 'default', label: 'Closed' },
};

const KANBAN_COLUMNS: TicketStatus[] = ['New', 'Open', 'InProgress', 'WaitingOnCustomer', 'Resolved'];

const STATUS_OPTIONS: TicketStatus[] = ['New', 'Open', 'InProgress', 'WaitingOnCustomer', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS: TicketPriority[] = ['Urgent', 'High', 'Medium', 'Low'];
const CATEGORY_OPTIONS: TicketCategory[] = ['Billing', 'Technical', 'Account', 'Token', 'Feature', 'General'];
const TYPE_OPTIONS: MerchantType[] = ['Enterprise', 'Standalone'];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function slaTimeRemaining(deadline: string | null): { text: string; breached: boolean } {
  if (!deadline) return { text: '--', breached: false };
  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return { text: 'Breached', breached: true };
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return { text: `${Math.floor(hours / 24)}d ${hours % 24}h`, breached: false };
  return { text: `${hours}h ${mins}m`, breached: false };
}

/* -------------------------------------------------------------------------- */
/*  View mode type                                                             */
/* -------------------------------------------------------------------------- */

type ViewMode = 'table' | 'kanban';

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function TicketQueuePage() {
  const navigate = useNavigate();

  /* ---- Local state ---- */
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filterStatus, setFilterStatus] = useState<TicketStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState<TicketCategory | ''>('');
  const [filterMerchantType, setFilterMerchantType] = useState<MerchantType | ''>('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  /* ---- API calls ---- */
  const ticketsQuery = useTickets({
    page,
    pageSize,
    search: search || undefined,
    status: filterStatus || undefined,
    priority: filterPriority || undefined,
    category: filterCategory || undefined,
    merchantType: filterMerchantType || undefined,
    agentId: filterAgent || undefined,
    createdFrom: filterDateFrom || undefined,
    createdTo: filterDateTo || undefined,
  });

  const metricsQuery = useTicketMetrics();

  const tickets = ticketsQuery.data?.data?.items ?? [];
  const totalCount = ticketsQuery.data?.data?.totalCount ?? 0;
  const metrics = metricsQuery.data?.data;
  const isLoading = ticketsQuery.isLoading;

  /* ---- Active filter count ---- */
  const activeFilterCount = [filterStatus, filterPriority, filterCategory, filterMerchantType, filterAgent, filterDateFrom, filterDateTo].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterCategory('');
    setFilterMerchantType('');
    setFilterAgent('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }, []);

  /* ---- Table columns ---- */
  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 90,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            #{(getValue() as string).slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: 'merchantName',
        header: 'Merchant',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.merchantName}</span>
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
        cell: ({ getValue }) => (
          <ATMBadge variant="outline" size="sm">{getValue() as string}</ATMBadge>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 100,
        cell: ({ getValue }) => {
          const p = getValue() as TicketPriority;
          const cfg = PRIORITY_CONFIG[p];
          return <ATMBadge variant={cfg.variant} size="sm" dot>{cfg.label}</ATMBadge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ getValue }) => {
          const s = getValue() as TicketStatus;
          const cfg = STATUS_CONFIG[s];
          return <ATMBadge variant={cfg.variant} size="sm">{cfg.label}</ATMBadge>;
        },
      },
      {
        accessorKey: 'agentName',
        header: 'Agent',
        size: 120,
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(getValue() as string | null) ?? 'Unassigned'}
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
          const sla = slaTimeRemaining(getValue() as string | null);
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
            onClick={() => navigate(`/support/${row.original.id}`)}
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
    data: tickets as Ticket[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  /* ---- Kanban helpers ---- */
  const ticketsByStatus = useMemo(() => {
    const map: Record<string, Ticket[]> = {};
    for (const col of KANBAN_COLUMNS) map[col] = [];
    for (const t of tickets) {
      if (map[t.status]) map[t.status]!.push(t);
    }
    return map;
  }, [tickets]);

  /* ---- Quick stats ---- */
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

    const stats = [
      { label: 'Open', value: metrics?.totalOpen ?? 0, icon: <Clock className="h-5 w-5 text-blue-500" />, color: 'text-blue-600 dark:text-blue-400' },
      { label: 'In Progress', value: metrics?.byAgent?.length ?? 0, icon: <Loader2 className="h-5 w-5 text-amber-500" />, color: 'text-amber-600 dark:text-amber-400' },
      { label: 'Resolved', value: metrics?.totalResolved ?? 0, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'SLA Breached', value: `${(100 - (metrics?.slaCompliancePercent ?? 100)).toFixed(1)}%`, icon: <AlertTriangle className="h-5 w-5 text-red-500" />, color: 'text-red-600 dark:text-red-400' },
    ];

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TicketStatus | '')} className="input-select">
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TicketPriority | '')} className="input-select">
              <option value="">All</option>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as TicketCategory | '')} className="input-select">
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant Type</label>
            <select value={filterMerchantType} onChange={(e) => setFilterMerchantType(e.target.value as MerchantType | '')} className="input-select">
              <option value="">All</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Agent</label>
            <input type="text" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} placeholder="Agent name..." className="input-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="input-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="input-base" />
          </div>
          <div className="flex items-end">
            <ATMButton variant="ghost" size="sm" onClick={clearFilters}>Clear All</ATMButton>
          </div>
        </div>
      </ATMCard>
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
            description="Try adjusting your search or filters, or create a new ticket."
            onAction={() => navigate('/support')}
            actionLabel="Create Ticket"
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
                  onClick={() => navigate(`/support/${row.original.id}`)}
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
            onPageSizeChange={setPageSize}
          />
        </div>
      </ATMCard>
    );
  }

  /* ---- Kanban view ---- */
  function renderKanbanView() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {KANBAN_COLUMNS.map((col) => {
          const cfg = STATUS_CONFIG[col];
          const items = ticketsByStatus[col] ?? [];
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
                      key={ticket.id}
                      type="button"
                      onClick={() => navigate(`/support/${ticket.id}`)}
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
                        <span className="truncate">{ticket.merchantName}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{formatRelativeTime(ticket.createdAt)}</span>
                        {sla.text !== '--' && (
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
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and resolve customer support requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ATMButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Create Ticket
          </ATMButton>
        </div>
      </div>

      {/* Quick stats */}
      {renderQuickStats()}

      {/* Toolbar: search + view toggle + filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ticket ID or subject..."
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

      {/* Filters */}
      {renderFilters()}

      {/* Content */}
      {viewMode === 'table' ? renderTableView() : renderKanbanView()}
    </div>
  );
}

export default TicketQueuePage;
