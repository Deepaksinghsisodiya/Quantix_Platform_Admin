import React, { useState } from 'react';
import { Share2, Globe, Image as ImageIcon } from 'lucide-react';

interface SocialSharePreviewProps {
  metaTitle: string;
  metaDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  siteVariant: string;
}

export const SocialSharePreview: React.FC<SocialSharePreviewProps> = ({
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImageUrl,
  canonicalUrl,
  siteVariant,
}) => {
  const [tab, setTab] = useState<'og' | 'twitter'>('og');

  const title = ogTitle && ogTitle.trim() !== '' ? ogTitle : metaTitle;
  const description = ogDescription && ogDescription.trim() !== '' ? ogDescription : metaDescription;

  const defaultUrl = siteVariant.toLowerCase() === 'restaurant'
    ? 'restaurant.quantixpos.com'
    : siteVariant.toLowerCase() === 'retail'
    ? 'retail.quantixpos.com'
    : 'quantixpos.com';

  const hostUrl = canonicalUrl
    ? canonicalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : defaultUrl;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-orange-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Social Card Preview (WhatsApp / LinkedIn / Twitter)
          </h4>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setTab('og')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              tab === 'og'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            OpenGraph
          </button>
          <button
            type="button"
            onClick={() => setTab('twitter')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              tab === 'twitter'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Twitter Card
          </button>
        </div>
      </div>

      {/* Social Card */}
      <div className="max-w-md mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        {/* Image Box */}
        <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
          {ogImageUrl && ogImageUrl.trim() !== '' ? (
            <img
              src={ogImageUrl}
              alt="Social share preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback on load error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400">
              <ImageIcon className="w-8 h-8 opacity-60" />
              <span className="text-[11px] font-medium">Add OG Image URL (1200x630px)</span>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="p-3.5 space-y-1">
          <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block">
            {hostUrl}
          </span>
          <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 leading-snug">
            {title || 'Social Card Title Placeholder'}
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description || 'Enter description to preview how your content appears when shared across social channels.'}
          </p>
        </div>
      </div>
    </div>
  );
};
