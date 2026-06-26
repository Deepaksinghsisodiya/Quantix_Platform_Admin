import React from 'react';
import { type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface ATMIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const variantClasses: Record<string, string> = {
  default: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200',
  danger: 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-rose-500 dark:hover:text-rose-400',
  success: 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 dark:hover:text-emerald-400',
  ghost: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
};

const sizeMap: Record<string, { btn: string; icon: number }> = {
  sm: { btn: 'w-7 h-7', icon: 14 },
  md: { btn: 'w-9 h-9', icon: 18 },
  lg: { btn: 'w-11 h-11', icon: 20 },
};

export const ATMIconButton: React.FC<ATMIconButtonProps> = ({
  icon: Icon, variant = 'default', size = 'md', tooltip, className, ...rest
}) => {
  const selectedSize = (sizeMap[size] || sizeMap.md) as { btn: string; icon: number };
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        selectedSize.btn,
        className
      )}
      title={tooltip}
      {...rest}
    >
      <Icon size={selectedSize.icon} />
    </button>
  );
};
