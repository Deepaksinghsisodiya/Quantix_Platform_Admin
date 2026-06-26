import React from 'react';
import { ATMSelectField } from './ATMSelectField';
import { CURRENCY_OPTIONS } from '../../modules/settings/constants/settings.constants';

interface Props {
  name: string;
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ATMCurrencySelect: React.FC<Props> = (props) => {
  return (
    <ATMSelectField 
      {...props}
      options={CURRENCY_OPTIONS}
      searchable
      placeholder={props.placeholder || 'ATMSelect Currency'}
    />
  );
};
