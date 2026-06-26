/**
 * RichTextEditor -- Alpha-stage markdown-aware text editor with live preview.
 *
 * Uses a textarea for input with a toolbar for common formatting shortcuts.
 * A side-by-side preview panel renders the markdown as styled HTML.
 */

import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Minimum height of the editor area. */
  minHeight?: string;
}

/* -------------------------------------------------------------------------- */
/*  Toolbar button                                                             */
/* -------------------------------------------------------------------------- */

interface ToolbarAction {
  label: string;
  icon: React.ReactNode;
  prefix: string;
  suffix?: string;
  block?: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    label: 'Bold',
    icon: <span className="font-bold">B</span>,
    prefix: '**',
    suffix: '**',
  },
  {
    label: 'Italic',
    icon: <span className="italic">I</span>,
    prefix: '_',
    suffix: '_',
  },
  {
    label: 'Heading',
    icon: <span className="font-bold text-xs">H1</span>,
    prefix: '## ',
    block: true,
  },
  {
    label: 'Bullet List',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zm0 5A.75.75 0 016.75 9h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 9.75zm0 5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM3.5 5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    prefix: '- ',
    block: true,
  },
  {
    label: 'Link',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
        <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
      </svg>
    ),
    prefix: '[',
    suffix: '](url)',
  },
  {
    label: 'Image',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 0a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v7.764l-3.024-3.024a1.5 1.5 0 00-2.122 0L8.932 12.41l-.814-.814a1.5 1.5 0 00-2.122 0L2.5 15.098V5.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
    prefix: '![alt](',
    suffix: ')',
  },
  {
    label: 'Code',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06z"
          clipRule="evenodd"
        />
      </svg>
    ),
    prefix: '`',
    suffix: '`',
  },
];

/* -------------------------------------------------------------------------- */
/*  Simple markdown to HTML converter                                          */
/* -------------------------------------------------------------------------- */

function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code class="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono dark:bg-gray-800">$1</code>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 underline dark:text-indigo-400">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="my-2">')
    // Single newlines
    .replace(/\n/g, '<br />');

  // Wrap in paragraph
  html = `<p class="my-2">${html}</p>`;

  // Wrap adjacent <li> in <ul>
  html = html.replace(
    /(<li[^>]*>.*?<\/li>)+/gs,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`,
  );

  return html;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here... Markdown is supported.',
  className,
  minHeight = '16rem',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const applyAction = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end) || 'text';

      let insertion: string;
      if (action.block) {
        insertion = `${action.prefix}${selected}`;
      } else {
        insertion = `${action.prefix}${selected}${action.suffix ?? ''}`;
      }

      const newValue = value.slice(0, start) + insertion + value.slice(end);
      onChange(newValue);

      // Restore cursor after React re-renders
      requestAnimationFrame(() => {
        ta.focus();
        const cursorPos = start + action.prefix.length + selected.length;
        ta.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange],
  );

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-0.5">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              title={action.label}
              onClick={() => applyAction(action)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600',
                'transition-colors hover:bg-gray-200 hover:text-gray-900',
                'dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              )}
            >
              {action.icon}
            </button>
          ))}
        </div>

        {/* Toggle preview */}
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            showPreview
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700',
          )}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none p-4"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full resize-y bg-transparent p-4 text-sm text-gray-900 placeholder:text-gray-400',
            'focus:outline-none',
            'dark:text-gray-100 dark:placeholder:text-gray-500',
            'font-mono',
          )}
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
