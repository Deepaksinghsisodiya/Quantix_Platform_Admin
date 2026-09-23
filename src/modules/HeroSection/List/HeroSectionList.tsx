import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  ImageOff,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Search,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { HeroSlideCard } from './HeroSlideCard';
import type { HeroSlide, SiteVariantTab } from '../Model/HeroSectionTypes';

interface HeroSectionListProps {
  slides: readonly HeroSlide[];
  activeTab: SiteVariantTab;
  onTabChange: (tab: SiteVariantTab) => void;
  counts: Record<SiteVariantTab, number>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (slide: HeroSlide) => void;
  onOpenDelete: (slide: HeroSlide) => void;
  onTogglePublished: (slide: HeroSlide) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
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

export const HeroSectionList: React.FC<HeroSectionListProps> = ({
  slides,
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
  onMoveSlide,
  isReordering = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'hidden'>('all');

  const filteredSlides = useMemo(() => {
    return slides.filter((slide) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        slide.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slide.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (slide.subheading && slide.subheading.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && slide.isActive) ||
        (statusFilter === 'hidden' && !slide.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [slides, searchQuery, statusFilter]);

  const activeCount = useMemo(() => slides.filter((s) => s.isActive).length, [slides]);
  const hiddenCount = useMemo(() => slides.filter((s) => !s.isActive).length, [slides]);

  return (
    <div className="w-full space-y-5 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 1. Header with Responsive Action */}
      <ATMPageHeader
        title="Hero Banners CMS"
        subtitle="Manage dynamic hero slides, headings, badges, dual CTAs, bullet chips, and showcase visuals across all websites."
        icon={Sparkles}
        iconColor="theme"
        action={{
          label: `Add ${activeTab} Slide`,
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. Error Banner */}
      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Could not load hero slides from API.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={onRetry} className="self-start sm:self-auto">
            Retry
          </ATMButton>
        </div>
      )}

      {/* 3. Controls Bar: Responsive Tabs, Search, Status Filter & View Mode */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#111318]">
        {/* Responsive Website Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
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
                  'flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary-50 text-primary-900 shadow-xs ring-1 ring-primary-500/20 dark:bg-primary-950/60 dark:text-primary-200 dark:ring-primary-500/40 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                )}
              >
                <Icon size={15} className={isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.shortLabel}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    isSelected
                      ? 'bg-primary-600 text-white dark:bg-primary-500'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Status Filter & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search headings, badges, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                )}
              >
                All ({slides.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('live')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                  statusFilter === 'live'
                    ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                )}
              >
                Live ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('hidden')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                  statusFilter === 'hidden'
                    ? 'bg-white text-amber-700 shadow-xs dark:bg-slate-800 dark:text-amber-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                )}
              >
                Hidden ({hiddenCount})
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
      </div>

      {/* 4. Slides Content Listing: 100% Reusable Skeletons & Presenter Cards */}
      {isLoading ? (
        <ATMSkeleton
          variant={viewMode === 'grid' ? 'content-card' : 'content-row'}
          count={viewMode === 'grid' ? 6 : 4}
        />
      ) : filteredSlides.length === 0 ? (
        <ATMCard className="border border-dashed border-slate-300 dark:border-slate-800">
          <div className="flex h-64 flex-col items-center justify-center gap-3.5 text-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <ImageOff className="h-6 w-6" />
            </div>
            <div className="max-w-md space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery || statusFilter !== 'all'
                  ? 'No matching slides found'
                  : `No slides configured for ${activeTab}`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search keywords or status filter.'
                  : `Click the "Add ${activeTab} Slide" button above to publish your first banner on the ${activeTab} website.`}
              </p>
            </div>
            {!(searchQuery || statusFilter !== 'all') && (
              <ATMButton variant="primary" size="sm" onClick={onOpenAdd} icon={Plus}>
                Add First Slide
              </ATMButton>
            )}
          </div>
        </ATMCard>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'space-y-4'
          )}
        >
          {filteredSlides.map((slide, index) => (
            <HeroSlideCard
              key={slide.heroSlideId}
              slide={slide}
              index={index}
              totalSlides={slides.length}
              viewMode={viewMode}
              isReordering={isReordering}
              onMoveSlide={onMoveSlide}
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

export default HeroSectionList;
