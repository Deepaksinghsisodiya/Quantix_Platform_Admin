import React from 'react';
import { ATMSelectField } from './ATMSelectField';
import { LANGUAGE_OPTIONS } from '../../modules/settings/constants/settings.constants';

interface Props {
  name: string;
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ATMLanguageSelect: React.FC<Props> = (props) => {
  return (
    <ATMSelectField 
      {...props}
      options={LANGUAGE_OPTIONS}
      searchable
      placeholder={props.placeholder || 'ATMSelect Language'}
    />
  );
};
