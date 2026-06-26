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
    <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-800 last:border-0 font-medium">
      <dt className="text-sm text-surface-500 dark:text-surface-400">{label}</dt>
      <dd className="text-sm font-semibold text-surface-900 dark:text-surface-100">{value}</dd>
    </div>
  );
}
