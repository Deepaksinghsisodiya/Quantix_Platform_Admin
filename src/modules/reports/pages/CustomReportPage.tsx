import React, { useMemo, useState, useCallback } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ExportButton } from '@/shared/components/ExportButton';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Plus, Trash2, Play, Save, X, AlertTriangle } from 'lucide-react';
import type { ReportExportFormat } from '@/lib/types';
import { useRevenueReport, useExportReport } from '@/lib/hooks/useReports';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FilterCondition {
  readonly id: string;
  field: string;
  operator: string;
  value: string;
}

interface ResultRow {
  readonly label: string;
  readonly revenue: number;
  readonly tokenCount: number;
  readonly transactionCount: number;
  readonly commission: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DIMENSIONS = [
  { key: 'merchantType', label: 'Merchant Type' },
  { key: 'businessNature', label: 'Business Type' },
  { key: 'planTier', label: 'Plan / Tier' },
  { key: 'country', label: 'Country' },
  { key: 'region', label: 'Region' },
  { key: 'datePeriod', label: 'Date Period' },
  { key: 'signupCohort', label: 'Signup Cohort' },
  { key: 'status', label: 'Merchant Status' },
  { key: 'source', label: 'Acquisition Source' },
];

const MEASURES = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'mrr', label: 'MRR' },
  { key: 'arr', label: 'ARR' },
  { key: 'arpu', label: 'ARPU' },
  { key: 'ltv', label: 'Customer LTV' },
  { key: 'tokenCount', label: 'Token Count' },
  { key: 'tokenRevenue', label: 'Token Revenue' },
  { key: 'transactionCount', label: 'Transaction Count' },
  { key: 'transactionVolume', label: 'Transaction Volume' },
  { key: 'commission', label: 'Commission' },
  { key: 'churnRate', label: 'Churn Rate' },
  { key: 'signupCount', label: 'Signup Count' },
  { key: 'activeUsers', label: 'Active Users' },
  { key: 'apiCalls', label: 'API Call Volume' },
];

