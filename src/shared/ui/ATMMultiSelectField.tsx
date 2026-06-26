import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  name: string;
  label?: string;
  options: Option[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  maxSelections?: number;
  className?: string;
  isLoading?: boolean;
}

export const ATMMultiSelectField: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'ATMSelect options',
  error,
  helperText,
  disabled,
  required,
  searchable,
  maxSelections,
  className = '',
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

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

  const toggleOption = (val: string | number) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      if (maxSelections && value.length >= maxSelections) return;
      onChange([...value, val]);
    }
  };

  const removeOption = (val: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
          {label}
          {required && <span className="text-red-500 animate-pulse text-[14px] leading-none">*</span>}
        </label>
      )}

      <div className="relative group">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex flex-wrap items-center gap-2.5 px-5 py-4 text-sm rounded-[1.25rem] border-2 transition-all duration-300 min-h-[58px]
            ${disabled ? 'bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60' : 'bg-zen-surface text-gray-900 dark:text-gray-100 cursor-pointer'}
            ${
              error
                ? 'border-red-500/50 dark:border-red-900/50 ring-4 ring-red-500/5 dark:ring-red-900/10 shadow-sm'
                : isOpen
                ? 'border-accent-600 dark:border-accent-500 ring-4 ring-accent-600/5 dark:ring-accent-500/10 shadow-md'
                : 'border-gray-100 dark:border-gray-800/50 hover:border-accent-200 dark:hover:border-accent-800 shadow-sm'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-accent-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-accent-600/60">Processing Matrix...</span>
            </div>
          ) : selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="flex items-center gap-2 px-3 py-1 bg-accent-50/50 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 rounded-xl text-[10px] font-black uppercase tracking-tight border-2 border-accent-100 dark:border-accent-900/50 shadow-sm transition-all animate-in zoom-in duration-300 group/tag hover:bg-accent-100 dark:hover:bg-accent-900/60"
              >
                {opt.label}
                <X
                  size={12}
                  strokeWidth={3}
                  className="cursor-pointer hover:text-red-500 dark:hover:text-red-400 hover:scale-125 transition-all"
                  onClick={(e) => removeOption(opt.value, e)}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-300 dark:text-gray-700 font-bold">{placeholder}</span>
          )}
          <ChevronDown
            size={18}
            strokeWidth={3}
            className={`text-gray-300 dark:text-gray-700 ml-auto transition-transform duration-500 ${isOpen ? 'rotate-180 text-accent-500' : ''}`}
          />
        </div>

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
              {filteredOptions.length === 0 ? (
                <div className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700 text-center italic">
                  No matches found in matrix
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled || (!!maxSelections && !isSelected && value.length >= maxSelections)}
                      onClick={() => toggleOption(opt.value)}
                      className={`
                        w-full flex items-center justify-between px-6 py-3.5 text-sm transition-all duration-300
                        ${opt.disabled ? 'cursor-not-allowed opacity-30 grayscale' : 'hover:bg-accent-50/50 dark:hover:bg-accent-950/30'}
                        ${isSelected ? 'bg-accent-50/80 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 font-black' : 'text-gray-700 dark:text-gray-300 font-bold'}
                      `}
                    >
                      <span className="uppercase tracking-tight text-[13px]">{opt.label}</span>
                      {isSelected && <Check size={16} strokeWidth={4} className="text-accent-600 dark:text-accent-400 animate-in zoom-in duration-300" />}
                    </button>
                  );
                })
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
