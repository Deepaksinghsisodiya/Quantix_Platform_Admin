import React, { useState, useMemo } from 'react';
import {
  Quote,
  Plus,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Search,
  Star,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { TestimonialCard } from './TestimonialCard';
import type { TestimonialItem, SiteVariantTab } from '../Model/TestimonialTypes';

interface TestimonialListProps {
  testimonials: readonly TestimonialItem[];
  activeTab: SiteVariantTab;
  onTabChange: (tab: SiteVariantTab) => void;
  counts: Record<SiteVariantTab, number>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: TestimonialItem) => void;
  onOpenDelete: (item: TestimonialItem) => void;
  onTogglePublished: (item: TestimonialItem) => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

const SITE_TABS: Array<{
  id: SiteVariantTab;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}> = [
  { id: 'Enterprise', label: 'Enterprise Website', icon: Building2 },
  { id: 'Restaurant', label: 'Restaurant Website', icon: UtensilsCrossed },
  { id: 'Retail', label: 'Retail Website', icon: ShoppingBag },
];

export const TestimonialList: React.FC<TestimonialListProps> = ({
  testimonials,
  activeTab,
  onTabChange,
  counts,
  isLoading,
  isError,
  onRetry,
  onOpenAdd,
  onOpenEdit,
  onOpenDelete,
  onTogglePublished,
  onMoveItem,
  isReordering = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4'>('all');

  const filteredItems = useMemo(() => {
    return testimonials.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.personName.toLowerCase().includes(q) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.personRole && item.personRole.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        item.body.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && item.isActive) ||
        (statusFilter === 'hidden' && !item.isActive);

      const matchesRating =
        ratingFilter === 'all' ||
        (ratingFilter === '5' && item.rating === 5) ||
        (ratingFilter === '4' && item.rating >= 4);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [testimonials, searchQuery, statusFilter, ratingFilter]);

  const activeCount = useMemo(() => testimonials.filter((t) => t.isActive).length, [testimonials]);
  const fiveStarCount = useMemo(() => testimonials.filter((t) => t.rating === 5).length, [testimonials]);
  const avgRating = useMemo(() => {
    if (testimonials.length === 0) return '5.0';
    const sum = testimonials.reduce((acc, t) => acc + (t.rating || 5), 0);
    return (sum / testimonials.length).toFixed(1);
  }, [testimonials]);

  return (
    <div className="w-full space-y-5 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 1. Header with Primary Action */}
      <ATMPageHeader
        title="Testimonials & Client Reviews CMS"
        subtitle="Manage customer quotes, verified executive credentials, star ratings, and key business outcome metrics shown on the website."
        icon={Quote}
        iconColor="theme"
        action={{
          label: `Add ${activeTab} Review`,
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. Top Summary KPI Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-7 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <ATMCard className="p-4 sm:p-5 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {activeTab} Reviews
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {testimonials.length}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
              <Quote className="h-5 w-5" />
            </div>
          </ATMCard>

          <ATMCard className="p-4 sm:p-5 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                5-Star Ratings
              </p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                {fiveStarCount}
                <span className="text-xs font-normal text-slate-400">({avgRating} avg)</span>
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 font-bold">
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
          </ATMCard>

          <ATMCard className="p-4 sm:p-5 flex items-center justify-between border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Live on Site
              </p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCount}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              ✓
            </div>
          </ATMCard>
        </div>
      )}

      {/* 3. Site Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-px">
        {SITE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group flex items-center gap-2.5 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap',
                isSelected
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon className={cn('h-4 w-4', isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600')} />
              <span>{tab.label}</span>
              {isLoading ? (
                <div className="ml-1 h-4 w-5 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
              ) : (
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                    isSelected
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Controls Bar: Search, Status Filter, Rating Filter & View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-[#12151c] dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} reviews, author, or company...`}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
          {/* Rating filter */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRatingFilter('all')}
              className={cn('px-2.5 py-1 rounded-lg transition-all', ratingFilter === 'all' ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400')}
            >
              All Stars
            </button>
            <button
              type="button"
              onClick={() => setRatingFilter('5')}
              className={cn('px-2.5 py-1 rounded-lg transition-all flex items-center gap-1', ratingFilter === '5' ? 'bg-white shadow-xs text-amber-600 dark:bg-slate-900 dark:text-amber-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400')}
            >
              <Star className="h-3 w-3 fill-current" /> 5★
            </button>
          </div>

          {/* Status filter */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn('px-2.5 py-1 rounded-lg transition-all', statusFilter === 'all' ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400')}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={cn('px-2.5 py-1 rounded-lg transition-all', statusFilter === 'live' ? 'bg-white shadow-xs text-emerald-600 dark:bg-slate-900 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400')}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hidden')}
              className={cn('px-2.5 py-1 rounded-lg transition-all', statusFilter === 'hidden' ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400')}
            >
              Hidden
            </button>
          </div>

          <ATMViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            gridLabel="Cards"
            listLabel="List"
          />
        </div>
      </div>

      {/* 5. Cards Grid / List or Empty / Error / Loading States */}
      {isLoading ? (
        <ATMSkeleton
          variant={viewMode === 'grid' ? 'testimonial-card' : 'testimonial-row'}
          count={viewMode === 'grid' ? 3 : 4}
        />
      ) : isError ? (
        <ATMCard className="p-8 text-center max-w-lg mx-auto border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Failed to load testimonials</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Could not fetch testimonials from the server. Check backend connection.
          </p>
          <ATMButton variant="primary" size="sm" onClick={onRetry}>
            Retry Request
          </ATMButton>
        </ATMCard>
      ) : filteredItems.length === 0 ? (
        <ATMCard className="p-10 text-center max-w-md mx-auto border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Quote className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No testimonials found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            {searchQuery
              ? `No testimonials match "${searchQuery}". Try clearing search filter.`
              : `No testimonials defined for ${activeTab} website. Click below to add the first client review.`}
          </p>
          <ATMButton variant="primary" size="sm" onClick={onOpenAdd} icon={Plus}>
            Add {activeTab} Review
          </ATMButton>
        </ATMCard>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredItems.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.testimonialId}
              testimonial={testimonial}
              index={index}
              totalItems={filteredItems.length}
              viewMode={viewMode}
              isReordering={isReordering}
              onMoveItem={onMoveItem}
              onTogglePublished={onTogglePublished}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
