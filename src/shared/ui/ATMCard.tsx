import React, { ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  hint?: string; // added support for legacy hint prop as subtitle alias
  header?: ReactNode;
  action?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const ATMCard: React.FC<Props> = ({
  title,
  subtitle,
  hint,
  header,
  action,
  extra,
  children,
  className = '',
  padding = 'md',
  shadow = true,
}) => {
  const effectiveSubtitle = subtitle ?? hint;
  const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-250/30 dark:border-slate-800/60 rounded-2xl overflow-hidden premium-hover-card
        ${shadow ? 'shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)]' : ''}
        ${className}
      `}
    >
      {header ? (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">{header}</div>
      ) : (title || effectiveSubtitle || action || extra) ? (
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">{title}</h3>
            )}
            {effectiveSubtitle && <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{effectiveSubtitle}</p>}
          </div>
          {(action || extra) && (
            <div className="flex-shrink-0">
              {action || extra}
            </div>
          )}
        </div>
      ) : null}
      
      <div className={`${paddingMap[padding]}`}>
        {children}
      </div>
    </div>
  );
};

export default ATMCard;
