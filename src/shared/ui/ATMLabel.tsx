import React from 'react';

interface Props {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  variant?: 'default' | 'subheading' | 'caption';
}

export const ATMLabel: React.FC<Props> = ({ 
  children, 
  required, 
  className = '', 
  variant = 'default' 
}) => {
  const variantClasses = {
    default: 'text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight',
    subheading: 'text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]',
    caption: 'text-[9px] font-black text-gray-500 dark:text-gray-700 uppercase tracking-widest'
  };

  return (
    <label className={`flex items-center gap-1.5 px-0.5 ${variantClasses[variant]} ${className}`}>
      {children}
      {required && <span className="text-red-500 animate-pulse text-[14px] leading-none">*</span>}
    </label>
  );
};
