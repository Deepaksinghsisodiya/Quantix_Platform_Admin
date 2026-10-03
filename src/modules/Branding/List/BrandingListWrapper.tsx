import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Palette,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Building2,
  Utensils,
  Store,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import {
  useGetAdminBrandingQuery,
  useSaveBrandingMutation,
} from '../Service/BrandingService';
import { BrandingForm } from '../Form/BrandingForm';
import { BrandingPreviewCard } from './BrandingPreviewCard';
import type { SiteVariant, BrandingItem } from '../Model/BrandingTypes';

const DEFAULT_BRANDING: Record<SiteVariant, { brandName: string; brandHighlight: string; tagline: string; iconType: string }> = {
  Enterprise: {
    brandName: 'Quantix',
    brandHighlight: 'Enterprise',
    tagline: 'POS PLATFORM',
    iconType: 'Zap',
  },
  Restaurant: {
    brandName: 'Quantix',
    brandHighlight: 'Restaurant POS',
    tagline: 'All-in-One POS Platform',
    iconType: 'Utensils',
  },
  Retail: {
    brandName: 'Quantix',
    brandHighlight: 'Retail POS',
    tagline: 'All-in-One POS Platform',
    iconType: 'Store',
  },
};

const SITE_TABS: { id: SiteVariant; label: string; icon: typeof Building2; port: number; desc: string }[] = [
  { id: 'Enterprise', label: 'Enterprise Platform', icon: Building2, port: 3003, desc: 'Multi-store chains & cloud HQ' },
  { id: 'Restaurant', label: 'Restaurant & Dining', icon: Utensils, port: 3002, desc: 'Kitchen KDS, tables & fast food' },
  { id: 'Retail', label: 'Retail & Checkout', icon: Store, port: 3001, desc: 'Barcode POS & inventory balance' },
];

