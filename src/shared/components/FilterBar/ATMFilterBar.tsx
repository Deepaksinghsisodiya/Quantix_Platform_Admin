import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ATMSelectField } from '../../ui/ATMSelectField';
import { ATMDatePicker } from '../../ui/ATMDatePicker';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'dateRange' | 'toggle';
  options?: { value: any; label: string }[];
}

interface Props {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  className?: string;
}

export const ATMFilterBar: React.FC<Props> = ({
  filters,
  values,
  onChange,
  onReset,
  className = '',
}) => {
  const activeFiltersCount = Object.values(values).filter(v => v !== null && v !== '' && v !== undefined).length;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider">
        <Filter size={14} />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-accent-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
            {activeFiltersCount}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[140px]">
            {filter.type === 'select' && (
              <ATMSelectField
                name={filter.key}
                placeholder={filter.label}
                options={filter.options || []}
                value={values[filter.key]}
                onChange={(val) => onChange(filter.key, val)}
                className="!gap-0"
              />
            )}
            {filter.type === 'dateRange' && (
              <ATMDatePicker
                name={filter.key}
                placeholder={filter.label}
                value={values[filter.key]}
                onChange={(val) => onChange(filter.key, val)}
                className="!gap-0"
              />
            )}
          </div>
        ))}
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors uppercase tracking-wider"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      )}
    </div>
  );
};
