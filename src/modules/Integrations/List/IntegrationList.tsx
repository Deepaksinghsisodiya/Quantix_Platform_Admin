import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Search,
  Star,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { IntegrationCard } from './IntegrationCard';
import type { IntegrationItem, SiteVariantTab } from '../Model/IntegrationTypes';

interface IntegrationListProps {
  integrations: readonly IntegrationItem[];
  activeTab: SiteVariantTab;
  onTabChange: (tab: SiteVariantTab) => void;
  counts: Record<SiteVariantTab, number>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (integration: IntegrationItem) => void;
  onOpenDelete: (integration: IntegrationItem) => void;
  onToggleActive: (integration: IntegrationItem) => void;
  onTogglePopular: (integration: IntegrationItem) => void;
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

export const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations = [],
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
  onTogglePopular,
  onMove,
  isReordering = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'popular' | 'live' | 'hidden'>('all');

  const safeIntegrations = useMemo(() => integrations || [], [integrations]);

  // Extract unique categories in this tab
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    safeIntegrations.forEach((item) => {
      if (item.category) cats.add(item.category.toLowerCase());
    });
    return Array.from(cats);
  }, [safeIntegrations]);

  // Filtering
  const filteredIntegrations = useMemo(() => {
    return safeIntegrations.filter((item) => {
      // 1. Search Query
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesSlug = (item.slug || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesBadge = (item.badge || '').toLowerCase().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesDesc && !matchesBadge && !matchesCategory) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if ((item.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // 3. Status Filter
      if (statusFilter === 'popular' && !item.isPopular) return false;
      if (statusFilter === 'live' && !item.isActive) return false;
      if (statusFilter === 'hidden' && item.isActive) return false;

      return true;
    });
  }, [safeIntegrations, searchQuery, categoryFilter, statusFilter]);

  // Dynamic KPI Stats
  const totalCount = safeIntegrations.length;
  const liveCount = useMemo(() => safeIntegrations.filter((i) => i.isActive).length, [safeIntegrations]);
  const popularCount = useMemo(() => safeIntegrations.filter((i) => i.isPopular).length, [safeIntegrations]);
  const hiddenCount = useMemo(() => safeIntegrations.filter((i) => !i.isActive).length, [safeIntegrations]);

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 1. Header with Consistent Action & Icon */}
      <ATMPageHeader
        title="Integrations & Connectors CMS"
        subtitle="Manage payment gateways, third-party delivery dispatchers, accounting ledgers, and hardware connections across all websites."
        icon={Layers}
        iconColor="theme"
        action={{
          label: `Add ${activeTab} Integration`,
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. Top Summary KPI Stats (Light & Dark mode responsive cards matching Clientele) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Total in {activeTab}</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded font-bold">
                Connectors
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Live on Website</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{liveCount}</span>
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Live
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Featured Popular</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{popularCount}</span>
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-600 font-semibold">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Popular
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Draft / Hidden</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">{hiddenCount}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Hidden</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Website Variant Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-1.5 sm:space-x-3 overflow-x-auto pb-px scrollbar-none" aria-label="Website Tabs">
          {SITE_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = counts?.[tab.id] ?? 0;
            const isCurrent = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'group inline-flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer',
                  isCurrent
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
                )}
              >
                <Icon className={cn('h-4 w-4 transition-colors', isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400')} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {isLoading ? (
                  <div className="ml-1 h-4 w-5 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
                ) : (
                  <span
                    className={cn(
                      'ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[11px] font-semibold',
                      isCurrent
                        ? 'bg-primary-600 text-white dark:bg-primary-500'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Controls Toolbar (Search, Category Filter, Status Filter, View Mode) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, slug, badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Status Filter Segment Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('popular')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer',
                statusFilter === 'popular'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer',
                statusFilter === 'live'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hidden')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer',
                statusFilter === 'hidden'
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Hidden
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-end gap-2">
          <ATMViewModeToggle
            value={viewMode}
            onChange={(mode) => setViewMode(mode)}
          />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <ATMCard className="p-8 text-center border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Failed to load integrations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Unable to communicate with the Platform API server. Please check your backend connection.
          </p>
          <ATMButton variant="secondary" onClick={onRetry} className="mt-4">
            Try Again
          </ATMButton>
        </ATMCard>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <ATMSkeleton
          variant={viewMode === 'grid' ? 'integration-card' : 'integration-row'}
          count={6}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredIntegrations.length === 0 && (
        <ATMCard className="p-12 text-center border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No integrations found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No integrations matched your filters. Try clearing search or filters.'
              : `No integrations currently configured for the ${activeTab} website.`}
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? (
              <ATMButton
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </ATMButton>
            ) : (
              <ATMButton variant="primary" onClick={onOpenAdd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add First Integration
              </ATMButton>
            )}
          </div>
        </ATMCard>
      )}

      {/* Cards List or Grid */}
      {!isLoading && !isError && filteredIntegrations.length > 0 && (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'space-y-3'
          )}
        >
          {filteredIntegrations.map((item, idx) => (
            <IntegrationCard
              key={item.integrationId || item.id}
              integration={item}
              index={idx}
              totalCount={filteredIntegrations.length}
              viewMode={viewMode}
              onEdit={onOpenEdit}
              onDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onTogglePopular={onTogglePopular}
              onMove={onMove}
              isReordering={isReordering}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IntegrationList;
