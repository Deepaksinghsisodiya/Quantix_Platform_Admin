import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import { MoreVertical, ArrowUp, ArrowDown, Search, X, Filter } from 'lucide-react';
import clsx from 'clsx';
import { ATMEmptyState, ATMSwitch, ATMTooltip, ATMTextField, ATMButton, ATMCheckbox, ATMIconButton, ATMSelectField } from '../../ui';
import { ATMPagination } from './ATMPagination';
import type { LucideIcon } from 'lucide-react';

export interface ATMTableColumn<T> {
  key: keyof T | string;
  header: string;
  renderCell?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  hidden?: boolean;
  colSpan?: number;
  sticky?: 'left' | 'right';
}

export interface RowAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  hidden?: (row: T) => boolean;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'switch' | 'date';
  options?: { value: any; label: string }[];
  placeholder?: string;
  multiSelect?: boolean;
  defaultValue?: any;
}

export type TableDensity = 'comfortable' | 'compact' | 'high';

export interface ATMTableProps<T> {
  columns: ATMTableColumn<T>[];
  data: readonly T[];
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterConfig?: {
    fields: FilterField[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
    onReset: () => void;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
  };
  extraHeaderActions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => RowAction<T>[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectChange?: (ids: string[]) => void;
  emptyMessage?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  sortBy?: string;
  sortDesc?: boolean;
  onSort?: (field: string) => void;
  className?: string;
  isWide?: boolean;
  density?: TableDensity;
  renderExpandedRow?: (row: T) => React.ReactNode;
  expandedRows?: string[];
  onExpandedRowsChange?: (ids: string[]) => void;
  isFetching?: boolean;
}

const ATMTableComponent = <T,>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterConfig,
  pagination,
  extraHeaderActions,
  onRowClick,
  rowActions,
  selectable = false,
  selectedRows = [],
  onSelectChange,
  emptyMessage = 'No records found',
  onEmptyAction,
  emptyActionLabel,
  sortBy,
  sortDesc,
  onSort,
  className,
  isWide = false,
  density = 'comfortable',
  renderExpandedRow,
  expandedRows = [],
}: ATMTableProps<T>) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tempValues, setTempValues] = useState<Record<string, any>>(filterConfig?.values || {});

  // Keep the drawer's temp snapshot in sync with the live committed filter values.
  // Previously it was taken only once at mount — so opening the drawer a second time
  // showed stale defaultsainegha, and every "Apply" re-committed ALL fields (which would
  // clobber values the drawer was never meant to touch, e.g. committing a default date
  // range over an active custom range on the Tokens list).
  const filterConfigRef = useRef(filterConfig);
  filterConfigRef.current = filterConfig;  // refsync every render to keep handlers current
  const prevOpenRef = useRef(isDrawerOpen);
  useEffect(() => {
    if (isDrawerOpen && !prevOpenRef.current) {
      // Re-snapshot the LIVE values (incl. defaults) whenever the drawer opens, so the
      // "Active Filters" chips/count reflect what's really driving the table.
      setTempValues(filterConfigRef.current?.values || {});
    }
    prevOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  const visibleCols = useMemo(() => columns.filter(c => !c.hidden), [columns]);

  const toggleRow = (id: string) => {
    const next = selectedRows.includes(id)
      ? selectedRows.filter(r => r !== id)
      : [...selectedRows, id];
    onSelectChange?.(next);
  };

  const toggleAll = () => {
    const allIds = data.map(r => String((r as any).id));
    onSelectChange?.(selectedRows.length === data.length && data.length > 0 ? [] : allIds);
  };

  const handleApply = () => {
    if (filterConfig) {
      // Only commit fields the user actually changed in the drawer. Committing
      // every temp entry would re-push untouched values — e.g. re-committing the
      // default "Last 30 days" range and empty dates would flip a custom date
      // range back to the default and reset pagination unnecessarily.
      const committed = filterConfig.values || {};
      Object.entries(tempValues).forEach(([key, value]) => {
        if (committed[key] !== value) filterConfig.onChange(key, value);
      });
    }
    setIsDrawerOpen(false);
  };

  const handleReset = () => {
    filterConfig?.onReset();
    setTempValues({});
    setIsDrawerOpen(false);
  };

  const activeFiltersCount = filterConfig
    ? Object.entries(filterConfig.values).filter(([key, v]) => {
      const field = filterConfig.fields.find((f) => f.key === key);
      return v && v !== 'all' && v !== field?.defaultValue;
    }).length
    : 0;

  const densityClasses = {
    comfortable: {
      th: isWide ? 'px-8 py-4' : 'px-6 py-3.5',
      td: isWide ? 'px-10 py-5' : 'px-6 py-4',
      actionTh: isWide ? 'px-10 py-5' : 'px-6 py-4',
      actionTd: isWide ? 'px-10 py-5' : 'px-6 py-4',
    },
    compact: {
      th: 'px-4 py-2.5',
      td: 'px-4 py-2.5',
      actionTh: 'px-4 py-2.5',
      actionTd: 'px-4 py-2.5',
    },
    high: {
      th: 'px-2 py-1.5',
      td: 'px-2 py-1.5',
      actionTh: 'px-2 py-1.5',
      actionTd: 'px-2 py-1.5',
    }
  };

  const currentDensity = densityClasses[density];

  return (
    <div className={clsx(
      "flex flex-col h-full bg-zen-surface overflow-hidden transition-all duration-300 relative",
      className
    )}>

      {(isLoading || isFetching) && data.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 z-[100] overflow-hidden">
          <div className="h-full bg-accent-500 animate-progress origin-left" />
        </div>
      )}

      <div className="px-6 py-3 border-b border-[var(--zen-border)] bg-zen-surface flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1">
          {onSearchChange && (
            <div className="w-full max-w-[340px]">
              <ATMTextField
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                prefix={<Search size={16} />}
                className="!gap-0"
                suffix={searchValue ? (
                  <button onClick={() => onSearchChange('')} className="p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg text-slate-300 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white transition-all">
                    <X size={14} strokeWidth={3} />
                  </button>
                ) : null}
              />
            </div>
          )}

          {filterConfig && (
            <ATMTooltip content="Refine data selection" position="bottom">
              <ATMButton
                onClick={() => setIsDrawerOpen(true)}
                variant={activeFiltersCount > 0 ? 'primary' : 'outline'}
                icon={Filter}
                className="relative"
              >
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-gray-950">
                    {activeFiltersCount}
                  </span>
                )}
              </ATMButton>
            </ATMTooltip>
          )}
        </div>

        <div className="flex items-center gap-5">
          {pagination && pagination.totalCount > 0 && (
            <div className="flex items-center gap-5 border-r border-[var(--zen-border)] pr-5 mr-1">
              {pagination.onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 whitespace-nowrap">Show:</span>
                  <ATMSelectField
                    name="pageSize"
                    value={pagination.pageSize.toString()}
                    onChange={(val) => pagination.onPageSizeChange?.(Number(val))}
                    options={[
                      { value: '10', label: '10' },
                      { value: '20', label: '20' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' },
                    ]}
                    size="sm"
                    className="w-[80px]"
                  />
                </div>
              )}
              <span className="text-[12px] font-medium text-slate-400 dark:text-gray-500 whitespace-nowrap">
                Showing <span className="text-slate-900 dark:text-white font-bold">{(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}</span> of <span className="text-slate-900 dark:text-white font-bold">{pagination.totalCount}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {extraHeaderActions}
          </div>
        </div>
      </div>

      {filterConfig && activeFiltersCount > 0 && (
        <div className="px-8 py-2.5 bg-zen-surface border-b border-[var(--zen-border)] flex items-center gap-3 animate-in fade-in duration-500">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(filterConfig.values).map(([key, value]) => {
              if (!value || value === 'all') return null;
              const field = filterConfig.fields.find(f => f.key === key);
              if (!field) return null;
              if (field.defaultValue !== undefined && value === field.defaultValue) return null;

              let displayValue = String(value);
              if (field.type === 'select') {
                const opt = field.options?.find(o => o.value === value);
                displayValue = opt ? opt.label : String(value);
              } else if (field.type === 'switch') {
                displayValue = 'Active';
              }

              return (
                <div key={key} className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-gray-400 rounded-lg border border-slate-100/50 dark:border-gray-800 hover:border-slate-200 transition-all cursor-default">
                  <span className="text-[10px] font-bold uppercase tracking-tight opacity-60">{field.label}:</span>
                  <span className="text-[10px] font-black text-slate-700 dark:text-gray-200">{displayValue}</span>
                  <button onClick={() => filterConfig.onChange(key, field.type === 'switch' ? false : 'all')} className="hover:text-rose-500 transition-colors">
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              );
            })}
            <button onClick={handleReset} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest px-2 py-1 transition-all">
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-zen-surface">
        <table className="min-w-full border-separate border-spacing-0" role="grid">
          <thead className="sticky top-0 z-30 bg-slate-50/80 dark:bg-[#121215]/80 backdrop-blur-md shadow-sm border-b border-[var(--zen-border)]" role="rowgroup">
            <tr role="row">
              {selectable && (
                <th className={clsx("border-b border-[var(--zen-border)] w-[60px] bg-transparent sticky left-0 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.02)]", currentDensity.th)} role="columnheader">
                  <ATMCheckbox
                    name="select-all"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {visibleCols.map(col => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    'border-b border-[var(--zen-border)] bg-transparent text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors',
                    currentDensity.th,
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                    col.sortable && 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400',
                    col.sticky === 'left' && 'sticky left-0 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.02)]',
                    col.sticky === 'right' && 'sticky right-0 z-40 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && onSort?.(String(col.key))}
                  role="columnheader"
                  colSpan={col.colSpan}
                >
                  <div className={clsx('flex items-center gap-1.5', col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start')}>
                    {col.header}
                    {sortBy === col.key && (
                      sortDesc ? <ArrowDown size={11} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" /> : <ArrowUp size={11} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th className={clsx(
                  "bg-transparent font-black text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-[160px] border-b border-[var(--zen-border)] sticky right-0 z-40 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]",
                  currentDensity.actionTh
                )} role="columnheader">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-zen-surface" role="rowgroup">
            {(isLoading || isFetching) && data.length === 0 ? (
              Array.from({ length: pagination?.pageSize || 8 }).map((_, r) => (
                <tr key={`skeleton-${r}`} className="border-b border-[var(--zen-border)]">
                  {selectable && (
                    <td className="px-6 py-4 text-center border-b border-[var(--zen-border)]">
                      <div className="w-5 h-5 bg-slate-100 dark:bg-gray-800/60 rounded-md mx-auto animate-skeleton-pulse" />
                    </td>
                  )}
                  {visibleCols.map((_, c) => (
                    <td
                      key={`skeleton-${r}-${c}`}
                      className={clsx(
                        "border-b border-[var(--zen-border)]",
                        currentDensity.td
                      )}
                    >
                      <div
                        className={clsx(
                          "h-3.5 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse",
                          c === 0 ? "w-32" : c === visibleCols.length - 1 ? "w-16 ml-auto" : "w-full max-w-[120px]"
                        )}
                      />
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-6 py-4 text-center border-b border-[var(--zen-border)]">
                      <div className="w-16 h-8 bg-slate-100 dark:bg-gray-800/60 rounded-lg mx-auto animate-skeleton-pulse" />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              (Array.isArray(data) ? data : []).map((row, idx) => {
                const rowId = String((row as any).id || (row as any)._id || idx);
                const isExpanded = expandedRows.includes(rowId);
                const totalColSpan = visibleCols.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

                return (
                  <React.Fragment key={rowId}>
                    <tr
                      className={clsx(
                        'transition-colors duration-200 group cursor-pointer border-b border-[var(--zen-border)]',
                        'hover:bg-slate-50/80 dark:hover:bg-zinc-900/60',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500',
                        isExpanded && 'bg-slate-50 dark:bg-slate-800'
                      )}
                      onClick={() => onRowClick?.(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row);
                        }
                      }}
                      tabIndex={onRowClick ? 0 : undefined}
                      role="row"
                      aria-expanded={renderExpandedRow ? isExpanded : undefined}
                    >
                      {selectable && (
                        <td className={clsx("text-center border-b border-[var(--zen-border)] bg-inherit sticky left-0 z-10 group-hover:bg-zinc-50/70 dark:group-hover:bg-zinc-900 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]", currentDensity.td)} onClick={e => e.stopPropagation()} role="gridcell">
                          <ATMCheckbox
                            name={`select-row-${rowId}`}
                            checked={selectedRows.includes(rowId)}
                            onChange={() => toggleRow(rowId)}
                          />
                        </td>
                      )}
                      {visibleCols.map(col => (
                        <td
                          key={String(col.key)}
                          className={clsx(
                            'text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight border-b border-[var(--zen-border)] transition-colors group-hover:text-slate-900 dark:group-hover:text-white bg-inherit',
                            currentDensity.td,
                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                            col.sticky === 'left' && 'sticky left-0 z-10 hover:z-30 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/80 dark:group-hover:bg-zinc-900/60',
                            col.sticky === 'right' && 'sticky right-0 z-10 hover:z-30 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/80 dark:group-hover:bg-zinc-900/60'
                          )}
                          role="gridcell"
                          colSpan={col.colSpan}
                        >
                          {col.renderCell ? col.renderCell((row as any)[col.key], row) : (
                            <span className={clsx("truncate block leading-tight", !(row as any)[col.key] ? "text-zinc-300 dark:text-zinc-600 font-normal" : "text-zinc-600 dark:text-zinc-300")}>
                              {String((row as any)[col.key] ?? '—')}
                            </span>
                          )}
                        </td>
                      ))}
                      {rowActions && (
                        <td className={clsx(
                          "border-b border-[var(--zen-border)] bg-inherit sticky right-0 z-10 hover:z-50 group-hover:bg-slate-50/80 dark:group-hover:bg-zinc-900/60 transition-colors shadow-[-2px_0_5px_rgba(0,0,0,0.02)]",
                          currentDensity.actionTd
                        )} onClick={e => e.stopPropagation()} role="gridcell">
                          <div className="flex items-center justify-center gap-1.5">
                            {rowActions(row).filter(a => !a.hidden?.(row)).map((action, i) => {
                              const Icon = action.icon || MoreVertical;
                              return (
                                <ATMTooltip key={`${action.label}-${i}`} content={action.label} position="top">
                                  <ATMIconButton
                                    onClick={() => action.onClick(row)}
                                    variant={action.variant === 'danger' ? 'danger' : action.variant === 'success' ? 'success' : 'ghost'}
                                    icon={Icon}
                                    size="sm"
                                  />
                                </ATMTooltip>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                    {isExpanded && renderExpandedRow && (
                      <tr className="bg-slate-50/20 dark:bg-gray-900/20">
                        <td colSpan={totalColSpan} className="p-0 border-b border-slate-50 dark:border-gray-800">
                          <div className="animate-in fade-in duration-300">
                            {renderExpandedRow(row)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {!(isLoading || isFetching) && data.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] py-16 animate-in fade-in duration-500">
            <ATMEmptyState
              title={emptyMessage}
              onAction={onEmptyAction}
              actionLabel={emptyActionLabel}
            />
          </div>
        )}
      </div>

      {pagination && pagination.totalCount > 0 && (
        <div className="border-t border-[var(--zen-border)] px-8 py-3 bg-zen-surface flex-shrink-0" role="navigation">
          <ATMPagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            showInfo={false}
            hidePageSize={true}
          />
        </div>
      )}

      {filterConfig && isDrawerOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute top-[65px] left-8 w-[320px] bg-zen-card z-[101] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-[20px] border border-slate-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left" role="dialog">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-gray-800 bg-zen-card flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-800 dark:text-gray-100 uppercase tracking-[0.1em]">Filters</h3>
              <ATMIconButton icon={X} onClick={() => setIsDrawerOpen(false)} variant="ghost" size="sm" />
            </div>

            <div className="p-6 space-y-7 max-h-[450px] overflow-y-auto scrollbar-none">
              {filterConfig.fields.map((field) => (
                <div key={field.key} className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>

                  <div className="space-y-1.5">
                    {field.type === 'select' && (
                      <div className="flex flex-wrap gap-1.5">
                        {field.options?.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              if (field.multiSelect) {
                                const current = tempValues[field.key] || [];
                                const next = current.includes(opt.value) ? current.filter((v: any) => v !== opt.value) : [...current, opt.value];
                                setTempValues(prev => ({ ...prev, [field.key]: next }));
                              } else {
                                setTempValues(prev => ({ ...prev, [field.key]: opt.value }));
                              }
                            }}
                            className={clsx(
                              "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all",
                              (field.multiSelect ? (tempValues[field.key] || []).includes(opt.value) : tempValues[field.key] === opt.value)
                                ? "bg-slate-900 dark:bg-accent-600 border-slate-900 dark:border-accent-600 text-white"
                                : "bg-zen-card border-slate-100 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-600"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {field.type === 'text' && (
                      <ATMTextField
                        value={tempValues[field.key] || ''}
                        onChange={(e) => setTempValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder || `Search...`}
                        className="!gap-0"
                      />
                    )}

                    {field.type === 'date' && (
                      <ATMTextField
                        type="date"
                        value={tempValues[field.key] || ''}
                        onChange={(e) => setTempValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder || 'Select date'}
                        className="!gap-0"
                      />
                    )}

                    {field.type === 'switch' && (
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-gray-300">Active Only</span>
                        <ATMSwitch
                          name={field.key}
                          checked={tempValues[field.key] || false}
                          onChange={(val) => setTempValues(prev => ({ ...prev, [field.key]: val }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 pt-2 flex items-center gap-3">
              <ATMButton onClick={handleApply} fullWidth size="sm">Apply</ATMButton>
              <ATMButton onClick={handleReset} variant="ghost" size="sm">Reset</ATMButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ATMTable = memo(ATMTableComponent) as typeof ATMTableComponent;
;
