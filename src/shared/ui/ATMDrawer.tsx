import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  position?: 'right' | 'left';
  width?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * ATMDrawer - SaaS Minimal Edition (No Blur).
 * A premium side-drawer system with a clean, distraction-free backdrop.
 */
export const ATMDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  position = 'right',
  width,
  size = 'md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const positionClasses = {
    right: 'right-0 animate-in slide-in-from-right duration-500',
    left: 'left-0 animate-in slide-in-from-left duration-500',
  };

  const sizeClasses = {
    sm: 'w-80 sm:w-96',
    md: 'w-full sm:w-[28rem] md:w-[32rem]',
    lg: 'w-full sm:w-[36rem] md:w-[42rem]',
    xl: 'w-full sm:w-[48rem] md:w-[56rem]',
    full: 'w-screen',
  };

  const finalWidth = width || sizeClasses[size];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex overflow-hidden">
      {/* Overlay - Strictly Non-Interactive for Clicks to close */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-700"
        onClick={(e) => {
          e.stopPropagation();
        }}
      />

      {/* Drawer Container - Zen Perfection Edition */}
      <div
        className={clsx(
          "relative h-full bg-white dark:bg-gray-950 shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.15)] dark:shadow-none flex flex-col overflow-hidden border-l border-white/40 dark:border-gray-800/50 transition-all duration-700",
          position === 'right' ? 'rounded-l-[1.5rem]' : 'rounded-r-[1.5rem]',
          finalWidth,
          positionClasses[position]
        )}
      >
        {/* Glassmorphic Header */}
        <div className="px-8 pt-8 pb-5 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md flex items-start justify-between sticky top-0 z-20 border-b border-slate-100 dark:border-gray-800">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-black text-accent-600 dark:text-accent-400 uppercase tracking-[0.25em] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close Drawer"
            className="group p-2.5 -mr-2 -mt-2 text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-gray-800/40 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-500"
            title="Close Drawer"
          >
            <X size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-500" />
          </button>
        </div>

        {/* Content Body - Balanced Spacing */}
        <div className="flex-1 overflow-y-auto px-8 py-4 relative z-10 custom-scrollbar text-[14px] text-slate-600 dark:text-gray-400 font-medium leading-[1.6]">
          {children}
        </div>

        {/* Strategic Footer - Ultra Clean Section */}
        {footer && (
          <div className="px-8 py-5 bg-slate-50/40 dark:bg-gray-900/20 border-t border-slate-50/50 dark:border-gray-800/50 sticky bottom-0 z-20">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ATMDrawer;
