import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { ATMButton } from '../../shared/ui';
import ChangePasswordModal from '../../modules/auth/components/ChangePasswordModal';

const PasswordWarningBanner: React.FC = () => {
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isAuthenticated = !!accessToken && !!user;
  if (!isAuthenticated || user?.isPasswordChanged !== false || dismissed) return null;

  return (
    <>
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3 flex items-center gap-3 transition-colors">
        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
          <span className="font-bold">⚠ Security Notice:</span> You are using a temporary access key. Please initialize a secure key to protect your account.
        </p>
        <ATMButton variant="outline" size="sm" onClick={() => setModalOpen(true)} className="dark:bg-amber-900/30 dark:border-amber-900/50 dark:text-amber-400">Change Now</ATMButton>
        <button onClick={() => setDismissed(true)} className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-500 transition-colors">
          <X size={16} />
        </button>
      </div>
      <ChangePasswordModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default PasswordWarningBanner;
