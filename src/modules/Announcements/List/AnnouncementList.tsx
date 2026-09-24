import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Search,
  Pin,
  Eye,
  CheckCircle2,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { AnnouncementCard, AnnouncementCardSkeleton } from './AnnouncementCard';
import type { Announcement, SiteVariantTab } from '../Model/AnnouncementTypes';

interface AnnouncementListProps {
  announcements: readonly Announcement[];
  activeTab: SiteVariantTab;
  onTabChange: (tab: SiteVariantTab) => void;
  counts: Record<SiteVariantTab, number>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (announcement: Announcement) => void;
  onOpenDelete: (announcement: Announcement) => void;
  onToggleActive: (announcement: Announcement) => void;
  onTogglePinned: (announcement: Announcement) => void;
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

export const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements = [],
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
  onTogglePinned,
  onMove,
  isReordering = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'pinned' | 'hidden'>('all');

  const safeAnnouncements = useMemo(() => announcements || [], [announcements]);

  const filteredAnnouncements = useMemo(() => {
    return safeAnnouncements.filter((a) => {
      const q = (searchQuery || '').toLowerCase().trim();
      const title = (a?.title || '').toLowerCase();
      const badge = (a?.badge || '').toLowerCase();
      const body = (a?.body || '').toLowerCase();
      const kind = (a?.kind || '').toLowerCase();

      const matchesSearch =
        q === '' ||
        title.includes(q) ||
        badge.includes(q) ||
        body.includes(q) ||
        kind.includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && a?.isActive) ||
        (statusFilter === 'pinned' && a?.isPinned) ||
        (statusFilter === 'hidden' && !a?.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [safeAnnouncements, searchQuery, statusFilter]);

  const liveCount = useMemo(() => safeAnnouncements.filter((a) => a?.isActive).length, [safeAnnouncements]);
  const pinnedCount = useMemo(() => safeAnnouncements.filter((a) => a?.isPinned).length, [safeAnnouncements]);
  const hiddenCount = useMemo(() => safeAnnouncements.filter((a) => !a?.isActive).length, [safeAnnouncements]);

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 1. Header with Responsive Action */}
      <ATMPageHeader
        title="Announcements & Top Promo Banners"
        subtitle="Manage website top notification strips, promotional offers, news announcements, and urgent alerts across all websites."
        icon={Megaphone}
        iconColor="theme"
        action={{
          label: `Add ${activeTab} Banner`,
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. Top Summary KPI Stats */}
      {isLoading ? (
        <ATMSkeleton variant="kpi-card" count={4} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Total in {activeTab}</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{safeAnnouncements.length}</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded">
                Banners
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Live on Navbar</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{liveCount}</span>
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Live
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Pinned to Top</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{pinnedCount}</span>
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-600">
                <Pin className="h-3 w-3 fill-amber-500" /> Priority
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Draft / Inactive</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">{hiddenCount}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Hidden</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Site Navigation Tabs */}
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
                  'group inline-flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-150 whitespace-nowrap',
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

      {/* 4. Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                statusFilter === 'live'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pinned')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                statusFilter === 'pinned'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Pinned
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hidden')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                statusFilter === 'hidden'
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              Drafts
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end self-end sm:self-center">
          <ATMViewModeToggle
            value={viewMode}
            onChange={(mode) => setViewMode(mode)}
          />
        </div>
      </div>

      {/* 5. Main Content Area */}
      {isLoading ? (
        <ATMSkeleton
          variant="announcement-card"
          count={4}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'flex flex-col space-y-3'
          )}
        />
      ) : isError ? (
        <ATMCard className="p-8 text-center border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
          <div className="inline-flex p-3 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Failed to load announcements</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Unable to connect to the announcements API service. Please verify your connection or retry.
          </p>
          <div className="mt-4">
            <ATMButton variant="outline" size="sm" onClick={onRetry}>
              Retry Loading
            </ATMButton>
          </div>
        </ATMCard>
      ) : filteredAnnouncements.length === 0 ? (
        <ATMCard className="p-8 sm:p-10 text-center border-dashed border-slate-300 dark:border-slate-800">
          <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-3">
            <Megaphone className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {searchQuery ? 'No matching announcements found' : `No announcements yet for ${activeTab}`}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords or clear the filter.'
              : `Create your first promotional top banner or release notice for the ${activeTab} website.`}
          </p>
          {!searchQuery && (
            <div className="mt-5">
              <ATMButton variant="primary" size="sm" onClick={onOpenAdd} className="flex items-center gap-1.5 mx-auto">
                <Plus className="h-4 w-4" />
                <span>Create Announcement</span>
              </ATMButton>
            </div>
          )}
        </ATMCard>
      ) : (
        <div
          className={cn(
            'gap-4',
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2'
              : 'flex flex-col space-y-3'
          )}
        >
          {filteredAnnouncements.map((announcement, idx) => (
            <AnnouncementCard
              key={announcement?.id || idx}
              announcement={announcement}
              index={idx}
              totalCount={filteredAnnouncements.length}
              onEdit={onOpenEdit}
              onDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onTogglePinned={onTogglePinned}
              onMove={onMove}
              isReordering={isReordering}
            />
          ))}
        </div>
      )}
    </div>
  );
};
