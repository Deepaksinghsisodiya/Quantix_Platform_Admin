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
import { ATMButton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { SolutionCard, SolutionCardSkeleton } from './SolutionCard';
import type { SolutionItem } from '../Model/SolutionTypes';

interface SolutionListProps {
  items: SolutionItem[];
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

const SECTION_TABS = [
  { id: 'PromoCard' as const, label: 'Subdomain Promo Cards (Left)', shortLabel: 'Subdomain Cards', icon: ExternalLink },
  { id: 'SectorItem' as const, label: 'Sector Solutions & Pages (Right)', shortLabel: 'Sector Pages', icon: Layers },
  { id: 'All' as const, label: 'All Items', shortLabel: 'All', icon: Compass },
];

export const SolutionList: React.FC<SolutionListProps> = ({
  items = [],
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
        title="Solutions (MegaMenu & Landing Pages)"
        subtitle="Manage Enterprise Navbar Solutions dropdown: Left Subdomain External Cards & Right Sector Landing Pages."
        icon={Compass}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Solutions' },
        ]}
        action={{
          label: 'Add Solution / Card',
          onClick: onOpenAdd,
          icon: Plus,
        }}
      />

      {/* 2. KPI Stats Cards Grid (Matching Clientele & How It Works standards) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 animate-pulse"
            >
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Stat 1: Subdomain Cards */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Subdomain Cards (Left)</span>
              <ExternalLink size={13} className="text-amber-500" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {counts.PromoCard}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/40">
                Subdomain
              </span>
            </div>
          </div>

          {/* Stat 2: Sector Landing Pages */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Sector Solutions (Right)</span>
              <Layers size={13} className="text-primary-500" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {counts.SectorItem}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded border border-primary-200/60 dark:border-primary-800/40">
                Pages
              </span>
            </div>
          </div>

          {/* Stat 3: Live Active */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              Live Active in View
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {liveCount}
              </span>
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Live
              </span>
            </div>
          </div>

          {/* Stat 4: Hidden / Draft */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              Draft / Hidden
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">
                {hiddenCount}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Hidden</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Underline Section Tabs (Matching Clientele/HowItWorks styling) */}
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

      {/* 4. Controls Toolbar: Search & Live/Hidden Filter Pills */}
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
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
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
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1',
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
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1',
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

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-center">
          Showing <span className="font-bold text-slate-800 dark:text-white">{filteredItems.length}</span> of {safeItems.length}
        </div>
      </div>

      {/* 5. Informational Callout Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 shrink-0">
          <HelpCircle size={18} />
        </div>
        <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
          <div className="font-bold">Enterprise Solutions MegaMenu Architecture:</div>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            • <strong>Left Cards (Subdomain):</strong> Take users to standalone platform websites (Restaurant: <code className="font-mono font-bold">http://localhost:3002</code>, Retail: <code className="font-mono font-bold">http://localhost:3001</code>).<br />
            • <strong>Right Solutions (Landing Pages):</strong> Open detailed sector pages (<code className="font-mono font-bold">/solutions/[industrySlug]</code>) containing 3 Key Points, 6 Bento Workflows, and Sector FAQs.
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

      {/* 7. Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SolutionCardSkeleton key={i} />
          ))}
        </div>
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

      {/* 9. Solution Cards Grid (Matching standard layout) */}
      {!isLoading && !isError && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item, idx) => (
            <SolutionCard
              key={item.solutionId || item.id || idx}
              item={item}
              index={idx}
              total={filteredItems.length}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              onToggleActive={onToggleActive}
              onMove={onMove}
              isReordering={isReordering}
            />
          ))}
        </div>
      )}
    </div>
  );
};
