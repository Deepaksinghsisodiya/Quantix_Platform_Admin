import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StepProgressProps {
  currentStep: number;
  steps: readonly string[];
}

/**
 * StepProgress - Multi-step wizard progress bar used by Enterprise & Standalone
 * registration flows. Features modern glassmorphic background, luxurious typeface,
 * and glowing segmented active steps.
 */
export function StepProgress({ currentStep, steps }: StepProgressProps) {
  return (
    <div className="space-y-4 bg-white/75 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-5 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-slate-900">
            {currentStep + 1}
          </span>
          <span className="text-xs font-bold text-slate-450 dark:text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          {steps[currentStep]}
        </span>
      </div>
      <div className="flex gap-1.5 w-full">
        {steps.map((stepName, idx) => (
          <div
            key={stepName}
            title={`${idx + 1}. ${stepName}`}
            className={cn(
              'flex-1 rounded-full h-1.5 transition-all duration-500',
              idx <= currentStep
                ? 'bg-slate-900 dark:bg-white shadow-sm shadow-slate-900/20'
                : 'bg-slate-100 dark:bg-slate-850',
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default StepProgress;
