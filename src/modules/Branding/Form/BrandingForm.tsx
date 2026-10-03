import React, { useState } from 'react';
import {
  Zap,
  Store,
  Utensils,
  Coffee,
  ShoppingBag,
  Boxes,
  Layers,
  Sparkles,
  Building2,
  Image as ImageIcon,
  Type,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { ATMButton, ATMTextField, ATMCheckbox } from '@/shared/ui';
import { MediaPicker } from '@/modules/content/components/MediaPicker';
import type { MediaAsset } from '@/modules/content/services/mediaApi';
import type { SiteVariant } from '../Model/BrandingTypes';
import { cn } from '@/lib/utils/cn';

export const ICON_PRESETS = [
  { name: 'Zap', icon: Zap, label: 'Lightning (Enterprise)', tag: 'Fast & Cloud' },
  { name: 'Utensils', icon: Utensils, label: 'Dining (Restaurant)', tag: 'Kitchen & KDS' },
  { name: 'Store', icon: Store, label: 'Storefront (Retail)', tag: 'Checkout & POS' },
  { name: 'Coffee', icon: Coffee, label: 'Café & Beverage', tag: 'Fast Counter' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping Bag', tag: 'Boutique' },
  { name: 'Boxes', icon: Boxes, label: 'Inventory (Boxes)', tag: 'Warehouse' },
  { name: 'Building2', icon: Building2, label: 'Corporate HQ', tag: 'Franchise' },
  { name: 'Layers', icon: Layers, label: 'Platform Layers', tag: 'Ecosystem' },
  { name: 'Sparkles', icon: Sparkles, label: 'AI & Intelligence', tag: 'Next-Gen' },
];

interface BrandingFormProps {
  activeVariant: SiteVariant;
  brandName: string;
  setBrandName: (v: string) => void;
  brandHighlight: string;
  setBrandHighlight: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  iconType: string;
  setIconType: (v: string) => void;
  logoImageUrl: string;
  setLogoImageUrl: (v: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
}

export const BrandingForm: React.FC<BrandingFormProps> = ({
  activeVariant,
  brandName,
  setBrandName,
  brandHighlight,
  setBrandHighlight,
  tagline,
  setTagline,
  iconType,
  setIconType,
  logoImageUrl,
  setLogoImageUrl,
  isActive,
  setIsActive,
}) => {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* SECTION 1: CORE BRAND IDENTITY */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Core Brand Identity & Typography
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
            {activeVariant}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <ATMTextField
              label="Base Brand Name"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Quantix"
              helperText="First word of the brand logo (white/dark font)."
            />
          </div>

          <div>
            <ATMTextField
              label="Highlight Word / Badge"
              required
              value={brandHighlight}
              onChange={(e) => setBrandHighlight(e.target.value)}
              placeholder="e.g. Enterprise, Restaurant POS, Retail POS"
              helperText={
                <span>
                  Rendered in accent color (<strong className="text-primary-600 dark:text-primary-400">{brandHighlight || 'Accent'}</strong>).
                </span>
              }
            />
          </div>
        </div>

        <div>
          <ATMTextField
            label="Subtitle / Platform Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. POS PLATFORM or All-in-One POS Platform"
            helperText="Small tracking-widest text rendered directly beneath the brand title."
          />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <ATMCheckbox
            name="isActive"
            label="Publish Branding (Active on public website navbar & footer)"
            checked={isActive}
            onChange={(checked: boolean) => setIsActive(checked)}
          />
        </div>
      </div>

      {/* SECTION 2: ICONOGRAPHY & GRAPHIC STYLING */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Logo Iconography & Visual Graphic
        </h4>

        {/* Vector Icon Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
            Choose Vector Icon Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ICON_PRESETS.map((preset) => {
              const isSelected = iconType.toLowerCase() === preset.name.toLowerCase() && !logoImageUrl;
              const IconComp = preset.icon;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setIconType(preset.name);
                    setLogoImageUrl('');
                  }}
                  className={cn(
                    'group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 shadow-2xs ring-1 ring-primary-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
                      isSelected
                        ? 'bg-gradient-to-tr from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/30'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                      {preset.tag}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Icon Name Textfield */}
        <div>
          <ATMTextField
            label="Or Custom Lucide Icon Name"
            value={iconType}
            onChange={(e) => setIconType(e.target.value)}
            placeholder="e.g. Zap, Store, Utensils, Shield, Cpu, Sparkles"
            helperText="Accepts any valid Lucide icon name (case-insensitive)."
          />
        </div>

        {/* Custom Image Upload / Picker */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Custom Logo Image (Optional Override)
            </span>
            <ATMButton
              variant="outline"
              size="sm"
              onClick={() => setMediaPickerOpen(true)}
              className="gap-1.5 text-xs h-7 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Pick from Media Library
            </ATMButton>
          </div>
          <ATMTextField
            value={logoImageUrl}
            onChange={(e) => setLogoImageUrl(e.target.value)}
            placeholder="https://... or /media/... (leave empty to use vector icon)"
            helperText="If provided, this image will replace the vector icon inside the glowing brand badge."
          />
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset: MediaAsset) => {
          setLogoImageUrl(asset.url);
          setMediaPickerOpen(false);
        }}
        title="Select Logo Image"
      />
    </div>
  );
};
