import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ATMBreadcrumbsProps {
  /** Manually supply breadcrumb items. When omitted, auto-generates from the current route path. */
  items?: BreadcrumbItem[];
  className?: string;
}

/** Separator chevron icon. */
function Separator() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-600"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function toLabel(segment: string): string {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function autoGenerate(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, idx) => ({
    label: toLabel(seg),
    href: idx < segments.length - 1 ? '/' + segments.slice(0, idx + 1).join('/') : undefined,
  }));
}

export const ATMBreadcrumbs: React.FC<ATMBreadcrumbsProps> = ({ items, className }) => {
  const location = useLocation();
  const crumbs = items ?? autoGenerate(location.pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <Separator />}
              {crumb.href && !isLast ? (
                <Link
                  to={crumb.href}
                  className={cn(
                    'text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm',
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="text-slate-500 dark:text-slate-400"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ATMBreadcrumbs;
