import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  MoveUp,
  MoveDown,
  Layers,
  Globe,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  AlertTriangle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import {
  ATMButton,
  ATMCard,
  ATMModal,
  ATMSkeleton,
  ATMTextField,
  ATMTextArea,
  ATMSelectField,
} from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { FAQ } from '@/lib/types';
import {
  useGetFaqsQuery,
  useGetFaqCategoriesQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
} from '../services/contentApi';

const ALL = '__all__';

/** Platform tabs for storefront-scoped FAQ management */
const PLATFORM_TABS = [
  { id: ALL,           label: 'All Storefronts',      icon: Globe },
  { id: 'Enterprise',  label: 'Enterprise Storefront', icon: Building2 },
  { id: 'Restaurant',  label: 'Restaurant Storefront', icon: UtensilsCrossed },
  { id: 'Retail',      label: 'Retail Storefront',     icon: ShoppingBag },
] as const;

type PlatformTabId = typeof PLATFORM_TABS[number]['id'];

const CATEGORY_SUGGESTIONS = [
  'Platform',
  'Offline',
  'Integrations',
  'Hardware',
  'Security',
  'Support',
  'Inventory',
  'Menu Management',
  'Billing',
];

interface DraftFaq {
  faqId?: string;
  question: string;
  answer: string;
  category: string;
  merchantType: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyDraft = (platform: PlatformTabId, existingCount: number): DraftFaq => ({
  question: '',
  answer: '',
  category: 'Platform',
  merchantType: platform === 'Enterprise' ? 'Enterprise' : platform === ALL ? '' : 'Standalone',
  sortOrder: existingCount + 1,
  isActive: true,
});

export default function FAQPage() {
  const [activePlatform, setActivePlatform] = useState<PlatformTabId>(ALL);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<DraftFaq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);

  // Queries & Mutations
  const faqsQuery = useGetFaqsQuery();
  const categoriesQuery = useGetFaqCategoriesQuery();
  const [createFaq, createState] = useCreateFaqMutation();
  const [updateFaq, updateState] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();
  const [reorderFaqs] = useReorderFaqsMutation();

  const allFaqs = faqsQuery.data?.data ?? [];
  const fetchedCategories = categoriesQuery.data?.data ?? [];

  // Categorize per platform
  const isMatchPlatform = (faq: FAQ, platform: PlatformTabId): boolean => {
    if (platform === ALL) return true;
    if (platform === 'Enterprise') {
      return (
        faq.merchantType === 'Enterprise' ||
        faq.category?.toLowerCase() === 'enterprise'
      );
    }
    if (platform === 'Restaurant') {
      return (
        faq.merchantType === 'Standalone' ||
        faq.merchantType === 'Restaurant' ||
        faq.category?.toLowerCase() === 'restaurant' ||
        faq.question.toLowerCase().includes('restaurant') ||
        faq.question.toLowerCase().includes('kitchen') ||
        faq.question.toLowerCase().includes('kds') ||
        faq.question.toLowerCase().includes('menu') ||
        faq.question.toLowerCase().includes('zomato')
      );
    }
    if (platform === 'Retail') {
      return (
        faq.merchantType === 'Standalone' ||
        faq.merchantType === 'Retail' ||
        faq.category?.toLowerCase() === 'retail' ||
        faq.question.toLowerCase().includes('retail') ||
        faq.question.toLowerCase().includes('barcode') ||
        faq.question.toLowerCase().includes('sku') ||
        faq.question.toLowerCase().includes('inventory')
      );
    }
    return true;
  };

  // Filtered FAQs based on platform, category, and search query
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      // Platform filter
      if (!isMatchPlatform(faq, activePlatform)) return false;

      // Category filter
      if (selectedCategory !== ALL && faq.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuestion = faq.question.toLowerCase().includes(query);
        const matchesAnswer = faq.answer.toLowerCase().includes(query);
        const matchesCategory = (faq.category ?? '').toLowerCase().includes(query);
        return matchesQuestion || matchesAnswer || matchesCategory;
      }

