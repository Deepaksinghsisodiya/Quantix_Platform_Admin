import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { SolutionCard, SolutionCardSkeleton, SolutionListRowSkeleton } from './SolutionCard';
import type { SolutionItem, SiteVariantTab } from '../Model/SolutionTypes';

interface SolutionListProps {
  items: SolutionItem[];
  activeSiteVariant: SiteVariantTab;
  onSiteVariantChange: (variant: SiteVariantTab) => void;
  siteVariantCounts: Record<SiteVariantTab, number>;
  activeTab: 'PromoCard' | 'SectorItem' | 'All';
  onTabChange: (tab: 'PromoCard' | 'SectorItem' | 'All') => void;
  counts: {
    PromoCard: number;
    SectorItem: number;
    All: number;
  };
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: SolutionItem) => void;
  onOpenDelete: (item: SolutionItem) => void;
  onToggleActive: (item: SolutionItem) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isReordering?: boolean;
}

const SITE_VARIANT_TABS: Array<{ id: SiteVariantTab; label: string; icon: any }> = [
  { id: 'Enterprise', label: 'Enterprise Platform', icon: Globe },
  { id: 'Restaurant', label: 'Restaurant Platform', icon: Sparkles },
  { id: 'Retail', label: 'Retail Platform', icon: Layers },
  { id: 'Subdomains', label: 'Subdomains (Projects)', icon: ExternalLink },
  { id: 'All', label: 'All Platforms', icon: Compass },
];

const SECTION_TABS = [
  { id: 'All' as const, label: 'All Solutions & Venues', shortLabel: 'All Items', icon: Compass },
  { id: 'SectorItem' as const, label: 'Sector Pages & Venue Showcases', shortLabel: 'Venues / Sectors', icon: Layers },
  { id: 'PromoCard' as const, label: 'Subdomain Promo Cards (Left)', shortLabel: 'Promo Cards', icon: ExternalLink },
];

