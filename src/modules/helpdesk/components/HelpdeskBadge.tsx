import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

const TONES: Record<string, string> = {
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

/**
 * Helpdesk badge shared by the merchant support list and ticket pages: a tone plus a
 * semantic icon, so a badge reads at a glance without depending on colour alone.
 */
export function HelpdeskBadge({
  tone,
  icon: Icon,
  label,
}: {
  tone: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        TONES[tone] ?? TONES.default,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}