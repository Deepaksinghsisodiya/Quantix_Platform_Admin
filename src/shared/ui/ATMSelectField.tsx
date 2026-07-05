import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface Props {
  name: string;
  label?: string;
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  className?: string;
  prefix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const ATMSelectField: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select',
  error,
  helperText,
  disabled,
  required,
  searchable,
  clearable,
  loading,
  className = '',
  prefix,
  size = 'lg',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sizeMap = {
    sm: {
      button: 'px-3 py-1.5 text-xs rounded-lg border',
      icon: 14,
      gap: 'gap-2'
    },
    md: {
      button: 'px-4 py-2 text-sm rounded-lg border',
      icon: 16,
      gap: 'gap-2.5'
    },
    lg: {
      button: 'px-4 py-3 text-sm rounded-lg border',
      icon: 18,
      gap: 'gap-3'
    }
  };

  const currentSize = sizeMap[size];

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 px-0.5">
          {label}
          {required && <span className="text-red-550 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative group">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between ${currentSize.button} transition-all duration-200
            ${disabled ? 'bg-gray-50 dark:bg-slate-900/50 cursor-not-allowed text-gray-400 dark:text-slate-600 opacity-60' : 'bg-[var(--zen-surface)] dark:bg-zinc-950/50 text-slate-800 dark:text-slate-200'}
            ${
              error
                ? 'border-red-500 bg-red-50/10'
                : isOpen
                ? 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-500/10 dark:ring-primary-400/10'
                : 'border-[var(--zen-border)] hover:border-slate-400 dark:hover:border-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.005)]'
            }
          `}
        >
          <span className={`truncate flex items-center ${currentSize.gap} font-bold ${!selectedOption ? 'text-gray-300 dark:text-gray-700' : ''}`}>
            {prefix && <span className="opacity-70 group-focus-within:text-accent-500 transition-colors">{prefix}</span>}
            {selectedOption?.icon}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className={`flex items-center ${currentSize.gap} ml-1`}>
            {clearable && value !== null && !disabled && (
              <X
                size={currentSize.icon - 2}
                className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 hover:scale-110 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
              />
            )}
            <ChevronDown
              size={currentSize.icon}
              strokeWidth={3}
              className={`text-gray-300 dark:text-gray-700 transition-transform duration-500 ${isOpen ? 'rotate-180 text-accent-500' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-2 bg-[var(--zen-surface)] dark:bg-[var(--zen-card)] border border-[var(--zen-border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {searchable && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                <Search size={16} className="text-gray-400 dark:text-gray-600 ml-1" />
                <input
                  autoFocus
                  className="w-full text-sm font-bold outline-none py-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  placeholder="Search protocol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="max-h-72 overflow-y-auto py-2 custom-scrollbar">
              {loading ? (
                <div className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-accent-600 dark:border-accent-400 border-t-transparent rounded-full animate-spin"></div>
                  Synchronizing...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700 text-center italic">
                  No matches found in matrix
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      w-full flex items-center justify-between px-6 py-3.5 text-sm transition-all duration-300
                      ${opt.disabled ? 'cursor-not-allowed opacity-30 grayscale' : 'hover:bg-accent-50/50 dark:hover:bg-accent-950/30'}
                      ${value === opt.value ? 'bg-accent-50/80 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 font-black' : 'text-gray-700 dark:text-gray-300 font-bold'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {opt.icon && <span className="opacity-70">{opt.icon}</span>}
                      <span className="uppercase tracking-tight text-[13px]">{opt.label}</span>
                    </div>
                    {value === opt.value && <Check size={16} strokeWidth={4} className="text-accent-600 dark:text-accent-400 animate-in zoom-in duration-300" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-[10px] font-black uppercase tracking-tight px-1 ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
