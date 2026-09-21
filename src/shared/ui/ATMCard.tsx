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
    // No overflow-hidden here: select/dropdown menus render absolutely INSIDE cards and were
    // clipped invisible at the card edge. Cards that need clipping (rounded table corners)
    // pass `overflow-hidden` via className explicitly.
    <div
      className={`
        relative bg-white/95 border border-slate-200/80 rounded-2xl dark:bg-[#13151a]/95 dark:border-gray-800/80
        ${shadow ? 'shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 dark:shadow-none dark:hover:border-gray-700/80' : ''}
        ${className}
      `}
    >
      {header ? (
        <div className="px-5 py-4 border-b border-[var(--zen-border)]">{header}</div>
      ) : (title || effectiveSubtitle || action || extra) ? (
        <div className="px-5 py-4 border-b border-[var(--zen-border)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight truncate">{title}</h3>
            )}
            {effectiveSubtitle && <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold mt-0.5 truncate">{effectiveSubtitle}</p>}
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
