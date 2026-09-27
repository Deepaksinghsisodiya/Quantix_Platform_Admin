import React, { useMemo } from 'react';
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
import { ATMButton } from '@/shared/ui';
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
  // Compute KPI Stats
  const stats = useMemo(() => {
    const total = items.length;
    const enterprise = items.filter((x) => x.siteVariant.toLowerCase() === 'enterprise').length;
    const restaurant = items.filter((x) => x.siteVariant.toLowerCase() === 'restaurant').length;
    const retail = items.filter((x) => x.siteVariant.toLowerCase() === 'retail').length;
    const active = items.filter((x) => x.isActive).length;

    return { total, enterprise, restaurant, retail, active };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Site variant tab filter
      if (filter.siteVariant !== 'all' && item.siteVariant.toLowerCase() !== filter.siteVariant.toLowerCase()) {
        return false;
      }

      // Status filter
      if (filter.status === 'ACTIVE' && !item.isActive) return false;
      if (filter.status === 'INACTIVE' && item.isActive) return false;

      // Search query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchHeading = item.heading.toLowerCase().includes(q);
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
    { id: 'enterprise', label: 'Enterprise Website', count: stats.enterprise, icon: Building2 },
    { id: 'restaurant', label: 'Restaurant Website', count: stats.restaurant, icon: Utensils },
    { id: 'retail', label: 'Retail Website', count: stats.retail, icon: Store },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <ATMPageHeader
        title="Final CTA Banner"
        subtitle="Manage the primary bottom conversion banner, telemetry sync badges, and high-impact CTAs across Enterprise, Restaurant, and Retail platforms."
        action={{
          label: 'Add CTA Banner',
          onClick: onAddNew,
          icon: Plus,
        }}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Banners
            </span>
            <div className="text-2xl sm:text-3xl font-syne font-extrabold text-slate-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>{stats.active} Live Banners</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers size={22} strokeWidth={2.3} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Enterprise Banner
            </span>
            <div className="text-2xl sm:text-3xl font-syne font-extrabold text-slate-900 dark:text-white">
              {stats.enterprise}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Multi-Store Scalability
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Building2 size={22} strokeWidth={2.3} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Restaurant Banner
            </span>
            <div className="text-2xl sm:text-3xl font-syne font-extrabold text-slate-900 dark:text-white">
              {stats.restaurant}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Dining & Kitchen Line
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Utensils size={22} strokeWidth={2.3} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Retail Banner
            </span>
            <div className="text-2xl sm:text-3xl font-syne font-extrabold text-slate-900 dark:text-white">
              {stats.retail}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Barcode & Storefront
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Store size={22} strokeWidth={2.3} />
          </div>
        </div>
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
                    ? 'border-primary text-primary dark:text-primary-light'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <TabIcon size={15} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10.5px] font-bold',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by heading, badge, or keyword..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition-colors shadow-2xs"
            />
          </div>

          {/* Status Segmented Filter */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onFilterChange({ status: st })}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize text-[11px] font-bold',
                  filter.status === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Live' : 'Draft'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid / Empty / Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CtaBannerCardSkeleton />
          <CtaBannerCardSkeleton />
          <CtaBannerCardSkeleton />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-syne">
              No CTA Banners Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first Final CTA conversion banner for your storefronts.
            </p>
          </div>
          <ATMButton variant="primary" onClick={onAddNew} size="sm">
            <Plus size={14} className="mr-1.5" />
            Create CTA Banner
          </ATMButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <CtaBannerCard
              key={item.ctaBannerId}
              item={item}
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
