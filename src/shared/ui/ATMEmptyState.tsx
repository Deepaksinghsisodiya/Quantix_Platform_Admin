import React from 'react';
import { SearchX, Plus, LucideIcon } from 'lucide-react';
import { ATMButton } from './ATMButton';

interface Props {
  icon?: any; // Supports LucideIcon class or ReactElement
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

/**
 * ATMEmptyState - SaaS Minimal Edition.
 * A distraction-free, high-readability empty state component.
 * Follows the 'Zero Blur' and 'Slate Minimal' architecture for maximum clarity.
 */
export const ATMEmptyState: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700 ${className}`}>
      
      {/* 🧼 Clean Minimalist Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 flex items-center justify-center text-slate-300 dark:text-gray-600">
           {Icon ? (
             React.isValidElement(Icon) ? (
               Icon
             ) : (
               // @ts-ignore
               <Icon size={32} strokeWidth={1.5} />
             )
           ) : (
             <SearchX size={32} strokeWidth={1.5} />
           )}
        </div>
      </div>

      {/* 🧼 Simple Typography */}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-gray-100 tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-[13px] font-medium text-slate-400 dark:text-gray-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* 🧼 SaaS Minimal Action Button */}
      {action ? (
        <div className="mt-8">
          {action}
        </div>
      ) : onAction ? (
        <div className="mt-8">
          <ATMButton 
            onClick={onAction} 
            icon={Plus}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-700 text-white shadow-lg shadow-slate-100 dark:shadow-none transition-all active:scale-[0.98]"
          >
            <span className="font-bold text-[13px]">
               {actionLabel || 'Create New'}
            </span>
          </ATMButton>
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-2 opacity-20">
           <div className="w-1 h-1 rounded-full bg-slate-400" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              No Records Found
           </span>
        </div>
      )}
    </div>
  );
};

export default ATMEmptyState;
