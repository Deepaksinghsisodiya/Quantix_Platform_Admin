import React, { useState } from 'react';
import { Search, Monitor, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GoogleSerpPreviewProps {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  siteVariant: string;
}

export const GoogleSerpPreview: React.FC<GoogleSerpPreviewProps> = ({
  metaTitle,
  metaDescription,
  canonicalUrl,
  siteVariant,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const defaultUrl = siteVariant.toLowerCase() === 'restaurant'
    ? 'https://restaurant.quantixpos.com'
    : siteVariant.toLowerCase() === 'retail'
    ? 'https://retail.quantixpos.com'
    : 'https://quantixpos.com';

  const displayUrl = canonicalUrl && canonicalUrl.trim() !== '' ? canonicalUrl : defaultUrl;

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const isTitleIdeal = titleLength >= 40 && titleLength <= 65;
  const isDescIdeal = descLength >= 120 && descLength <= 165;

  return (
    <div className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 p-4 sm:p-5 shadow-xs">
      {/* Header with Device Toggle */}
      <div className="flex items-center justify-between border-b border-surface-200/80 dark:border-surface-800 pb-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100 uppercase tracking-wider">
            Google SERP Live Preview
          </h4>
        </div>

        <div className="flex items-center gap-1 bg-surface-0 dark:bg-surface-950 p-1 rounded-lg border border-surface-200 dark:border-surface-800">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              device === 'desktop'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              device === 'mobile'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* SERP Card Box */}
      <div
        className={`bg-surface-0 dark:bg-surface-950 p-4 rounded-xl border border-surface-200/90 dark:border-surface-800 shadow-sm transition-all ${
          device === 'mobile' ? 'max-w-xs mx-auto border-l-4 border-l-primary-500' : 'w-full'
        }`}
      >
        {/* Favicon & Breadcrumb URL */}
        <div className="flex items-center gap-2 text-xs mb-1 min-w-0">
          <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
            Q
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-sans text-surface-900 dark:text-surface-100 font-normal leading-tight truncate">
              Quantix Platform
            </span>
            <span className="text-[11px] font-sans text-surface-500 dark:text-surface-400 leading-tight truncate">
              {displayUrl}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline text-sm sm:text-base font-medium leading-snug cursor-pointer font-sans tracking-normal break-words mt-1">
          {metaTitle || 'Page Title Placeholder — Add a Search Title'}
        </h3>

        {/* Description */}
        <p className="text-[#4d5156] dark:text-[#bdc1c6] text-xs leading-relaxed mt-1 font-sans break-words">
          {metaDescription ||
            'Enter a compelling meta description to improve your click-through rate (CTR) on Google search results...'}
        </p>
      </div>

      {/* Metrics & Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11.5px]">
        {/* Title Length Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-0 dark:bg-surface-950 border border-surface-200/80 dark:border-surface-800">
          <span className="text-surface-600 dark:text-surface-400 font-medium">Title Length:</span>
          <div className="flex items-center gap-1.5">
            <span className={`font-mono font-bold ${isTitleIdeal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {titleLength} / 60 chars
            </span>
            {isTitleIdeal ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </div>

        {/* Description Length Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-0 dark:bg-surface-950 border border-surface-200/80 dark:border-surface-800">
          <span className="text-surface-600 dark:text-surface-400 font-medium">Description Length:</span>
          <div className="flex items-center gap-1.5">
            <span className={`font-mono font-bold ${isDescIdeal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {descLength} / 160 chars
            </span>
            {isDescIdeal ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
