import React, { useState, useMemo } from 'react';
import {
  ListOrdered,
  Plus,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { HowItWorksCard, HowItWorksCardSkeleton, HowItWorksListItemSkeleton } from './HowItWorksCard';
import type { HowItWorksStepItem, SiteVariantTab } from '../Model/HowItWorksTypes';

interface HowItWorksListProps {
  steps: readonly HowItWorksStepItem[];
  activeTab: SiteVariantTab;
  onTabChange: (tab: SiteVariantTab) => void;
  counts: Record<SiteVariantTab, number>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (step: HowItWorksStepItem) => void;
  onOpenDelete: (step: HowItWorksStepItem) => void;
  onToggleActive: (step: HowItWorksStepItem) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

const SITE_TABS: Array<{
  id: SiteVariantTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}> = [
  { id: 'Enterprise', label: 'Enterprise Website', shortLabel: 'Enterprise', icon: Building2 },
  { id: 'Restaurant', label: 'Restaurant Website', shortLabel: 'Restaurant', icon: UtensilsCrossed },
  { id: 'Retail', label: 'Retail Website', shortLabel: 'Retail', icon: ShoppingBag },
];

export const HowItWorksList: React.FC<HowItWorksListProps> = ({
  steps = [],
  activeTab,
  onTabChange,
  counts,
  isLoading,
  isError,
  onRetry,
  onOpenAdd,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
  isReordering = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'hidden'>('all');

  const filteredSteps = useMemo(() => {
    return steps.filter((step) => {
      const q = (searchQuery || '').toLowerCase().trim();
      const title = (step.title || '').toLowerCase();
      const desc = (step.description || '').toLowerCase();
      const badge = (step.badgeLabel || '').toLowerCase();

      const matchesSearch =
        q === '' ||
        title.includes(q) ||
        desc.includes(q) ||
        badge.includes(q);

      const isActive = step.isActive ?? true;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && isActive) ||
        (statusFilter === 'hidden' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [steps, searchQuery, statusFilter]);

  const liveCount = useMemo(() => steps.filter((s) => s.isActive ?? true).length, [steps]);
  const hiddenCount = useMemo(() => steps.filter((s) => !(s.isActive ?? true)).length, [steps]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* 1. Header */}
      <ATMPageHeader
        title="How It Works (Workflow Engine)"
        subtitle="Manage the step-by-step interactive workflow sequences presented on Enterprise, Restaurant, and Retail landing pages."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content Management' },
          { label: 'How It Works' },
        ]}
        action={{
          label: 'Add Step',
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ATMStatsCard
          label="Total Workflow Steps"
          value={isLoading ? '-' : steps.length}
          icon={ListOrdered}
          variant="accent"
          description={isLoading ? 'Loading metrics...' : `${liveCount} live on ${activeTab}`}
        />
        <ATMStatsCard
          label="Enterprise Sequence"
          value={isLoading ? '-' : (counts.Enterprise || 0)}
          icon={Building2}
          variant="indigo"
          description="Multi-store rollout steps"
          onClick={() => onTabChange('Enterprise')}
        />
        <ATMStatsCard
          label="Restaurant Sequence"
          value={isLoading ? '-' : (counts.Restaurant || 0)}
          icon={UtensilsCrossed}
          variant="amber"
          description="Kitchen & floor flow"
          onClick={() => onTabChange('Restaurant')}
        />
        <ATMStatsCard
          label="Retail Sequence"
          value={isLoading ? '-' : (counts.Retail || 0)}
          icon={ShoppingBag}
          variant="emerald"
          description="Barcode & checkout flow"
          onClick={() => onTabChange('Retail')}
        />
      </div>

      {/* 3. Underline Site Variant Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {SITE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
                isActive
                  ? 'border-[#FF4F00] text-[#FF4F00] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <TabIcon size={15} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold',
                  isActive
                    ? 'bg-orange-500/15 text-[#FF4F00]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Controls Bar: Search + Status Filter + View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, badge, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF4F00] transition-colors shadow-2xs"
          />
        </div>

        {/* Status Filter & View Mode Toggle */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            {([
              { key: 'all', label: 'All' },
              { key: 'live', label: 'Live' },
              { key: 'hidden', label: 'Hidden' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]',
                  statusFilter === key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <ATMViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            gridLabel="Cards"
            listLabel="List"
          />
        </div>
      </div>

      {/* 5. Main Content Area */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <HowItWorksCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <HowItWorksListItemSkeleton key={i} />
            ))}
          </div>
        )
      ) : isError ? (
        <ATMCard className="p-8 text-center border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
          <div className="inline-flex p-3 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Failed to load workflow steps</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Unable to connect to the How It Works API. Please verify your connection or retry.
          </p>
          <div className="mt-4">
            <ATMButton variant="outline" size="sm" onClick={onRetry}>
              Retry Loading
            </ATMButton>
          </div>
        </ATMCard>
      ) : filteredSteps.length === 0 ? (
        <ATMCard className="p-8 sm:p-10 text-center border-dashed border-slate-300 dark:border-slate-800">
          <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-3">
            <ListOrdered className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white font-syne">
            {searchQuery ? 'No matching steps found' : `No workflow steps yet for ${activeTab}`}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords or clear the filter.'
              : `Add the first workflow step for the ${activeTab} website.`}
          </p>
          {!searchQuery && (
            <div className="mt-5">
              <ATMButton variant="primary" size="sm" onClick={onOpenAdd} className="flex items-center gap-1.5 mx-auto">
                <Plus className="h-4 w-4" />
                <span>Add First Step</span>
              </ATMButton>
            </div>
          )}
        </ATMCard>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredSteps.map((step, idx) => (
            <HowItWorksCard
              key={step.stepId || step.id}
              step={step}
              index={idx}
              total={filteredSteps.length}
              viewMode={viewMode}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onMove={onMove}
              isReordering={isReordering}
            />
          ))}
        </div>
      )}
    </div>
  );
};
