import React from 'react';

interface ReviewRowProps {
  label: string;
  value: React.ReactNode;
}

/**
 * Reusable key-value review row used in step-based registration
 * review screens. Supports both string and ReactNode values.
 */
export function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
