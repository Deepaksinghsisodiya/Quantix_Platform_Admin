import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { cn } from '@/lib/utils/cn';
import type { PlanDef } from '@/modules/merchants/Register/constants';

interface PlanCardProps {
  plan: PlanDef;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Selectable plan card for Enterprise registration flow.
 * Shows plan name, price, feature list, and popular badge.
 */
export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-300 w-full',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
        selected
          ? 'border-accent-600 bg-accent-50/50 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
          : 'border-surface-200 bg-zen-surface hover:border-accent-300 dark:border-surface-800 dark:hover:border-accent-800',
      )}
    >
      {plan.popular && (
        <span className="absolute -top-2.5 left-4">
          <ATMBadge color="primary" size="sm" label="Most Popular" />
        </span>
      )}
      {selected && (
        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-accent-600 dark:text-accent-400" />
      )}
      <h3 className="text-lg font-extrabold text-surface-900 dark:text-surface-100">{plan.name}</h3>
      <div className="mt-2">
        {plan.price > 0 ? (
          <span className="text-3xl font-extrabold tabular-nums text-surface-900 dark:text-surface-100">
            ${plan.price}
            <span className="text-sm font-normal text-surface-500 dark:text-surface-400">{plan.period}</span>
          </span>
        ) : (
          <span className="text-xl font-extrabold text-surface-900 dark:text-surface-100">{plan.period}</span>
        )}
      </div>
      <ul className="mt-4 space-y-2 w-full">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs font-semibold text-surface-600 dark:text-surface-400">
            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}
