import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Zap,
  CheckCircle2,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { absoluteMediaUrl } from '@/modules/content/services/mediaApi';
import { ICON_PRESETS } from '../Form/BrandingForm';
import type { SiteVariant, BrandingItem } from '../Model/BrandingTypes';
import { cn } from '@/lib/utils/cn';

interface BrandingPreviewCardProps {
  activeVariant: SiteVariant;
  brandName: string;
  brandHighlight: string;
  tagline: string;
  iconType: string;
  logoImageUrl: string;
  currentItem?: BrandingItem;
}

const VARIANT_PALETTE: Record<
  SiteVariant,
  {
    gradient: string;
    text: string;
    buttonBg: string;
    shadow: string;
    badgeDark: string;
    badgeLight: string;
    radioText: string;
  }
> = {
  Enterprise: {
    gradient: 'from-[#FF4F00] to-[#FF6B2B]',
    text: 'text-[#FF4F00]',
    buttonBg: 'bg-[#FF4F00]',
    shadow: 'shadow-orange-500/25',
    badgeDark: 'bg-slate-900 text-orange-400 border border-slate-800',
    badgeLight: 'bg-orange-50 text-[#FF4F00] border border-orange-200',
    radioText: 'text-[#FF4F00]',
  },
  Restaurant: {
    gradient: 'from-emerald-600 to-teal-500',
    text: 'text-emerald-500',
    buttonBg: 'bg-emerald-600',
    shadow: 'shadow-emerald-500/25',
    badgeDark: 'bg-slate-900 text-emerald-400 border border-slate-800',
    badgeLight: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    radioText: 'text-emerald-500',
  },
  Retail: {
    gradient: 'from-blue-600 to-cyan-500',
    text: 'text-blue-500',
    buttonBg: 'bg-blue-600',
    shadow: 'shadow-blue-500/25',
    badgeDark: 'bg-slate-900 text-blue-400 border border-slate-800',
    badgeLight: 'bg-blue-50 text-blue-600 border border-blue-200',
    radioText: 'text-blue-500',
  },
};

export const BrandingPreviewCard: React.FC<BrandingPreviewCardProps> = ({
  activeVariant,
  brandName,
  brandHighlight,
  tagline,
  iconType,
  logoImageUrl,
  currentItem,
}) => {
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');

  const renderIconComponent = (name: string, className: string) => {
    const match = ICON_PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (match) {
      const Comp = match.icon;
      return <Comp className={className} />;
    }
    return <Zap className={className} />;
  };

  const port = activeVariant === 'Enterprise' ? 3003 : activeVariant === 'Restaurant' ? 3002 : 3001;
  const palette = VARIANT_PALETTE[activeVariant];

  return (
    <div className="sticky top-6 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Live Header Preview
          </h4>
        </div>

        {/* Theme Switcher Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setPreviewTheme('light')}
            className={cn(
              'flex h-6.5 px-2.5 items-center gap-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              previewTheme === 'light'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
            title="Preview in Light Mode"
          >
            <Sun className="h-3 w-3" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewTheme('dark')}
            className={cn(
              'flex h-6.5 px-2.5 items-center gap-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              previewTheme === 'dark'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
            title="Preview in Dark Mode"
          >
            <Moon className="h-3 w-3" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Mock Browser Window Container */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden transition-all duration-300 shadow-inner',
          previewTheme === 'dark'
            ? 'bg-slate-950 border-slate-800 text-white'
            : 'bg-slate-50/60 border-slate-200 text-slate-900'
        )}
      >
        {/* Mock Browser Window Chrome */}
        <div
          className={cn(
            'flex items-center justify-between px-3.5 py-2.5 border-b',
            previewTheme === 'dark'
              ? 'bg-slate-900/80 border-slate-800/80'
              : 'bg-white border-slate-200/80'
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <div
            className={cn(
              'flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-mono border',
              previewTheme === 'dark'
                ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            )}
          >
            <Globe className="h-2.5 w-2.5 text-slate-400" />
            <span>http://localhost:{port}</span>
          </div>

          <a
            href={`http://localhost:${port}`}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Open website in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Mock Website Navbar Replica */}
        <div
          className={cn(
            'px-4 py-4 flex items-center justify-between border-b backdrop-blur-md',
            previewTheme === 'dark'
              ? 'bg-slate-950/90 border-slate-800/60'
              : 'bg-white/90 border-slate-200/60'
          )}
        >
          {/* Logo Brand Component */}
          <div className="flex items-center gap-2.5 group shrink-0 select-none cursor-pointer">
            {/* Glowing Rounded Box */}
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300 group-hover:scale-105 bg-gradient-to-tr',
                palette.gradient,
                palette.shadow
              )}
            >
              {logoImageUrl ? (
                <img
                  src={absoluteMediaUrl(logoImageUrl)}
                  alt={brandName}
                  className="h-5 w-5 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                renderIconComponent(iconType, 'h-4.5 w-4.5 fill-white stroke-[2.5]')
              )}
            </div>

            {/* Brand Title + Tagline (Public Website Typography) */}
            <div className="flex flex-col text-left leading-none">
              <span
                className={cn(
                  'font-syne text-base sm:text-lg font-black tracking-tight',
                  previewTheme === 'dark' ? 'text-white' : 'text-slate-900'
                )}
              >
                {brandName || 'Quantix'}{' '}
                <span className={palette.text}>{brandHighlight || activeVariant}</span>
              </span>
              <span className="font-syne text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
                {tagline || 'POS PLATFORM'}
              </span>
            </div>
          </div>

          {/* Mock Nav Links */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span className="hover:text-slate-200 transition-colors">Products</span>
            <span className="hover:text-slate-200 transition-colors">Solutions</span>
            <span
              className={cn(
                'px-2.5 py-1 rounded-lg text-white text-[11px] font-bold shadow-xs',
                palette.buttonBg
              )}
            >
              Get Demo
            </span>
          </div>
        </div>

        {/* Mock Hero Content Preview */}
        <div className="p-6 text-center space-y-2">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider',
              previewTheme === 'dark' ? palette.badgeDark : palette.badgeLight
            )}
          >
            <Radio className={cn('h-2.5 w-2.5', palette.radioText)} />
            <span>Next-Generation POS Platform</span>
          </div>
          <h4
            className={cn(
              'text-sm font-bold tracking-tight',
              previewTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            )}
          >
            Powering {activeVariant} Operations Worldwide
          </h4>
        </div>
      </div>

      {/* Readiness & Last Updated Telemetry */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Public API Synchronized
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            200 OK
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Updates made to <strong className="text-slate-800 dark:text-slate-200">{activeVariant}</strong> are saved to backend database and served immediately with zero flicker fallback.
        </p>

        {currentItem?.updatedAt && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-200 dark:border-slate-700/60 font-mono">
            Last published: {new Date(currentItem.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};
