import React from 'react';
import { Clock } from 'lucide-react';
import { ATMTextField } from './ATMTextField';

interface Props {
  name: string;
  label?: string;
  value: string; // HH:mm
  onChange: (time: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const ATMTimePicker: React.FC<Props> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <ATMTextField
      {...props}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      prefix={<Clock size={18} />}
    />
  );
};
