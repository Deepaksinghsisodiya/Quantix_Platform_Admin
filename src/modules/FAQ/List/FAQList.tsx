import React, { useMemo, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Building2,
  Utensils,
  Store,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { FAQCard, FAQCardSkeleton } from './FAQCard';
import type { FAQItem, FAQFilter } from '../Model/FAQTypes';
import { cn } from '@/lib/utils/cn';

interface FAQListProps {
  items: readonly FAQItem[];
  categories: readonly string[];
  isLoading: boolean;
  filter: FAQFilter;
  onFilterChange: (filter: Partial<FAQFilter>) => void;
  onAddNew: () => void;
  onOpenEdit: (item: FAQItem) => void;
  onOpenDelete: (item: FAQItem) => void;
  onToggleActive: (item: FAQItem) => void;
  onMove?: (index: number, direction: 'up' | 'down') => void;
  onReorder?: (orderedIds: string[]) => void;
}

export const FAQList: React.FC<FAQListProps> = ({
  items,
  categories,
  isLoading,
  filter,
  onFilterChange,
  onAddNew,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  onMove,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper to determine if an item belongs to a platform
  const matchPlatform = (item: FAQItem, platform: string): boolean => {
    if (!item) return false;
    const p = (platform || '').toLowerCase();
    if (p === 'all') return true;

    const sv = (item.siteVariant || '').toLowerCase();
    if (sv && sv !== 'all') {
      return sv === p;
    }

    const mt = (item.merchantType || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const qText = (item.question || '').toLowerCase();

    if (p === 'enterprise') {
      return mt === 'enterprise' || cat === 'enterprise';
    }
    if (p === 'restaurant') {
      return (
        mt === 'restaurant' ||
        cat === 'restaurant' ||
        mt === 'standalone' ||
        qText.includes('restaurant') ||
        qText.includes('kds') ||
        qText.includes('menu') ||
        qText.includes('zomato')
      );
    }
    if (p === 'retail') {
      return (
        mt === 'retail' ||
        cat === 'retail' ||
        qText.includes('retail') ||
        qText.includes('barcode') ||
        qText.includes('inventory')
      );
    }
    return true;
  };

  // Compute KPI stats
  const stats = useMemo(() => {
    const list = items || [];
    const total = list.length;
    const enterprise = list.filter((x) => matchPlatform(x, 'enterprise')).length;
    const restaurant = list.filter((x) => matchPlatform(x, 'restaurant')).length;
    const retail = list.filter((x) => matchPlatform(x, 'retail')).length;
    const active = list.filter((x) => Boolean(x?.isActive)).length;

    return { total, enterprise, restaurant, retail, active };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    const list = items || [];
    return list.filter((item) => {
      if (!item) return false;
      // Site variant tab filter
      if (filter.siteVariant !== 'all' && !matchPlatform(item, filter.siteVariant)) {
        return false;
      }

      // Category filter
      if (filter.category !== 'all' && item.category !== filter.category) {
        return false;
      }

      // Status filter
      if (filter.status === 'ACTIVE' && !item.isActive) return false;
      if (filter.status === 'INACTIVE' && item.isActive) return false;

      // Search query
      if (filter.searchQuery?.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchQ = (item.question || '').toLowerCase().includes(q);
        const matchA = (item.answer || '').toLowerCase().includes(q);
        const matchC = (item.category || '').toLowerCase().includes(q);
        return matchQ || matchA || matchC;
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
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        title="Frequently Asked Questions (FAQ)"
        subtitle="Manage questions, answers, categorization, and publication status across Enterprise, Restaurant, and Retail platforms."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content Management' },
          { label: 'Frequently Asked Questions' },
        ]}
        icon={HelpCircle}
        iconColor="theme"
        action={{
          label: 'Add FAQ',
          onClick: onAddNew,
          icon: Plus,
        }}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ATMStatsCard
          label="Total FAQs"
          value={stats.total}
          icon={HelpCircle}
          variant="accent"
          description={`${stats.active} published live`}
          onClick={() => onFilterChange({ siteVariant: 'all', category: 'all' })}
        />
        <ATMStatsCard
          label="Enterprise FAQs"
          value={stats.enterprise}
          icon={Building2}
          variant="indigo"
          description="Multi-store scalability"
          onClick={() => onFilterChange({ siteVariant: 'enterprise', category: 'all' })}
        />
        <ATMStatsCard
          label="Restaurant FAQs"
          value={stats.restaurant}
          icon={Utensils}
          variant="amber"
          description="Dining and kitchen line"
          onClick={() => onFilterChange({ siteVariant: 'restaurant', category: 'all' })}
        />
        <ATMStatsCard
          label="Retail FAQs"
          value={stats.retail}
          icon={Store}
          variant="emerald"
          description="Barcode and storefront"
          onClick={() => onFilterChange({ siteVariant: 'retail', category: 'all' })}
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
                onClick={() => onFilterChange({ siteVariant: tab.id, category: 'all' })}
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
              placeholder="Search by question, answer, or category..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF4F00] transition-colors shadow-2xs"
            />
            {filter.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
            {/* Category Filter Dropdown */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-semibold">
                <Layers size={13} className="text-slate-400" />
                <select
                  value={filter.category}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                  className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Segmented Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onFilterChange({ status: st })}
                  className={cn(
                    'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]',
                    filter.status === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Live' : 'Hidden'}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <ATMViewModeToggle
              value={viewMode}
              onChange={setViewMode}
              gridLabel="Cards"
              listLabel="List"
            />
          </div>
        </div>
      </div>

      {/* Cards List or Skeletons */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FAQCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 bg-white dark:bg-[#12151c] animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-[#FF4F00] mx-auto flex items-center justify-center">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-syne">
              No FAQs found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filter.searchQuery
                ? `No FAQs matched your search for "${filter.searchQuery}". Try different keywords.`
                : 'No FAQs have been added for this platform yet. Click below to add the first one.'}
            </p>
          </div>
          <ATMButton variant="primary" onClick={onAddNew} icon={Plus}>
            Add First FAQ
          </ATMButton>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredItems.map((item, index) => (
            <FAQCard
              key={item.faqId}
              item={item}
              index={index}
              totalCount={filteredItems.length}
              viewMode={viewMode}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
