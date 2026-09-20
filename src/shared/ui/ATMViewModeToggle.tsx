import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ATMViewModeToggleProps {
  value: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
  gridLabel?: string;
  listLabel?: string;
  className?: string;
}

/**
 * Labeled Cards / List Table view-mode pill, shared by list screens
 * (Plans, Rate Cards, …). Styling matches the Plans page original.
 */
export const ATMViewModeToggle: React.FC<ATMViewModeToggleProps> = ({
  value,
  onChange,
  gridLabel = 'Cards',
  listLabel = 'List Table',
  className,
}) => (
  <div
    className={cn(
      'flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700',
      className
    )}
  >
    <button
      type="button"
      onClick={() => onChange('grid')}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
        value === 'grid'
          ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      <LayoutGrid className="h-4 w-4" />
      {gridLabel}
    </button>
    <button
      type="button"
      onClick={() => onChange('list')}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
        value === 'list'
          ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      <List className="h-4 w-4" />
      {listLabel}
    </button>
  </div>
);

export default ATMViewModeToggle;
