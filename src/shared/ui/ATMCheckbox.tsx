import React from 'react';
import { Check, Minus } from 'lucide-react';

interface Props {
  name: string;
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export const ATMCheckbox: React.FC<Props> = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled,
  indeterminate,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        className={`
          flex items-start gap-3.5 cursor-pointer select-none group py-1
          ${disabled ? 'cursor-not-allowed opacity-40' : ''}
        `}
        onClick={(e) => {
          if (disabled) return;
          e.preventDefault();
          onChange(!checked);
        }}
      >
        <div
          className={`
            mt-0.5 w-6 h-6 rounded-[0.5rem] border-2 flex items-center justify-center transition-all duration-500 shadow-sm
            ${
              checked || indeterminate
                ? 'bg-slate-900 border-slate-900 dark:bg-accent-600 dark:border-accent-600 scale-110 shadow-xl shadow-accent-500/10'
                : 'bg-zen-surface border-gray-100 dark:border-gray-800 group-hover:border-accent-300 dark:group-hover:border-accent-700 group-hover:shadow-lg'
            }
            ${error ? 'border-red-500/50 ring-4 ring-red-500/5 dark:ring-red-900/10' : ''}
          `}
        >
          {indeterminate ? (
            <Minus size={14} className="text-white animate-in zoom-in-50 duration-300" strokeWidth={4} />
          ) : checked ? (
            <Check size={14} className="text-white animate-in zoom-in-50 duration-300" strokeWidth={4} />
          ) : null}
        </div>

        {label && (
          <div className="flex flex-col pt-0.5">
            <span className={`text-[13px] font-bold uppercase tracking-tight transition-colors duration-300 ${error ? 'text-red-500' : 'text-gray-900 dark:text-gray-100 group-hover:text-accent-600 dark:group-hover:text-accent-400'}`}>
              {label}
            </span>
          </div>
        )}
      </label>

      {(error || helperText) && (
        <p className={`text-[10px] font-black uppercase tracking-tight ml-[2.3rem] ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