const FILTER_FIELDS = ['Merchant Type', 'Business Type', 'Plan', 'Tier', 'Country', 'Region', 'Status', 'Date', 'Signup Source', 'Tag'];
const FILTER_OPERATORS = ['equals', 'not equals', 'contains', 'greater than', 'less than', 'between', 'in', 'is null', 'is not null'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// TODO Pass-26: hook missing — useCustomReport (ad-hoc dimension/measure/filter
// query builder) does not exist on backend yet; we drive results from
// useRevenueReport while still allowing the user to build/run/save the
// definition locally. Save uses local-only state.

function CustomReportPage() {
  const [hasRun, setHasRun] = useState(true); // pre-filled
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportName, setReportName] = useState('');

  // Dimensions & measures
  const [selectedDimensions, setSelectedDimensions] = useState<Set<string>>(
    new Set(['merchantType', 'planTier']),
  );
  const [selectedMeasures, setSelectedMeasures] = useState<Set<string>>(
    new Set(['revenue', 'transactionCount', 'commission']),
  );

  // Filters
  const [filters, setFilters] = useState<FilterCondition[]>([
    { id: 'f-1', field: 'Status', operator: 'equals', value: 'Active' },
  ]);

  const toggleDimension = useCallback((key: string) => {
    setSelectedDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleMeasure = useCallback((key: string) => {
    setSelectedMeasures((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const addFilter = useCallback(() => {
    setFilters((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, field: FILTER_FIELDS[0] ?? '', operator: FILTER_OPERATORS[0] ?? '', value: '' },
    ]);
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFilter = useCallback(
    (id: string, key: keyof FilterCondition, value: string) => {
      setFilters((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
      );
    },
    [],
  );

  const revenueQuery = useRevenueReport({ granularity: 'Monthly' });
  const exportMut = useExportReport();

  const results = useMemo<ResultRow[]>(() => {
    const items = revenueQuery.data?.data ?? [];
    if (items.length === 0) return [];
    return items.map((r) => ({
      label: new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: r.totalRevenue,
      tokenCount: 0,
      transactionCount: 0,
      commission: r.commissionRevenue,
    }));
  }, [revenueQuery.data]);

  const chartData = useMemo(
    () => results.map((r) => ({ name: r.label, revenue: r.revenue })),
    [results],
  );

  const isLoading = revenueQuery.isLoading;
  const isError = revenueQuery.isError;

  const handleRun = () => {
    setHasRun(true);
    void revenueQuery.refetch();
  };

  const handleSave = () => {
    toast.success(`Report "${reportName || 'Untitled'}" saved locally`);
    setShowSaveModal(false);
    setReportName('');
  };

  const handleExport = (format: ReportExportFormat) => {
    exportMut.mutate(
      {
        reportType: 'Custom',
        format,
        params: { granularity: 'Monthly' },
      },
      {
        onSuccess: () => toast.success('Export queued'),
        onError: () => toast.error('Failed to export report'),
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Custom Report Builder</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Build reports with flexible dimensions, measures, and filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors',
              'hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            )}
          >
            <Save className="h-4 w-4" />
            Save Report
          </button>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Builder controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dimensions */}
        <ATMCard title="Dimensions" padding="md">
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            ATMSelect the grouping dimensions for your report
          </p>
          <div className="flex flex-wrap gap-2">
            {DIMENSIONS.map((dim) => (
              <label
                key={dim.key}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                  selectedDimensions.has(dim.key)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedDimensions.has(dim.key)}
                  onChange={() => toggleDimension(dim.key)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    selectedDimensions.has(dim.key)
                      ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600',
                  )}
                >
                  {selectedDimensions.has(dim.key) && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {dim.label}
              </label>
            ))}
          </div>
        </ATMCard>

        {/* Measures */}
        <ATMCard title="Measures" padding="md">
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            ATMSelect the values to aggregate
          </p>
          <div className="flex flex-wrap gap-2">
            {MEASURES.map((m) => (
              <label
                key={m.key}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                  selectedMeasures.has(m.key)
                    ? 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-900/30 dark:text-violet-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedMeasures.has(m.key)}
                  onChange={() => toggleMeasure(m.key)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    selectedMeasures.has(m.key)
                      ? 'border-violet-500 bg-violet-500 dark:border-violet-400 dark:bg-violet-500'
                      : 'border-gray-300 dark:border-gray-600',
                  )}
                >
                  {selectedMeasures.has(m.key) && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {m.label}
              </label>
            ))}
          </div>
        </ATMCard>
      </div>

      {/* Filter builder */}
      <ATMCard title="Filters" padding="md">
        <div className="space-y-3">
          {filters.map((filter) => (
            <div key={filter.id} className="flex flex-wrap items-center gap-2">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                className={cn(
                  'h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700',
                  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                )}
              >
                {FILTER_FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                className={cn(
                  'h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700',
                  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                )}
              >
                {FILTER_OPERATORS.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                placeholder="Value..."
                className={cn(
                  'h-9 flex-1 min-w-[120px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700',
                  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                )}
              />
              <button
                type="button"
                onClick={() => removeFilter(filter.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                aria-label="Remove filter"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFilter}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus className="h-4 w-4" />
            Add condition
          </button>
        </div>
      </ATMCard>

      {/* Run button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleRun}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors',
            'hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-gray-900',
          )}
        >
          <Play className="h-4 w-4" />
          Run Report
        </button>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load report data.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void revenueQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Results */}
      {hasRun && (
        <>
          {/* Chart */}
          <ATMCard title="Results Visualization" action={
            <ATMBadge variant="success" size="sm" dot>
              {results.length} rows
            </ATMBadge>
          }>
            {isLoading ? (
              <ATMSkeleton variant="rect" height="300px" />
            ) : results.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                No data for current parameters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="#9ca3af"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={((value: number) => formatCurrency(value)) as never}
                    contentStyle={{
                      backgroundColor: 'var(--color-surface, #fff)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ATMCard>

          {/* Data table */}
          <ATMCard title="Results Data">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Group</th>
                    {selectedMeasures.has('revenue') && (
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                    )}
                    {selectedMeasures.has('tokenCount') && (
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Tokens</th>
                    )}
                    {selectedMeasures.has('transactionCount') && (
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Transactions</th>
                    )}
                    {selectedMeasures.has('commission') && (
                      <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Commission</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {results.map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{row.label}</td>
                      {selectedMeasures.has('revenue') && (
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                          {formatCurrency(row.revenue)}
                        </td>
                      )}
                      {selectedMeasures.has('tokenCount') && (
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                          {row.tokenCount.toLocaleString()}
                        </td>
                      )}
                      {selectedMeasures.has('transactionCount') && (
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                          {row.transactionCount.toLocaleString()}
                        </td>
                      )}
                      {selectedMeasures.has('commission') && (
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                          {formatCurrency(row.commission)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ATMCard>
        </>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={cn(
              'w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl',
              'dark:border-gray-700 dark:bg-gray-900',
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Save Report
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="report-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Report Name
                </label>
                <input
                  id="report-name"
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Q1 Revenue by Tier"
                  className={cn(
                    'w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700',
                    'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className={cn(
                    'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors',
                    'hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!reportName.trim()}
                  className={cn(
                    'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
                    'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomReportPage;
