import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImageOff,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Layers,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import {
  ATMButton,
  ATMCard,
  ATMModal,
  ATMSkeleton,
  ATMTextField,
  ATMBadge,
  ATMTextArea,
  ATMSelectField,
  ATMCheckbox,
} from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { MediaPicker } from '../components/MediaPicker';
import { absoluteMediaUrl } from '../services/mediaApi';
import {
  useGetAdminHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useReorderHeroSlidesMutation,
  type HeroSlide,
} from '../services/heroSlidesApi';

type SiteTab = 'Enterprise' | 'Restaurant' | 'Retail';

const SITE_TABS: Array<{ id: SiteTab; label: string; icon: React.ComponentType<{ className?: string; size?: number }> }> = [
  { id: 'Enterprise', label: 'Enterprise Website', icon: Building2 },
  { id: 'Restaurant', label: 'Restaurant Website', icon: UtensilsCrossed },
  { id: 'Retail', label: 'Retail Website', icon: ShoppingBag },
];

interface SlideDraft {
  heroSlideId?: string;
  siteVariant: string;
  badge: string;
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  highlight1: string;
  highlight2: string;
  highlight3: string;
  mediaAssetId: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyDraft = (siteVariant: string): SlideDraft => ({
  siteVariant,
  badge: '',
  heading: '',
  subheading: '',
  primaryCtaLabel: 'Start Free Trial',
  primaryCtaUrl: '/contact',
  secondaryCtaLabel: 'Book Demo',
  secondaryCtaUrl: '/contact/demo',
  highlight1: '',
  highlight2: '',
  highlight3: '',
  mediaAssetId: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
});

export default function HeroBannersPage() {
  const [activeTab, setActiveTab] = useState<SiteTab>('Enterprise');
  const [draft, setDraft] = useState<SlideDraft | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  const { data: response, isLoading, isError, refetch } = useGetAdminHeroSlidesQuery(activeTab);
  const [createSlide, createState] = useCreateHeroSlideMutation();
  const [updateSlide, updateState] = useUpdateHeroSlideMutation();
  const [deleteSlide, deleteState] = useDeleteHeroSlideMutation();
  const [reorderSlides, reorderState] = useReorderHeroSlidesMutation();

  const slides = useMemo(() => {
    return [...(response?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [response]);

  const openCreate = () => {
    const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.sortOrder)) + 1 : 1;
    const initial = emptyDraft(activeTab);
    initial.sortOrder = nextOrder;
    setDraft(initial);
  };

  const openEdit = (s: HeroSlide) => {
    const h = s.featureHighlights || [];
    setDraft({
      heroSlideId: s.heroSlideId,
      siteVariant: s.siteVariant,
      badge: s.badge || '',
      heading: s.heading,
      subheading: s.subheading || '',
      primaryCtaLabel: s.primaryCtaLabel || '',
      primaryCtaUrl: s.primaryCtaUrl || '',
      secondaryCtaLabel: s.secondaryCtaLabel || '',
      secondaryCtaUrl: s.secondaryCtaUrl || '',
      highlight1: h[0] || '',
      highlight2: h[1] || '',
      highlight3: h[2] || '',
      mediaAssetId: s.mediaAssetId || '',
      imageUrl: s.imageUrl || '',
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.heading.trim()) {
      toast.error('Slide heading / title is required.');
      return;
    }

    const highlights = [draft.highlight1, draft.highlight2, draft.highlight3]
      .map((x) => x.trim())
      .filter(Boolean);

    const payload = {
      siteVariant: draft.siteVariant,
      badge: draft.badge.trim(),
      heading: draft.heading.trim(),
      subheading: draft.subheading.trim() || null,
      primaryCtaLabel: draft.primaryCtaLabel.trim() || null,
      primaryCtaUrl: draft.primaryCtaUrl.trim() || null,
      secondaryCtaLabel: draft.secondaryCtaLabel.trim() || null,
      secondaryCtaUrl: draft.secondaryCtaUrl.trim() || null,
      featureHighlights: highlights,
      mediaAssetId: draft.mediaAssetId || null,
      imageUrl: draft.imageUrl.trim() || null,
      sortOrder: draft.sortOrder,
      isActive: draft.isActive,
    };

    try {
      if (draft.heroSlideId) {
        await updateSlide({ id: draft.heroSlideId, ...payload }).unwrap();
        toast.success('Hero slide updated.');
      } else {
        await createSlide(payload).unwrap();
        toast.success('Hero slide created.');
      }
      setDraft(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not save this slide.');
    }
  };

  const togglePublished = async (s: HeroSlide) => {
    try {
      await updateSlide({
        id: s.heroSlideId,
        siteVariant: s.siteVariant,
        badge: s.badge,
        heading: s.heading,
        subheading: s.subheading,
        primaryCtaLabel: s.primaryCtaLabel,
        primaryCtaUrl: s.primaryCtaUrl,
        secondaryCtaLabel: s.secondaryCtaLabel,
        secondaryCtaUrl: s.secondaryCtaUrl,
        featureHighlights: s.featureHighlights,
        mediaAssetId: s.mediaAssetId,
        imageUrl: s.imageUrl,
        sortOrder: s.sortOrder,
        isActive: !s.isActive,
      }).unwrap();
      toast.success(s.isActive ? 'Slide hidden from website.' : 'Slide published to website.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update visibility.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSlide(deleteTarget.heroSlideId).unwrap();
      toast.success('Slide deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not delete this slide.');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((s) => s.heroSlideId);
    try {
      await reorderSlides({ orderedIds }).unwrap();
      toast.success('Slide order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reorder slides.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        title="Hero Banners CMS"
        subtitle="Manage dynamic hero slides, headings, badges, dual CTAs, bullet chips, and background visuals across all websites."
        icon={Sparkles}
        iconColor="theme"
        action={{ label: `Add ${activeTab} Slide`, onClick: openCreate, icon: Plus }}
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not load hero slides from API.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Website Variant Filter Tabs */}
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-[#13151a]">
        {SITE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200',
                isSelected
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isSelected
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                )}
              >
                {slides.filter((s) => s.siteVariant.toLowerCase() === tab.id.toLowerCase()).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slides Listing */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <ATMSkeleton key={i} variant="rect" height="120px" className="rounded-xl" />
            ))}
          </div>
        ) : slides.length === 0 ? (
          <ATMCard>
            <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <ImageOff className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No slides configured for {activeTab}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Click the &quot;Add {activeTab} Slide&quot; button above to create your first dynamic hero banner.
                </p>
              </div>
              <ATMButton variant="primary" size="sm" onClick={openCreate} icon={Plus}>
                Add Slide
              </ATMButton>
            </div>
          </ATMCard>
        ) : (
          slides.map((s, index) => {
            const imageSrc = s.mediaAssetId
              ? absoluteMediaUrl(`/api/v1/media/${s.mediaAssetId}/file`)
              : s.imageUrl;

            return (
              <ATMCard
                key={s.heroSlideId}
                className={cn(
                  'group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-slate-200/90 dark:border-slate-800',
                  !s.isActive && 'opacity-65 bg-slate-50/50 dark:bg-slate-900/30',
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start p-2">
                  {/* Left: Media Thumbnail */}
                  <div className="relative h-32 w-full md:w-48 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={s.heading}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-6 w-6 text-slate-500" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Center: Slide Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {s.badge && (
                        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/60">
                          {s.badge}
                        </span>
                      )}
                      <ATMBadge
                        color={s.isActive ? 'success' : 'default'}
                        label={s.isActive ? 'Live' : 'Hidden'}
                        icon={s.isActive ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {s.heading}
                    </h3>

                    {s.subheading && (
                      <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {s.subheading}
                      </p>
                    )}

                    {/* CTAs preview */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {s.primaryCtaLabel && (
                        <span className="inline-flex items-center gap-1 rounded bg-[#FF4F00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF4F00] dark:bg-[#FF4F00]/20">
                          Primary: {s.primaryCtaLabel} {s.primaryCtaUrl ? `(${s.primaryCtaUrl})` : ''}
                        </span>
                      )}
                      {s.secondaryCtaLabel && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Secondary: {s.secondaryCtaLabel} {s.secondaryCtaUrl ? `(${s.secondaryCtaUrl})` : ''}
                        </span>
                      )}
                    </div>

                    {/* Feature Highlight chips */}
                    {s.featureHighlights && s.featureHighlights.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {s.featureHighlights.map((chip, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                          >
                            ✓ {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col items-center justify-end gap-1 shrink-0 pt-2 md:pt-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0 || reorderState.isLoading}
                        onClick={() => moveSlide(index, 'up')}
                        title="Move Up"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
                      >
                        <MoveUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={index === slides.length - 1 || reorderState.isLoading}
                        onClick={() => moveSlide(index, 'down')}
                        title="Move Down"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
                      >
                        <MoveDown size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePublished(s)}
                        title={s.isActive ? 'Hide from website' : 'Publish to website'}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {s.isActive ? <Eye size={16} /> : <EyeOff size={16} className="text-amber-500" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        title="Edit Slide"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(s)}
                        title="Delete Slide"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </ATMCard>
            );
          })
        )}
      </div>

      {/* Add / Edit Slide Modal */}
      <ATMModal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.heroSlideId ? `Edit ${draft.siteVariant} Slide` : `Create New ${activeTab} Hero Slide`}
        subtitle="Configure the slide content, dual CTA buttons, feature chips, and showcase visual."
        size="4xl"
        footer={
          draft ? (
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {draft.heroSlideId ? 'Editing existing slide' : 'Creating new hero slide'}
              </span>
              <div className="flex items-center gap-2">
                <ATMButton variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </ATMButton>
                <ATMButton
                  variant="primary"
                  onClick={() => { void save(); }}
                  isLoading={createState.isLoading || updateState.isLoading}
                >
                  {draft.heroSlideId ? 'Update Slide' : 'Publish Slide'}
                </ATMButton>
              </div>
            </div>
          ) : undefined
        }
      >
        {draft && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Content & Live Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Basic Metadata & Heading */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <Layers className="h-4 w-4 text-primary-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Slide Information & Hierarchy
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ATMSelectField
                      name="siteVariant"
                      label="Target Website"
                      value={draft.siteVariant}
                      onChange={(val) => setDraft({ ...draft, siteVariant: String(val || 'Enterprise') })}
                      options={[
                        { value: 'Enterprise', label: 'Enterprise Website' },
                        { value: 'Restaurant', label: 'Restaurant Website' },
                        { value: 'Retail', label: 'Retail Website' },
                      ]}
                      helperText="Which website platform renders this slide."
                    />

                    <ATMTextField
                      name="sortOrder"
                      label="Slide Order Index"
                      type="number"
                      value={String(draft.sortOrder)}
                      onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })}
                      helperText="Lower numbers appear first (#1 is hero front)."
                    />
                  </div>

                  <ATMTextField
                    name="badge"
                    label="Top Pill Badge"
                    placeholder="e.g. OPERATING PLATFORM FOR MULTI-LOCATION BRANDS"
                    value={draft.badge}
                    onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                    helperText="Small uppercase badge pill displayed above the heading."
                  />

                  <ATMTextField
                    name="heading"
                    label="Main Heading / Title *"
                    placeholder="e.g. Run Every Location From One Platform"
                    value={draft.heading}
                    onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
                    helperText="Primary H1 headline for the slide."
                  />

                  <ATMTextArea
                    name="subheading"
                    label="Subheading / Paragraph Description"
                    placeholder="Detailed paragraph explaining features, benefits, and values..."
                    rows={4}
                    value={draft.subheading}
                    onChange={(e) => setDraft({ ...draft, subheading: e.target.value })}
                    helperText="2-3 concise sentences recommended."
                  />
                </div>

                {/* 2. Interactive Real-Time Preview */}
                <div className="rounded-xl border border-primary-200/80 bg-gradient-to-br from-primary-50/40 via-white to-slate-50/50 p-5 dark:border-primary-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                        Live Slide Card Preview
                      </span>
                    </div>
                    <span className="rounded-md bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      {draft.siteVariant} #{draft.sortOrder}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {draft.badge && (
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                        {draft.badge}
                      </span>
                    )}
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {draft.heading || 'Your Headline Will Appear Here'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {draft.subheading || 'Subheading and descriptive overview text will be displayed here in full fidelity.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {draft.primaryCtaLabel && (
                        <div className="rounded-lg bg-[#FF4F00] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                          {draft.primaryCtaLabel}
                        </div>
                      )}
                      {draft.secondaryCtaLabel && (
                        <div className="rounded-lg border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                          {draft.secondaryCtaLabel}
                        </div>
                      )}
                    </div>

                    {[draft.highlight1, draft.highlight2, draft.highlight3].filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        {[draft.highlight1, draft.highlight2, draft.highlight3].filter(Boolean).map((chip, i) => (
                          <span key={i} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                            ✓ {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Visuals, CTAs & Highlights (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Visual Showcase */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <ImageOff className="h-4 w-4 text-primary-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Showcase Device Visual
                    </h4>
                  </div>

                  {draft.mediaAssetId ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                        <img
                          src={absoluteMediaUrl(`/api/v1/media/${draft.mediaAssetId}/file`)}
                          alt="Showcase Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          ✓ Media Library Asset linked
                        </span>
                        <div className="flex gap-2">
                          <ATMButton variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                            Change
                          </ATMButton>
                          <ATMButton variant="danger" size="sm" onClick={() => setDraft({ ...draft, mediaAssetId: '' })}>
                            Remove
                          </ATMButton>
                        </div>
                      </div>
                    </div>
                  ) : draft.imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                        <img
                          src={draft.imageUrl}
                          alt="Showcase Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate text-slate-500 max-w-[180px]">
                          {draft.imageUrl}
                        </span>
                        <div className="flex gap-2">
                          <ATMButton variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                            Pick Media
                          </ATMButton>
                          <ATMButton variant="danger" size="sm" onClick={() => setDraft({ ...draft, imageUrl: '' })}>
                            Clear
                          </ATMButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-primary-500 hover:bg-primary-50/10 dark:border-slate-700 dark:bg-slate-900/40 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary dark:bg-primary-950">
                          <Plus size={20} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Select from Media Library
                        </span>
                        <span className="text-[10px] text-slate-500">
                          PNG, JPG, WebP terminal or hardware mockups
                        </span>
                      </button>

                      <ATMTextField
                        name="imageUrl"
                        label="Or Direct Image Path / URL"
                        placeholder="/images/foodhub_pos_terminal.jpg"
                        value={draft.imageUrl}
                        onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                        helperText="Local public image path or remote CDN URL."
                      />
                    </div>
                  )}
                </div>

                {/* 2. Action Buttons (CTAs) */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <ExternalLink className="h-4 w-4 text-primary-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Dual Action Buttons (CTAs)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                      <span className="text-[11px] font-bold text-[#FF4F00] uppercase tracking-wide">
                        Primary CTA Button (Solid Orange)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ATMTextField
                          name="primaryCtaLabel"
                          label="Button Label"
                          placeholder="e.g. Start Free Trial"
                          value={draft.primaryCtaLabel}
                          onChange={(e) => setDraft({ ...draft, primaryCtaLabel: e.target.value })}
                        />
                        <ATMTextField
                          name="primaryCtaUrl"
                          label="Destination URL"
                          placeholder="e.g. /contact or /sign-up"
                          value={draft.primaryCtaUrl}
                          onChange={(e) => setDraft({ ...draft, primaryCtaUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Secondary CTA Button (Outline)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ATMTextField
                          name="secondaryCtaLabel"
                          label="Button Label"
                          placeholder="e.g. Book Demo"
                          value={draft.secondaryCtaLabel}
                          onChange={(e) => setDraft({ ...draft, secondaryCtaLabel: e.target.value })}
                        />
                        <ATMTextField
                          name="secondaryCtaUrl"
                          label="Destination URL"
                          placeholder="e.g. /contact/demo"
                          value={draft.secondaryCtaUrl}
                          onChange={(e) => setDraft({ ...draft, secondaryCtaUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Feature Highlight Chips */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Feature Highlight Chips (3 Bullets)
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <ATMTextField
                      name="highlight1"
                      label="Feature Chip 1"
                      placeholder="e.g. Manage Every Location"
                      value={draft.highlight1}
                      onChange={(e) => setDraft({ ...draft, highlight1: e.target.value })}
                    />
                    <ATMTextField
                      name="highlight2"
                      label="Feature Chip 2"
                      placeholder="e.g. One POS for Every Branch"
                      value={draft.highlight2}
                      onChange={(e) => setDraft({ ...draft, highlight2: e.target.value })}
                    />
                    <ATMTextField
                      name="highlight3"
                      label="Feature Chip 3"
                      placeholder="e.g. Connected Real-Time Data"
                      value={draft.highlight3}
                      onChange={(e) => setDraft({ ...draft, highlight3: e.target.value })}
                    />
                  </div>
                </div>

                {/* 4. Visibility Control */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                  <ATMCheckbox
                    name="isActive"
                    label="Publish to website (Slide active and visible)"
                    checked={draft.isActive}
                    onChange={(checked) => setDraft({ ...draft, isActive: checked })}
                  />
                  <p className="text-[11px] text-slate-500 mt-1 pl-6">
                    When unchecked, this slide is kept as a draft and hidden from website visitors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ATMModal>

      {/* Media Picker */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => draft && setDraft({ ...draft, mediaAssetId: asset.assetId })}
        defaultFolder="marketing"
        imagesOnly
        title="Choose a Hero Showcase Image"
      />

      {/* Delete Confirmation Modal */}
      <ATMModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Hero Slide?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete &ldquo;{deleteTarget?.heading}&rdquo;? It will stop appearing in the website slider.
          </p>
          <div className="flex justify-end gap-2">
            <ATMButton variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </ATMButton>
            <ATMButton
              variant="danger"
              onClick={() => { void confirmDelete(); }}
              isLoading={deleteState.isLoading}
            >
              Delete Slide
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}
