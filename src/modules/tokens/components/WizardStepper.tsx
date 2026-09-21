/**
 * WizardStepper — shared 3-step chip stepper (2026-08-30, extracted from the Generate
 * Tokens wizard so Batch Generate renders the identical pattern).
 */
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface WizardStepperProps {
  steps: { id: number; label: string }[];
  step: number;
  maxReachable: number;
  onStepChange: (s: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ steps, step, maxReachable, onStepChange }) => (
  <div className="flex items-center gap-2">
    {steps.map((s, idx) => {
      const reachable = s.id <= maxReachable;
      const active = s.id === step;
      const done = s.id < step;
      return (
        <React.Fragment key={s.id}>
          {idx > 0 && <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />}
          <button
            type="button"
            disabled={!reachable}
            onClick={() => reachable && onStepChange(s.id)}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
              active
                ? 'bg-primary-600 text-white'
                : done
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : reachable
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    : 'bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed',
            )}
          >
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black',
              active ? 'bg-white/20' : done ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-white/60 dark:bg-black/20',
            )}>
              {done ? <Check size={12} /> : s.id}
            </span>
            {s.label}
          </button>
        </React.Fragment>
      );
    })}
  </div>
);

export default WizardStepper;
