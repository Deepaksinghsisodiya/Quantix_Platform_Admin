import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Store,
  Boxes,
  ChefHat,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { BusinessProblemCard } from './BusinessProblemCard';
import type { BusinessProblem } from '../Model/BusinessProblemTypes';

interface BusinessProblemListProps {
  items: readonly BusinessProblem[];
  counts?: Record<string, number>;
  activeVariant: string;
  onVariantChange: (variant: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: BusinessProblem) => void;
  onOpenDelete: (item: BusinessProblem) => void;
  onToggleActive: (item: BusinessProblem) => void;
}

const VARIANT_TABS = [
  { id: 'Enterprise', label: 'Enterprise Platform', icon: Store },
  { id: 'Restaurant', label: 'Restaurant & Dining', icon: ChefHat },
  { id: 'Retail', label: 'Retail & Checkout', icon: Boxes },
];

export const BusinessProblemList: React.FC<BusinessProblemListProps> = ({
  items = [],
  counts,
  activeVariant,
  onVariantChange,
  isLoading,
  isError,
  onRetry,
  onOpenAdd,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
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
      const tag = (item.tag || '').toLowerCase();
      const tabLabel = (item.shortTabLabel || '').toLowerCase();

      const matchesSearch =
        q === '' ||
        title.includes(q) ||
        desc.includes(q) ||
        tag.includes(q) ||
        tabLabel.includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && item.isActive) ||
        (statusFilter === 'hidden' && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [safeItems, searchQuery, statusFilter]);

  const liveCount = useMemo(() => safeItems.filter((s) => s.isActive).length, [safeItems]);
  const criticalCount = useMemo(
    () => safeItems.filter((s) => (s.severity || '').toUpperCase() === 'CRITICAL').length,
    [safeItems]
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Page Header */}
      <ATMPageHeader
        title="Business Problems CMS"
        subtitle="Manage diagnostic friction cards, operational reality micro-meters, and Quantix resolutions across Enterprise, Restaurant, and Retail platforms."
        icon={AlertTriangle}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Business Problems' },
        ]}
        action={{
          label: 'Add Problem',
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ATMStatsCard
          label="Total Problems"
          value={isLoading ? <ATMSkeleton width="44px" height="28px" className="rounded-md" /> : safeItems.length.toString()}
          description={`Registered cards for ${activeVariant}`}
          icon={Layers}
          variant="accent"
        />
        <ATMStatsCard
          label="Live On Website"
          value={isLoading ? <ATMSkeleton width="44px" height="28px" className="rounded-md" /> : liveCount.toString()}
          description="Currently visible to public visitors"
          icon={Eye}
          variant="emerald"
        />
        <ATMStatsCard
          label="Critical Severities"
          value={isLoading ? <ATMSkeleton width="44px" height="28px" className="rounded-md" /> : criticalCount.toString()}
          description="High-friction operational issues highlighted"
          icon={AlertTriangle}
          variant="amber"
        />
      </div>

      {/* Variant Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {VARIANT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeVariant.toLowerCase() === tab.id.toLowerCase();
          const count = counts ? counts[tab.id] ?? 0 : 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onVariantChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all cursor-pointer select-none',
                isActive
                  ? 'border-[#FF4F00] text-[#FF4F00] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 text-xs rounded-full font-mono font-bold',
                  isActive
                    ? 'bg-orange-500/15 text-[#FF4F00]'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar with Dual View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, tag, impact..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                statusFilter === 'live'
                  ? 'bg-white shadow-xs text-emerald-600 dark:bg-slate-900 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              Live ({liveCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hidden')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                statusFilter === 'hidden'
                  ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              Hidden ({safeItems.length - liveCount})
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

      {/* Main Content Area with Layout-Accurate Skeleton */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
              >
                {/* Header Skeleton */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ATMSkeleton width="40px" height="40px" className="rounded-xl" />
                    <div className="space-y-1.5">
                      <ATMSkeleton width="80px" height="12px" className="rounded" />
                      <ATMSkeleton width="110px" height="14px" className="rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ATMSkeleton width="60px" height="20px" className="rounded" />
                    <ATMSkeleton width="45px" height="20px" className="rounded-full" />
                  </div>
                </div>

                {/* Title & Description Skeleton */}
                <div className="space-y-2 pt-1">
                  <ATMSkeleton width="85%" height="18px" className="rounded" />
                  <ATMSkeleton width="100%" height="12px" className="rounded" />
                  <ATMSkeleton width="70%" height="12px" className="rounded" />
                </div>

                {/* Operational Reality Micro-Meter Box */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <ATMSkeleton width="100px" height="12px" className="rounded" />
                    <ATMSkeleton width="70px" height="12px" className="rounded" />
                  </div>
                  <ATMSkeleton width="90%" height="14px" className="rounded" />
                </div>

                {/* Interactive Segmented Switcher & Dynamic Box */}
                <div className="space-y-2">
                  <ATMSkeleton width="100%" height="32px" className="rounded-xl" />
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 space-y-1.5 min-h-[70px]">
                    <ATMSkeleton width="80px" height="12px" className="rounded" />
                    <ATMSkeleton width="100%" height="12px" className="rounded" />
                    <ATMSkeleton width="60%" height="12px" className="rounded" />
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <ATMSkeleton width="80px" height="20px" className="rounded" />
                  <div className="flex items-center gap-1.5">
                    <ATMSkeleton width="30px" height="30px" className="rounded-lg" />
                    <ATMSkeleton width="30px" height="30px" className="rounded-lg" />
                    <ATMSkeleton width="30px" height="30px" className="rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 bg-white dark:bg-[#12151c]"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <ATMSkeleton width="40px" height="40px" className="rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <ATMSkeleton width="24px" height="16px" className="rounded" />
                      <ATMSkeleton width="180px" height="16px" className="rounded" />
                      <ATMSkeleton width="70px" height="16px" className="rounded" />
                    </div>
                    <ATMSkeleton width="60%" height="12px" className="rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ATMSkeleton width="55px" height="22px" className="rounded-full" />
                  <ATMSkeleton width="100px" height="32px" className="rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20">
          <AlertCircle size={36} className="text-rose-500 mb-2" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Failed to Load Business Problems
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Could not fetch data from the server. Please verify your connection or API server.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <AlertTriangle size={40} className="text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Business Problems Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchQuery
              ? `No cards matching "${searchQuery}". Try adjusting your search query.`
              : `There are currently no business problems registered for the ${activeVariant} platform.`}
          </p>
          <ATMButton
            variant="primary"
            onClick={onOpenAdd}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus size={14} />
            <span>Add First Problem</span>
          </ATMButton>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredItems.map((prob) => (
            <BusinessProblemCard
              key={prob.businessProblemId || prob.id}
              problem={prob}
              viewMode={viewMode}
              onEdit={onOpenEdit}
              onDelete={onOpenDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
};
