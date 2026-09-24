import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  isOpen?: boolean;
  open?: boolean; // added support for legacy open prop
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string; // added support for legacy description prop
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * ATMModal - SaaS Minimal Edition (No Blur).
 * A refined, professional modal system with a clean, clear backdrop.
 */
export const ATMModal: React.FC<Props> = ({
  isOpen: externalIsOpen,
  open,
  onClose,
  title,
  subtitle,
  description,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOutsideClick = false,
  showCloseButton = true,
  className,
  containerClassName,
}) => {
  const isOpen = !!(externalIsOpen ?? open);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Give a tiny delay for the animation to trigger after mount
      setTimeout(() => {
        setIsAnimating(true);
        document.body.style.overflow = 'hidden';
      }, 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before unmounting (300ms)
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  if (!mounted || !shouldRender) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-4xl',
    '4xl': 'max-w-6xl'
  };

  return createPortal(
    <div className={clsx(
      "fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out",
      containerClassName,
      isAnimating ? "bg-slate-950/50 backdrop-blur-md opacity-100" : "bg-slate-950/0 backdrop-blur-none opacity-0"
    )}>
      {/* 🧼 Overlay - Logic controlled for strict modals */}
      <div
        className="absolute inset-0 cursor-default"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (closeOnOutsideClick) onClose();
        }}
      />

      {/* 🧼 Modal Architecture - Authentic WhatsApp Smoothness */}
      <div
        className={clsx(
          "relative w-full bg-[var(--zen-surface)] dark:bg-[var(--zen-card)] rounded-xl flex flex-col overflow-hidden transition-all duration-300 transform",
          "shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15),0_10px_30px_-5px_rgba(0,0,0,0.08)]",
          "border border-[var(--zen-border)]",
          sizeClasses[size],
          "max-h-[88vh]",
          className,
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.96] opacity-0"
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' // Gentler WhatsApp easing
        }}
      >
        {/* Header - Not used in Confirm Modal but kept for others */}
        {(title || subtitle || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 bg-[var(--zen-surface)] dark:bg-[var(--zen-card)] z-20 shrink-0 border-b border-[var(--zen-border)]">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                {title}
              </h3>
              {(subtitle || description) && (
                <p className="text-xs font-medium text-slate-400 dark:text-gray-500 mt-1">
                  {subtitle || description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close Modal"
                className="group p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
            )}
          </div>
        )}

        {/* Body - Compact Padding like WhatsApp */}
        <div className={clsx(
          "flex-1 overflow-y-auto px-6 py-6 custom-scrollbar text-[14px] text-slate-600 dark:text-gray-400 font-medium leading-[1.5]",
          (title || subtitle) && "pt-5"
        )}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-5 bg-slate-50/40 dark:bg-gray-900/20 border-t border-slate-50/50 dark:border-gray-800/50 flex items-center justify-end gap-3 shrink-0 z-20">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ATMModal;
