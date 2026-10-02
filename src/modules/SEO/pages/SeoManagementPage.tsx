import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Save,
  CheckCircle,
  ShieldCheck,
  Search,
  Share2,
  FileCode,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetAdminSeoListQuery,
  useSaveSeoMetadataMutation,
} from '../Service/SeoService';
import type { SeoMetadataItem, SaveSeoMetadataPayload } from '../Model/SeoTypes';
import { KeywordTagInput } from '../components/KeywordTagInput';
import { GoogleSerpPreview } from '../components/GoogleSerpPreview';
import { SocialSharePreview } from '../components/SocialSharePreview';
import { JsonLdEditor } from '../components/JsonLdEditor';

const PLATFORMS = [
  { id: 'Restaurant', name: 'Quantix Restaurant POS', color: 'from-orange-500 to-amber-500' },
  { id: 'Retail', name: 'Quantix Retail POS', color: 'from-blue-600 to-indigo-600' },
  { id: 'Enterprise', name: 'Quantix Enterprise POS', color: 'from-purple-600 to-pink-600' },
];

const PAGES = [
  { slug: 'home', label: 'Home Page (/)' },
  { slug: 'features', label: 'Features Page (/features)' },
  { slug: 'pricing', label: 'Pricing Page (/pricing)' },
  { slug: 'contact', label: 'Contact Page (/contact)' },
];

