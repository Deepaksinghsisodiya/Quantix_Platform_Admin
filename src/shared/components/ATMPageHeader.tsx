import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { ATMButton } from '../ui/ATMButton';

interface Action {
  label: string;
  onClick: () => void;
  icon?: any;
  permission?: { module: string; action: 'view' | 'add' | 'edit' | 'delete' };
}

interface Props {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  iconColor?: 'theme' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate' | 'violet';
  breadcrumb?: Array<{ label: string; href?: string }>;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  action?: Action;
  secondaryAction?: Action;
  extraActions?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

import { ArrowLeft } from 'lucide-react';

const colorMaps = {
  theme: 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-100 dark:border-accent-900/30 shadow-accent-100/5 dark:shadow-none',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 shadow-indigo-100/10 dark:shadow-none',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 shadow-emerald-100/10 dark:shadow-none',
  rose: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 shadow-rose-100/10 dark:shadow-none',
  amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 shadow-amber-100/10 dark:shadow-none',
  blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 shadow-blue-100/10 dark:shadow-none',
  purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 shadow-purple-100/10 dark:shadow-none',
  slate: 'bg-slate-100/80 dark:bg-gray-900 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-gray-800/80 shadow-slate-100/10 dark:shadow-none',
  violet: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/30 shadow-violet-100/10 dark:shadow-none',
};

export const ATMPageHeader: React.FC<Props> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'theme',
  action,
  secondaryAction,
  extraActions,
  onBack,
  className = '',
}) => {
  const { hasPermission } = usePermission();

  const renderAction = (act: Action, isPrimary: boolean) => {
    if (act.permission && !hasPermission(act.permission.module, act.permission.action)) {
      return null;
    }

    return (
      <ATMButton
        onClick={act.onClick}
        variant={isPrimary ? 'primary' : 'outline'}
        icon={act.icon}
        size="md"
      >
        {act.label}
      </ATMButton>
    );
  };

  return (
    <div className={`flex items-center justify-between gap-6 ${className}`}>
      <div className="flex items-center gap-4">
        {onBack && (
          <>
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
          </>
        )}

        {Icon && (
          <div className={
            iconColor === 'theme' 
              ? "w-14 h-14 rounded-[22px] bg-accent-600 dark:bg-accent-600 text-white shadow-xl shadow-accent-500/25 dark:shadow-none hover:scale-105 border border-transparent flex items-center justify-center transition-all duration-500 cursor-pointer"
              : `w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm hover:scale-105 transition-all duration-300 ${colorMaps[iconColor]}`
          }>
            <Icon size={iconColor === 'theme' ? 26 : 22} strokeWidth={iconColor === 'theme' ? 2 : 2.2} />
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && <div className="text-sm font-normal text-slate-500 dark:text-gray-400">{subtitle}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {extraActions}
        {secondaryAction && renderAction(secondaryAction, false)}
        {action && renderAction(action, true)}
      </div>
    </div>
  );
};

export default ATMPageHeader;
