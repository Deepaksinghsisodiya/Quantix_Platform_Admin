import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Search,
  Share2,
  FileCode,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMCard } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { SeoMetadataItem, SaveSeoMetadataPayload } from '../Model/SeoTypes';
import { KeywordTagInput } from '../components/KeywordTagInput';
import { GoogleSerpPreview } from '../components/GoogleSerpPreview';
import { SocialSharePreview } from '../components/SocialSharePreview';
import { JsonLdEditor } from '../components/JsonLdEditor';

export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

interface SeoListProps {
  seoList: readonly SeoMetadataItem[];
  activeTab: SiteVariantTab;
  onTabChange: (tab: SiteVariantTab) => void;
  counts: Record<SiteVariantTab, number>;
  isLoading: boolean;
  onSave: (payload: SaveSeoMetadataPayload) => Promise<void>;
  isSaving: boolean;
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

const PAGES = [
  { slug: 'home', label: 'Home Page (/)' },
  { slug: 'features', label: 'Features Page (/features)' },
  { slug: 'pricing', label: 'Pricing Page (/pricing)' },
  { slug: 'contact', label: 'Contact Page (/contact)' },
];

const SUGGESTED_KEYWORDS: Record<SiteVariantTab, string[]> = {
  Restaurant: [
    'restaurant pos',
    'cloud kitchen billing software',
    'kds system',
    'restaurant billing machine',
    'food outlet pos',
    'pos software india',
    'qr ordering system',
    'cafe billing software',
    'multi branch restaurant pos',
    'swiggy zomato integration',
  ],
  Retail: [
    'retail pos software',
    'barcode billing software',
    'supermarket pos machine',
    'multi store inventory',
    'gst billing pos',
    'retail inventory management',
    'retail cloud pos',
    'apparel store pos',
    'billing software for retail',
  ],
  Enterprise: [
    'enterprise pos system',
    'omnichannel commerce platform',
    'franchise management pos',
    'multi location retail cloud',
    'enterprise billing api',
    'retail erp integration',
    'pos software enterprise',
    'high volume billing pos',
  ],
};

export const SeoList: React.FC<SeoListProps> = ({
  seoList = [],
  activeTab,
  onTabChange,
  counts,
  isLoading,
  onSave,
  isSaving,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>('home');
  const [formTab, setFormTab] = useState<'content' | 'social' | 'advanced'>('content');

  // Local Form State
  const [formData, setFormData] = useState<SaveSeoMetadataPayload>({
    siteVariant: activeTab,
    pageSlug: selectedSlug,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImageUrl: '',
    robotsIndex: true,
    robotsFollow: true,
    googleSiteVerification: '',
    structuredDataJson: '',
    isActive: true,
  });

  // Populate form on activeTab or selectedSlug change
  useEffect(() => {
    const existing = seoList.find(
      (item) =>
        item.siteVariant.toLowerCase() === activeTab.toLowerCase() &&
        item.pageSlug.toLowerCase() === selectedSlug.toLowerCase()
    );

    if (existing) {
      setFormData({
        siteVariant: existing.siteVariant,
        pageSlug: existing.pageSlug,
        metaTitle: existing.metaTitle || '',
        metaDescription: existing.metaDescription || '',
        keywords: existing.keywords || '',
        canonicalUrl: existing.canonicalUrl || '',
        ogTitle: existing.ogTitle || '',
        ogDescription: existing.ogDescription || '',
        ogImageUrl: existing.ogImageUrl || '',
        twitterCard: existing.twitterCard || 'summary_large_image',
        twitterTitle: existing.twitterTitle || '',
        twitterDescription: existing.twitterDescription || '',
        twitterImageUrl: existing.twitterImageUrl || '',
        robotsIndex: existing.robotsIndex ?? true,
        robotsFollow: existing.robotsFollow ?? true,
        googleSiteVerification: existing.googleSiteVerification || '',
        structuredDataJson: existing.structuredDataJson || '',
        isActive: existing.isActive ?? true,
      });
    } else {
      setFormData({
        siteVariant: activeTab,
        pageSlug: selectedSlug,
        metaTitle:
          activeTab === 'Restaurant'
            ? 'Quantix Restaurant POS — Cloud Kitchen, POS & Table Billing Platform'
            : activeTab === 'Retail'
            ? 'Quantix Retail POS — Cloud Billing, Barcode & Multi-Store Inventory System'
            : 'Quantix Enterprise — All-in-One Enterprise POS & Omnichannel Platform',
        metaDescription:
          activeTab === 'Restaurant'
            ? 'Fastest restaurant POS billing software with integrated KDS, online order sync (Zomato/Swiggy), inventory tracking, and QR digital ordering.'
            : activeTab === 'Retail'
            ? 'Unified retail point of sale software for supermarkets, apparel, and convenience stores. High-speed barcode scanning, live inventory, and GST compliance.'
            : 'Enterprise-grade cloud POS platform for multi-store retail chains, franchise restaurant groups, and high-volume commerce networks.',
        keywords: (SUGGESTED_KEYWORDS[activeTab] || []).join(', '),
        canonicalUrl:
          activeTab === 'Restaurant'
            ? 'https://restaurant.quantixpos.com'
            : activeTab === 'Retail'
            ? 'https://retail.quantixpos.com'
            : 'https://quantixpos.com',
        ogTitle: '',
        ogDescription: '',
        ogImageUrl: '/og-image.png',
        twitterCard: 'summary_large_image',
        twitterTitle: '',
        twitterDescription: '',
        twitterImageUrl: '/og-image.png',
        robotsIndex: true,
        robotsFollow: true,
        googleSiteVerification: '',
        structuredDataJson: '',
        isActive: true,
      });
    }
  }, [activeTab, selectedSlug, seoList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.metaTitle.trim()) {
      toast.error('Meta Title is required for Google Search!');
      return;
    }

    if (!formData.metaDescription.trim()) {
      toast.error('Meta Description is required for Google Search!');
      return;
    }

    await onSave({
      ...formData,
      siteVariant: activeTab,
      pageSlug: selectedSlug,
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ATM Page Header */}
      <ATMPageHeader
        title="SEO & Google Ranking"
        subtitle="Manage Meta Titles, Search Descriptions, Focus Keywords, OpenGraph Cards & Schema.org JSON-LD across Enterprise, Restaurant, and Retail websites"
        icon={Globe}
        iconColor="theme"
        action={{
          label: isSaving ? 'Saving Changes...' : 'Save & Publish SEO',
          onClick: () => {
            const formEl = document.getElementById('seo-management-form') as HTMLFormElement;
            if (formEl) formEl.requestSubmit();
          },
          icon: isSaving ? RefreshCw : Save,
        }}
      />

      {/* Website Selection Tabs (Matching Integrations) */}
      <div className="w-full border-b border-surface-200 dark:border-surface-800">
        <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Website Variants">
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
                  'group flex items-center gap-2.5 border-b-2 px-1 py-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap',
                  isSelected
                    ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400 font-bold'
                    : 'border-transparent text-surface-500 hover:border-surface-300 hover:text-surface-700 dark:text-surface-400 dark:hover:border-surface-700 dark:hover:text-surface-200'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isSelected
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                  )}
                />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs font-mono font-medium',
                    isSelected
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
                      : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Full Width Content Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Customization (7 cols) */}
        <form id="seo-management-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <ATMCard className="p-5 sm:p-6 space-y-5">
            {/* Target Page Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-bold text-surface-900 dark:text-surface-100 uppercase tracking-wider">
                  Target Page
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
                {PAGES.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSelectedSlug(p.slug)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      selectedSlug === p.slug
                        ? 'bg-surface-0 dark:bg-surface-950 text-primary-600 dark:text-primary-400 shadow-xs font-bold'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Tabs (Content, Social, Advanced) */}
            <div className="flex items-center border-b border-surface-200 dark:border-surface-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormTab('content')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer',
                  formTab === 'content'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
                )}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search & Keywords</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('social')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer',
                  formTab === 'social'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
                )}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>OpenGraph & Social</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('advanced')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer',
                  formTab === 'advanced'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
                )}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Schema & Verification</span>
              </button>
            </div>

            {/* TAB 1: Search & Keywords */}
            {formTab === 'content' && (
              <div className="space-y-4 pt-1">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                      Google Search Title (Meta Title) <span className="text-primary-600">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-surface-400">
                      {formData.metaTitle.length} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="e.g. Best Restaurant POS Software & Cloud Billing System | Quantix"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    required
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                      Google Search Description (Meta Description) <span className="text-primary-600">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-surface-400">
                      {formData.metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="e.g. Supercharge your restaurant operations with Quantix cloud POS, KDS, inventory tracking, and QR digital ordering..."
                    className="w-full text-xs font-medium p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    required
                  />
                </div>

                {/* Tag Input for Focus Keywords */}
                <KeywordTagInput
                  value={formData.keywords}
                  onChange={(newKeywords) => setFormData({ ...formData, keywords: newKeywords })}
                  recommendedKeywords={SUGGESTED_KEYWORDS[activeTab] || []}
                />

                {/* Canonical URL */}
                <div className="space-y-1.5 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                    Canonical URL (Duplicate Content Guard)
                  </label>
                  <input
                    type="url"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    placeholder="e.g. https://restaurant.quantixpos.com"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: OpenGraph & Social */}
            {formTab === 'social' && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                    Social Card Image URL (OG Image)
                  </label>
                  <input
                    type="text"
                    value={formData.ogImageUrl}
                    onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value, twitterImageUrl: e.target.value })}
                    placeholder="e.g. /og-image.png or https://cdn.../share-card.jpg"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                  <span className="text-[10.5px] text-surface-400 block">
                    Recommended resolution: 1200 x 630 pixels.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                    Custom Social Card Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value, twitterTitle: e.target.value })}
                    placeholder="Leave empty to use Google Search Title"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                    Custom Social Card Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ogDescription}
                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value, twitterDescription: e.target.value })}
                    placeholder="Leave empty to use Google Search Description"
                    className="w-full text-xs font-medium p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Advanced (Schema & Verification) */}
            {formTab === 'advanced' && (
              <div className="space-y-4 pt-1">
                {/* Google Site Verification Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                    Google Search Console Verification Tag
                  </label>
                  <input
                    type="text"
                    value={formData.googleSiteVerification}
                    onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
                    placeholder="e.g. google-site-verification=abc123xyz"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Robots Index / Follow Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 cursor-pointer">
                    <span className="text-xs font-bold text-surface-800 dark:text-surface-200">
                      Allow Google Indexing (Robots Index)
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.robotsIndex}
                      onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 cursor-pointer">
                    <span className="text-xs font-bold text-surface-800 dark:text-surface-200">
                      Allow Link Following (Robots Follow)
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.robotsFollow}
                      onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                  </label>
                </div>

                {/* Structured Data JSON Editor */}
                <JsonLdEditor
                  value={formData.structuredDataJson}
                  onChange={(newJson) => setFormData({ ...formData, structuredDataJson: newJson })}
                  siteVariant={activeTab}
                />
              </div>
            )}
          </ATMCard>
        </form>

        {/* Right Column: Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SERP Live Preview */}
          <GoogleSerpPreview
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            canonicalUrl={formData.canonicalUrl}
            siteVariant={activeTab}
          />

          {/* Social Share Preview */}
          <SocialSharePreview
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            ogTitle={formData.ogTitle}
            ogDescription={formData.ogDescription}
            ogImageUrl={formData.ogImageUrl}
            canonicalUrl={formData.canonicalUrl}
            siteVariant={activeTab}
          />
        </div>
      </div>
    </div>
  );
};
