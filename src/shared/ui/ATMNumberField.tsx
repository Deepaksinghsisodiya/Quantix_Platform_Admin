import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { ATMTextField } from './ATMTextField';

interface Props {
  name: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  showControls?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
}

export const ATMNumberField: React.FC<Props> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  showControls = true,
  disabled,
  ...props
}) => {
  const handleIncrement = () => {
    const newVal = value + step;
    if (max !== undefined && newVal > max) return;
    onChange(newVal);
  };

  const handleDecrement = () => {
    const newVal = value - step;
    if (min !== undefined && newVal < min) return;
    onChange(newVal);
  };

  return (
    <ATMTextField
      {...props}
      type="number"
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) onChange(val);
      }}
      suffix={
        <div className="flex items-center gap-1">
          {props.suffix}
          {showControls && !disabled && (
            <div className="flex flex-col border-l border-gray-200 dark:border-gray-800 ml-2 pl-1">
              <button
                type="button"
                onClick={handleIncrement}
                className="p-0.5 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                className="p-0.5 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
              >
                <Minus size={12} />
              </button>
            </div>
          )}
        </div>
      }
    />
  );
};
