import React, { useState } from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMTable, ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { ATMPagination } from '@/shared/components/ATMTable/ATMPagination';
import { ATMSearch } from '@/shared/components/SearchInput/ATMSearch';
import {
  Plus,
  Pencil,
  Archive,
  Users,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Monitor,
  Layers,
  Building,
  Store,
  Eye,
  Banknote,
  Star,
} from 'lucide-react';
import { PlanCard } from '../components/PlanCard';
import { PlanCardSkeleton } from '../components/PlanCardSkeleton';
import { FLAVOUR_DISPLAY, type Plan } from '../types/plan.types';

interface PlanListViewProps {
  plans: Plan[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  isLoading: boolean;
  isError: boolean;
  refetch: () => void;

  viewMode: 'grid' | 'list';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'active' | 'inactive' | 'deprecated';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive' | 'deprecated') => void;
  typeFilter: 'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud';
  setTypeFilter: (filter: 'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud') => void;

  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
  onToggleStatus: (planId: string) => void;
  onViewDetails: (plan: Plan) => void;
  onAddClick: () => void;
}

export const PlanListView: React.FC<PlanListViewProps> = ({
  plans,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  refetch,
  viewMode,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  onEditPlan,
  onDeletePlan,
  onToggleStatus,
  onViewDetails,
  onAddClick,
}) => {
  // 2026-09-05: currency always comes from configuration (platform.currency).
  const { currency } = useDeploymentCurrency();

  // Table columns definition for List View
  const columns: ATMTableColumn<Plan>[] = [
    {
      key: 'name',
      header: 'Plan & Tier',
      renderCell: (_, row) => {
        const isMuted = row.status !== 'Active';
        const isPopular = row.status === 'Active' && (row.popular ?? false);
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group/title"
            onClick={() => onViewDetails(row)}
            title="Click to view plan details"
          >
            <div
              className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0', isMuted && 'opacity-60')}
              style={{
                background: isMuted
                  ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)'
                  : `linear-gradient(135deg, ${row.color || '#3b82f6'}, ${(row.color || '#3b82f6')}b3)`,
                boxShadow: isMuted ? undefined : `0 3px 10px ${(row.color || '#3b82f6')}40`,
              }}
            >
              <Banknote size={18} strokeWidth={2} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                {isPopular && (
                  <Star size={12} className="fill-amber-400 stroke-amber-400 shrink-0" />
                )}
                <span
                  className={cn(
                    'font-bold text-sm truncate group-hover/title:text-slate-600 dark:group-hover/title:text-slate-300 transition-colors',
                    isMuted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                  )}
                >
                  {row.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5 truncate">
                priority: {row.priority} · {FLAVOUR_DISPLAY[row.flavour]}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'planType',
      header: 'Plan Type',
      renderCell: (_, row) => (
        <div className="flex flex-col items-start gap-1">
          <ATMBadge
            color={row.planType === 'Enterprise cloud' ? 'purple' : 'success'}
            label={row.planType}
            size="sm"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {FLAVOUR_DISPLAY[row.flavour]}
          </span>
        </div>
      ),
      width: '160px',
    },
    {
      key: 'monthlyPrice',
      header: 'Pricing',
      renderCell: (_, row) => (
        <div className="flex flex-col items-start gap-1">
          <span className={cn('font-extrabold text-sm', row.status === 'Active' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>
            {formatCurrencyOrDash(row.monthlyPrice, currency)}
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500"> /mo</span>
          </span>
          <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-lg px-1.5 py-0.5 text-[10px] font-bold">
            {formatCurrencyOrDash(row.yearlyPrice, currency)} /yr
          </span>
        </div>
      ),
      width: '130px',
    },
    {
      key: 'maxLocations',
      header: 'Limits & Capacity',
      renderCell: (_, row) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-2 py-1"
            title="Maximum physical store outlets/locations allowed under this plan tier"
          >
            <span className="inline-flex h-5 w-5 rounded-md bg-blue-500/10 items-center justify-center">
              <MapPin className="h-3 w-3" />
            </span>
            {row.maxLocations === 0 ? 'Unlimited' : row.maxLocations}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg px-2 py-1"
            title="Maximum cash registers / POS terminal systems active at same time"
          >
            <span className="inline-flex h-5 w-5 rounded-md bg-indigo-500/10 items-center justify-center">
              <Monitor className="h-3 w-3" />
            </span>
            {row.maxTerminals === 0 ? 'Unlimited' : row.maxTerminals}
          </span>
        </div>
      ),
    },
    {
      key: 'merchantCount',
      header: 'Active Subscribers',
      renderCell: (_, row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1',
            row.merchantCount > 0
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60'
          )}
        >
          <Users className="h-3.5 w-3.5" />
          {row.merchantCount} {row.merchantCount === 1 ? 'subscriber' : 'subscribers'}
        </span>
      ),
      width: '170px',
    },
    {
      key: 'status',
      header: 'Status Switch',
      renderCell: (_, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          <ATMSwitch
            name={`switch-${row.id}`}
            checked={row.status === 'Active'}
            onChange={() => onToggleStatus(row.id)}
            size="sm"
          />
        </div>
      ),
      width: '185px',
    },
  ];

  const rowActions = (row: Plan): RowAction<Plan>[] => [
    { label: 'View Details', icon: Eye, onClick: () => onViewDetails(row) },
    { label: 'Edit Plan', icon: Pencil, onClick: () => onEditPlan(row) },
    { label: 'Remove Plan', icon: Archive, variant: 'danger', onClick: () => onDeletePlan(row) },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar: Reusable ATMSearch + Type & Status Filter Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Reusable ATMSearch Component */}
        <div className="w-full lg:w-72">
          <ATMSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search plans by name or tier..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-end">
          {/* Plan Type Selector */}
          <div className="flex flex-wrap items-center gap-0.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800 p-0.5 rounded-[16px]">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('Standalone POS')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                typeFilter === 'Standalone POS'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Store className="h-3.5 w-3.5 shrink-0" />
              Standalone POS
            </button>
            <button
              onClick={() => setTypeFilter('Standalone Cloud')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                typeFilter === 'Standalone Cloud'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Store className="h-3.5 w-3.5 shrink-0" />
              Standalone Cloud
            </button>
            <button
              onClick={() => setTypeFilter('Enterprise cloud')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                typeFilter === 'Enterprise cloud'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Building className="h-3.5 w-3.5 shrink-0" />
              Enterprise Cloud
            </button>
          </div>

          {/* Active / Inactive Status Selector */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800 p-0.5 rounded-[16px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer',
                statusFilter === 'inactive'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Inactive
            </button>
          </div>

          <ATMButton
            variant="outline"
            size="sm"
            onClick={refetch}
            icon={RefreshCw}
            className="shrink-0 rounded-[14px] border-slate-200 dark:border-slate-800/80 h-9 font-bold"
          >
            Refetch
          </ATMButton>
        </div>
      </div>

      {/* Grid or Table List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ATMCard className="rounded-2xl border-red-200/80 dark:border-red-950/40">
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Failed to load subscription plans from server.
            </p>
            <ATMButton variant="primary" size="sm" onClick={refetch} icon={RefreshCw} className="rounded-xl">
              Retry Loading
            </ATMButton>
          </div>
        </ATMCard>
      ) : plans.length === 0 ? (
        <ATMCard className="rounded-2xl">
          <div className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-[20px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No plans match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Try adjusting your search query, plan type, or status filter.
            </p>
            <ATMButton variant="primary" size="sm" onClick={onAddClick} icon={Plus} className="mt-2 rounded-xl">
              Create First Plan
            </ATMButton>
          </div>
        </ATMCard>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={onEditPlan}
                onDelete={onDeletePlan}
                onToggleStatus={onToggleStatus}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>

          {/* Grid View Pagination Controls */}
          {totalCount > 0 && (
            <div className="bg-slate-50/45 dark:bg-slate-950/20 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <ATMPagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSizeOptions={[10, 20, 40, 60]}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--zen-surface)] overflow-hidden shadow-sm h-[calc(100vh-17rem)] min-h-[440px]">
          <ATMTable
            data={plans}
            columns={columns}
            rowActions={rowActions}
            pagination={{
              page,
              pageSize,
              totalCount,
              onPageChange,
              onPageSizeChange,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PlanListView;
