/**
 * TokenWizardCard — premium step-card shell for the Generate/Batch token wizards
 * (2026-09-21). Mirrors the Merchant Onboarding wizard's step card so the two
 * wizards share the same visual language: gradient header + step icon, "Step X of N"
 * eyebrow, title and description, then the padded form body.
 *
 * NOTE: no `overflow-hidden` here — select/dropdown menus render absolutely inside
 * cards and would be clipped invisible at the card edge (ATMCard convention).
 */
import React from 'react';
import { ATMCard } from '@/shared/ui/ATMCard';
import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

export interface TokenWizardCardProps {
  step: number;
  totalSteps?: number;
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const TokenWizardCard: React.FC<TokenWizardCardProps> = ({
  step,
  totalSteps = 3,
  title,
  description,
  icon: Icon,
  children,
  className,
}) => (
  <ATMCard className={cn('glass-card', className)} padding="none">
    <div className="flex items-start gap-3.5 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-50/60 via-white to-white dark:from-primary-950/20 dark:via-transparent dark:to-transparent rounded-t-2xl">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/25 shrink-0">
        {Icon ? <Icon size={19} strokeWidth={2} /> : <span className="text-sm font-black">{step}</span>}
      </span>
      <div className="min-w-0 pt-0.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Step {step} of {totalSteps}
        </span>
        <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug max-w-xl">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="px-6 py-6">{children}</div>
  </ATMCard>
);

/** TokenWizardSection — a titled sub-group inside a wizard step (replaces nested cards). */
export const TokenWizardSection: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => (
  <section className={cn('space-y-4', className)}>
    <div>
      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {title}
      </h4>
      {description && (
        <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

export default TokenWizardCard;