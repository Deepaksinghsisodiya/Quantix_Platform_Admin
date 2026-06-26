import React, { ChangeEvent, FocusEvent } from 'react';

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
}

export const ATMTextArea: React.FC<Props> = ({
  label,
  error,
  helperText,
  disabled,
  required,
  rows = 3,
  maxLength,
  showCount,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex justify-between items-end px-1">
        {label && (
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] flex items-center gap-1.5 leading-none">
            {label}
            {required && <span className="text-red-500 animate-pulse text-[14px] leading-none">*</span>}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest leading-none bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800">
            {props.value.length} <span className="opacity-30">/</span> {maxLength}
          </span>
        )}
      </div>

      <div
        className={`
        relative rounded-[1.5rem] border-2 transition-all duration-500 group
        ${disabled ? 'bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed opacity-60' : 'bg-zen-surface'}
        ${
          error
            ? 'border-red-500/50 dark:border-red-900/50 ring-4 ring-red-500/5 dark:ring-red-900/10 shadow-sm'
            : 'border-gray-100 dark:border-gray-800 focus-within:border-accent-600 dark:focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-600/5 dark:focus-within:ring-accent-500/10 shadow-sm hover:border-accent-200 dark:hover:border-accent-800'
        }
      `}
      >
        <textarea
          {...props}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className="w-full px-6 py-5 text-sm bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 resize-none font-bold leading-relaxed transition-all"
        />
        
        {/* Subtle Decorative Gradient */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent-500/5 dark:bg-accent-500/10 rounded-full blur-[40px] pointer-events-none transition-opacity duration-700 opacity-0 group-focus-within:opacity-100" />
      </div>

      {(error || helperText) && (
        <p className={`text-[10px] font-black uppercase tracking-tight px-1 ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
