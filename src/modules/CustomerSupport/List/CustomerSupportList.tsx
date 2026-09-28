import React, { useMemo } from 'react';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  Building2,
  Utensils,
  Store,
  Clock,
  Sparkles,
  Phone,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { CustomerSupportCard, CustomerSupportCardSkeleton } from './CustomerSupportCard';
import type { SupportSectionItem, CustomerSupportFilter } from '../Model/CustomerSupportTypes';
import { cn } from '@/lib/utils/cn';

interface CustomerSupportListProps {
  items: readonly SupportSectionItem[];
  isLoading: boolean;
  filter: CustomerSupportFilter;
  onFilterChange: (filter: Partial<CustomerSupportFilter>) => void;
  onAddNew: () => void;
  onOpenEdit: (item: SupportSectionItem) => void;
  onOpenDelete: (item: SupportSectionItem) => void;
  onToggleActive: (item: SupportSectionItem) => void;
}

export const CustomerSupportList: React.FC<CustomerSupportListProps> = ({
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
        const matchTitle = item.mainTitle.toLowerCase().includes(q);
        const matchHighlight = item.highlightWord?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchRep = item.repName?.toLowerCase().includes(q);
        const matchPhone = item.directPhone?.toLowerCase().includes(q);
        return matchTitle || matchHighlight || matchDesc || matchRep || matchPhone;
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
        title="24/7 Dedicated Customer Support"
        subtitle="Manage live customer support guarantees, technical pillars, hotline channels, and support desks across Enterprise, Restaurant, and Retail platforms."
        icon={Headphones}
        iconColor="theme"
        action={{
          label: 'Add Support Config',
          onClick: onAddNew,
          icon: Plus,
        }}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ATMStatsCard
          label="Total Support Desks"
          value={stats.total}
          icon={Headphones}
          variant="accent"
          description={`${stats.active} published live`}
          onClick={() => onFilterChange({ siteVariant: 'all' })}
        />
        <ATMStatsCard
          label="Enterprise Desk"
          value={stats.enterprise}
          icon={Building2}
          variant="indigo"
          description="VIP Escalation Hotline"
          onClick={() => onFilterChange({ siteVariant: 'enterprise' })}
        />
        <ATMStatsCard
          label="Restaurant Desk"
          value={stats.restaurant}
          icon={Utensils}
          variant="amber"
          description="Dining rush-hour standby"
          onClick={() => onFilterChange({ siteVariant: 'restaurant' })}
        />
        <ATMStatsCard
          label="Retail Desk"
          value={stats.retail}
          icon={Store}
          variant="emerald"
          description="Checkout & hardware desk"
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
              placeholder="Search by title, contact, or hotline..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* Status Select Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Filter size={12} />
              Status:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-850 p-1 border border-slate-200 dark:border-slate-800">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onFilterChange({ status })}
                  className={cn(
                    'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                    filter.status === status
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Live' : 'Draft'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Support Sections */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CustomerSupportCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-primary flex items-center justify-center">
            <Headphones size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-syne">
              No Support Configurations Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filter.searchQuery
                ? 'No support desks match your search criteria. Try a different keyword.'
                : 'Create your first 24/7 dedicated customer support desk for your storefronts.'}
            </p>
          </div>
          <ATMButton variant="primary" onClick={onAddNew} className="text-xs">
            <Plus size={14} className="mr-1" />
            Create Support Configuration
          </ATMButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <CustomerSupportCard
              key={item.supportSectionId}
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
