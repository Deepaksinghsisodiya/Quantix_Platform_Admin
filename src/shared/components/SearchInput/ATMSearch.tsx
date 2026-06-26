import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  onClear?: () => void;
  className?: string;
}

export const ATMSearch: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
  onClear,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounce);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <div className={`relative flex items-center group ${className}`}>
      <div className="absolute left-3 text-gray-400 dark:text-gray-500 group-focus-within:text-accent-600 transition-colors">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-zen-surface focus:border-accent-600 dark:focus:border-accent-500 rounded-xl text-sm outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onClear?.();
            onChange('');
          }}
          className="absolute right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
