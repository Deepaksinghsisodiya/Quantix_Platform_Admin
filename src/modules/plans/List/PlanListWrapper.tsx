import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { Plus, Loader2 } from 'lucide-react';
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
import type { Plan, Flavour } from '../types/plan.types';
import { PLAN_TYPE_WIRE_TO_UI } from '../types/plan.types';

const PLAN_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#6b7280'];

const round2 = (n: number) => Number((n ?? 0).toFixed(2));

export const PlanListWrapper: React.FC = () => {
  const plansQuery = usePlansList();
  const toggleStatusMutation = useTogglePlanStatusHook();
  const deletePlanMutation = useDeletePlanHook();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<Plan | null>(null);

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

  // Server PlanSummaryDto → UI Plan. Weekly/monthly/yearly are display projections of the
  // per-day price; marketing bullet points are not stored server-side, so cards show none.
  const rawPlans: Plan[] = useMemo(() => {
    const rows: any[] = (plansQuery.data as any)?.data ?? [];
    return rows.map((p: any, idx: number) => ({
      id: String(p.planId),
      // Admin lists show the UNIQUE PlanName; displayName ("Basic"/"Pro"/"Advance") repeats
      // per tier and is the website label.
      name: p.planName || p.displayName || p.planCode || 'Unnamed Plan',
      planType: PLAN_TYPE_WIRE_TO_UI[p.planType as keyof typeof PLAN_TYPE_WIRE_TO_UI] ?? 'Enterprise cloud',
      flavour: (p.flavour ?? 'BOT') as Flavour,
      priority: p.sortOrder ?? idx + 1,
      dailyPrice: round2(p.planPricePerDay),
      weeklyPrice: round2(p.planPricePerDay * 7),
      monthlyPrice: round2(p.planPricePerDay * 30),
      yearlyPrice: round2(p.planPricePerDay * 365),
      maxLocations: p.maxLocations ?? 0,
      maxTerminals: p.maxTerminals ?? 0,
      features: (p.marketingBullets ?? []).map((t: string) => ({ text: t, included: true })),
      merchantCount: p.activeSubscriberCount ?? 0,
      status: p.isDeprecated ? 'Deprecated' : p.isActive ? 'Active' : 'Inactive',
      color: PLAN_COLORS[idx % PLAN_COLORS.length] ?? '#3b82f6',
    }));
  }, [plansQuery.data]);

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
  const inactiveCount = rawPlans.filter((p) => p.status !== 'Active').length;
  const totalMerchants = rawPlans.reduce((acc, p) => acc + p.merchantCount, 0);

  const handleToggleStatus = async (planId: string) => {
    const target = rawPlans.find((p) => p.id === planId);
    if (!target) return;
    if (target.status === 'Deprecated') {
      toast.error(`"${target.name}" is deprecated — deprecated plans cannot be re-activated from here.`);
      return;
    }
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await toggleStatusMutation.mutateAsync({ id: planId, status: nextStatus as 'Active' | 'Inactive' });
      toast.success(`Plan "${target.name}" is now ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || `Failed to change status of "${target.name}".`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    const { id, name } = deletingPlan;
    setDeletingPlan(null);
    try {
      await deletePlanMutation.mutateAsync(id);
      toast.success(`Plan "${name}" removed.`);
    } catch (err: any) {
      // Server refuses deletion when merchants are subscribed (PLAN_HAS_SUBSCRIBERS).
      toast.error(err?.data?.message || err?.message || `Failed to remove plan "${name}".`);
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
            <ATMViewModeToggle value={viewMode} onChange={setViewMode} />
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

      {/* Add Plan Modal Wrapper — RTK tag invalidation refreshes the list after create. */}
      <AddPlanWrapper
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => plansQuery.refetch()}
      />

      {/* Edit Plan Modal Wrapper */}
      <EditPlanWrapper
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        plan={editingPlan}
        onSuccess={() => plansQuery.refetch()}
      />

      {/* Delete Confirm Modal */}
      <ATMConfirmModal
        isOpen={!!deletingPlan}
        title={`Remove Subscription Plan "${deletingPlan?.name}"?`}
        description={
          <span>
            Are you sure you want to remove <strong>{deletingPlan?.name}</strong>? Plans with subscribed
            merchants cannot be removed — deprecate them instead so existing merchants keep working while
            new signups can no longer select the plan.
          </span>
        }
        confirmLabel="Yes, Remove Plan"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  );
};

export default PlanListWrapper;
