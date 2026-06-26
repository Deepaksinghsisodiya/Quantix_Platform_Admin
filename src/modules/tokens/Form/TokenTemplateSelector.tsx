import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TokenTier } from '@/lib/types';

export interface TierTemplate {
  tier: TokenTier;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  features: string[];
  limits: {
    maxLocations: number;
    maxTerminals: number;
    maxUsers: number;
    maxProducts: number;
  };
}

export const TIER_TEMPLATES: readonly TierTemplate[] = [
  {
    tier: 'Basic',
    label: 'Basic',
    description: 'Essential POS features for small businesses.',
    color: 'text-surface-700 dark:text-surface-300',
    bgColor: 'bg-surface-100 dark:bg-surface-850',
    features: ['1 Location', '1 Terminal', '5 Users', '500 Products'],
    limits: {
      maxLocations: 1,
      maxTerminals: 1,
      maxUsers: 5,
      maxProducts: 500,
    },
  },
  {
    tier: 'Standard',
    label: 'Standard',
    description: 'Full POS with card payments and inventory.',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    features: ['3 Locations', '3 Terminals', '15 Users', '2000 Products'],
    limits: {
      maxLocations: 3,
      maxTerminals: 3,
      maxUsers: 15,
      maxProducts: 2000,
    },
  },
  {
    tier: 'Advance',
    label: 'Advance',
    description: 'Multi-location support with advanced analytics.',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    features: ['10 Locations', '10 Terminals', '50 Users', '10000 Products'],
    limits: {
      maxLocations: 10,
      maxTerminals: 10,
      maxUsers: 50,
      maxProducts: 10000,
    },
  },
  {
    tier: 'Premium',
    label: 'Premium',
    description: 'Everything included. White-label capable.',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    features: ['Unlimited Locations', 'Unlimited Terminals', 'Unlimited Users', 'Unlimited Products'],
    limits: {
      maxLocations: 999,
      maxTerminals: 999,
      maxUsers: 999,
      maxProducts: 99999,
    },
  },
];

interface TokenTemplateSelectorProps {
  selectedTier: TokenTier | null;
  onSelect: (tier: TokenTier, template: TierTemplate) => void;
}

export function TokenTemplateSelector({
  selectedTier,
  onSelect,
}: TokenTemplateSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {TIER_TEMPLATES.map((t) => {
        const selected = selectedTier === t.tier;
        return (
          <button
            key={t.tier}
            type="button"
            onClick={() => onSelect(t.tier, t)}
            className={cn(
              'relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-300 w-full hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
              selected
                ? 'border-accent-600 bg-accent-50/30 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
                : 'border-surface-200 bg-zen-surface hover:border-accent-300 dark:border-surface-800 dark:hover:border-accent-800',
            )}
          >
            {selected && (
              <div className="absolute -top-3 right-4 flex items-center gap-1 bg-white dark:bg-gray-900 border border-accent-600 dark:border-accent-500 rounded-full px-2.5 py-0.5 shadow-sm animate-in zoom-in duration-300">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                  Selected
                </span>
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent-600 text-white dark:bg-accent-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="h-1.5 w-1.5">
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                </span>
              </div>
            )}
            <div className={cn('inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-bold uppercase tracking-wider', t.bgColor, t.color)}>
              {t.label}
            </div>
            <p className="mt-2 text-xs font-semibold text-surface-500 dark:text-surface-400">{t.description}</p>
            <ul className="mt-3 space-y-1.5 w-full">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs font-semibold text-surface-650 dark:text-surface-400">
                  <Check className="h-3 w-3 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
