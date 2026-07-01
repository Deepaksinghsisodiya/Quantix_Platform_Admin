import React from 'react';
import { cn } from '@/lib/utils/cn';

interface OTPInputGroupProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}

export const OTPInputGroup: React.FC<OTPInputGroupProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
}) => {
  const inputs = Array.from({ length });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    const digitsOnly = val.replace(/\D/g, '');
    if (!digitsOnly) return;

    const newValue = value.split('');
    newValue[index] = digitsOnly.charAt(digitsOnly.length - 1); // pick last char entered
    const joinedValue = newValue.join('').slice(0, length);
    onChange(joinedValue);

    // Auto-focus next input
    if (index < length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newValue = value.split('');
      if (!newValue[index] && index > 0) {
        // focus previous
        const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement | null;
        prevInput?.focus();
      }
      newValue[index] = '';
      onChange(newValue.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, length);
    onChange(digits);

    // Focus last filled or last input
    const focusIndex = Math.min(digits.length, length - 1);
    const targetInput = document.getElementById(`otp-input-${focusIndex}`) as HTMLInputElement | null;
    targetInput?.focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {inputs.map((_, index) => (
        <input
          key={index}
          id={`otp-input-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-xl font-bold font-mono rounded-xl border border-surface-200 bg-surface-50/50 outline-none transition-all duration-150',
            'focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-500/5',
            'dark:border-surface-800 dark:bg-surface-900/50 dark:text-surface-100 dark:focus:border-accent-400',
            error && 'border-danger focus:border-danger focus:ring-danger/5 dark:border-danger dark:focus:border-danger',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
};

export default OTPInputGroup;
