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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-gray-900 dark:text-white">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-sm font-extrabold text-accent-600 dark:text-accent-400">
          {steps[currentStep]}
        </span>
      </div>
      <div className="flex gap-2 w-full">
        {steps.map((stepName, idx) => (
          <div
            key={stepName}
            className={cn(
              'flex-1 rounded-full h-1.5 transition-all duration-300',
              idx <= currentStep
                ? 'bg-accent-600 dark:bg-accent-500'
                : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/20',
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default StepProgress;
