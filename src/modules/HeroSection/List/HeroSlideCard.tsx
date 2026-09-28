import React, { useState } from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImageOff,
  MoveUp,
  MoveDown,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

import { ATMBadge } from '@/shared/ui';
import { ATMContentActionButtons } from '@/shared/components/ATMContentActionButtons';
import { cn } from '@/lib/utils/cn';
import { absoluteMediaUrl } from '@/modules/content/services/mediaApi';
import type { HeroSlide } from '../Model/HeroSectionTypes';

interface HeroSlideCardProps {
  slide: HeroSlide;
  index: number;
  totalSlides: number;
  viewMode: 'grid' | 'list';
  isReordering?: boolean;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  onTogglePublished: (slide: HeroSlide) => void;
  onOpenEdit: (slide: HeroSlide) => void;
  onOpenDelete: (slide: HeroSlide) => void;
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({
  slide,
  index,
  totalSlides,
  viewMode,
  isReordering = false,
  onMoveSlide,
  onTogglePublished,
  onOpenEdit,
  onOpenDelete,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const imageSrc = slide.mediaAssetId
    ? absoluteMediaUrl(`/api/v1/media/${slide.mediaAssetId}/file`)
    : slide.imageUrl;

  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'group flex flex-col justify-between rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg dark:bg-[#12151c]',
          slide.isActive
            ? 'border-slate-200/90 dark:border-slate-800'
            : 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
        )}
      >
        {/* Visual Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
          {imageSrc && !imgError ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700/80" />
              )}
              <img
                src={imageSrc}
                alt={slide.heading}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={cn(
                  'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                  !imgLoaded ? 'opacity-0' : 'opacity-100'
                )}
                loading="lazy"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
              <ImageOff className="h-8 w-8 text-slate-600" />
            </div>
          )}

          <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-md shadow-xs">
            #{index + 1}
          </span>

          <div className="absolute top-2.5 right-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={slide.isActive}
              onClick={() => onTogglePublished(slide)}
              title={slide.isActive ? 'Status: Published Live (Click to hide from website)' : 'Status: Hidden Draft (Click to publish on website)'}
              className={cn(
                'h-7 rounded-lg border inline-flex items-center gap-2 px-2 transition-all duration-200 cursor-pointer select-none text-[11px] font-semibold shadow-md backdrop-blur-md',
                slide.isActive
                  ? 'border-emerald-300/80 bg-white/95 text-emerald-700 hover:bg-emerald-50'
                  : 'border-slate-300/80 bg-white/95 text-slate-600 hover:bg-slate-100'
              )}
            >
              <span
                className={cn(
                  'relative inline-flex h-3.5 w-6.5 p-0.5 items-center rounded-full transition-colors duration-200 ease-in-out shrink-0',
                  slide.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-2.5 w-2.5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out',
                    slide.isActive ? 'translate-x-3' : 'translate-x-0'
                  )}
                />
              </span>
              <span className="leading-none">{slide.isActive ? 'Live' : 'Hidden'}</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-4 space-y-2.5">
          {slide.badge && (
            <span className="inline-block rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/60 line-clamp-1">
              {slide.badge}
            </span>
          )}

          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {slide.heading}
          </h3>

          {slide.subheading && (
            <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {slide.subheading}
            </p>
          )}

          {/* Buttons Preview */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {slide.primaryCtaLabel && (
              <span className="inline-flex items-center gap-1 rounded bg-[#FF4F00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF4F00] dark:bg-[#FF4F00]/20">
                Primary: {slide.primaryCtaLabel}
              </span>
            )}
            {slide.secondaryCtaLabel && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {slide.secondaryCtaLabel}
              </span>
            )}
          </div>

          {/* Feature chips */}
          {slide.featureHighlights && slide.featureHighlights.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {slide.featureHighlights.map((chip, i) => (
                <span
                  key={i}
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  ✓ {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Action Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900/40 rounded-b-2xl">
          <span className="text-[11px] font-mono text-slate-400">
            #{index + 1} of {totalSlides}
          </span>

          <ATMContentActionButtons
            isActive={slide.isActive}
            onToggleActive={() => onTogglePublished(slide)}
            onEdit={() => onOpenEdit(slide)}
            onDelete={() => onOpenDelete(slide)}
            onMoveUp={() => onMoveSlide(index, 'up')}
            onMoveDown={() => onMoveSlide(index, 'down')}
            canMoveUp={index > 0 && !isReordering}
            canMoveDown={index < totalSlides - 1 && !isReordering}
            moveTooltip={{ up: 'Move Slide Up', down: 'Move Slide Down' }}
          />
        </div>
      </div>
    );
  }

  // LIST ROWS VIEW
  return (
    <div
      className={cn(
        'group flex flex-col md:flex-row items-stretch rounded-2xl border bg-white p-3.5 sm:p-4.5 gap-4 shadow-xs transition-all duration-200 hover:shadow-md dark:bg-[#12151c]',
        slide.isActive
          ? 'border-slate-200/90 dark:border-slate-800'
          : 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
      )}
    >
      {/* 1. Left Thumbnail */}
      <div className="relative aspect-video sm:aspect-[16/10] md:h-36 md:w-56 lg:w-64 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        {imageSrc && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700/80" />
            )}
            <img
              src={imageSrc}
              alt={slide.heading}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={cn(
                'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                !imgLoaded ? 'opacity-0' : 'opacity-100'
              )}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <ImageOff className="h-7 w-7 text-slate-500" />
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-md shadow-xs">
          #{index + 1}
        </span>

        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 backdrop-blur-xs">
          {slide.siteVariant}
        </span>
      </div>

      {/* 2. Middle Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {slide.badge && (
              <span className="rounded-md bg-primary-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/60">
                {slide.badge}
              </span>
            )}
            <ATMBadge
              color={slide.isActive ? 'success' : 'default'}
              label={slide.isActive ? 'Live' : 'Hidden'}
              icon={slide.isActive ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {slide.heading}
          </h3>

          {slide.subheading && (
            <p className="line-clamp-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {slide.subheading}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            {slide.primaryCtaLabel && (
              <span className="inline-flex items-center gap-1 rounded bg-[#FF4F00]/10 px-2 py-0.5 text-[11px] font-bold text-[#FF4F00] dark:bg-[#FF4F00]/20">
                Primary: {slide.primaryCtaLabel}
                {slide.primaryCtaUrl && <ArrowUpRight size={12} className="opacity-70" />}
              </span>
            )}
            {slide.secondaryCtaLabel && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Secondary: {slide.secondaryCtaLabel}
                {slide.secondaryCtaUrl && <ArrowUpRight size={12} className="opacity-70" />}
              </span>
            )}
          </div>

          {slide.featureHighlights && slide.featureHighlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {slide.featureHighlights.map((chip, i) => (
                <span
                  key={i}
                  className="rounded-md border border-slate-200 bg-slate-50/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  ✓ {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Action Toolbar */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800">
        <ATMContentActionButtons
          isActive={slide.isActive}
          showLabels={true}
          activeLabel="Live"
          inactiveLabel="Hidden"
          onToggleActive={() => onTogglePublished(slide)}
          onEdit={() => onOpenEdit(slide)}
          onDelete={() => onOpenDelete(slide)}
          onMoveUp={() => onMoveSlide(index, 'up')}
          onMoveDown={() => onMoveSlide(index, 'down')}
          canMoveUp={index > 0 && !isReordering}
          canMoveDown={index < totalSlides - 1 && !isReordering}
          moveTooltip={{ up: 'Move Slide Up', down: 'Move Slide Down' }}
        />
      </div>
    </div>
  );
};

export default HeroSlideCard;
