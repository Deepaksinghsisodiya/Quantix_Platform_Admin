import React from 'react';
import { cn } from '@/lib/utils/cn';

type Cols = 1 | 2 | 3 | 4;

const colsClass: Record<Cols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

interface ATMFormGridProps {
  /** Number of columns at desktop width. Cells stretch to equal height per row. */
  cols?: Cols;
  className?: string;
  children: React.ReactNode;
}

/**
 * ATMFormGrid — responsive form field grid. All cells in a row stretch to the
 * tallest one (grid default), so fields, selects and textareas line up perfectly.
 */
export const ATMFormGrid: React.FC<ATMFormGridProps> = ({
  cols = 2,
  className,
  children,
}) => {
  return (
    <div className={cn('grid grid-cols-1 gap-5', colsClass[cols], className)}>
      {children}
    </div>
  );
};

export default ATMFormGrid;