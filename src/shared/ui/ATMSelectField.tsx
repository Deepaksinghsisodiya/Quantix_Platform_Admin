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
  placeholder = 'ATMSelect option',
  error,
  helperText,
  disabled,
  required,
  searchable,
  clearable,
  loading,
  className = '',
  prefix,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sizeMap = {
    sm: {
      button: 'px-2.5 py-1.5 text-[12px] rounded-xl border-2',
      icon: 14,
      gap: 'gap-2'
    },
    md: {
      button: 'px-5 py-4 text-sm rounded-xl border-2',
      icon: 18,
      gap: 'gap-3'
    },
    lg: {
      button: 'px-6 py-5 text-base rounded-xl border-2',
      icon: 20,
      gap: 'gap-4'
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
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
          {label}
          {required && <span className="text-red-500 animate-pulse text-[14px] leading-none">*</span>}
        </label>
      )}

      <div className="relative group">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between ${currentSize.button} transition-all duration-300
            ${disabled ? 'bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60' : 'bg-zen-surface text-gray-900 dark:text-gray-100'}
            ${
              error
                ? 'border-red-500/50 dark:border-red-900/50 ring-4 ring-red-500/5 dark:ring-red-900/10 shadow-sm'
                : isOpen
                ? 'border-accent-600 dark:border-accent-500 ring-4 ring-accent-600/5 dark:ring-accent-500/10 shadow-md'
                : 'border-gray-100 dark:border-gray-800/50 hover:border-accent-200 dark:hover:border-accent-800 shadow-sm'
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
          <div className="absolute z-[100] w-full mt-2 bg-zen-card backdrop-blur-xl border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
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
