import React from 'react';
import { Filter, X } from 'lucide-react';
import { ATMFilterChip } from './ATMFilterChip';

export interface FilterConfig {
  key: string; label: string;
  type: 'select' | 'dateRange' | 'checkbox' | 'radio';
  options?: { value: string; label: string }[];
}

export interface ActiveFilter { key: string; label: string; value: string; displayValue: string; }

interface Props {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFilter: (filters: ActiveFilter[]) => void;
  onClearAll: () => void;
}

export const ATMFilter: React.FC<Props> = ({ activeFilters, onFilter, onClearAll }) => {
  const removeFilter = (key: string) => onFilter(activeFilters.filter(f => f.key !== key));

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={14} className="text-gray-400" />
      {activeFilters.map(f => (
        <ATMFilterChip key={f.key} label={f.label} value={f.displayValue} onRemove={() => removeFilter(f.key)} />
      ))}
      <button onClick={onClearAll} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
        <X size={12} /> Clear All
      </button>
    </div>
  );
};

export default ATMFilter;
