import React, { ReactNode, useState } from 'react';
import clsx from 'clsx';

interface Props {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

/**
 * ATMTooltip - SaaS Minimal Edition.
 * A refined, low-noise tooltip for providing contextual information.
 * Follows the 'Zero Blur' and 'Slate Minimal' design architecture.
 */
export const ATMTooltip: React.FC<Props> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const t = setTimeout(() => setIsVisible(true), delay);
    setTimer(t);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
  };

  return (
    <div
      className={clsx("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          className={clsx(
            "absolute z-[150] px-3 py-1.5 bg-slate-800 text-white text-[11px] font-semibold tracking-tight rounded-lg shadow-lg whitespace-nowrap pointer-events-none",
            "animate-in fade-in zoom-in-95 duration-200",
            positionClasses[position]
          )}
        >
          {content}
          
          {/* Subtle Arrow */}
          <div
            className={clsx(
              "absolute border-[4px] border-transparent",
              position === 'top' && "top-full left-1/2 -translate-x-1/2 border-t-slate-800",
              position === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800",
              position === 'left' && "left-full top-1/2 -translate-y-1/2 border-l-slate-800",
              position === 'right' && "right-full top-1/2 -translate-y-1/2 border-r-slate-800"
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ATMTooltip;