export const BrandingListWrapper: React.FC = () => {
  const [activeVariant, setActiveVariant] = useState<SiteVariant>('Enterprise');

  // Form State
  const [brandName, setBrandName] = useState('Quantix');
  const [brandHighlight, setBrandHighlight] = useState('Enterprise');
  const [tagline, setTagline] = useState('POS PLATFORM');
  const [iconType, setIconType] = useState('Zap');
  const [logoImageUrl, setLogoImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  // Queries & Mutations
  const { data: brandingResponse, isLoading, refetch } = useGetAdminBrandingQuery();
  const [saveBranding, { isLoading: isSaving }] = useSaveBrandingMutation();

  const allItems = useMemo(() => brandingResponse?.data || [], [brandingResponse?.data]);

  const currentItem = allItems.find(
    (item: BrandingItem) => item.siteVariant.toLowerCase() === activeVariant.toLowerCase()
  );

  useEffect(() => {
    if (currentItem) {
      setBrandName(currentItem.brandName || 'Quantix');
      setBrandHighlight(currentItem.brandHighlight ?? DEFAULT_BRANDING[activeVariant].brandHighlight);
      setTagline(currentItem.tagline ?? DEFAULT_BRANDING[activeVariant].tagline);
      setIconType(currentItem.iconType || DEFAULT_BRANDING[activeVariant].iconType);
      setLogoImageUrl(currentItem.logoImageUrl || '');
      setIsActive(currentItem.isActive ?? true);
    } else {
      const defaults = DEFAULT_BRANDING[activeVariant];
      setBrandName(defaults.brandName);
      setBrandHighlight(defaults.brandHighlight);
      setTagline(defaults.tagline);
      setIconType(defaults.iconType);
      setLogoImageUrl('');
      setIsActive(true);
    }
  }, [currentItem, activeVariant]);

  const handleResetDefaults = () => {
    const defaults = DEFAULT_BRANDING[activeVariant];
    setBrandName(defaults.brandName);
    setBrandHighlight(defaults.brandHighlight);
    setTagline(defaults.tagline);
    setIconType(defaults.iconType);
    setLogoImageUrl('');
    setIsActive(true);
    toast.info(`Reset to default branding for ${activeVariant}`);
  };

  const handleSave = async () => {
    try {
      const res = await saveBranding({
        siteVariant: activeVariant,
        brandName: brandName.trim(),
        brandHighlight: brandHighlight.trim(),
        tagline: tagline.trim(),
        iconType: iconType.trim(),
        logoImageUrl: logoImageUrl.trim() ? logoImageUrl.trim() : null,
        isActive,
      }).unwrap();

      if (res.success) {
        toast.success(`Branding for ${activeVariant} updated successfully!`);
        refetch();
      } else {
        toast.error(res.message || 'Failed to save branding');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Error saving branding settings');
    }
  };

  const activePort = activeVariant === 'Enterprise' ? 3003 : activeVariant === 'Restaurant' ? 3002 : 3001;

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* 1. ATMPageHeader with Breadcrumbs and Action */}
      <ATMPageHeader
        title="Website Branding & Header Logo"
        subtitle="Manage the primary brand logo, highlight color text, and subtitle tagline dynamically across Enterprise, Restaurant, and Retail platforms."
        icon={Palette}
        iconColor="theme"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Website Branding' },
        ]}
        action={{
          label: isSaving ? 'Saving...' : 'Save Branding',
          onClick: handleSave,
          icon: Save,
        }}
      />

      {/* 2. KPI Telemetry Cards Matching FeatureList */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ATMStatsCard
          label="Total Platforms"
          value={3}
          description="Enterprise, Restaurant, Retail"
          icon={Building2}
          variant="amber"
        />
        <ATMStatsCard
          label="Active Live"
          value={allItems.filter((i) => i.isActive).length || 3}
          description="Published to websites"
          icon={CheckCircle2}
          variant="emerald"
        />
        <ATMStatsCard
          label="Vector Icon"
          value={iconType}
          description={`${activeVariant} icon symbol`}
          icon={Zap}
          variant="indigo"
        />
        <ATMStatsCard
          label="Local Port"
          value={`:${activePort}`}
          description={`http://localhost:${activePort}`}
          icon={Layers}
          variant="slate"
        />
      </div>

      {/* 3. Underline Tab Bar Matching CustomerSupport & Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {SITE_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeVariant === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveVariant(tab.id)}
                className={cn(
                  'group flex items-center gap-2.5 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm font-syne transition-all whitespace-nowrap cursor-pointer',
                  isTabActive
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold',
                    isTabActive
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  :{tab.port}
                </span>
                <a
                  href={`http://localhost:${tab.port}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Open website at localhost:${tab.port}`}
                  className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-0.5"
                >
                  <ExternalLink size={12} />
                </a>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Form and Live Preview Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <ATMSkeleton className="h-44 w-full rounded-2xl" />
            <ATMSkeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <ATMSkeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <BrandingForm
              activeVariant={activeVariant}
              brandName={brandName}
              setBrandName={setBrandName}
              brandHighlight={brandHighlight}
              setBrandHighlight={setBrandHighlight}
              tagline={tagline}
              setTagline={setTagline}
              iconType={iconType}
              setIconType={setIconType}
              logoImageUrl={logoImageUrl}
              setLogoImageUrl={setLogoImageUrl}
              isActive={isActive}
              setIsActive={setIsActive}
            />

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <ATMButton
                variant="outline"
                onClick={handleResetDefaults}
                disabled={isSaving || isLoading}
                className="gap-2 border-slate-200 dark:border-slate-700 font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                Reset {activeVariant} Defaults
              </ATMButton>

              <ATMButton
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="gap-2 bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20 font-bold"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Publishing...' : `Publish ${activeVariant} Branding`}
              </ATMButton>
            </div>
          </div>

          {/* RIGHT: Live Interactive Preview (5 cols) */}
          <div className="lg:col-span-5">
            <BrandingPreviewCard
              activeVariant={activeVariant}
              brandName={brandName}
              brandHighlight={brandHighlight}
              tagline={tagline}
              iconType={iconType}
              logoImageUrl={logoImageUrl}
              currentItem={currentItem}
            />
          </div>
        </div>
      )}
    </div>
  );
};
