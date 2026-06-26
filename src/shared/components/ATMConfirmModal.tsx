import React from 'react';
import { ATMModal } from '../ui';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  title: string;
  description: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOutsideClick?: boolean;
}

/**
 * ATMConfirmModal - SaaS Minimal Zen Edition (Unified Theme).
 */
export const ATMConfirmModal: React.FC<Props> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'info',
  size = 'md',
  closeOnOutsideClick = true,
}) => {
  return (
    <ATMModal
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      size={size}
      closeOnOutsideClick={closeOnOutsideClick}
    >
      <div className="py-1 px-0">
        {/* Messaging - WhatsApp Accurate Spacing */}
        <div className="space-y-2 mb-8 text-left">
          <h3 className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight">
            {title}
          </h3>
          <div className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </div>
        </div>

        {/* Actions - Right Aligned WhatsApp Buttons */}
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 h-10 text-[14px] font-bold text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              "px-6 h-10 rounded-full text-[14px] font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center min-w-[100px]",
              variant === 'danger'
                ? 'bg-[#ea0038] hover:bg-[#c0002e] shadow-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </ATMModal>
  );
};

export default ATMConfirmModal;
