import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Globe2,
  UtensilsCrossed,
  ShoppingBag,
  Zap,
  Users,
  Award,
  Sparkles,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getRibbonLayout, getRibbonSeparator, MAX_RIBBON_CARDS } from '../utils/ribbonLayout';
import type { SocialProofMetric, SiteVariantTab } from '../Model/SocialProofTypes';

const ICON_MAP: Record<string, React.ElementType> = {
  Store,
  TrendingUp,
  ShieldCheck,
  Globe2,
  UtensilsCrossed,
  ShoppingBag,
  Zap,
  Users,
  Award,
  Sparkles,
};

const COLOR_THEMES: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    laserBeam: string;
    gradient: string;
    spotlight: string;
  }
> = {
  orange: {
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    iconText: 'text-[#FF4F00]',
    laserBeam: 'via-[#FF4F00]',
    gradient: 'from-orange-500 to-amber-500',
    spotlight: 'rgba(255,79,0,0.1)',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconText: 'text-emerald-500',
    laserBeam: 'via-emerald-500',
    gradient: 'from-emerald-400 to-teal-500',
    spotlight: 'rgba(16,185,129,0.1)',
  },
  blue: {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconText: 'text-blue-500',
    laserBeam: 'via-blue-500',
    gradient: 'from-blue-400 to-cyan-500',
    spotlight: 'rgba(59,130,246,0.1)',
  },
  purple: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconText: 'text-purple-500',
    laserBeam: 'via-purple-500',
    gradient: 'from-purple-400 to-indigo-500',
    spotlight: 'rgba(168,85,247,0.1)',
  },
  rose: {
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconText: 'text-rose-500',
    laserBeam: 'via-rose-500',
    gradient: 'from-rose-400 to-pink-500',
    spotlight: 'rgba(244,63,94,0.1)',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconText: 'text-amber-500',
    laserBeam: 'via-amber-500',
    gradient: 'from-amber-400 to-yellow-500',
    spotlight: 'rgba(245,158,11,0.1)',
  },
};

const DEFAULT_THEME = {
  iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
  iconText: 'text-[#FF4F00]',
  laserBeam: 'via-[#FF4F00]',
  gradient: 'from-orange-500 to-amber-500',
  spotlight: 'rgba(255,79,0,0.1)',
};

interface SocialProofLiveRibbonProps {
  metrics: readonly SocialProofMetric[];
  activeVariant: SiteVariantTab;
}

export const SocialProofLiveRibbon: React.FC<SocialProofLiveRibbonProps> = ({
  metrics,
  activeVariant,
}) => {
  const liveMetrics = metrics.filter((m) => m.isActive);
  const visibleMetrics = liveMetrics.slice(0, MAX_RIBBON_CARDS);
  const layout = getRibbonLayout(visibleMetrics.length);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 shadow-xl text-white overflow-hidden relative">
      {/* Ribbon Top Meta Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-[#FF4F00]">
            <Laptop size={15} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-syne font-bold text-white tracking-wide">
                Live Ribbon Website View
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● Live on {activeVariant} Site
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Real-time rendering mockup as displayed right below hero banner on public storefront
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
          {liveMetrics.length} metrics active
        </span>
      </div>

      {/* Live Ribbon Mockup Container */}
      <div className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_-20%,rgba(255,79,0,0.12),transparent_75%)]" />

        {visibleMetrics.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active metrics currently published for {activeVariant}. Toggle a metric to live state to preview here.
          </div>
        ) : (
          <div className={cn('grid', layout.gridClass)}>
            {visibleMetrics.map((metric, idx) => {
              const IconComp = (metric.iconKey && ICON_MAP[metric.iconKey]) || Sparkles;
              const theme = (metric.accentColor && COLOR_THEMES[metric.accentColor.toLowerCase()]) || DEFAULT_THEME;

              return (
                <div
                  key={metric.metricId || idx}
                  className={cn(
                    'relative p-4 sm:p-5 flex flex-col items-center justify-center text-center group hover:bg-white/[0.03] transition-colors',
                    getRibbonSeparator(idx, visibleMetrics.length, layout.baseCols, '', 'border-white/10'),
                    getRibbonSeparator(idx, visibleMetrics.length, layout.wideCols, layout.wideBp, 'border-white/10')
                  )}
                >
                  {/* Laser Beam Accent */}
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity',
                      theme.laserBeam
                    )}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center mb-2 ring-2 ring-white/10 group-hover:scale-110 transition-transform',
                      theme.iconBg,
                      theme.iconText
                    )}
                  >
                    <IconComp size={18} />
                  </div>

                  {/* Value */}
                  <div
                    className={cn(
                      'text-2xl sm:text-3xl font-syne font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent',
                      theme.gradient
                    )}
                  >
                    {metric.value}
                  </div>

                  {/* Label */}
                  <div className="text-[11px] font-syne font-bold uppercase tracking-wider text-slate-200 mt-1">
                    {metric.label}
                  </div>

                  {/* Description */}
                  {metric.description && (
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                      {metric.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialProofLiveRibbon;
