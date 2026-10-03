import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Store,
  Boxes,
  ChefHat,
  LineChart,
  Navigation,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { cn } from '@/lib/utils/cn';
import { FeatureCard } from './FeatureCard';
import type { PlatformFeature } from '../Model/FeatureTypes';

interface FeatureListProps {
  items: readonly PlatformFeature[];
  counts?: Record<string, number>;
  activeVariant: string;
  onVariantChange: (variant: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: PlatformFeature) => void;
  onOpenDelete: (item: PlatformFeature) => void;
  onToggleActive: (item: PlatformFeature) => void;
  onToggleNavbar: (item: PlatformFeature) => void;
}

const VARIANT_TABS = [
  { id: 'Enterprise', label: 'Enterprise Platform', icon: Store },
  { id: 'Restaurant', label: 'Restaurant & Dining', icon: ChefHat },
  { id: 'Retail', label: 'Retail & Checkout', icon: Boxes },
];

export const FeatureList: React.FC<FeatureListProps> = ({
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
  onToggleNavbar,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'hidden'>('all');

  const safeItems = useMemo(() => items || [], [items]);

  const filteredItems = useMemo(() => {
    return safeItems.filter((item) => {
      const q = (searchQuery || '').toLowerCase().trim();
      const title = (item.title || '').toLowerCase();
      const desc = (item.shortDescription || item.fullDescription || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const slug = (item.slug || '').toLowerCase();

      const matchesSearch =
        q === '' ||
        title.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        slug.includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && item.isActive) ||
        (statusFilter === 'hidden' && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [safeItems, searchQuery, statusFilter]);

  const liveCount = useMemo(() => safeItems.filter((s) => s.isActive).length, [safeItems]);
  const navbarCount = useMemo(() => safeItems.filter((s) => s.showInNavbar).length, [safeItems]);

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        title="Features CMS Manager"
        subtitle="Manage product features across Navbar dropdown, Bento Grid, Homepage Vault, and single feature detail pages."
        icon={Zap}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Features' },
        ]}
        action={{
          label: 'Add New Feature',
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ATMStatsCard
          label="Total Features"
          value={safeItems.length}
          description={`${activeVariant} site variant`}
          icon={Zap}
          variant="amber"
        />
        <ATMStatsCard
          label="Active Live"
          value={liveCount}
          description="Published on website"
          icon={Eye}
          variant="emerald"
        />
        <ATMStatsCard
          label="In Navbar"
          value={navbarCount}
          description="MegaMenu navigation items"
          icon={Navigation}
          variant="indigo"
        />
        <ATMStatsCard
          label="Draft / Hidden"
          value={safeItems.length - liveCount}
          description="Hidden from public API"
          icon={EyeOff}
          variant="slate"
        />
      </div>

      {/* Variant Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
        {VARIANT_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActiveTab = activeVariant.toLowerCase() === tab.id.toLowerCase();
          const count = counts?.[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onVariantChange(tab.id)}
              className={cn(
                'group flex items-center gap-2.5 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer',
                isActiveTab
                  ? 'border-[#FF4F00] text-[#FF4F00] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold',
                  isActiveTab
                    ? 'bg-orange-500/15 text-[#FF4F00]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar with Dual View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feature title, slug, category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF4F00]"
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

      {/* Grid / List Content with ATMSkeleton */}
      {isLoading ? (
        <ATMSkeleton
          variant={viewMode === 'grid' ? 'feature-card' : 'feature-row'}
          count={6}
        />
      ) : isError ? (
        <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="font-syne font-bold">Failed to load features for {activeVariant}</p>
          <ATMButton variant="secondary" onClick={onRetry} icon={RefreshCw}>
            Retry Load
          </ATMButton>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Sparkles size={32} className="mx-auto text-slate-400" />
          <h3 className="font-syne font-bold text-slate-900 dark:text-white">No Features Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No features matched your filters for variant &apos;{activeVariant}&apos;. Add your first feature to get started.
          </p>
          <ATMButton variant="primary" onClick={onOpenAdd} icon={Plus}>
            Add Feature Item
          </ATMButton>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredItems.map((item, idx) => (
            <FeatureCard
              key={item.featureId || item.id}
              item={item}
              index={idx}
              total={filteredItems.length}
              viewMode={viewMode}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onToggleNavbar={onToggleNavbar}
            />
          ))}
        </div>
      )}
    </div>
  );
};