      return true;
    });
  }, [allFaqs, activePlatform, selectedCategory, searchQuery]);

  // Derived category list
  const activeCategories = useMemo(() => {
    const set = new Set<string>();
    fetchedCategories.forEach((c) => set.add(c));
    allFaqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [allFaqs, fetchedCategories]);

  // Metrics
  const metrics = useMemo(() => {
    const total = allFaqs.length;
    const published = allFaqs.filter((f) => f.isActive).length;
    const hidden = total - published;
    const catCount = activeCategories.length;
    return { total, published, hidden, catCount };
  }, [allFaqs, activeCategories]);

  // Toggle single item expansion
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle expand all
  const handleToggleExpandAll = () => {
    if (expandedIds.size === filteredFaqs.length && filteredFaqs.length > 0) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredFaqs.map((f) => f.faqId)));
    }
  };

  // Open Create
  const handleOpenCreate = () => {
    setDraft(emptyDraft(activePlatform, allFaqs.length));
  };

  // Open Edit
  const handleOpenEdit = (faq: FAQ) => {
    setDraft({
      faqId: faq.faqId,
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? 'Platform',
      merchantType: faq.merchantType ?? '',
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
  };

  // Save (Create / Update)
  const handleSave = async () => {
    if (!draft) return;
    if (!draft.question.trim()) {
      toast.error('Question is required.');
      return;
    }
    if (!draft.answer.trim()) {
      toast.error('Answer is required.');
      return;
    }

    try {
      if (draft.faqId) {
        await updateFaq({
          faqId: draft.faqId,
          question: draft.question.trim(),
          answer: draft.answer.trim(),
          category: draft.category.trim() || undefined,
          merchantType: draft.merchantType || null,
          sortOrder: draft.sortOrder,
          isActive: draft.isActive,
        }).unwrap();
        toast.success('FAQ updated successfully.');
      } else {
        await createFaq({
          question: draft.question.trim(),
          answer: draft.answer.trim(),
          category: draft.category.trim() || undefined,
          merchantType: draft.merchantType || null,
          sortOrder: draft.sortOrder,
        }).unwrap();
        toast.success('FAQ created successfully.');
      }
      setDraft(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to save FAQ. Please try again.';
      toast.error(errorMsg);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (faq: FAQ) => {
    try {
      await updateFaq({
        faqId: faq.faqId,
        isActive: !faq.isActive,
      }).unwrap();
      toast.success(
        faq.isActive ? 'FAQ hidden from website.' : 'FAQ published live to website.',
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to toggle visibility.';
      toast.error(errorMsg);
    }
  };

  // Move up/down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredFaqs.length) return;

    const list = [...filteredFaqs];
    const moved = list[index];
    const target = list[targetIndex];
    if (!moved || !target) return;

    list[index] = target;
    list[targetIndex] = moved;

    const orderedIds = list.map((f) => f.faqId);
    try {
      await reorderFaqs(orderedIds).unwrap();
      toast.success('FAQ order updated.');
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update order.';
      toast.error(errorMsg);
    }
  };

  // Drag and drop reorder
  const handleDrop = async (targetFaqId: string) => {
    if (!draggedFaqId || draggedFaqId === targetFaqId) {
      setDraggedFaqId(null);
      return;
    }

    const fromIdx = filteredFaqs.findIndex((f) => f.faqId === draggedFaqId);
    const toIdx = filteredFaqs.findIndex((f) => f.faqId === targetFaqId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedFaqId(null);
      return;
    }

    const reordered = [...filteredFaqs];
    const [item] = reordered.splice(fromIdx, 1);
    if (!item) return;
    reordered.splice(toIdx, 0, item);

    setDraggedFaqId(null);
    try {
      await reorderFaqs(reordered.map((f) => f.faqId)).unwrap();
      toast.success('FAQ reordered.');
    } catch {
      toast.error('Failed to save reordered FAQs.');
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaq(deleteTarget.faqId).unwrap();
      toast.success('FAQ deleted successfully.');
      setDeleteTarget(null);
    } catch {
      toast.error('Could not delete this FAQ.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <ATMPageHeader
        title="Frequently Asked Questions (FAQ)"
        subtitle="Manage questions, answers, categorization, and visibility across Enterprise, Restaurant, and Retail storefronts."
        icon={HelpCircle}
        iconColor="theme"
        action={{
          label: activePlatform === ALL ? 'Add FAQ' : `Add ${activePlatform} FAQ`,
          onClick: handleOpenCreate,
          icon: Plus,
        }}
      />

      {/* Top Quick Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.total}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total FAQs</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.published}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Live / Published</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <EyeOff className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.hidden}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Hidden / Draft</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics.catCount}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Categories</div>
          </div>
        </div>
      </div>

      {/* Platform Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-100/70 p-1.5 dark:border-slate-800 dark:bg-[#13151a]">
        <div className="flex flex-wrap gap-1">
          {PLATFORM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activePlatform === tab.id;
            const count = allFaqs.filter((f) => isMatchPlatform(f, tab.id)).length;

            return (
              <button
                key={tab.id}
                type="button"
                id={`faq-platform-tab-${tab.id}`}
                onClick={() => {
                  setActivePlatform(tab.id);
                  setSelectedCategory(ALL);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200',
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
                )}
              >
                <Icon size={14} className={isSelected ? 'text-primary-600 dark:text-primary-400' : ''} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isSelected
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredFaqs.length > 0 && (
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {expandedIds.size === filteredFaqs.length ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Expand All ({filteredFaqs.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-[#13151a] dark:text-slate-100 dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory(ALL)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              selectedCategory === ALL
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            )}
          >
            All Categories
          </button>
          {activeCategories.map((cat) => {
            const catCount = allFaqs
              .filter((f) => isMatchPlatform(f, activePlatform))
              .filter((f) => f.category === cat).length;
            if (catCount === 0 && activePlatform !== ALL) return null;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                {cat} <span className="opacity-60 text-[10px]">({catCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {faqsQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not load FAQs from server.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void faqsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-3">
        {faqsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <ATMSkeleton key={i} variant="rect" height="76px" className="rounded-xl" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <ATMCard>
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <HelpCircle className="h-7 w-7 opacity-50" />
              </div>
              <div className="max-w-md">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  {searchQuery
                    ? `No FAQs match "${searchQuery}"`
                    : activePlatform !== ALL
                      ? `No FAQs configured for ${activePlatform}`
                      : 'No FAQs added yet'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? 'Try adjusting your search terms or clearing the category filter.'
                    : 'Get started by creating your first storefront accordion question and answer.'}
                </p>
              </div>
              {searchQuery ? (
                <ATMButton variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search
                </ATMButton>
              ) : (
                <ATMButton variant="primary" size="sm" onClick={handleOpenCreate} icon={Plus}>
                  Create FAQ
                </ATMButton>
              )}
            </div>
          </ATMCard>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIds.has(faq.faqId);

            return (
              <div
                key={faq.faqId}
                draggable
                onDragStart={() => setDraggedFaqId(faq.faqId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { void handleDrop(faq.faqId); }}
                className={cn(
                  'group relative rounded-xl border bg-white shadow-sm transition-all duration-200 dark:bg-[#13151a]',
                  draggedFaqId === faq.faqId && 'opacity-40 scale-[0.99]',
                  faq.isActive
                    ? 'border-slate-200/90 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    : 'border-dashed border-amber-300/80 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/10',
                )}
              >
                {/* Left Status Color Bar */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors',
                    faq.isActive ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                />

                <div className="flex flex-col p-4 pl-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  {/* Left Side: Drag, Order, Question, Badges */}
                  <div className="flex flex-1 items-start gap-3">
                    {/* Drag Handle */}
                    <div
                      className="mt-0.5 flex flex-col items-center justify-center text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Order index pill */}
                    <div className="mt-0.5 flex h-5 min-w-[20px] items-center justify-center rounded bg-slate-100 px-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      #{index + 1}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      {/* Question Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(faq.faqId)}
                        className="text-left font-semibold text-slate-900 hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400 text-sm leading-snug"
                      >
                        {faq.question}
                      </button>

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Category Badge */}
                        {faq.category && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Layers className="h-2.5 w-2.5 text-slate-400" />
                            {faq.category}
                          </span>
                        )}

                        {/* Audience / Platform */}
                        {faq.merchantType ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                            {faq.merchantType === 'Enterprise' ? (
                              <Building2 className="h-2.5 w-2.5" />
                            ) : (
                              <UtensilsCrossed className="h-2.5 w-2.5" />
                            )}
                            {faq.merchantType}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Globe className="h-2.5 w-2.5" />
                            All Storefronts
                          </span>
                        )}

                        {/* Status Badge */}
                        {faq.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <EyeOff className="h-2.5 w-2.5" />
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions Bar */}
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2 sm:mt-0 sm:border-t-0 sm:pt-0">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => { void handleMove(index, 'up'); }}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Move Up"
                    >
                      <MoveUp className="h-3.5 w-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === filteredFaqs.length - 1}
                      onClick={() => { void handleMove(index, 'down'); }}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Move Down"
                    >
                      <MoveDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => { void handleTogglePublish(faq); }}
                      className={cn(
                        'rounded p-1.5 transition-colors',
                        faq.isActive
                          ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40'
                          : 'text-amber-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-amber-400 dark:hover:bg-emerald-950/40',
                      )}
                      title={faq.isActive ? 'Hide from public storefront' : 'Publish to live storefront'}
                    >
                      {faq.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(faq)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Edit question & answer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(faq)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      title="Delete FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Expand/Collapse Chevron */}
                    <button
                      type="button"
                      onClick={() => toggleExpanded(faq.faqId)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 ml-1"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Section */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 pl-12 dark:border-slate-800/80 dark:bg-slate-900/40">
                    <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {faq.answer}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Order weight: {faq.sortOrder}</span>
                      {faq.createdAt && (
                        <span>Added: {new Date(faq.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal with Live Card Preview */}
      <ATMModal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.faqId ? 'Edit FAQ Item' : 'Add Storefront FAQ'}
        size="lg"
      >
        {draft && (
          <div className="space-y-4">
            {/* Live Preview Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3 text-primary-500" />
                Live Card Preview
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#13151a]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {draft.question.trim() || 'Your question will display here...'}
                  </span>
                  {draft.category && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {draft.category}
                    </span>
                  )}
                  {draft.merchantType && (
                    <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[9px] font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      {draft.merchantType}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {draft.answer.trim() || 'Your answer explanation will display here when expanded...'}
                </p>
              </div>
            </div>

            {/* Question Input */}
            <ATMTextField
              name="question"
              label="Question Title"
              placeholder="e.g. Can Quantix connect to SAP, Oracle, or a custom ERP?"
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            />

            {/* Answer Input */}
            <ATMTextArea
              name="answer"
              label="Answer Description"
              rows={5}
              placeholder="Provide a thorough, direct explanation for your customers and merchants..."
              value={draft.answer}
              onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
            />

            {/* Grid 3-Cols: Category, Target Storefront, Order */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Category with quick chips */}
              <div className="space-y-1.5">
                <ATMTextField
                  name="category"
                  label="Category Name"
                  placeholder="Platform / Hardware / Integrations"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                />
                <div className="flex flex-wrap gap-1">
                  {CATEGORY_SUGGESTIONS.slice(0, 4).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDraft({ ...draft, category: c })}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Merchant Type */}
              <ATMSelectField
                name="merchantType"
                label="Target Storefront"
                value={draft.merchantType}
                onChange={(v) => setDraft({ ...draft, merchantType: String(v ?? '') })}
                options={[
                  { value: '', label: 'All Storefronts (Global)' },
                  { value: 'Enterprise', label: 'Enterprise Storefront' },
                  { value: 'Standalone', label: 'Restaurant / Retail Storefronts' },
                ]}
              />

              {/* Sort Order */}
              <ATMTextField
                name="sortOrder"
                label="Sort Order"
                type="number"
                value={String(draft.sortOrder)}
                onChange={(e) =>
                  setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Active & Visible to visitors</span>
              </label>

              <div className="flex items-center gap-2">
                <ATMButton variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </ATMButton>
                <ATMButton
                  variant="primary"
                  onClick={() => { void handleSave(); }}
                  isLoading={createState.isLoading || updateState.isLoading}
                >
                  {draft.faqId ? 'Save Changes' : 'Publish FAQ'}
                </ATMButton>
              </div>
            </div>
          </div>
        )}
      </ATMModal>

      {/* Delete Confirmation Modal */}
      <ATMModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete FAQ Item?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3 dark:border-red-900/50 dark:bg-red-950/20">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-300">
              <p className="font-semibold">This action cannot be undone.</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                &ldquo;{deleteTarget?.question}&rdquo; will be permanently deleted from the database and storefront.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <ATMButton variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </ATMButton>
            <ATMButton variant="danger" onClick={() => { void handleConfirmDelete(); }}>
              Delete FAQ
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}
