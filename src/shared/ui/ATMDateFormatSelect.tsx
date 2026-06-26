import React from 'react';
import { Calendar } from 'lucide-react';
import { ATMSelectField } from './ATMSelectField';
import { DATE_FORMAT_OPTIONS } from '../../modules/settings/constants/settings.constants';

interface Props {
  name: string;
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ATMDateFormatSelect: React.FC<Props> = (props) => {
  return (
    <ATMSelectField 
      {...props}
      options={DATE_FORMAT_OPTIONS.map(opt => ({ ...opt, icon: <Calendar size={14} /> }))}
      placeholder={props.placeholder || 'ATMSelect Date Format'}
    />
  );
};
