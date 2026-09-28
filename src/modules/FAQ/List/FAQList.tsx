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
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
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
  onReorder,
}) => {
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);

  // Helper to determine if an item belongs to a platform
  const matchPlatform = (item: FAQItem, platform: string): boolean => {
    const p = platform.toLowerCase();
    if (p === 'all') return true;

    const mt = (item.merchantType || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    if (p === 'enterprise') {
      return mt === 'enterprise' || cat === 'enterprise';
    }
    if (p === 'restaurant') {
      return (
        mt === 'standalone' ||
        mt === 'restaurant' ||
        cat === 'restaurant' ||
        item.question.toLowerCase().includes('restaurant') ||
        item.question.toLowerCase().includes('kds') ||
        item.question.toLowerCase().includes('menu') ||
        item.question.toLowerCase().includes('zomato')
      );
    }
    if (p === 'retail') {
      return (
        mt === 'standalone' ||
        mt === 'retail' ||
        cat === 'retail' ||
        item.question.toLowerCase().includes('retail') ||
        item.question.toLowerCase().includes('barcode') ||
        item.question.toLowerCase().includes('inventory')
      );
    }
    return true;
  };

  // Compute KPI stats
  const stats = useMemo(() => {
    const total = items.length;
    const enterprise = items.filter((x) => matchPlatform(x, 'enterprise')).length;
    const restaurant = items.filter((x) => matchPlatform(x, 'restaurant')).length;
    const retail = items.filter((x) => matchPlatform(x, 'retail')).length;
    const active = items.filter((x) => x.isActive).length;

    return { total, enterprise, restaurant, retail, active };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchQ = item.question.toLowerCase().includes(q);
        const matchA = item.answer.toLowerCase().includes(q);
        const matchC = (item.category || '').toLowerCase().includes(q);
        return matchQ || matchA || matchC;
      }

      return true;
    });
  }, [items, filter]);

  // Drag and drop handler
  const handleDrop = (targetId: string) => {
    if (!draggedFaqId || draggedFaqId === targetId || !onReorder) {
      setDraggedFaqId(null);
      return;
    }

    const fromIdx = filteredItems.findIndex((x) => x.faqId === draggedFaqId);
    const toIdx = filteredItems.findIndex((x) => x.faqId === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedFaqId(null);
      return;
    }

    const reordered = [...filteredItems];
    const [moved] = reordered.splice(fromIdx, 1);
    if (!moved) return;
    reordered.splice(toIdx, 0, moved);

    setDraggedFaqId(null);
    onReorder(reordered.map((x) => x.faqId));
  };

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
        title="Frequently Asked Questions (FAQ)"
        subtitle="Manage questions, answers, categorization, and publication status across Enterprise, Restaurant, and Retail platforms."
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
          description="Dining & kitchen line"
          onClick={() => onFilterChange({ siteVariant: 'restaurant', category: 'all' })}
        />
        <ATMStatsCard
          label="Retail FAQs"
          value={stats.retail}
          icon={Store}
          variant="emerald"
          description="Barcode & storefront"
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
              placeholder="Search by question, answer, or category..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition-colors shadow-2xs"
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
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Live' : 'Hidden'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards List or Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <FAQCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
        <div className="grid grid-cols-1 gap-3.5">
          {filteredItems.map((item, index) => (
            <FAQCard
              key={item.faqId}
              item={item}
              index={index}
              totalCount={filteredItems.length}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onMove={onMove}
              onDragStart={() => setDraggedFaqId(item.faqId)}
              onDrop={() => handleDrop(item.faqId)}
              isDragging={draggedFaqId === item.faqId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
