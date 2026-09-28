import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ATMButton } from '../ui/ATMButton';

export interface ATMFormHeaderActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  isEdit?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  formId?: string;
  onSave?: () => void;
}

export const ATMFormHeaderActions: React.FC<ATMFormHeaderActionsProps> = ({
  onCancel,
  isLoading = false,
  isSubmitting = false,
  isEdit = false,
  submitLabel,
  cancelLabel = 'Cancel',
  formId,
  onSave,
}) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('atm-header-actions');
    if (el) {
      setTarget(el);
    }
  }, []);

  const defaultSubmit = isEdit ? 'Save Changes' : 'Create';
  const label = submitLabel || defaultSubmit;
  const busy = isLoading || isSubmitting;

  const content = (
    <div className="flex items-center gap-2 shrink-0">
      <ATMButton
        variant="ghost"
        type="button"
        onClick={onCancel}
        disabled={busy}
        size="md"
      >
        {cancelLabel}
      </ATMButton>
      <ATMButton
        variant="primary"
        type="submit"
        form={formId}
        isLoading={busy}
        size="md"
        onClick={onSave}
      >
        {label}
      </ATMButton>
    </div>
  );

  if (target) {
    return createPortal(content, target);
  }

  // Fallback if header actions element is not found
  return (
    <div className="flex items-center justify-end gap-2 pb-4">
      {content}
    </div>
  );
};

export default ATMFormHeaderActions;
