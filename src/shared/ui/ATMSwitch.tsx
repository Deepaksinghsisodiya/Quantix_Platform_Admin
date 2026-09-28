import React from 'react';

interface Props {
  name: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ATMSwitch: React.FC<Props> = ({
  label,
  checked,
  onChange,
  disabled,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4.5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
    md: { track: 'w-10 h-5.5', thumb: 'w-4.5 h-4.5', translate: 'translate-x-4.5' },
  };

  const { track, thumb, translate } = sizes[size];

  return (
    <label
      className={`
        inline-flex items-center gap-2.5 select-none cursor-pointer group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            ${track} rounded-full transition-colors duration-200 ease-in-out p-0.5
            ${checked ? 'bg-emerald-500 shadow-inner' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500'}
          `}
        />
        <div
          className={`
            absolute left-0.5 top-0.5 bg-white ${thumb} rounded-full transition-transform duration-200 ease-in-out shadow-xs pointer-events-none
            ${checked ? translate : 'translate-x-0'}
          `}
        />
      </div>
      {label && <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>}
    </label>
  );
};