const SUGGESTED_KEYWORDS: Record<string, string[]> = {
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

export const SeoManagementPage: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<string>('Restaurant');
  const [selectedSlug, setSelectedSlug] = useState<string>('home');
  const [activeTab, setActiveTab] = useState<'content' | 'social' | 'advanced'>('content');

  // Fetch admin SEO list
  const { data: response, isLoading, refetch } = useGetAdminSeoListQuery({ siteVariant: selectedVariant });
  const [saveSeoMetadata, { isLoading: isSaving }] = useSaveSeoMetadataMutation();

  const seoList = response?.data || [];

  // Local Form State
  const [formData, setFormData] = useState<SaveSeoMetadataPayload>({
    siteVariant: selectedVariant,
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

  // Populate form when selectedVariant or selectedSlug changes or when data arrives
  useEffect(() => {
    const existing = seoList.find(
      (item) =>
        item.siteVariant.toLowerCase() === selectedVariant.toLowerCase() &&
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
      // Defaults if record doesn't exist in DB yet
      setFormData({
        siteVariant: selectedVariant,
        pageSlug: selectedSlug,
        metaTitle:
          selectedVariant === 'Restaurant'
            ? 'Quantix Restaurant POS — Cloud Kitchen, POS & Table Billing Platform'
            : selectedVariant === 'Retail'
            ? 'Quantix Retail POS — Cloud Billing, Barcode & Multi-Store Inventory System'
            : 'Quantix Enterprise — All-in-One Enterprise POS & Omnichannel Platform',
        metaDescription:
          selectedVariant === 'Restaurant'
            ? 'Fastest restaurant POS billing software with integrated KDS, online order sync (Zomato/Swiggy), inventory tracking, and QR digital ordering.'
            : selectedVariant === 'Retail'
            ? 'Unified retail point of sale software for supermarkets, apparel, and convenience stores. High-speed barcode scanning, live inventory, and GST compliance.'
            : 'Enterprise-grade cloud POS platform for multi-store retail chains, franchise restaurant groups, and high-volume commerce networks.',
        keywords: (SUGGESTED_KEYWORDS[selectedVariant] || []).join(', '),
        canonicalUrl:
          selectedVariant === 'Restaurant'
            ? 'https://restaurant.quantixpos.com'
            : selectedVariant === 'Retail'
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
  }, [selectedVariant, selectedSlug, seoList]);

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

    try {
      await saveSeoMetadata({
        ...formData,
        siteVariant: selectedVariant,
        pageSlug: selectedSlug,
      }).unwrap();

      toast.success(
        `SEO Metadata & Google Keywords successfully saved for ${selectedVariant} (${selectedSlug})!`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save SEO metadata.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Google Ranking & SEO Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-syne font-black tracking-tight text-white">
              SEO & Keywords Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Dynamically control Meta Titles, Search Descriptions, Ranking Keywords, OpenGraph Tags, and JSON-LD Structured Data across all 3 platforms to maximize Google First-Page rankings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving Changes...' : 'Save & Publish SEO'}</span>
          </button>
        </div>
      </div>

      {/* Platform Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLATFORMS.map((plat) => {
          const isSelected = selectedVariant.toLowerCase() === plat.id.toLowerCase();
          return (
            <button
              key={plat.id}
              type="button"
              onClick={() => setSelectedVariant(plat.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-orange-500 dark:border-orange-500 shadow-lg ring-2 ring-orange-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Target Website
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  {plat.name}
                </span>
              </div>
              <div
                className={`w-3 h-3 rounded-full bg-gradient-to-br ${plat.color} ${
                  isSelected ? 'scale-125 shadow-md' : 'opacity-40'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Page Selector & Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Live Customization (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            {/* Sub-Header: Page Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Target Page
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {PAGES.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSelectedSlug(p.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedSlug === p.slug
                        ? 'bg-white dark:bg-slate-950 text-orange-600 dark:text-orange-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Tabs (Content, Social, Advanced) */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'content'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search & Keywords</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'social'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>OpenGraph & Social</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('advanced')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'advanced'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Schema & Verification</span>
              </button>
            </div>

            {/* TAB 1: Search & Keywords */}
            {activeTab === 'content' && (
              <div className="space-y-4 pt-1">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Google Search Title (Meta Title) <span className="text-orange-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formData.metaTitle.length} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="e.g. Best Restaurant POS Software & Cloud Billing System | Quantix"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    required
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Google Search Description (Meta Description) <span className="text-orange-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formData.metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="e.g. Supercharge your restaurant operations with Quantix cloud POS, KDS, inventory tracking, and QR digital ordering..."
                    className="w-full text-xs font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    required
                  />
                </div>

                {/* Tag Input for Focus Keywords */}
                <KeywordTagInput
                  value={formData.keywords}
                  onChange={(newKeywords) => setFormData({ ...formData, keywords: newKeywords })}
                  recommendedKeywords={SUGGESTED_KEYWORDS[selectedVariant] || []}
                />

                {/* Canonical URL */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Canonical URL (Duplicate Content Guard)
                  </label>
                  <input
                    type="url"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    placeholder="e.g. https://restaurant.quantixpos.com"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: OpenGraph & Social */}
            {activeTab === 'social' && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Social Card Image URL (OG Image)
                  </label>
                  <input
                    type="text"
                    value={formData.ogImageUrl}
                    onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value, twitterImageUrl: e.target.value })}
                    placeholder="e.g. /og-image.png or https://cdn.../share-card.jpg"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  />
                  <span className="text-[10.5px] text-slate-400 block">
                    Recommended resolution: 1200 x 630 pixels.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Custom Social Card Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value, twitterTitle: e.target.value })}
                    placeholder="Leave empty to use Google Search Title"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Custom Social Card Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ogDescription}
                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value, twitterDescription: e.target.value })}
                    placeholder="Leave empty to use Google Search Description"
                    className="w-full text-xs font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Advanced (Schema & Verification) */}
            {activeTab === 'advanced' && (
              <div className="space-y-4 pt-1">
                {/* Google Site Verification Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Google Search Console Verification Tag
                  </label>
                  <input
                    type="text"
                    value={formData.googleSiteVerification}
                    onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
                    placeholder="e.g. google-site-verification=abc123xyz"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  />
                </div>

                {/* Robots Index / Follow Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Allow Google Indexing (Robots Index)
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.robotsIndex}
                      onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Allow Link Following (Robots Follow)
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.robotsFollow}
                      onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                </div>

                {/* Structured Data JSON Editor */}
                <JsonLdEditor
                  value={formData.structuredDataJson}
                  onChange={(newJson) => setFormData({ ...formData, structuredDataJson: newJson })}
                  siteVariant={selectedVariant}
                />
              </div>
            )}
          </div>
        </form>

        {/* Right Column: Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SERP Live Preview */}
          <GoogleSerpPreview
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            canonicalUrl={formData.canonicalUrl}
            siteVariant={selectedVariant}
          />

          {/* Social Share Preview */}
          <SocialSharePreview
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            ogTitle={formData.ogTitle}
            ogDescription={formData.ogDescription}
            ogImageUrl={formData.ogImageUrl}
            canonicalUrl={formData.canonicalUrl}
            siteVariant={selectedVariant}
          />
        </div>
      </div>
    </div>
  );
};
