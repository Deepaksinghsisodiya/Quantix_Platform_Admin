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
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  };

  const { track, thumb, translate } = sizes[size];

  return (
    <label
      className={`
        flex items-center gap-3 select-none cursor-pointer group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative inline-block">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            ${track} rounded-full transition-colors duration-200 ease-in-out
            ${checked ? 'bg-accent-600' : 'bg-gray-200 dark:bg-gray-800 group-hover:bg-gray-300 dark:group-hover:bg-gray-700'}
          `}
        />
        <div
          className={`
            absolute left-0.5 top-0.5 bg-white dark:bg-gray-200 ${thumb} rounded-full transition-transform duration-200 ease-in-out shadow-sm
            ${checked ? translate : 'translate-x-0'}
          `}
        />
      </div>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};
