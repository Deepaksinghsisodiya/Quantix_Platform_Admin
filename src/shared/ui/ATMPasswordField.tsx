import React, { useState } from 'react';
import { ATMTextField } from './ATMTextField';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  showStrengthMeter?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const ATMPasswordField: React.FC<Props> = ({ showStrengthMeter, value, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (val: string) => {
    let score = 0;
    if (!val) return 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const strength = calculateStrength(String(value));

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="flex flex-col gap-2">
      <ATMTextField
        {...props}
        value={value}
        type={showPassword ? 'text' : 'password'}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      {showStrengthMeter && value && (
        <div className="flex flex-col gap-1 px-0.5">
          <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
            <span className="text-gray-400 dark:text-gray-500">Security Strength</span>
            <span className={strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-yellow-600' : 'text-green-600'}>
              {getStrengthText()}
            </span>
          </div>
          <div className="flex gap-1 h-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-500 ${
                  i <= strength ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
