import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Building2,
  Utensils,
  Store,
  Layers,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { CtaBannerCard, CtaBannerCardSkeleton } from './CtaBannerCard';
import type { CtaBannerItem, CtaBannerFilter } from '../Model/CtaBannerTypes';
import { cn } from '@/lib/utils/cn';

interface CtaBannerListProps {
  items: readonly CtaBannerItem[];
  isLoading: boolean;
  filter: CtaBannerFilter;
  onFilterChange: (filter: Partial<CtaBannerFilter>) => void;
  onAddNew: () => void;
  onOpenEdit: (item: CtaBannerItem) => void;
  onOpenDelete: (item: CtaBannerItem) => void;
  onToggleActive: (item: CtaBannerItem) => void;
}

export const CtaBannerList: React.FC<CtaBannerListProps> = ({
  items,
  isLoading,
  filter,
  onFilterChange,
  onAddNew,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Compute KPI Stats
  const stats = useMemo(() => {
    const list = items || [];
    const total = list.length;
    const enterprise = list.filter((x) => (x?.siteVariant || '').toLowerCase() === 'enterprise').length;
    const restaurant = list.filter((x) => (x?.siteVariant || '').toLowerCase() === 'restaurant').length;
    const retail = list.filter((x) => (x?.siteVariant || '').toLowerCase() === 'retail').length;
    const active = list.filter((x) => Boolean(x?.isActive)).length;

    return { total, enterprise, restaurant, retail, active };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    const list = items || [];
    return list.filter((item) => {
      if (!item) return false;
      const itemVariant = (item.siteVariant || '').toLowerCase();
      // Site variant tab filter
      if (filter.siteVariant !== 'all' && itemVariant !== filter.siteVariant.toLowerCase()) {
        return false;
      }

      // Status filter
      if (filter.status === 'ACTIVE' && !item.isActive) return false;
      if (filter.status === 'INACTIVE' && item.isActive) return false;

      // Search query
      if (filter.searchQuery?.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchHeading = (item.heading || '').toLowerCase().includes(q);
        const matchAccent = item.headingAccent?.toLowerCase().includes(q);
        const matchSubheading = item.subheading?.toLowerCase().includes(q);
        const matchBadge = item.badge?.toLowerCase().includes(q);
        return matchHeading || matchAccent || matchSubheading || matchBadge;
      }

      return true;
    });
  }, [items, filter]);

  const tabs = [
    { id: 'all', label: 'All Platforms', count: stats.total, icon: Sparkles },
    { id: 'enterprise', label: 'Enterprise Platform', count: stats.enterprise, icon: Building2 },
    { id: 'restaurant', label: 'Restaurant & Dining', count: stats.restaurant, icon: Utensils },
    { id: 'retail', label: 'Retail & Checkout', count: stats.retail, icon: Store },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        title="Final CTA Banner"
        subtitle="Manage the primary bottom conversion banner, telemetry sync badges, and high-impact CTAs across Enterprise, Restaurant, and Retail platforms."
        icon={Sparkles}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'CTA Banner' },
        ]}
        action={{
          label: 'Add CTA Banner',
          onClick: onAddNew,
          icon: Plus,
        }}
      />

      {/* KPI Stats Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ATMStatsCard
          label="Total CTA Banners"
          value={isLoading ? '-' : stats.total}
          icon={Layers}
          variant="accent"
          description={isLoading ? 'Loading banners...' : `${stats.active} published live`}
          onClick={() => onFilterChange({ siteVariant: 'all' })}
        />
        <ATMStatsCard
          label="Enterprise Website"
          value={isLoading ? '-' : stats.enterprise}
          icon={Building2}
          variant="indigo"
          description={isLoading ? 'Loading...' : 'B2B Multi-Store Banner'}
          onClick={() => onFilterChange({ siteVariant: 'enterprise' })}
        />
        <ATMStatsCard
          label="Restaurant Website"
          value={isLoading ? '-' : stats.restaurant}
          icon={Utensils}
          variant="amber"
          description={isLoading ? 'Loading...' : 'Dining & Kitchen Banner'}
          onClick={() => onFilterChange({ siteVariant: 'restaurant' })}
        />
        <ATMStatsCard
          label="Retail Website"
          value={isLoading ? '-' : stats.retail}
          icon={Store}
          variant="emerald"
          description={isLoading ? 'Loading...' : 'Checkout & Store Banner'}
          onClick={() => onFilterChange({ siteVariant: 'retail' })}
        />
      </div>

      {/* Tabs & Filter Bar */}
      <div className="space-y-4">
        {/* Underline Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = filter.siteVariant === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange({ siteVariant: tab.id })}
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
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar with Dual View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by heading, badge, or accent..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
            />
          </div>

          {/* Status Select Filter & View Mode Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onFilterChange({ status })}
                  className={cn(
                    'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                    filter.status === status
                      ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Live' : 'Hidden'}
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
      </div>

      {/* Content-Matching Skeleton Loader */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <CtaBannerCardSkeleton />
            <CtaBannerCardSkeleton />
            <CtaBannerCardSkeleton />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 bg-white dark:bg-[#12151c] animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-4.5 w-52 max-w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3.5 w-64 max-w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-[#FF4F00] flex items-center justify-center">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-syne">
              No CTA Banners Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filter.searchQuery
                ? 'No CTA banners match your search criteria. Try a different keyword.'
                : 'Create your first conversion banner for the platform.'}
            </p>
          </div>
          <ATMButton variant="primary" onClick={onAddNew} className="text-xs" icon={Plus}>
            Create CTA Banner
          </ATMButton>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredItems.map((item) => (
            <CtaBannerCard
              key={item.ctaBannerId}
              item={item}
              viewMode={viewMode}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
};
