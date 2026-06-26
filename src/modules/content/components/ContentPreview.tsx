/**
 * ContentPreview -- Renders HTML content in a safe, styled preview panel.
 *
 * Used to preview blog posts, help articles, and marketing content before
 * publishing. Applies prose styling and a bordered container.
 */

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ContentPreviewProps {
  /** Raw HTML or markdown-converted HTML to render. */
  html: string;
  /** Optional title rendered above the content body. */
  title?: string;
  /** Featured image URL. */
  featuredImage?: string | null;
  className?: string;
}

export function ContentPreview({
  html,
  title,
  featuredImage,
  className,
}: ContentPreviewProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Preview
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {featuredImage && (
          <div className="mb-6 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <img
              src={featuredImage}
              alt="Featured"
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {title && (
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">
            {title}
          </h1>
        )}

        <div
          className={cn(
            'prose prose-sm max-w-none dark:prose-invert',
            'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
            'prose-a:text-indigo-600 dark:prose-a:text-indigo-400',
            'prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm',
            'dark:prose-code:bg-gray-800',
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
