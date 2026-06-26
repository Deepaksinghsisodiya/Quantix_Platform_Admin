import React, { useEffect, useRef, useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ReportExportFormat } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportButtonProps {
  readonly onExport: (format: ReportExportFormat) => void;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly size?: 'sm' | 'md';
}

// ---------------------------------------------------------------------------
// Format config
// ---------------------------------------------------------------------------

const FORMATS: { value: ReportExportFormat; label: string; icon: React.ElementType }[] = [
  { value: 'CSV', label: 'Export CSV', icon: Table },
  { value: 'Excel', label: 'Export Excel', icon: FileSpreadsheet },
  { value: 'PDF', label: 'Export PDF', icon: FileText },
];

// ---------------------------------------------------------------------------
// ExportButton
// ---------------------------------------------------------------------------

export function ExportButton({
  onExport,
  loading = false,
  disabled = false,
  size = 'md',
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isSmall = size === 'sm';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 transition-colors',
          'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900',
          isSmall ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Export options"
      >
        {loading ? (
          <svg
            className={cn('animate-spin', isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4')}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Download className={isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
        )}
        Export
        <ChevronDown className={cn('ml-0.5', isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-44 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          role="listbox"
        >
          {FORMATS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                setOpen(false);
                onExport(value);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
