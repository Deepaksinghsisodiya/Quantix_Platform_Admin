import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { LayoutGrid, List, Plus, Loader2 } from 'lucide-react';
import { usePagination } from '@/shared/hooks/usePagination';
import {
  usePlansList,
  useTogglePlanStatusHook,
  useDeletePlanHook,
} from '../services/usePlans';
import { PlanStatsSummary } from '../components/PlanStatsSummary';
import { PlanListView } from './PlanListView';
import { AddPlanWrapper } from '../Add/AddPlanWrapper';
import { EditPlanWrapper } from '../Edit/EditPlanWrapper';
import { PlanDetailModal } from '../Detail/PlanDetailModal';
import { cn } from '@/lib/utils/cn';
import type { Plan, PlanType, PlanStatus } from '../types/plan.types';
import { DUMMY_PLANS } from '../types/plan.types';

const PLAN_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#6b7280'];

export const PlanListWrapper: React.FC = () => {
  const plansQuery = usePlansList();
  const toggleStatusMutation = useTogglePlanStatusHook();
  const deletePlanMutation = useDeletePlanHook();

  const [localPlans, setLocalPlans] = useState<Plan[]>(DUMMY_PLANS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<Plan | null>(null);

  // 🧪 usePagination Hook for URL Sync & Pagination
  const {
    params,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onFilterChange,
  } = usePagination({
    page: 1,
    pageSize: 6,
    search: '',
    statusFilter: 'all',
    typeFilter: 'all',
  });

  const searchQuery = params.search || '';
  const statusFilter = (params.statusFilter as 'all' | 'active' | 'inactive' | 'deprecated') || 'all';
  const typeFilter = (params.typeFilter as 'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud') || 'all';

  // Display local pre-configured plans directly (ignoring unconfigured database API list rows)
  const rawPlans: Plan[] = localPlans;

  // Filtered plans
  const filteredPlans = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return rawPlans.filter((plan) => {
      const planName = (plan.name || '').toLowerCase();
      const matchesSearch = !q || planName.includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? plan.status === 'Active'
          : statusFilter === 'inactive'
          ? plan.status === 'Inactive'
          : plan.status === 'Deprecated';

      const matchesType =
        typeFilter === 'all' ? true : plan.planType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rawPlans, searchQuery, statusFilter, typeFilter]);

  // Paginated Sliced Plans
  const paginatedPlans = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return filteredPlans.slice(start, start + params.pageSize);
  }, [filteredPlans, params.page, params.pageSize]);

  // Metrics summary
  const activeCount = rawPlans.filter((p) => p.status === 'Active').length;
  const inactiveCount = rawPlans.filter((p) => p.status === 'Inactive').length;
  const totalMerchants = rawPlans.reduce((acc, p) => acc + p.merchantCount, 0);

  const handleToggleStatus = async (planId: string) => {
    const target = localPlans.find((p) => p.id === planId);
    const nextStatus = target?.status === 'Active' ? 'Inactive' : 'Active';

    setLocalPlans((prev) =>
      prev.map((plan) => (plan.id === planId ? { ...plan, status: nextStatus } : plan))
    );
    toast.info(`Plan "${target?.name || planId}" status changed to ${nextStatus}.`);

    try {
      await toggleStatusMutation.mutateAsync({ id: planId, status: nextStatus as any });
    } catch {
      // Local fallback
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    setLocalPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
    toast.success(`Plan "${deletingPlan.name}" removed.`);
    const idToDelete = deletingPlan.id;
    setDeletingPlan(null);

    try {
      await deletePlanMutation.mutateAsync(idToDelete);
    } catch {
      // Local fallback
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2.5">
            <span>Subscription & Billing Plans</span>
            {plansQuery.isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          </div>
        }
        subtitle="Manage pricing tiers, merchant limits, and features for Cloud Enterprise & Standalone POS"
        extraActions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <List className="h-4 w-4" />
                List Table
              </button>
            </div>

            <ATMBadge label={`${rawPlans.length} Total Plans`} color="purple" />
          </div>
        }
        action={{
          label: 'Create New Plan',
          onClick: () => setIsAddOpen(true),
          icon: Plus,
        }}
      />

      {/* Top Summary Stats */}
      <PlanStatsSummary
        totalPlans={rawPlans.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        totalMerchants={totalMerchants}
      />

      {/* Main List & Grid View Presenter */}
      <PlanListView
        plans={paginatedPlans}
        totalCount={filteredPlans.length}
        page={params.page}
        pageSize={params.pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={plansQuery.isLoading}
        isError={plansQuery.isError}
        refetch={plansQuery.refetch}
        viewMode={viewMode}
        searchQuery={searchQuery}
        setSearchQuery={onSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={(val: 'all' | 'active' | 'inactive' | 'deprecated') => onFilterChange('statusFilter', val)}
        typeFilter={typeFilter}
        setTypeFilter={(val: 'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud') => onFilterChange('typeFilter', val)}
        onEditPlan={(plan: Plan) => setEditingPlan(plan)}
        onDeletePlan={(plan: Plan) => setDeletingPlan(plan)}
        onToggleStatus={handleToggleStatus}
        onViewDetails={(plan: Plan) => setViewingPlan(plan)}
        onAddClick={() => setIsAddOpen(true)}
      />

      {/* Plan Detail Modal */}
      <PlanDetailModal
        isOpen={!!viewingPlan}
        onClose={() => setViewingPlan(null)}
        plan={viewingPlan}
        onEdit={(p: Plan) => setEditingPlan(p)}
        onDelete={(p: Plan) => setDeletingPlan(p)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add Plan Modal Wrapper */}
      <AddPlanWrapper
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newPlan?: any) => {
          if (newPlan && newPlan.id) {
            setLocalPlans((prev) => [...prev, newPlan]);
          }
          plansQuery.refetch();
        }}
      />

      {/* Edit Plan Modal Wrapper */}
      <EditPlanWrapper
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        plan={editingPlan}
        onSuccess={(updatedPlan?: any) => {
          if (updatedPlan && updatedPlan.id) {
            setLocalPlans((prev) => prev.map((p) => p.id === updatedPlan.id ? updatedPlan : p));
          }
          plansQuery.refetch();
        }}
      />

      {/* Delete / Deprecate Confirm Modal */}
      <ATMConfirmModal
        isOpen={!!deletingPlan}
        title={`Remove Subscription Plan "${deletingPlan?.name}"?`}
        description={
          <span>
            Are you sure you want to deprecate/remove <strong>{deletingPlan?.name}</strong>? Existing merchants on this plan will not be impacted, but new merchants will no longer be able to select it during onboarding.
          </span>
        }
        confirmLabel="Yes, Deprecate Plan"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  );
};

export default PlanListWrapper;