export const SolutionList: React.FC<SolutionListProps> = ({
  items = [],
  activeSiteVariant,
  onSiteVariantChange,
  siteVariantCounts,
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

  const safeItems = useMemo(() => items || [], [items]);

  const filteredItems = useMemo(() => {
    return safeItems.filter((item) => {
      const q = (searchQuery || '').toLowerCase().trim();
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.categoryTitle || '').toLowerCase();
      const slug = (item.slug || '').toLowerCase();
      const ext = (item.externalUrl || '').toLowerCase();

      const matchesSearch =
        q === '' ||
        title.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        slug.includes(q) ||
        ext.includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && item.isActive) ||
        (statusFilter === 'hidden' && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [safeItems, searchQuery, statusFilter]);

  const liveCount = useMemo(() => safeItems.filter((s) => s.isActive).length, [safeItems]);
  const hiddenCount = useMemo(() => safeItems.filter((s) => !s.isActive).length, [safeItems]);

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 1. Standard Page Header */}
      <ATMPageHeader
        title={activeSiteVariant === 'Subdomains' ? 'Subdomain Projects (External Portals)' : 'Solutions & Industry Venues'}
        subtitle={
          activeSiteVariant === 'Subdomains'
            ? 'Manage the 2 Standalone Subdomain Projects (Restaurant on Port 3002 & Retail on Port 3001) that open in a new window.'
            : activeSiteVariant === 'Enterprise'
            ? 'Manage the 3 Core Enterprise Solutions (Restaurant POS System, Retail POS System, Cloud Multi-Store POS System).'
            : activeSiteVariant === 'Restaurant'
            ? 'Manage Restaurant dining solutions (Fine Dine, QSR, Cafe, Cloud Kitchen, Pub & Bar, etc.).'
            : activeSiteVariant === 'Retail'
            ? 'Manage Retail store solutions (Supermarket, Apparel, Electronics, Pharmacy, etc.).'
            : 'Manage Solutions across all platforms and standalone Subdomain projects.'
        }
        icon={Compass}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Solutions' },
        ]}
        action={{
          label: activeSiteVariant === 'Subdomains' ? 'Add Subdomain Project' : `Add Solution (${activeSiteVariant === 'All' ? 'Enterprise' : activeSiteVariant})`,
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. Top-Level Platform Selector Pills (Enterprise / Restaurant / Retail / All) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {SITE_VARIANT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeSiteVariant === tab.id;
          const count = siteVariantCounts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSiteVariantChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer shadow-2xs',
                isCurrent
                  ? 'bg-primary-600 text-white dark:bg-primary-500 shadow-md ring-2 ring-primary-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              )}
            >
              <Icon className={cn('h-4 w-4', isCurrent ? 'text-white' : 'text-slate-400')} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'ml-1 px-2 py-0.5 rounded-full text-[11px] font-black',
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ATMStatsCard
          label={`Total Solutions (${activeSiteVariant})`}
          value={counts.All}
          icon={Compass}
          variant="accent"
          description={`${liveCount} live on website`}
          onClick={() => onTabChange('All')}
        />
        <ATMStatsCard
          label="Sector & Venue Pages"
          value={counts.SectorItem}
          icon={Layers}
          variant="indigo"
          description="Landing pages & venue cards"
          onClick={() => onTabChange('SectorItem')}
        />
        <ATMStatsCard
          label="Subdomain Promo Cards"
          value={counts.PromoCard}
          icon={ExternalLink}
          variant="amber"
          description="Navbar showcase cards"
          onClick={() => onTabChange('PromoCard')}
        />
        <ATMStatsCard
          label="Live on Platform"
          value={liveCount}
          icon={CheckCircle2}
          variant="emerald"
          description={`${hiddenCount} drafts / hidden`}
        />
      </div>

      {/* 3. Underline Section Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-1.5 sm:space-x-3 overflow-x-auto pb-px scrollbar-none" aria-label="Solutions Navigation Tabs">
          {SECTION_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'All' ? counts.All : counts[tab.id];
            const isCurrent = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'group inline-flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-150 whitespace-nowrap',
                  isCurrent
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
                )}
              >
                <Icon
                  className={cn('h-4 w-4 transition-colors', isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400')}
                />
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

      {/* 4. Controls Toolbar: Search, Filters & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search solutions by title, category, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer',
                statusFilter === 'live'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hidden')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer',
                statusFilter === 'hidden'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <EyeOff className="h-3 w-3 text-slate-400" />
              Hidden
            </button>
          </div>
        </div>

        {/* View Mode Toggle (Cards / List Table) & Counter */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <ATMViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            gridLabel="Cards"
            listLabel="List"
          />

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredItems.length}</span> of {safeItems.length}
          </div>
        </div>
      </div>

      {/* 5. Informational Callout Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 shrink-0">
          <HelpCircle size={18} />
        </div>
        <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
          <div className="font-bold">Multi-Platform Solutions & Subdomains Architecture:</div>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            • <strong>Enterprise Platform:</strong> Exactly 3 Core Sector Solutions (Restaurant POS System, Retail POS System, Cloud Multi-Store POS System) leading to deep sector pages.<br />
            • <strong>Restaurant Platform:</strong> Dedicated dining solutions (Fine Dine, QSR, Cafe, Cloud Kitchen, Bar & Brewery, Pizzeria, Dessert).<br />
            • <strong>Retail Platform:</strong> Dedicated retail solutions (Supermarket, Apparel, Electronics, Pharmacy, Convenience, Departmental, Footwear).<br />
            • <strong>Subdomains (Projects):</strong> Exactly 2 Standalone external projects (Restaurant on Port 3002 & Retail on Port 3001) that open in a new window.
          </p>
        </div>
      </div>

      {/* 6. Error State */}
      {isError && (
        <div className="p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <div className="text-base font-bold text-rose-800 dark:text-rose-200">Failed to load solutions</div>
          <p className="text-xs text-rose-600 dark:text-rose-400">Please check your connection or backend API.</p>
          <ATMButton variant="secondary" onClick={onRetry} className="gap-2 mx-auto">
            <RefreshCw size={14} /> Retry
          </ATMButton>
        </div>
      )}

      {/* 7. Loading Skeletons matching Card/List views */}
      {isLoading && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SolutionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SolutionListRowSkeleton key={i} />
            ))}
          </div>
        )
      )}

      {/* 8. Empty State */}
      {!isLoading && !isError && filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mx-auto">
            <Layers size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No solution items found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery ? 'Try clearing your search term.' : 'Create your first item for this section.'}
            </p>
          </div>
          <ATMButton variant="primary" onClick={onOpenAdd} className="gap-2 mx-auto">
            <Plus size={15} /> Add Solution
          </ATMButton>
        </div>
      )}

      {/* 9. Solution Cards Grid or List Table */}
      {!isLoading && !isError && filteredItems.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item, idx) => (
              <SolutionCard
                key={item.solutionId || item.id || idx}
                item={item}
                index={idx}
                total={filteredItems.length}
                viewMode="grid"
                onOpenEdit={onOpenEdit}
                onOpenDelete={onOpenDelete}
                onToggleActive={onToggleActive}
                onMove={onMove}
                isReordering={isReordering}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, idx) => (
              <SolutionCard
                key={item.solutionId || item.id || idx}
                item={item}
                index={idx}
                total={filteredItems.length}
                viewMode="list"
                onOpenEdit={onOpenEdit}
                onOpenDelete={onOpenDelete}
                onToggleActive={onToggleActive}
                onMove={onMove}
                isReordering={isReordering}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};
