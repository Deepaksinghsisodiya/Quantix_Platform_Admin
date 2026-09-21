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
  theme: 'bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/20 border-none',
  indigo: 'bg-gradient-to-br from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/20 border-none',
  emerald: 'bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20 border-none',
  rose: 'bg-gradient-to-br from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-500/20 border-none',
  amber: 'bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/20 border-none',
  blue: 'bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/20 border-none',
  purple: 'bg-gradient-to-br from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/20 border-none',
  slate: 'bg-gradient-to-br from-slate-700 to-slate-500 text-white shadow-lg shadow-slate-500/20 border-none dark:from-slate-800 dark:to-slate-600',
  violet: 'bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/20 border-none',
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
              ? "w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transition-all duration-300 shrink-0"
              : `w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 shrink-0 ${colorMaps[iconColor]}`
          }>
            <Icon size={24} strokeWidth={2} />
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && <div className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{subtitle}</div>}
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
