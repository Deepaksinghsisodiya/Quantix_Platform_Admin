import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StepProgressProps {
  currentStep: number;
  steps: readonly string[];
}

/**
 * Reusable multi-step wizard progress bar used by Enterprise & Standalone
 * registration flows. Shows step count, current step name, and segmented
 * pill indicators matching the reference screenshots.
 */
export function StepProgress({ currentStep, steps }: StepProgressProps) {
  return (
    <div className="space-y-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-950 text-xs font-black text-accent-600 dark:text-accent-400">
            {currentStep + 1}
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <span className="text-xs font-extrabold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
          {steps[currentStep]}
        </span>
      </div>
      <div className="flex gap-1.5 w-full">
        {steps.map((stepName, idx) => (
          <div
            key={stepName}
            title={`${idx + 1}. ${stepName}`}
            className={cn(
              'flex-1 rounded-full h-2 transition-all duration-500',
              idx <= currentStep
                ? 'bg-accent-600 dark:bg-accent-500 shadow-sm shadow-accent-500/20'
                : 'bg-slate-100 dark:bg-slate-800',
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default StepProgress;
